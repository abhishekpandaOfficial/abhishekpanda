import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Download, ScanFace, Fingerprint, Bell, CheckCircle2, ChevronRight,
  Smartphone, Shield, ArrowRight, X, Sparkles, Lock, Monitor, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

interface AdminOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'pwa' | 'passkey' | 'notifications' | 'complete';

interface DeviceInfo {
  name: string;
  type: 'iphone' | 'ipad' | 'mac' | 'android' | 'windows' | 'unknown';
  biometric: 'FaceID' | 'TouchID' | 'Fingerprint' | 'Windows Hello' | 'Biometric';
}

export const AdminOnboardingWizard = ({ isOpen, onClose, onComplete }: AdminOnboardingWizardProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isPWA, setIsPWA] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [isPasskeyRegistered, setIsPasskeyRegistered] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  const { registerCredential, isSupported: webAuthnSupported, credentials } = useWebAuthn();
  const { requestPermission, isEnabled: notificationsEnabled, subscribeToPush } = usePushNotifications();

  useEffect(() => {
    detectDevice();
    checkPWAStatus();
    checkPasskeyStatus();
    checkNotificationStatus();
  }, []);

  const detectDevice = () => {
    const ua = navigator.userAgent.toLowerCase();
    let info: DeviceInfo;

    if (/iphone/.test(ua)) {
      info = { name: 'iPhone', type: 'iphone', biometric: 'FaceID' };
    } else if (/ipad/.test(ua)) {
      info = { name: 'iPad', type: 'ipad', biometric: 'TouchID' };
    } else if (/macintosh|mac os x/.test(ua)) {
      info = { name: 'Mac', type: 'mac', biometric: 'TouchID' };
    } else if (/android/.test(ua)) {
      info = { name: 'Android', type: 'android', biometric: 'Fingerprint' };
    } else if (/windows/.test(ua)) {
      info = { name: 'Windows PC', type: 'windows', biometric: 'Windows Hello' };
    } else {
      info = { name: 'Device', type: 'unknown', biometric: 'Biometric' };
    }

    setDeviceInfo(info);
  };

  const checkPWAStatus = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsPWA(isStandalone || isInWebAppiOS);
    setIsPWAInstalled(isStandalone || isInWebAppiOS);
  };

  const checkPasskeyStatus = () => {
    const hasPasskey = localStorage.getItem('admin_passkey_registered') === 'true';
    setIsPasskeyRegistered(hasPasskey || credentials.length > 0);
  };

  const checkNotificationStatus = () => {
    const enabled = Notification.permission === 'granted';
    setIsNotificationsEnabled(enabled);
  };

  const handleRegisterPasskey = async () => {
    try {
      const success = await registerCredential();
      if (success) {
        setIsPasskeyRegistered(true);
        toast.success('Passkey registered successfully!');
        setStep('notifications');
      } else {
        toast.error('Failed to register passkey');
      }
    } catch (err) {
      toast.error('Passkey registration cancelled');
    }
  };

  const handleEnableNotifications = async () => {
    const permitted = await requestPermission();
    if (permitted) {
      await subscribeToPush();
      setIsNotificationsEnabled(true);
      toast.success('Push notifications enabled!');
      setStep('complete');
    } else {
      toast.error('Notification permission denied');
    }
  };

  const handleSkipNotifications = () => {
    setStep('complete');
  };

  const handleComplete = () => {
    localStorage.setItem('admin_onboarding_complete', 'true');
    onComplete();
    onClose();
  };

  const steps = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'pwa', label: 'Install App' },
    { id: 'passkey', label: 'Passkey' },
    { id: 'notifications', label: 'Alerts' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-emerald-500/20 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-emerald-400" />
                </div>
              </div>
            </motion.div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">Welcome to Command Center</h2>
              <p className="text-gray-400 max-w-sm mx-auto">
                Let's set up your secure access with biometric authentication and instant alerts.
              </p>
            </div>

            <div className="grid gap-3 text-left">
              {[
                { icon: Download, text: 'Install as App', done: isPWAInstalled },
                { icon: deviceInfo?.biometric === 'FaceID' ? ScanFace : Fingerprint, text: `Register ${deviceInfo?.biometric}`, done: isPasskeyRegistered },
                { icon: Bell, text: 'Enable Security Alerts', done: isNotificationsEnabled },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                    item.done 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-gray-800/50 border-gray-700/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.done ? 'bg-emerald-500/20' : 'bg-gray-700/50'
                  }`}>
                    {item.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <item.icon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <span className={item.done ? 'text-emerald-400' : 'text-gray-300'}>{item.text}</span>
                  {item.done && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
                </motion.div>
              ))}
            </div>

            <Button
              onClick={() => setStep('pwa')}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/25 rounded-xl"
            >
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        );

      case 'pwa':
        return (
          <motion.div
            key="pwa"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">Install as App</h2>
              <p className="text-gray-400 text-sm">
                Install for the best {deviceInfo?.biometric} experience
              </p>
            </div>

            {isPWAInstalled ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-400 font-medium">App Already Installed!</p>
                <p className="text-gray-400 text-sm mt-1">You're running in PWA mode</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    {deviceInfo?.type === 'iphone' || deviceInfo?.type === 'ipad' ? (
                      <Smartphone className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <Monitor className="w-8 h-8 text-emerald-400" />
                    )}
                    <div>
                      <p className="font-medium text-white">{deviceInfo?.name}</p>
                      <p className="text-xs text-gray-400">Detected Device</p>
                    </div>
                  </div>

                  {(deviceInfo?.type === 'iphone' || deviceInfo?.type === 'ipad') && (
                    <div className="space-y-3 text-sm">
                      <p className="text-gray-300 font-medium">To install on iOS:</p>
                      <ol className="space-y-2 text-gray-400">
                        <li className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center">1</span>
                          Tap <Share2 className="w-4 h-4 inline mx-1" /> Share button
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center">2</span>
                          Select "Add to Home Screen"
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center">3</span>
                          Tap "Add" to confirm
                        </li>
                      </ol>
                    </div>
                  )}

                  {deviceInfo?.type === 'android' && (
                    <p className="text-gray-400 text-sm">
                      Tap the menu (⋮) and select "Install app" or "Add to Home screen"
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => navigate('/install')}
                  className="w-full border-gray-700 text-gray-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  View Installation Guide
                </Button>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('passkey')}
                className="flex-1 border-gray-700 text-gray-300"
              >
                Skip for Now
              </Button>
              <Button
                onClick={() => setStep('passkey')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 'passkey':
        return (
          <motion.div
            key="passkey"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">Register {deviceInfo?.biometric}</h2>
              <p className="text-gray-400 text-sm">
                Secure your account with biometric authentication
              </p>
            </div>

            {isPasskeyRegistered ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-400 font-medium">Passkey Already Registered!</p>
                <p className="text-gray-400 text-sm mt-1">{deviceInfo?.biometric} is ready to use</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center py-6">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border-2 border-emerald-500/30 flex items-center justify-center"
                  >
                    {deviceInfo?.biometric === 'FaceID' ? (
                      <ScanFace className="w-16 h-16 text-emerald-400" />
                    ) : (
                      <Fingerprint className="w-16 h-16 text-emerald-400" />
                    )}
                  </motion.div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-xs text-gray-400 text-center">
                    <Lock className="w-3 h-3 inline mr-1" />
                    Your biometrics stay on your device. We never see or store them.
                  </p>
                </div>

                <Button
                  onClick={handleRegisterPasskey}
                  disabled={!webAuthnSupported}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold"
                >
                  {deviceInfo?.biometric === 'FaceID' ? (
                    <ScanFace className="w-5 h-5 mr-2" />
                  ) : (
                    <Fingerprint className="w-5 h-5 mr-2" />
                  )}
                  Register {deviceInfo?.biometric}
                </Button>
              </div>
            )}

            {isPasskeyRegistered && (
              <Button
                onClick={() => setStep('notifications')}
                className="w-full bg-emerald-600 hover:bg-emerald-500"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">Enable Security Alerts</h2>
              <p className="text-gray-400 text-sm">
                Get instant notifications for suspicious activity
              </p>
            </div>

            {isNotificationsEnabled ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-400 font-medium">Notifications Enabled!</p>
                <p className="text-gray-400 text-sm mt-1">You'll receive instant security alerts</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center py-6">
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 10, 0],
                    }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-2 border-amber-500/30 flex items-center justify-center"
                  >
                    <Bell className="w-12 h-12 text-amber-400" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  {[
                    'Failed login attempts',
                    'New device logins',
                    'Suspicious IP addresses',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleEnableNotifications}
                  className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-semibold"
                >
                  <Bell className="w-5 h-5 mr-2" />
                  Enable Push Notifications
                </Button>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkipNotifications}
                className="flex-1 border-gray-700 text-gray-300"
              >
                Skip
              </Button>
              {isNotificationsEnabled && (
                <Button
                  onClick={() => setStep('complete')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-green-500/30 rounded-full"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-600/20 border-2 border-green-500/50 flex items-center justify-center">
                  <Sparkles className="w-14 h-14 text-green-400" />
                </div>
              </div>
            </motion.div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">Setup Complete!</h2>
              <p className="text-gray-400">Your Command Center is now secured</p>
            </div>

            <div className="grid gap-2">
              {[
                { label: 'PWA Installed', done: isPWAInstalled },
                { label: `${deviceInfo?.biometric} Registered`, done: isPasskeyRegistered },
                { label: 'Push Notifications', done: isNotificationsEnabled },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                    item.done ? 'bg-emerald-500/10' : 'bg-gray-800/50'
                  }`}
                >
                  <span className={item.done ? 'text-emerald-400' : 'text-gray-500'}>{item.label}</span>
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={handleComplete}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/25 rounded-xl"
            >
              Enter Command Center
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Card */}
        <div className="relative bg-[#12121a]/95 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-2xl">
          {/* Progress bar */}
          {step !== 'complete' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                        i <= currentStepIndex
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {i < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`w-8 h-0.5 mx-1 ${
                          i < currentStepIndex ? 'bg-emerald-500' : 'bg-gray-700'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500">{steps[currentStepIndex]?.label}</span>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminOnboardingWizard;