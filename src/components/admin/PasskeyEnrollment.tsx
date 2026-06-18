import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fingerprint, ScanFace, Shield, CheckCircle2, ChevronRight, 
  Monitor, Smartphone, Tablet, ArrowRight, Sparkles, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebAuthn } from '@/hooks/useWebAuthn';

interface PasskeyEnrollmentProps {
  onComplete: () => void;
}

type EnrollmentStep = 'intro' | 'detection' | 'create' | 'success';

export const PasskeyEnrollment = ({ onComplete }: PasskeyEnrollmentProps) => {
  const [step, setStep] = useState<EnrollmentStep>('intro');
  const [isScanning, setIsScanning] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [biometricType, setBiometricType] = useState<string>('');
  
  const { 
    isSupported, 
    registerCredential, 
    detectCapabilities, 
    availableMethods,
    credentials 
  } = useWebAuthn();

  useEffect(() => {
    detectCapabilities();
    
    // Detect device
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone/.test(ua)) {
      setDeviceName('iPhone');
      setBiometricType('FaceID');
    } else if (/ipad/.test(ua)) {
      setDeviceName('iPad');
      setBiometricType('TouchID');
    } else if (/mac/.test(ua)) {
      setDeviceName('MacBook');
      setBiometricType('TouchID');
    } else if (/android/.test(ua)) {
      setDeviceName('Android Device');
      setBiometricType('Fingerprint');
    } else if (/windows/.test(ua)) {
      setDeviceName('Windows PC');
      setBiometricType('Windows Hello');
    } else {
      setDeviceName('This Device');
      setBiometricType('Biometric');
    }
  }, [detectCapabilities]);

  const handleCreatePasskey = async () => {
    setIsScanning(true);
    
    try {
      // Immediately trigger WebAuthn - the browser will show the biometric prompt
      const success = await registerCredential();
      
      if (success) {
        // Show success animation after biometric completes
        await new Promise(resolve => setTimeout(resolve, 500));
        setStep('success');
      } else {
        setIsScanning(false);
        // Show error toast
        console.error('Passkey registration failed');
      }
    } catch (error) {
      console.error('Passkey registration error:', error);
      setIsScanning(false);
    }
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
            {/* Icon */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-emerald-400" />
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">
                Enable Biometric Authentication
              </h2>
              <p className="text-gray-400 max-w-sm mx-auto">
                Use FaceID, TouchID, Windows Hello, or fingerprint sensors to unlock your admin console securely.
              </p>
            </div>

            {/* Features */}
            <div className="grid gap-3">
              {[
                { icon: Lock, text: 'Military-grade security' },
                { icon: Sparkles, text: 'Instant authentication' },
                { icon: Smartphone, text: 'Works across devices' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700"
                >
                  <feature.icon className="w-5 h-5 text-emerald-400" />
                  <span className="text-gray-300">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => setStep('detection')}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white h-12 shadow-lg shadow-emerald-500/25"
              >
                Set Up Passkey
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
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
              <h2 className="text-xl font-bold text-white">Device Detection</h2>
              <p className="text-gray-400 text-sm">Available authentication methods</p>
            </div>

            {/* Detected Device */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  {deviceName.includes('iPhone') || deviceName.includes('Android') ? (
                    <Smartphone className="w-7 h-7 text-emerald-400" />
                  ) : deviceName.includes('iPad') || deviceName.includes('Tablet') ? (
                    <Tablet className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <Monitor className="w-7 h-7 text-emerald-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{deviceName}</h3>
                  <p className="text-sm text-emerald-400">{biometricType} Available</p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-400 ml-auto" />
              </div>
            </motion.div>

            {/* Available Methods */}
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Detected Capabilities</p>
              <div className="grid grid-cols-2 gap-3">
                {(availableMethods.length > 0 ? availableMethods : [biometricType]).map((method, i) => (
                  <motion.div
                    key={method}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700"
                  >
                    {method.includes('Face') ? (
                      <ScanFace className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Fingerprint className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className="text-sm text-gray-300">{method}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <Button
              onClick={() => setStep('create')}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white h-12 shadow-lg shadow-emerald-500/25"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
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
              <h2 className="text-xl font-bold text-white">Create Passkey</h2>
              <p className="text-gray-400 text-sm">
                {isScanning 
                  ? 'Place your finger / Look at your device to continue'
                  : 'Register your biometric credential'
                }
              </p>
            </div>

            {/* Scanner Animation */}
            <div className="flex justify-center py-8">
              <div className="relative">
                {isScanning && (
                  <motion.div
                    className="absolute inset-0 bg-emerald-500/30 rounded-full"
                    animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <motion.div
                  animate={isScanning ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className={`relative w-36 h-36 rounded-full border-2 flex items-center justify-center ${
                    isScanning 
                      ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-emerald-400' 
                      : 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30'
                  }`}
                >
                  {biometricType.includes('Face') ? (
                    <motion.div
                      animate={isScanning ? { rotateY: [0, 360] } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <ScanFace className={`w-16 h-16 ${isScanning ? 'text-emerald-400' : 'text-emerald-500/50'}`} />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Fingerprint className={`w-16 h-16 ${isScanning ? 'text-emerald-400' : 'text-emerald-500/50'}`} />
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Scan Line */}
                {isScanning && (
                  <motion.div
                    className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full"
                    animate={{ top: ['25%', '75%', '25%'] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
              </div>
            </div>

            {/* Action */}
            {!isScanning && (
              <Button
                onClick={handleCreatePasskey}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white h-12 shadow-lg shadow-emerald-500/25"
              >
                <Fingerprint className="w-5 h-5 mr-2" />
                Register {biometricType}
              </Button>
            )}
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500/30 to-green-600/20 border border-green-500/50 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Passkey Registered Successfully</h2>
              <p className="text-gray-400">Your biometric credential has been saved</p>
            </div>

            {/* Device Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 inline-flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                {biometricType.includes('Face') ? (
                  <ScanFace className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Fingerprint className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-white">{deviceName}</p>
                <p className="text-xs text-emerald-400">{biometricType} Enabled</p>
              </div>
            </motion.div>

            {/* Action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white h-12 shadow-lg shadow-emerald-500/25"
              >
                Complete Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-70" />
        <div className="relative bg-[#12121a]/90 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {['intro', 'detection', 'create', 'success'].map((s, i) => (
              <motion.div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  ['intro', 'detection', 'create', 'success'].indexOf(step) >= i
                    ? 'bg-emerald-400'
                    : 'bg-gray-700'
                }`}
                animate={step === s ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default PasskeyEnrollment;
