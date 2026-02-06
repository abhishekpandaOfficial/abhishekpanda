import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ScanFace, CheckCircle2, XCircle, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { useSecurityAlert } from '@/hooks/useSecurityAlert';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useBiometricSounds } from '@/hooks/useBiometricSounds';
import { toast } from 'sonner';

interface BiometricVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
  moduleName?: string;
  userEmail?: string;
  verificationType?: 'fingerprint' | 'face';
}

type VerificationState = 'idle' | 'scanning' | 'success' | 'error' | 'blocked';

export const BiometricVerificationModal = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Identity Verification Required",
  subtitle = "Please authenticate using FaceID or Fingerprint",
  moduleName,
  userEmail = 'unknown@user.com',
  verificationType = 'fingerprint',
}: BiometricVerificationModalProps) => {
  const [state, setState] = useState<VerificationState>('idle');
  const [failureCount, setFailureCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const { authenticateWithCredential, isSupported } = useWebAuthn();
  const { sendSecurityAlert, getAttemptCount, resetAttempts } = useSecurityAlert();
  const haptic = useHapticFeedback();
  const sounds = useBiometricSounds();

  useEffect(() => {
    if (isOpen) {
      setState('idle');
      setErrorMessage('');
      // Check existing attempt count
      const existingAttempts = getAttemptCount(userEmail, verificationType);
      setFailureCount(existingAttempts);
      // Haptic feedback when modal opens
      haptic.triggerSelection();
    }
  }, [isOpen, userEmail, verificationType]);

  const handleVerify = async () => {
    if (failureCount >= 5) {
      setState('blocked');
      setErrorMessage('Too many failed attempts. Account temporarily locked.');
      haptic.triggerError();
      sounds.playError();
      return;
    }

    setState('scanning');
    setErrorMessage('');
    haptic.triggerSelection();
    sounds.playScan();
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (isSupported) {
      const success = await authenticateWithCredential();
      if (success) {
        setState('success');
        resetAttempts(userEmail, verificationType);
        setFailureCount(0);
        haptic.triggerSuccess();
        sounds.playSuccess();
        toast.success(`${verificationType === 'face' ? 'Face ID' : 'Fingerprint'} verified successfully`);
        setTimeout(() => {
          onSuccess();
          onClose();
          setState('idle');
        }, 1000);
      } else {
        await handleFailure();
      }
    } else {
      // WebAuthn not supported - show error
      setErrorMessage('Biometric authentication not supported on this device');
      setState('error');
      haptic.triggerError();
      sounds.playError();
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const handleFailure = async () => {
    const newFailureCount = failureCount + 1;
    setFailureCount(newFailureCount);
    setState('error');
    haptic.triggerError();
    sounds.playError();

    const stageName = verificationType === 'face' ? 'Face ID' : 'Fingerprint';
    
    // Send security alert (will only trigger after 2+ attempts)
    const { attemptCount, alertSent } = await sendSecurityAlert(
      userEmail,
      `${stageName} Verification`,
      'failed_biometric'
    );

    if (alertSent) {
      setErrorMessage(`Verification failed. Security alert sent (Attempt ${attemptCount})`);
      toast.error(`Security alert triggered after ${attemptCount} failed attempts`);
      sounds.playAlert();
    } else {
      setErrorMessage(`${stageName} not recognized. Please try again.`);
    }

    if (newFailureCount >= 5) {
      setState('blocked');
      setErrorMessage('Account temporarily locked due to multiple failed attempts');
      sounds.playAlert();
    } else {
      setTimeout(() => setState('idle'), 2500);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
        <div className="flex flex-col items-center py-6 space-y-6">
          {/* Module Badge */}
          {moduleName && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30"
            >
              <span className="text-xs font-medium text-emerald-400">{moduleName}</span>
            </motion.div>
          )}

          {/* Icon Container */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {state === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center">
                    <Fingerprint className="w-12 h-12 text-emerald-400" />
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
                  <motion.div
                    className="absolute inset-0 bg-emerald-500/30 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-500/50 flex items-center justify-center">
                    <motion.div
                      animate={{ rotateY: [0, 180, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <ScanFace className="w-12 h-12 text-emerald-400" />
                    </motion.div>
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
                  <div className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500/30 to-green-600/20 border border-green-500/50 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
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
                  <div className="absolute inset-0 bg-red-500/30 rounded-full blur-2xl" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 border border-red-500/50 flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-red-400" />
                  </div>
                </motion.div>
              )}

              {state === 'blocked' && (
                <motion.div
                  key="blocked"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-2xl animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/50 flex items-center justify-center">
                    <AlertTriangle className="w-12 h-12 text-orange-400" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Failure Counter */}
          {failureCount > 0 && state !== 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30"
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < failureCount ? 'bg-red-500' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-red-400">
                {failureCount}/5 attempts
              </span>
            </motion.div>
          )}

          {/* Title & Subtitle */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              {title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {state === 'scanning' ? `Scanning ${verificationType === 'face' ? 'Face ID' : 'Fingerprint'}... Please wait` :
               state === 'success' ? 'Identity verified successfully!' :
               state === 'error' ? errorMessage || 'Verification failed. Please try again.' :
               state === 'blocked' ? errorMessage :
               subtitle}
            </p>
          </div>

          {/* Action Buttons */}
          {state === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3 w-full"
            >
              <Button
                onClick={handleVerify}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40"
              >
                {verificationType === 'face' ? (
                  <ScanFace className="w-4 h-4 mr-2" />
                ) : (
                  <Fingerprint className="w-4 h-4 mr-2" />
                )}
                Verify with {verificationType === 'face' ? 'Face ID' : 'Fingerprint'}
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3 w-full"
            >
              <Button
                onClick={handleVerify}
                variant="outline"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Try Again
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </motion.div>
          )}

          {state === 'blocked' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3 w-full"
            >
              <div className="text-center text-sm text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                Account temporarily locked. Security team has been notified.
              </div>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                Close
              </Button>
            </motion.div>
          )}

          {state === 'scanning' && (
            <div className="flex items-center gap-2 text-emerald-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Authenticating...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BiometricVerificationModal;
