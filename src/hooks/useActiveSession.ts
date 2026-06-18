import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSecurityNotification } from './usePushNotifications';
import { hashToken, generateSecureToken } from '@/lib/crypto';

interface ActiveSession {
  id: string;
  sessionToken: string; // This is the HASHED token from DB
  deviceName: string;
  deviceType: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: Date;
  isCurrentSession: boolean;
}

interface UseActiveSessionReturn {
  activeSessions: ActiveSession[];
  currentSessionId: string | null;
  hasOtherActiveSessions: boolean;
  otherSessionDevice: string | null;
  registerSession: () => Promise<boolean>;
  killSession: (sessionId: string) => Promise<void>;
  killAllOtherSessions: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  sendNewSessionAlert: (deviceName: string, browser: string) => Promise<void>;
  sendNewDeviceEmailSMS: (deviceName: string, deviceType: string, browser: string) => Promise<void>;
}

// Get device info with better detection
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let deviceName = 'Unknown Device';
  let deviceType = 'desktop';
  let browser = 'Unknown';

  // Detect device
  if (/iPhone/.test(ua)) {
    deviceName = 'iPhone';
    deviceType = 'mobile';
  } else if (/iPad/.test(ua)) {
    deviceName = 'iPad';
    deviceType = 'tablet';
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    deviceType = 'desktop';
    deviceName = /MacBook/.test(ua) ? 'MacBook' : 'iMac / Mac';
  } else if (/Android/.test(ua)) {
    deviceName = 'Android';
    deviceType = /Mobile/.test(ua) ? 'mobile' : 'tablet';
  } else if (/Windows/.test(ua)) {
    deviceName = 'Windows PC';
    deviceType = 'desktop';
  } else if (/Linux/.test(ua)) {
    deviceName = 'Linux';
    deviceType = 'desktop';
  }

  // Detect browser
  if (/Chrome/.test(ua) && !/Edg/.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox/.test(ua)) {
    browser = 'Firefox';
  } else if (/Edg/.test(ua)) {
    browser = 'Edge';
  }

  return { deviceName, deviceType, browser };
};

const SESSION_STORAGE_KEY = 'admin_session_token';
const HEARTBEAT_INTERVAL = 15000; // 15 seconds

