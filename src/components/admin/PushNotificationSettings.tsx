import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Shield, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

export const PushNotificationSettings = () => {
  const {
    isSupported,
    isEnabled,
    isLoading,
    error,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
  } = usePushNotifications();

  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(false);

  const handleEnableNotifications = async () => {
    const permitted = await requestPermission();
    if (permitted) {
      const subscribed = await subscribeToPush();
      if (subscribed) {
        toast.success('Push notifications enabled!');
      }
    } else {
      toast.error('Please enable notifications in your browser settings');
    }
  };

  const handleDisableNotifications = async () => {
    await unsubscribeFromPush();
    toast.info('Push notifications disabled');
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
    toast.info('Test notification sent');
  };

  if (!isSupported) {
    return (
      <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
        <div className="flex items-center gap-3 text-amber-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">Push notifications are not supported on this device/browser.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Push Notifications</h3>
            <p className="text-sm text-gray-400">Receive security alerts even when the app is closed</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isEnabled 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : 'bg-gray-700 text-gray-400'
        }`}>
          {isEnabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {/* Main Toggle */}
      <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEnabled ? (
              <Bell className="w-5 h-5 text-emerald-400" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-white">Enable Push Notifications</p>
              <p className="text-xs text-gray-400">Get real-time security alerts on this device</p>
            </div>
          </div>
          <Button
            variant={isEnabled ? "outline" : "default"}
            size="sm"
            onClick={isEnabled ? handleDisableNotifications : handleEnableNotifications}
            disabled={isLoading}
            className={isEnabled 
              ? "border-gray-600 text-gray-300" 
              : "bg-emerald-600 hover:bg-emerald-500"
            }
          >
            {isLoading ? 'Loading...' : isEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </div>

      {/* Notification Types */}
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Notification Types</p>
          
          {[
            {
              id: 'security',
              icon: Shield,
              title: 'Security Alerts',
              description: 'Failed logins, suspicious activity, new devices',
              value: securityAlerts,
              onChange: setSecurityAlerts,
              critical: true,
            },
            {
              id: 'login',
              icon: Smartphone,
              title: 'Login Notifications',
              description: 'New login attempts and location changes',
              value: loginAlerts,
              onChange: setLoginAlerts,
              critical: true,
            },
            {
              id: 'system',
              icon: Bell,
              title: 'System Updates',
              description: 'App updates, maintenance, and announcements',
              value: systemAlerts,
              onChange: setSystemAlerts,
              critical: false,
            },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 border border-gray-700/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.value ? 'bg-emerald-500/10' : 'bg-gray-700/50'
                }`}>
                  <item.icon className={`w-5 h-5 ${
                    item.value ? 'text-emerald-400' : 'text-gray-500'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{item.title}</p>
                    {item.critical && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400">
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              </div>
              <Switch
                checked={item.value}
                onCheckedChange={item.onChange}
                disabled={item.critical} // Critical alerts can't be disabled
              />
            </div>
          ))}
        </motion.div>
      )}

      {/* Test Button */}
      {isEnabled && (
        <Button
          variant="outline"
          className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
          onClick={handleTestNotification}
        >
          <Bell className="w-4 h-4 mr-2" />
          Send Test Notification
        </Button>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* PWA Info */}
      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm text-gray-300 font-medium">PWA Push Notifications</p>
            <p className="text-xs text-gray-400">
              When installed as a PWA, you'll receive push notifications even when the app is closed. 
              Security alerts will be delivered instantly to your device.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PushNotificationSettings;