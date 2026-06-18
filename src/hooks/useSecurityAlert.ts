import { supabase } from "@/integrations/supabase/client";

interface SecurityAlertData {
  alertType: 'failed_biometric' | 'suspicious_login' | 'multiple_failures';
  email: string;
  attemptCount: number;
  failedStage: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

// Track failed attempts per session
const failedAttempts: Record<string, number> = {};

export const useSecurityAlert = () => {
  const getClientInfo = async () => {
    let ipAddress = 'Unknown';
    let location: SecurityAlertData['location'] = {};
    
    try {
      // Get IP and location info
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        ipAddress = data.ip || 'Unknown';
        location = {
          city: data.city,
          country: data.country_name,
          latitude: data.latitude,
          longitude: data.longitude,
        };
      }
    } catch (error) {
      console.log('Could not fetch IP info:', error);
    }

    // Parse user agent
    const userAgent = navigator.userAgent;
    const deviceInfo = parseUserAgent(userAgent);

    return { ipAddress, location, userAgent, deviceInfo };
  };

  const parseUserAgent = (ua: string) => {
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    // Detect browser
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // Detect OS
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    // Detect device type
    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
      device = 'Mobile';
    } else if (ua.includes('Tablet') || ua.includes('iPad')) {
      device = 'Tablet';
    }

    return { browser, os, device };
  };

  const trackFailedAttempt = (email: string, stage: string) => {
    const key = `${email}_${stage}`;
    failedAttempts[key] = (failedAttempts[key] || 0) + 1;
    return failedAttempts[key];
  };

  const resetAttempts = (email: string, stage?: string) => {
    if (stage) {
      delete failedAttempts[`${email}_${stage}`];
    } else {
      // Reset all attempts for this email
      Object.keys(failedAttempts).forEach(key => {
        if (key.startsWith(email)) {
          delete failedAttempts[key];
        }
      });
    }
  };

  const getAttemptCount = (email: string, stage: string) => {
    return failedAttempts[`${email}_${stage}`] || 0;
  };

  const sendSecurityAlert = async (
    email: string,
    failedStage: string,
    alertType: SecurityAlertData['alertType'] = 'failed_biometric'
  ) => {
    const attemptCount = trackFailedAttempt(email, failedStage);
    
    // Only send alerts after 2 or more failed attempts
    if (attemptCount < 2) {
      console.log(`Attempt ${attemptCount} for ${failedStage} - not sending alert yet`);
      return { attemptCount, alertSent: false };
    }

    const clientInfo = await getClientInfo();

    const alertData: SecurityAlertData & { timestamp: string } = {
      alertType: attemptCount >= 3 ? 'multiple_failures' : alertType,
      email,
      attemptCount,
      failedStage,
      timestamp: new Date().toISOString(),
      ...clientInfo,
    };

    try {
      // Log to database
      await supabase.from('login_audit_logs').insert({
        email,
        status: 'failed',
        failure_reason: `${failedStage} verification failed (attempt ${attemptCount})`,
        ip_address: clientInfo.ipAddress,
        user_agent: clientInfo.userAgent,
        city: clientInfo.location?.city,
        country: clientInfo.location?.country,
        browser: clientInfo.deviceInfo?.browser,
        device_type: clientInfo.deviceInfo?.device,
      });

      // Send security alert via edge function
      const { error } = await supabase.functions.invoke('security-alert', {
        body: alertData,
      });

      if (error) {
        console.error('Error sending security alert:', error);
      } else {
        console.log('Security alert sent for attempt', attemptCount);
      }

      return { attemptCount, alertSent: true };
    } catch (error) {
      console.error('Error in sendSecurityAlert:', error);
      return { attemptCount, alertSent: false };
    }
  };

  return {
    sendSecurityAlert,
    trackFailedAttempt,
    resetAttempts,
    getAttemptCount,
    getClientInfo,
  };
};
