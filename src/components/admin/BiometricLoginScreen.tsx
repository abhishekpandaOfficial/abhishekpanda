import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ScanFace, Shield, CheckCircle2, Mail, KeyRound, Loader2, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebAuthn } from '@/hooks/useWebAuthn';

interface BiometricLoginScreenProps {
  onSuccess: () => void;
  onFallbackLogin: () => void;
}

type AuthState = 'idle' | 'scanning' | 'success' | 'error';

export const BiometricLoginScreen = ({ onSuccess, onFallbackLogin }: BiometricLoginScreenProps) => {
  const [authState, setAuthState] = useState<AuthState>('idle');
  const { isSupported, authenticateWithCredential, detectCapabilities, availableMethods, credentials, loadCredentials } = useWebAuthn();
  const [hasPasskey, setHasPasskey] = useState(false);

  useEffect(() => {
    detectCapabilities();
    loadCredentials();
    // Check if user has registered a passkey
    const registered = localStorage.getItem('admin_passkey_registered') === 'true';
    setHasPasskey(registered);
  }, [detectCapabilities, loadCredentials]);

  const handleBiometricAuth = async () => {
    setAuthState('scanning');
    
    try {
      // Immediately trigger WebAuthn authentication - browser shows biometric prompt
      const success = await authenticateWithCredential();
      
      if (success) {
        setAuthState('success');
        // Store biometric verification timestamp
        sessionStorage.setItem('biometric_verified', Date.now().toString());
        sessionStorage.setItem('admin_2fa_verified', 'true');
        sessionStorage.setItem('admin_2fa_timestamp', Date.now().toString());
        setTimeout(() => onSuccess(), 1000);
      } else {
        setAuthState('error');
        setTimeout(() => setAuthState('idle'), 2000);
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      setAuthState('error');
      setTimeout(() => setAuthState('idle'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md"
      >
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-70" />
        
        {/* Card */}
        <div className="relative bg-[#12121a]/90 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 mb-4"
            >
              <Shield className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Secure Login</h1>
            <p className="text-gray-400 text-sm">
              Authenticate with FaceID / TouchID / Fingerprint
            </p>
          </div>

          {/* Available Methods */}
          {availableMethods.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-3 mb-6"
            >
              {availableMethods.map((method) => (
                <div
                  key={method}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                >
                  {method === 'FaceID' && <ScanFace className="w-3.5 h-3.5 text-emerald-400" />}
                  {method === 'TouchID' && <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />}
                  {method === 'Fingerprint' && <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />}
                  {method === 'Windows Hello' && <Monitor className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="text-xs text-emerald-400">{method}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Biometric Scanner */}
          <div className="flex justify-center mb-8">
            <AnimatePresence mode="wait">
              {authState === 'idle' && (
                <motion.button
                  key="idle"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={handleBiometricAuth}
                  className="relative group cursor-pointer"
                >
                  <motion.div
                    className="absolute inset-0 bg-emerald-500/30 rounded-full blur-2xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/40 flex items-center justify-center transition-all duration-300 group-hover:border-emerald-400 group-hover:shadow-lg group-hover:shadow-emerald-500/30">
                    <Fingerprint className="w-16 h-16 text-emerald-400 transition-transform group-hover:scale-110" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-emerald-400/50"
                    animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.button>
              )}

              {authState === 'scanning' && (
                <motion.div
                  key="scanning"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative"
                >
                  <motion.div
                    className="absolute inset-0 bg-emerald-500/40 rounded-full blur-2xl"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-2 border-emerald-400 flex items-center justify-center">
                    <motion.div
                      animate={{ rotateZ: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <ScanFace className="w-16 h-16 text-emerald-400" />
                    </motion.div>
                  </div>
                  {/* Scan Line */}
                  <motion.div
                    className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                    animate={{ top: ['20%', '80%', '20%'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              )}

              {authState === 'success' && (
                <motion.div
                  key="success"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-green-500/40 rounded-full blur-2xl" />
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-500/30 to-green-600/20 border-2 border-green-400 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <CheckCircle2 className="w-16 h-16 text-green-400" />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {authState === 'error' && (
                <motion.div
                  key="error"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, x: [0, -10, 10, -10, 10, 0] }}
                  transition={{ x: { duration: 0.4 } }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-red-500/40 rounded-full blur-2xl" />
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 border-2 border-red-400 flex items-center justify-center">
                    <Fingerprint className="w-16 h-16 text-red-400" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Text */}
          <div className="text-center mb-6">
            <AnimatePresence mode="wait">
              {authState === 'idle' && (
                <motion.p
                  key="idle-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-400 text-sm"
                >
                  Tap the fingerprint to authenticate
                </motion.p>
              )}
              {authState === 'scanning' && (
                <motion.div
                  key="scanning-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 text-emerald-400"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Verifying identity...</span>
                </motion.div>
              )}
              {authState === 'success' && (
                <motion.p
                  key="success-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-400 text-sm font-medium"
                >
                  Authentication successful!
                </motion.p>
              )}
              {authState === 'error' && (
                <motion.p
                  key="error-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm"
                >
                  Authentication failed. Try again.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Primary Button */}
          {authState === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleBiometricAuth}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white h-12 text-base shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40"
              >
                <Fingerprint className="w-5 h-5 mr-2" />
                Continue with Passkey (FaceID / Fingerprint)
              </Button>
            </motion.div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            <span className="text-xs text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          </div>

          {/* Fallback Options */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={onFallbackLogin}
              className="w-full border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              Use Email Login Instead
            </Button>
            <Button
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-300"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Forgot Access?
            </Button>
          </div>

          {/* Device Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pt-6 border-t border-gray-800"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Secured with WebAuthn Protocol</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default BiometricLoginScreen;
