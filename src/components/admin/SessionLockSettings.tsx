import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Clock, Volume2, VolumeX, Vibrate, Timer, Shield, Check, History, Lock, Unlock, Eye, MousePointer, Trash2, Monitor, Smartphone, Tablet, Zap, Bell, BellOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useActiveSession } from '@/hooks/useActiveSession';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

interface SessionLockSettingsProps {
  inactivityTimeout: number;
  onTimeoutChange: (timeout: number) => void;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  hapticEnabled: boolean;
  onHapticToggle: (enabled: boolean) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

interface LockEvent {
  id: string;
  type: 'lock' | 'unlock';
  reason?: 'inactivity' | 'tab_hidden' | 'manual' | 'biometric' | 'page_refresh';
  timestamp: number;
}

const timeoutOptions = [
  { label: '10 seconds', value: 10000 },
  { label: '30 seconds', value: 30000 },
  { label: '1 minute', value: 60000 },
  { label: '5 minutes', value: 300000 },
];

// Session activity storage
const STORAGE_KEY = 'admin_session_activity';

const getStoredActivity = (): LockEvent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const storeActivity = (events: LockEvent[]) => {
  // Keep only last 50 events
  const trimmed = events.slice(-50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
};

export const addLockEvent = (type: 'lock' | 'unlock', reason?: LockEvent['reason']) => {
  const events = getStoredActivity();
  events.push({
    id: crypto.randomUUID(),
    type,
    reason,
    timestamp: Date.now(),
  });
  storeActivity(events);
};

// Push Notification Settings Component
const PushNotificationSettings = () => {
  const { 
    isSupported, 
    isEnabled, 
    isLoading, 
    requestPermission, 
    sendTestNotification 
  } = usePushNotifications();

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success('Push notifications enabled!');
    } else {
      toast.error('Permission denied. Enable in browser settings.');
    }
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
    toast.success('Test notification sent!');
  };

  if (!isSupported) {
    return (
      <div className="pt-4 border-t border-border/30">
        <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BellOff className="w-4 h-4" />
          Push Notifications (Not Supported)
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Your browser doesn't support push notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-4 border-t border-border/30">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Bell className={cn(
            "w-4 h-4",
            isEnabled ? "text-cyan-400" : "text-muted-foreground"
          )} />
          Push Notifications
        </Label>
        {isEnabled ? (
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Enabled</span>
        ) : (
          <Button
            size="sm"
            onClick={handleEnableNotifications}
            disabled={isLoading}
            className="bg-cyan-600 hover:bg-cyan-500 text-xs h-7"
          >
            Enable
          </Button>
        )}
      </div>
      
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <p className="text-xs text-muted-foreground">
            Receive alerts when new sessions are detected or security events occur.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestNotification}
            className="text-xs h-7 border-cyan-500/30 hover:bg-cyan-500/10"
          >
            <Bell className="w-3 h-3 mr-1" />
            Send Test Alert
          </Button>
        </motion.div>
      )}
    </div>
  );
};

