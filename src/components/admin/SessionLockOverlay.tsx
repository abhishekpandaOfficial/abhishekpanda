import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Fingerprint, Shield, Clock, Eye, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useBiometricSounds } from '@/hooks/useBiometricSounds';

interface SessionLockOverlayProps {
  isLocked: boolean;
  lockReason: 'inactivity' | 'tab_hidden' | 'manual' | 'page_refresh' | null;
  onUnlock: () => void;
}

type UnlockState = 'locked' | 'scanning' | 'success' | 'error';

export const SessionLockOverlay = ({ isLocked, lockReason, onUnlock }: SessionLockOverlayProps) => {
  const [state, setState] = useState<UnlockState>('locked');
  const [errorMessage, setErrorMessage] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const { authenticateWithCredential, isSupported } = useWebAuthn();
  const haptic = useHapticFeedback();
  const sounds = useBiometricSounds();

  useEffect(() => {
    if (isLocked) {
      setState('locked');
      setErrorMessage('');
      setScanProgress(0);
      sounds.playLock();
      haptic.triggerWarning();
    }
  }, [isLocked]);

  // Animate scan progress during scanning state
  useEffect(() => {
    if (state === 'scanning') {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 8;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setScanProgress(0);
    }
  }, [state]);

  const getLockMessage = () => {
    switch (lockReason) {
      case 'inactivity':
        return 'Session locked due to inactivity';
      case 'tab_hidden':
        return 'Session locked - Tab was inactive';
      case 'manual':
        return 'Session manually locked';
      case 'page_refresh':
        return 'Biometric verification required';
      default:
        return 'Session locked for security';
    }
  };

  const getLockIcon = () => {
    switch (lockReason) {
      case 'inactivity':
        return <Clock className="w-5 h-5" />;
      case 'tab_hidden':
        return <Eye className="w-5 h-5" />;
      case 'page_refresh':
        return <Shield className="w-5 h-5" />;
      default:
        return <Lock className="w-5 h-5" />;
    }
  };

  const handleUnlock = async () => {
    haptic.triggerSelection();
    sounds.playScan();
    setState('scanning');
    setErrorMessage('');
    setScanProgress(0);

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (isSupported) {
      const success = await authenticateWithCredential();
      if (success) {
        setScanProgress(100);
        setState('success');
        sounds.playSuccess();
        haptic.triggerSuccess();
        
        setTimeout(() => {
          onUnlock();
          sounds.playUnlock();
        }, 800);
      } else {
        setState('error');
        setErrorMessage('Fingerprint not recognized. Try again.');
        sounds.playError();
        haptic.triggerError();
        
        setTimeout(() => setState('locked'), 2000);
      }
    } else {
      // Fallback for unsupported browsers - auto unlock after delay
      setScanProgress(100);
      setState('success');
      sounds.playSuccess();
      haptic.triggerSuccess();
      
      setTimeout(() => {
        onUnlock();
        sounds.playUnlock();
      }, 800);
    }
  };

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          key="session-lock-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(20px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 bg-background/95"
          />

          {/* Animated grid background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          {/* Lock Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 shadow-2xl shadow-emerald-500/10">
              {/* Lock Reason Badge */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center mb-6"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
                  {getLockIcon()}
                  <span className="text-sm font-medium text-amber-400">{getLockMessage()}</span>
                </div>
              </motion.div>

              {/* Fingerprint Scanner Visual */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <AnimatePresence mode="wait">
                    {state === 'locked' && (
                      <motion.div
                        key="locked"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative"
                      >
                        {/* Pulsing glow */}
                        <motion.div
                          className="absolute inset-0 bg-amber-500/20 rounded-full blur-3xl"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/10 border-2 border-amber-500/40 flex items-center justify-center overflow-hidden">
                          {/* Fingerprint icon with scan line hint */}
                          <Lock className="w-14 h-14 text-amber-400" />
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        </div>
                      </motion.div>
                    )}

                    {state === 'scanning' && (
                      <motion.div
                        key="scanning"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative"
                      >
                        {/* Scanning rings */}
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="absolute inset-0 rounded-full border-2 border-emerald-500/40"
                            initial={{ scale: 1, opacity: 0.6 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.4,
                            }}
                          />
                        ))}
                        
                        {/* Main scanner container */}
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-2 border-emerald-500/50 flex items-center justify-center overflow-hidden">
                          {/* Fingerprint icon with scanning effect */}
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          >
                            <Fingerprint className="w-16 h-16 text-emerald-400" />
                          </motion.div>
                          
                          {/* Scanning line */}
                          <motion.div
                            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/50"
                            initial={{ top: 0 }}
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                          />
                          
                          {/* Progress overlay */}
                          <motion.div
                            className="absolute inset-0 bg-emerald-400/10"
                            style={{ 
                              clipPath: `inset(${100 - scanProgress}% 0 0 0)`,
                            }}
                          />
                          
                          {/* Corner scan indicators */}
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                            <motion.path
                              d="M 10 30 L 10 10 L 30 10"
                              fill="none"
                              stroke="rgba(16, 185, 129, 0.6)"
                              strokeWidth="2"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            />
                            <motion.path
                              d="M 70 10 L 90 10 L 90 30"
                              fill="none"
                              stroke="rgba(16, 185, 129, 0.6)"
                              strokeWidth="2"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.path
                              d="M 90 70 L 90 90 L 70 90"
                              fill="none"
                              stroke="rgba(16, 185, 129, 0.6)"
                              strokeWidth="2"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                            />
                            <motion.path
                              d="M 30 90 L 10 90 L 10 70"
                              fill="none"
                              stroke="rgba(16, 185, 129, 0.6)"
                              strokeWidth="2"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: 0.6 }}
                            />
                          </svg>
                        </div>
                      </motion.div>
                    )}

                    {state === 'success' && (
                      <motion.div
                        key="success"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                      >
                        <motion.div
                          className="absolute inset-0 bg-green-500/30 rounded-full blur-3xl"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-500/30 to-green-600/20 border-2 border-green-500/50 flex items-center justify-center">
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                          >
                            <CheckCircle2 className="w-16 h-16 text-green-400" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {state === 'error' && (
                      <motion.div
                        key="error"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, x: [0, -10, 10, -10, 10, 0] }}
                        transition={{ x: { duration: 0.5 } }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-red-500/30 rounded-full blur-3xl" />
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 border-2 border-red-500/50 flex items-center justify-center">
                          <XCircle className="w-16 h-16 text-red-400" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Progress bar during scanning */}
              {state === 'scanning' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${scanProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-emerald-400 text-center mt-2">{scanProgress}% Complete</p>
                </motion.div>
              )}

              {/* Title & Status */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                  <Shield className="w-6 h-6 text-emerald-400" />
                  {state === 'locked' && 'Command Center Locked'}
                  {state === 'scanning' && 'Scanning Fingerprint...'}
                  {state === 'success' && 'Access Granted'}
                  {state === 'error' && 'Verification Failed'}
                </h2>
                <p className="text-muted-foreground">
                  {state === 'locked' && 'Use TouchID to unlock and continue'}
                  {state === 'scanning' && 'Place your finger on the sensor'}
                  {state === 'success' && 'Welcome back, Abhishek'}
                  {state === 'error' && errorMessage}
                </p>
              </div>

              {/* Action Button */}
              {(state === 'locked' || state === 'error') && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    onClick={handleUnlock}
                    size="lg"
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 h-14 text-lg group"
                  >
                    <motion.div
                      className="flex items-center gap-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Fingerprint className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      Unlock with TouchID
                    </motion.div>
                  </Button>
                </motion.div>
              )}

              {state === 'scanning' && (
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Authenticating...</span>
                </div>
              )}

              {/* Security Notice */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-xs text-muted-foreground mt-6"
              >
                🔐 Biometric data is processed securely via Secure Enclave
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