export const useActiveSession = (): UseActiveSessionReturn => {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [currentSessionToken, setCurrentSessionToken] = useState<string | null>(null);
  const [hashedToken, setHashedToken] = useState<string | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Get or create session token and compute hash
  useEffect(() => {
    const initToken = async () => {
      let token = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!token) {
        token = generateSecureToken();
        sessionStorage.setItem(SESSION_STORAGE_KEY, token);
      }
      setCurrentSessionToken(token);
      const hashed = await hashToken(token);
      setHashedToken(hashed);
    };
    initToken();
  }, []);

  // Send Email + SMS alert for new device login via edge function
  const sendNewDeviceEmailSMS = useCallback(async (deviceName: string, deviceType: string, browser: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      console.log('Sending new device alert via edge function...');
      
      const { data, error } = await supabase.functions.invoke('new-device-alert', {
        body: {
          email: user.email,
          deviceName,
          deviceType,
          browser,
          timestamp: new Date().toISOString(),
        }
      });

      if (error) {
        console.error('Error sending new device alert:', error);
      } else {
        console.log('New device alert sent:', data);
      }
    } catch (err) {
      console.error('Error in sendNewDeviceEmailSMS:', err);
    }
  }, []);

  // Send push notification for new session alert
  const sendNewSessionAlert = useCallback(async (deviceName: string, browser: string) => {
    try {
      await showSecurityNotification({
        title: '🔐 New Session Started',
        message: `A new session was started on ${deviceName} (${browser}). If this wasn't you, secure your account immediately.`,
        type: 'warning',
        data: { deviceName, browser, timestamp: Date.now() }
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('login_audit_logs').insert({
          email: user.email || 'unknown',
          status: 'new_session_alert_sent',
          device_type: deviceName,
          browser: browser,
          failure_reason: `Push notification sent for new session on ${deviceName}`,
          user_agent: navigator.userAgent,
        });
      }
    } catch (err) {
      console.error('Error sending new session alert:', err);
    }
  }, []);

  // Register current session in database (stores HASHED token)
  const registerSession = useCallback(async (): Promise<boolean> => {
    let token = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!token) {
      token = generateSecureToken();
      sessionStorage.setItem(SESSION_STORAGE_KEY, token);
    }
    setCurrentSessionToken(token);
    
    // Hash the token for database storage
    const tokenHash = await hashToken(token);
    setHashedToken(tokenHash);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { deviceName, deviceType, browser } = getDeviceInfo();

      // Check for existing active sessions from OTHER devices/browsers (using hashed token)
      const { data: existingSessions } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .neq('session_token', tokenHash)
        .gt('expires_at', new Date().toISOString());

      const hasOtherSessions = existingSessions && existingSessions.length > 0;

      // Check if this session already exists (using hashed token)
      const { data: currentSession } = await supabase
        .from('admin_sessions')
        .select('id')
        .eq('session_token', tokenHash)
        .single();

      if (currentSession) {
        // Update existing session
        await supabase
          .from('admin_sessions')
          .update({
            last_active_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
          })
          .eq('session_token', tokenHash);
      } else {
        // Insert new session with HASHED token
        await supabase.from('admin_sessions').insert({
          session_token: tokenHash, // Store hashed token, not raw
          user_id: user.id,
          device_name: deviceName,
          device_type: deviceType,
          browser: browser,
          user_agent: navigator.userAgent,
          last_active_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
        });

        // Log the session start
        await supabase.from('login_audit_logs').insert({
          email: user.email || 'unknown',
          status: 'session_started',
          device_type: deviceType,
          browser: browser,
          user_agent: navigator.userAgent,
        });

        // ALWAYS send Email + SMS alert for new device logins
        await sendNewDeviceEmailSMS(deviceName, deviceType, browser);

        // Send push notification if there were other active sessions
        if (hasOtherSessions) {
          await sendNewSessionAlert(deviceName, browser);
        }
      }

      return hasOtherSessions;
    } catch (err) {
      console.error('Error registering session:', err);
      return false;
    }
  }, [sendNewSessionAlert, sendNewDeviceEmailSMS]);

  // Refresh sessions list from database
  const refreshSessions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sessions, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('last_active_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      const mapped: ActiveSession[] = (sessions || []).map((s: any) => ({
        id: s.id,
        sessionToken: s.session_token, // This is the hashed token from DB
        deviceName: s.device_name,
        deviceType: s.device_type,
        browser: s.browser,
        ip: s.ip_address || 'Unknown',
        location: s.location || 'Unknown',
        lastActive: new Date(s.last_active_at),
        isCurrentSession: s.session_token === hashedToken, // Compare with hashed token
      }));

      setActiveSessions(mapped);
    } catch (err) {
      console.error('Error refreshing sessions:', err);
    }
  }, [hashedToken]);

  // Kill a specific session
  const killSession = useCallback(async (sessionId: string) => {
    try {
      const session = activeSessions.find(s => s.id === sessionId);
      
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('login_audit_logs').insert({
          email: user.email || 'unknown',
          status: 'session_killed',
          failure_reason: `Killed session: ${sessionId} (${session?.deviceName || 'Unknown'})`,
          device_type: session?.deviceType,
          browser: session?.browser,
          user_agent: navigator.userAgent,
        });

        if (session) {
          await showSecurityNotification({
            title: '🚫 Session Terminated',
            message: `Session on ${session.deviceName} (${session.browser}) was terminated.`,
            type: 'info',
            data: { sessionId, deviceName: session.deviceName }
          });
        }
      }

      await refreshSessions();
    } catch (err) {
      console.error('Error killing session:', err);
    }
  }, [activeSessions, refreshSessions]);

  // Kill all other sessions (using hashed token for comparison)
  const killAllOtherSessions = useCallback(async () => {
    if (!hashedToken) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const otherSessions = activeSessions.filter(s => !s.isCurrentSession);

      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .neq('session_token', hashedToken); // Use hashed token

      await supabase.from('login_audit_logs').insert({
        email: user.email || 'unknown',
        status: 'all_sessions_killed',
        failure_reason: `Killed ${otherSessions.length} other session(s)`,
        user_agent: navigator.userAgent,
      });

      await showSecurityNotification({
        title: '🔒 All Sessions Terminated',
        message: `${otherSessions.length} other session(s) have been terminated for security.`,
        type: 'info',
        data: { killedCount: otherSessions.length }
      });

      await refreshSessions();
    } catch (err) {
      console.error('Error killing all sessions:', err);
    }
  }, [activeSessions, hashedToken, refreshSessions]);

  // Heartbeat to keep session alive (using hashed token)
  useEffect(() => {
    if (!hashedToken) return;

    const heartbeat = async () => {
      try {
        await supabase
          .from('admin_sessions')
          .update({ 
            last_active_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('session_token', hashedToken); // Use hashed token
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    };

    heartbeat();
    heartbeatRef.current = setInterval(heartbeat, HEARTBEAT_INTERVAL);
    
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [hashedToken]);

  // Real-time subscription for session changes
  useEffect(() => {
    if (!hashedToken) return;

    let isMounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const initChannel = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      channel = supabase
        .channel('admin-sessions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'admin_sessions',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            console.log('Session change detected:', payload);

            const row = (payload.new || payload.old) as any;
            const token = row?.session_token as string | undefined;
            const isCurrentSessionEvent = token === hashedToken;

            if (payload.eventType === 'INSERT' && payload.new) {
              const newSession = payload.new as any;
              if (!isCurrentSessionEvent) {
                await showSecurityNotification({
                  title: '⚠️ New Login Detected',
                  message: `New login from ${newSession.device_name} (${newSession.browser}). If this wasn't you, take action immediately!`,
                  type: 'warning',
                  data: {
                    deviceName: newSession.device_name,
                    browser: newSession.browser,
                    sessionId: newSession.id,
                  }
                });
                await refreshSessions();
              }
              return;
            }

            if (payload.eventType === 'UPDATE' && payload.new) {
              const updatedSession = payload.new as any;
              if (isCurrentSessionEvent) {
                // Ignore our own heartbeat updates to prevent periodic UI "refresh".
                if (updatedSession.is_active) return;

                await showSecurityNotification({
                  title: '🚨 Session Terminated',
                  message: 'Your session was terminated from another device. You will be logged out.',
                  type: 'error',
                  data: {}
                });
                setTimeout(async () => {
                  sessionStorage.removeItem(SESSION_STORAGE_KEY);
                  await supabase.auth.signOut();
                  window.location.href = '/admin/login';
                }, 2000);
                return;
              }

              await refreshSessions();
              return;
            }

            // DELETE and any other non-current events.
            if (!isCurrentSessionEvent) {
              await refreshSessions();
            }
          }
        )
        .subscribe();
    };

    initChannel();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [hashedToken, refreshSessions]);

  // Initial load
  useEffect(() => {
    if (hashedToken) {
      refreshSessions();
    }
  }, [hashedToken, refreshSessions]);

  const hasOtherActiveSessions = activeSessions.filter(s => !s.isCurrentSession).length > 0;
  const otherSession = activeSessions.find(s => !s.isCurrentSession);
  const otherSessionDevice = otherSession ? `${otherSession.deviceName} (${otherSession.browser})` : null;

  return {
    activeSessions,
    currentSessionId: currentSessionToken,
    hasOtherActiveSessions,
    otherSessionDevice,
    registerSession,
    killSession,
    killAllOtherSessions,
    refreshSessions,
    sendNewSessionAlert,
    sendNewDeviceEmailSMS,
  };
};