// Sessions Tab Component
const SessionsTab = () => {
  const { activeSessions, currentSessionId, killSession, killAllOtherSessions, refreshSessions } = useActiveSession();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initial load and real-time sync
  useEffect(() => {
    refreshSessions();

    // Real-time sync using storage events for cross-tab updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_sessions') {
        refreshSessions();
        setLastUpdate(new Date());
      }
    };

    // Also use BroadcastChannel for same-origin real-time updates
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('admin_session_sync');
      broadcastChannel.onmessage = () => {
        refreshSessions();
        setLastUpdate(new Date());
      };
    } catch (e) {
      console.log('BroadcastChannel not supported, using storage events only');
    }

    // Periodic refresh every 5 seconds for real-time feel
    const interval = setInterval(() => {
      refreshSessions();
      setLastUpdate(new Date());
    }, 5000);

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
      broadcastChannel?.close();
    };
  }, [refreshSessions]);

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === 'mobile') return Smartphone;
    if (deviceType === 'tablet') return Tablet;
    return Monitor;
  };

  const handleKillSession = async (sessionId: string) => {
    await killSession(sessionId);
    toast.success('Session terminated');
  };

  const handleKillAll = async () => {
    await killAllOtherSessions();
    toast.success('All other sessions terminated');
  };

  return (
    <TabsContent value="sessions" className="py-4">
      {/* Real-time sync indicator */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">Real-time sync active</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Updated {format(lastUpdate, 'HH:mm:ss')}
        </span>
      </div>

      {/* Current Session */}
      <div className="mb-4">
        <Label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
          <Shield className="w-4 h-4 text-emerald-400" />
          Current Session
        </Label>
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">This Device</p>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Other Sessions */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Monitor className="w-4 h-4 text-blue-400" />
            Other Active Sessions
          </Label>
          {activeSessions.filter(s => !s.isCurrentSession).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleKillAll}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7"
            >
              <Zap className="w-3 h-3 mr-1" />
              Kill All
            </Button>
          )}
        </div>

        <ScrollArea className="h-[150px] rounded-lg border border-border/30 bg-muted/20">
          {activeSessions.filter(s => !s.isCurrentSession).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
              <Monitor className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No other active sessions</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {activeSessions.filter(s => !s.isCurrentSession).map((session, index) => {
                const DeviceIcon = getDeviceIcon(session.deviceType);
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <DeviceIcon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.deviceName} ({session.browser})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(session.lastActive, { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleKillSession(session.id)}
                      className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Zap className="w-3 h-3" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Security Info */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <p className="text-xs text-muted-foreground">
          ⚡ Sessions automatically expire after 5 minutes of inactivity. 
          Killing a session will require re-authentication on that device.
        </p>
      </div>
    </TabsContent>
  );
};

export const SessionLockSettings = ({
  inactivityTimeout,
  onTimeoutChange,
  soundEnabled,
  onSoundToggle,
  hapticEnabled,
  onHapticToggle,
  volume,
  onVolumeChange,
}: SessionLockSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<LockEvent[]>([]);
  const [activeTab, setActiveTab] = useState('settings');

  // Load activity log when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActivityLog(getStoredActivity().reverse());
    }
  }, [isOpen]);

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActivityLog([]);
  };

  const getEventIcon = (event: LockEvent) => {
    if (event.type === 'unlock') {
      return <Unlock className="w-4 h-4 text-emerald-400" />;
    }
    switch (event.reason) {
      case 'inactivity':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'tab_hidden':
        return <Eye className="w-4 h-4 text-blue-400" />;
      case 'manual':
        return <MousePointer className="w-4 h-4 text-violet-400" />;
      default:
        return <Lock className="w-4 h-4 text-red-400" />;
    }
  };

  const getEventLabel = (event: LockEvent) => {
    if (event.type === 'unlock') {
      return 'Unlocked via TouchID';
    }
    switch (event.reason) {
      case 'inactivity':
        return 'Locked (Inactivity)';
      case 'tab_hidden':
        return 'Locked (Tab Hidden)';
      case 'manual':
        return 'Locked (Manual)';
      default:
        return 'Locked';
    }
  };

  const lastUnlock = activityLog.find(e => e.type === 'unlock');
  const totalLocks = activityLog.filter(e => e.type === 'lock').length;
  const totalUnlocks = activityLog.filter(e => e.type === 'unlock').length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-violet-500/10"
          title="Lock Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border border-violet-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-violet-400" />
            Security & Lock Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30">
            <TabsTrigger value="settings" className="data-[state=active]:bg-violet-500/20">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-violet-500/20">
              <History className="w-4 h-4 mr-1" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-violet-500/20">
              <Monitor className="w-4 h-4 mr-1" />
              Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6 py-4">
            {/* Inactivity Timeout */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Timer className="w-4 h-4 text-amber-400" />
                Auto-Lock Timeout
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {timeoutOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onTimeoutChange(option.value)}
                    className={cn(
                      "relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border",
                      inactivityTimeout === option.value
                        ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                        : "bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {inactivityTimeout === option.value && (
                        <Check className="w-4 h-4 text-violet-400" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Sound Settings */}
            <div className="space-y-4 pt-4 border-t border-border/30">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  )}
                  Sound Effects
                </Label>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={onSoundToggle}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>

              <AnimatePresence>
                {soundEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-xs text-muted-foreground">Volume</Label>
                    <div className="flex items-center gap-3">
                      <VolumeX className="w-4 h-4 text-muted-foreground" />
                      <Slider
                        value={[volume * 100]}
                        onValueChange={(value) => onVolumeChange(value[0] / 100)}
                        max={100}
                        step={10}
                        className="flex-1"
                      />
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Haptic Settings */}
            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Vibrate className={cn(
                  "w-4 h-4",
                  hapticEnabled ? "text-blue-400" : "text-muted-foreground"
                )} />
                Haptic Feedback
              </Label>
              <Switch
                checked={hapticEnabled}
                onCheckedChange={onHapticToggle}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>

            {/* Push Notifications Section */}
            <PushNotificationSettings />

            {/* Info */}
            <div className="mt-4 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <p className="text-xs text-muted-foreground">
                🔐 The Command Center will automatically lock after the selected timeout period of inactivity, 
                or when you switch to a different browser tab.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="py-4">
            {/* Session Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-2xl font-bold text-emerald-400">{totalUnlocks}</div>
                <div className="text-xs text-muted-foreground">Unlocks</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <div className="text-2xl font-bold text-amber-400">{totalLocks}</div>
                <div className="text-xs text-muted-foreground">Locks</div>
              </div>
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center">
                <div className="text-2xl font-bold text-violet-400">{activityLog.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>

            {/* Last Unlock */}
            {lastUnlock && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <Unlock className="w-4 h-4" />
                  <span className="text-sm font-medium">Last Unlock</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(lastUnlock.timestamp, { addSuffix: true })}
                  <span className="mx-2">•</span>
                  {format(lastUnlock.timestamp, 'PPp')}
                </p>
              </div>
            )}

            {/* Activity Log */}
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <History className="w-4 h-4 text-blue-400" />
                Session Activity Log
              </Label>
              {activityLog.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <ScrollArea className="h-[200px] rounded-lg border border-border/30 bg-muted/20">
              {activityLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <History className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No activity recorded yet</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {activityLog.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors",
                        event.type === 'unlock' 
                          ? "bg-emerald-500/5 hover:bg-emerald-500/10" 
                          : "bg-amber-500/5 hover:bg-amber-500/10"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        event.type === 'unlock' 
                          ? "bg-emerald-500/20" 
                          : "bg-amber-500/20"
                      )}>
                        {getEventIcon(event)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {getEventLabel(event)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.timestamp, 'p')} • {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Security Info */}
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-muted-foreground">
                📊 Activity logs are stored locally and automatically cleared after 50 entries. 
                All biometric verifications use hardware-backed security.
              </p>
            </div>
          </TabsContent>

          <SessionsTab />
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
