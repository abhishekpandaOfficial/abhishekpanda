import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ScanFace, Fingerprint, Shield, CheckCircle2, ChevronRight,
  Monitor, Smartphone, Tablet, ArrowRight, Sparkles, Lock,
  AlertCircle, Timer, X, Download, Cpu, KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { toast } from 'sonner';

type RegistrationStep = 'intro' | 'detection' | 'create' | 'authenticating' | 'success';
type ErrorType = 'not-recognized' | 'timeout' | 'cancelled' | 'unsupported' | null;

interface DeviceInfo {
  name: string;
  type: 'iphone' | 'ipad' | 'mac' | 'android' | 'windows' | 'unknown';
  biometric: 'FaceID' | 'TouchID' | 'Fingerprint' | 'Windows Hello' | 'Biometric';
  icon: typeof Smartphone;
}

const PasskeyRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<RegistrationStep>('intro');
  const [error, setError] = useState<ErrorType>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isPWA, setIsPWA] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  
  const { 
    isSupported, 
    registerCredential, 
    detectCapabilities, 
    availableMethods,
    isLoading,
    error: webAuthnError
  } = useWebAuthn();

  useEffect(() => {
    detectCapabilities();
    detectDevice();
    checkPWAStatus();
  }, [detectCapabilities]);

  const detectDevice = () => {
    const ua = navigator.userAgent.toLowerCase();
    let info: DeviceInfo;

    if (/iphone/.test(ua)) {
      info = { name: 'iPhone', type: 'iphone', biometric: 'FaceID', icon: Smartphone };
    } else if (/ipad/.test(ua)) {
      info = { name: 'iPad', type: 'ipad', biometric: 'TouchID', icon: Tablet };
    } else if (/macintosh|mac os x/.test(ua)) {
      info = { name: 'Mac', type: 'mac', biometric: 'TouchID', icon: Monitor };
    } else if (/android/.test(ua)) {
      info = { name: 'Android', type: 'android', biometric: 'Fingerprint', icon: Smartphone };
    } else if (/windows/.test(ua)) {
      info = { name: 'Windows PC', type: 'windows', biometric: 'Windows Hello', icon: Monitor };
    } else {
      info = { name: 'Device', type: 'unknown', biometric: 'Biometric', icon: Monitor };
    }

    setDeviceInfo(info);
  };

  const checkPWAStatus = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsPWA(isStandalone || isInWebAppiOS);
    
    // Show install prompt for iOS Safari
    if (deviceInfo?.type === 'iphone' && !isStandalone && !isInWebAppiOS) {
      setShowInstallPrompt(true);
    }
  };

  const handleCreatePasskey = async () => {
    setStep('authenticating');
    setError(null);
    
    // Check iframe first - this is a common blocker
    const isInIframe = window !== window.top;
    if (isInIframe) {
      setError('unsupported');
      setStep('create');
      toast.error('Cannot register passkey in preview iframe. Open the deployed URL directly.');
      return;
    }
    
    // Show a toast to guide the user
    if (deviceInfo?.type === 'mac') {
      toast.info('Touch ID prompt will appear shortly - place your finger on the sensor when the system asks', { 
        duration: 10000,
        id: 'touchid-hint'
      });
    }
    
    // Give UI time to update before WebAuthn call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const success = await registerCredential();
      
      toast.dismiss('touchid-hint');
      
      if (success) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setStep('success');
        toast.success('Passkey registered successfully!');
      } else {
        // Check the actual error from the hook to determine the right error type
        if (webAuthnError) {
          if (webAuthnError.includes('iframe') || webAuthnError.includes('preview')) {
            setError('unsupported');
          } else if (webAuthnError.includes('cancelled') || webAuthnError.includes('not allowed')) {
            setError('cancelled');
          } else if (webAuthnError.includes('timeout')) {
            setError('timeout');
          } else if (webAuthnError.includes('not supported') || webAuthnError.includes('not available')) {
            setError('unsupported');
          } else {
            setError('not-recognized');
          }
          toast.error(webAuthnError);
        } else {
          setError('not-recognized');
        }
        setStep('create');
      }
    } catch (err: any) {
      toast.dismiss('touchid-hint');
      
      if (err?.name === 'NotAllowedError') {
        setError('cancelled');
        toast.error('Touch the Touch ID sensor when the system prompts you.');
      } else if (err?.name === 'TimeoutError') {
        setError('timeout');
      } else if (err?.name === 'NotSupportedError') {
        setError('unsupported');
      } else if (err?.name === 'InvalidStateError') {
        toast.error('A passkey already exists. Remove it first from Settings.');
        setError('not-recognized');
      } else {
        setError('not-recognized');
        toast.error(err?.message || 'Failed to create passkey');
      }
      setStep('create');
    }
  };

  const handleComplete = () => {
    navigate('/admin/login');
  };

  const renderBiometricIcon = (large = false) => {
    const size = large ? 'w-20 h-20' : 'w-12 h-12';
    if (deviceInfo?.biometric === 'FaceID') {
      return <ScanFace className={`${size} text-emerald-400`} />;
    }
    return <Fingerprint className={`${size} text-emerald-400`} />;
  };

  const renderErrorModal = () => {
    if (!error) return null;

    const isMac = deviceInfo?.type === 'mac';
    const isInIframe = window !== window.top;
    
    const errorContent = {
      'not-recognized': {
        title: isInIframe ? 'Preview Mode Detected' : `${deviceInfo?.biometric} Not Recognized`,
        message: isInIframe 
          ? 'Passkey registration cannot work inside this embedded preview frame due to browser security restrictions. Open your deployed app URL directly in a new browser tab.'
          : isMac 
            ? 'Touch ID was not recognized. Make sure your finger is properly placed on the Touch ID sensor. If using a Magic Keyboard with Touch ID, ensure it\'s connected and Touch ID is enabled in System Preferences → Touch ID.'
            : 'Your biometric was not recognized. Try again or move to better lighting.',
        icon: isInIframe ? Monitor : AlertCircle,
        color: isInIframe ? 'text-blue-400' : 'text-amber-400',
        bgColor: isInIframe ? 'bg-blue-500/20' : 'bg-amber-500/20',
        showDeployLink: isInIframe,
      },
      'timeout': {
        title: 'Authentication Timeout',
        message: isMac
          ? 'Touch ID request timed out. When the system prompts, place your finger on the Touch ID sensor immediately.'
          : `${deviceInfo?.biometric} took too long. Please try again.`,
        icon: Timer,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        showDeployLink: false,
      },
      'cancelled': {
        title: 'Registration Cancelled',
        message: isMac
          ? 'Touch ID was cancelled. When clicking "Create Passkey", wait for the system Touch ID prompt and place your finger on the sensor.'
          : `${deviceInfo?.biometric} was cancelled. Passkey not created.`,
        icon: X,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        showDeployLink: false,
      },
      'unsupported': {
        title: isInIframe ? 'Preview Mode Detected' : 'Platform Not Supported',
        message: isInIframe
          ? 'Passkey registration cannot work inside this embedded preview frame. Publish and open the deployed URL directly in a new browser tab.'
          : isMac
            ? 'Touch ID is not available. Ensure: 1) You\'re using Safari or Chrome, 2) Touch ID is set up in System Preferences → Touch ID, 3) Your Mac has Touch ID (built-in or Magic Keyboard).'
            : "This device doesn't support biometrics required for passkeys. Use an iPhone or TouchID Mac.",
        icon: isInIframe ? Monitor : AlertCircle,
        color: isInIframe ? 'text-blue-400' : 'text-red-400',
        bgColor: isInIframe ? 'bg-blue-500/20' : 'bg-red-500/20',
        showDeployLink: isInIframe,
      },
    };

    const content = errorContent[error];
    const Icon = content.icon;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={() => setError(null)}
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-[#1a1a24] border border-gray-700 rounded-2xl p-6 max-w-sm w-full space-y-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-full ${content.bgColor} flex items-center justify-center`}>
              <Icon className={`w-8 h-8 ${content.color}`} />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-white">{content.title}</h3>
            <p className="text-gray-400 text-sm">{content.message}</p>
          </div>
          
          {content.showDeployLink && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs text-blue-300 text-center">
                Click "Publish" in the top-right corner to deploy your app, then open the deployed URL in a new tab.
              </p>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => setError(null)}
            >
              {content.showDeployLink ? 'Close' : 'Cancel'}
            </Button>
            {!content.showDeployLink && error !== 'unsupported' && (
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                onClick={() => {
                  setError(null);
                  handleCreatePasskey();
                }}
              >
                Retry
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderInstallPrompt = () => {
    if (!showInstallPrompt || isPWA) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-40 bg-gradient-to-r from-emerald-900/90 to-cyan-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white text-sm">Install for Best Experience</h4>
            <p className="text-xs text-gray-300 mt-1">
              Tap <span className="text-emerald-400">Share</span> → <span className="text-emerald-400">Add to Home Screen</span> for native FaceID experience.
            </p>
          </div>
          <button 
            onClick={() => setShowInstallPrompt(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <motion.div
            key="intro"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Animated Icon */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="relative"
              >
                <motion.div
                  className="absolute inset-0 bg-emerald-500/20 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                  <KeyRound className="w-14 h-14 text-emerald-400" />
                </div>
              </motion.div>
            </div>

            {/* Title */}
            <div className="text-center space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl font-bold text-white"
              >
                Set Up Your Passkey
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 max-w-sm mx-auto"
              >
                Use {deviceInfo?.biometric} for instant, secure sign-in. No passwords to remember.
              </motion.p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {[
                { icon: Shield, text: 'Military-grade encryption', delay: 0.5 },
                { icon: Sparkles, text: 'Instant authentication', delay: 0.6 },
                { icon: Lock, text: 'Biometrics never leave device', delay: 0.7 },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: feature.delay }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-gray-300">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={() => setStep('detection')}
                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-lg font-semibold shadow-lg shadow-emerald-500/25 rounded-xl"
              >
                Begin Setup
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        );

      case 'detection':
        return (
          <motion.div
            key="detection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">Device Capability Detection</h2>
              <p className="text-gray-400 text-sm">Checking available authentication methods</p>
            </div>

            {/* Device Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5" />
              <div className="relative p-6 border border-emerald-500/30 rounded-2xl backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center"
                  >
                    {deviceInfo && <deviceInfo.icon className="w-8 h-8 text-emerald-400" />}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">{deviceInfo?.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                        {deviceInfo?.biometric} Supported
                      </span>
                    </div>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Capabilities Grid */}
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Detected Capabilities</p>
              <div className="grid grid-cols-2 gap-3">
                {(availableMethods.length > 0 ? availableMethods : [deviceInfo?.biometric || 'Biometric']).map((method, i) => (
                  <motion.div
                    key={method}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50"
                  >
                    {method?.includes('Face') ? (
                      <ScanFace className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Fingerprint className="w-5 h-5 text-emerald-400" />
                    )}
                    <span className="text-sm text-gray-300">{method}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50"
                >
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-gray-300">Secure Enclave</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
                </motion.div>
              </div>
            </div>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
            >
              <p className="text-xs text-gray-400 text-center">
                <Lock className="w-3 h-3 inline mr-1" />
                Your biometrics are processed in the device's Secure Enclave. We never see or store your biometric data.
              </p>
            </motion.div>

            {/* CTA */}
            <Button
              onClick={() => setStep('create')}
              className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-lg font-semibold shadow-lg shadow-emerald-500/25 rounded-xl"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        );

      case 'create':
        return (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">
                {deviceInfo?.type === 'iphone' ? 'Enable FaceID Login' : 
                 deviceInfo?.type === 'mac' ? 'Register TouchID Passkey' : 
                 'Create Passkey'}
              </h2>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                Use {deviceInfo?.biometric} to register your passkey for secure authentication.
              </p>
            </div>

            {/* Biometric Animation */}
            <div className="flex justify-center py-8">
              <motion.div
                className="relative"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Outer glow rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-emerald-500/20"
                  style={{ transform: 'scale(1.3)' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-emerald-500/10"
                  style={{ transform: 'scale(1.6)' }}
                />
                
                {/* Main icon container */}
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border-2 border-emerald-500/40 flex items-center justify-center backdrop-blur-sm">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {renderBiometricIcon(true)}
                  </motion.div>
                </div>

                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-emerald-500/10"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>

            {/* Instructions */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                {deviceInfo?.type === 'iphone' 
                  ? 'Look at your device to continue'
                  : 'Touch the sensor to continue'}
              </p>
            </div>

            {/* Security Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700/50">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-gray-400">Secure Enclave Protected</span>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleCreatePasskey}
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-lg font-semibold shadow-lg shadow-emerald-500/25 rounded-xl disabled:opacity-50 relative"
            >
              {isLoading ? (
                <>
                  <motion.div 
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <span className="ml-3">Waiting for Touch ID...</span>
                </>
              ) : (
                <>
                  {renderBiometricIcon(false)}
                  <span className="ml-3">Create Passkey</span>
                </>
              )}
            </Button>
            
            {/* Help text for Mac users */}
            {deviceInfo?.type === 'mac' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-gray-500 space-y-1"
              >
                <p>When you click "Create Passkey", a system Touch ID dialog will appear.</p>
                <p className="text-amber-400/80">If using Magic Keyboard with Touch ID, ensure it's connected and Touch ID is enabled in System Preferences.</p>
              </motion.div>
            )}
          </motion.div>
        );

      case 'authenticating':
        return (
          <motion.div
            key="authenticating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8 py-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">Registering Passkey...</h2>
              <p className="text-gray-400 text-sm">
                {deviceInfo?.type === 'iphone' 
                  ? 'Look at your device to continue'
                  : 'Touch the sensor to continue'}
              </p>
            </div>

            {/* Scanning Animation */}
            <div className="flex justify-center py-12">
              <div className="relative">
                {/* Multiple pulse rings */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
                    animate={{ 
                      scale: [1, 2],
                      opacity: [0.6, 0]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.5
                    }}
                  />
                ))}
                
                {/* Main container */}
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(16, 185, 129, 0.3)',
                      '0 0 40px rgba(16, 185, 129, 0.5)',
                      '0 0 20px rgba(16, 185, 129, 0.3)'
                    ]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="relative w-40 h-40 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 border-2 border-emerald-400 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ 
                      rotateY: deviceInfo?.biometric === 'FaceID' ? [0, 360] : 0,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotateY: { duration: 2, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 0.5, repeat: Infinity }
                    }}
                  >
                    {renderBiometricIcon(true)}
                  </motion.div>
                </motion.div>

                {/* Scan line */}
                <motion.div
                  className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full"
                  animate={{ top: ['20%', '80%', '20%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>

            {/* Status */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-center"
            >
              <p className="text-emerald-400 text-sm font-medium">
                Waiting for {deviceInfo?.biometric}...
              </p>
            </motion.div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 text-center py-4"
          >
            {/* Success Icon with Confetti Effect */}
            <div className="relative flex justify-center">
              {/* Confetti particles */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B'][i % 4],
                  }}
                  initial={{ 
                    x: 0, 
                    y: 0,
                    opacity: 0
                  }}
                  animate={{ 
                    x: Math.cos(i * 30 * Math.PI / 180) * 100,
                    y: Math.sin(i * 30 * Math.PI / 180) * 100 - 50,
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 1,
                    delay: 0.2,
                    ease: 'easeOut'
                  }}
                />
              ))}
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="relative"
              >
                <motion.div
                  className="absolute inset-0 bg-green-500/30 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-600/20 border-2 border-green-500/50 flex items-center justify-center">
                  <CheckCircle2 className="w-14 h-14 text-green-400" />
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-bold text-white">Passkey Registered Successfully</h2>
              <p className="text-gray-400">Your {deviceInfo?.biometric} credential has been saved</p>
            </motion.div>

            {/* Device Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mx-auto max-w-xs p-5 rounded-2xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  {renderBiometricIcon(false)}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-white">{deviceInfo?.name}</p>
                  <p className="text-sm text-emerald-400">{deviceInfo?.biometric}</p>
                  <p className="text-xs text-gray-500 mt-1">Secure Enclave: Active</p>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={handleComplete}
                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-lg font-semibold shadow-lg shadow-emerald-500/25 rounded-xl"
              >
                Finish Setup
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/3 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* PWA Install Prompt */}
      {renderInstallPrompt()}

      {/* PWA Mode Banner */}
      {isPWA && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-4 right-4 z-40 flex items-center justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">
              {deviceInfo?.biometric} PWA Mode: Secure Enclave Active
            </span>
          </div>
        </motion.div>
      )}

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Card glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-emerald-500/20 rounded-3xl blur-xl opacity-70" />
        
        {/* Card */}
        <div className="relative bg-[#12121a]/95 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 shadow-2xl">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {['intro', 'detection', 'create', 'success'].map((s, i) => {
              const currentIndex = ['intro', 'detection', 'create', 'authenticating', 'success'].indexOf(step);
              const stepIndex = ['intro', 'detection', 'create', 'success'].indexOf(s);
              const isActive = currentIndex >= stepIndex || (step === 'authenticating' && stepIndex <= 2);
              
              return (
                <motion.div
                  key={s}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-emerald-400' : 'bg-gray-700'
                  }`}
                  animate={step === s || (step === 'authenticating' && s === 'create') ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.5, repeat: step === s ? Infinity : 0, repeatDelay: 1 }}
                />
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Error Modal */}
      <AnimatePresence>
        {renderErrorModal()}
      </AnimatePresence>
    </div>
  );
};

export default PasskeyRegistration;
