import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ScanFace, Smartphone, CheckCircle2, AlertCircle, 
  RefreshCw, Shield, Loader2, Wifi, Lock, Fingerprint,
  Eye, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useBiometricSounds } from "@/hooks/useBiometricSounds";
import { useWebAuthn } from "@/hooks/useWebAuthn";

type FaceIDStatus = 
  | 'idle' 
  | 'preparing' 
  | 'waiting_device' 
  | 'authenticating' 
  | 'success' 
  | 'error' 
  | 'timeout' 
  | 'cancelled';

interface FaceIDVerificationProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  attempts: number;
  maxAttempts: number;
}

const statusMessages: Record<FaceIDStatus, string> = {
  idle: "Ready to verify with FaceID",
  preparing: "Preparing FaceID challenge...",
  waiting_device: "Waiting for your iPhone...",
  authenticating: "Authenticating with Secure Enclave...",
  success: "FaceID verification complete!",
  error: "Face not recognized. Try again.",
  timeout: "FaceID took too long. Please retry.",
  cancelled: "You cancelled FaceID authentication."
};

const FaceIDVerification = ({ 
  onSuccess, 
  onError, 
  attempts, 
  maxAttempts 
}: FaceIDVerificationProps) => {
  const [status, setStatus] = useState<FaceIDStatus>('idle');
  const [progressMessage, setProgressMessage] = useState("");
  const haptic = useHapticFeedback();
  const sounds = useBiometricSounds();
  const { authenticateWithCredential } = useWebAuthn();

  const handleFaceIDVerification = async () => {
    if (attempts >= maxAttempts) {
      onError("Too many failed attempts. Account locked.");
      haptic.triggerError();
      sounds.playError();
      return;
    }

    setStatus('preparing');
    setProgressMessage("Initializing secure connection...");
    haptic.triggerSelection();
    sounds.playClick();

    try {
      // Simulate preparation phase
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgressMessage("Generating cryptographic challenge...");
      sounds.playScan();
      await new Promise(resolve => setTimeout(resolve, 600));

      setStatus('waiting_device');
      setProgressMessage("Your iPhone will prompt you to scan your FaceID");

      setProgressMessage("Look at your iPhone to continue...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStatus('authenticating');
      setProgressMessage("Authenticating with Secure Enclave...");

      const ok = await authenticateWithCredential({ step: 5 });
      if (ok) {
        setStatus('success');
        setProgressMessage("Identity verified successfully!");
        haptic.triggerSuccess();
        sounds.playSuccess();

        await new Promise(resolve => setTimeout(resolve, 1500));
        onSuccess();
      } else {
        throw new Error("No assertion returned");
      }

    } catch (error: any) {
      console.error('FaceID error:', error);
      haptic.triggerError();
      sounds.playError();
      
      if (error.name === 'NotAllowedError') {
        setStatus('cancelled');
        setProgressMessage("Authentication was cancelled");
      } else if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
        setStatus('timeout');
        setProgressMessage("Request timed out");
      } else {
        setStatus('error');
        setProgressMessage(error.message || "Verification failed");
      }
      
      onError(statusMessages[status] || error.message);
      
      // Reset to idle after showing error
      setTimeout(() => {
        setStatus('idle');
        setProgressMessage("");
      }, 3000);
    }
  };

  const renderFaceIDIcon = () => {
    return (
      <motion.div
        key={status}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative"
      >
        {/* Outer glow ring */}
        {(status === 'idle' || status === 'preparing' || status === 'waiting_device' || status === 'authenticating') && (
          <motion.div
            className={`absolute inset-0 rounded-full blur-3xl ${
              status === 'authenticating' ? 'bg-cyan-500/50' : 'bg-emerald-500/30'
            }`}
            animate={{ 
              scale: [1, 1.4, 1], 
              opacity: [0.3, 0.6, 0.3] 
            }}
            transition={{ 
              duration: status === 'authenticating' ? 0.6 : 2, 
              repeat: Infinity 
            }}
          />
        )}

        {status === 'success' && (
          <motion.div
            className="absolute inset-0 bg-green-500/50 rounded-full blur-3xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.6 }}
          />
        )}

        {(status === 'error' || status === 'timeout' || status === 'cancelled') && (
          <motion.div
            className="absolute inset-0 bg-red-500/40 rounded-full blur-3xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* Main container */}
        <motion.div 
          className={`relative w-44 h-44 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
            status === 'success' 
              ? 'bg-gradient-to-br from-green-500/30 to-green-600/20 border-green-400' 
              : status === 'error' || status === 'timeout' || status === 'cancelled'
                ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/50'
                : status === 'authenticating'
                  ? 'bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 border-cyan-400'
                  : 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/40'
          }`}
          animate={status === 'authenticating' ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {/* Scanning line animation */}
          {(status === 'preparing' || status === 'waiting_device' || status === 'authenticating') && (
            <motion.div
              className="absolute left-8 right-8 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"
              animate={{ top: ['15%', '85%', '15%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* Face outline animation */}
          {status === 'authenticating' && (
            <>
              {/* Face outline circle */}
              <motion.div
                className="absolute inset-8 border-2 border-cyan-400/50 rounded-full"
                animate={{ scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              {/* Eye dots */}
              <motion.div
                className="absolute top-1/3 left-1/3 w-3 h-3 bg-cyan-400 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <motion.div
                className="absolute top-1/3 right-1/3 w-3 h-3 bg-cyan-400 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}

          {/* Icon */}
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success-icon"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 className="w-20 h-20 text-green-400" />
              </motion.div>
            ) : status === 'error' || status === 'timeout' || status === 'cancelled' ? (
              <motion.div
                key="error-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1, x: [0, -8, 8, -8, 8, 0] }}
                transition={{ x: { duration: 0.5 } }}
              >
                <AlertCircle className="w-20 h-20 text-red-400" />
              </motion.div>
            ) : (
              <motion.div
                key="faceid-icon"
                animate={status !== 'idle' ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <ScanFace className={`w-20 h-20 ${
                  status === 'authenticating' ? 'text-cyan-400' : 'text-emerald-400'
                }`} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 flex items-center justify-center mb-4"
        >
          <ScanFace className="w-8 h-8 text-cyan-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">
          FaceID Verification — Step 4 of 4
        </h2>
        <p className="text-gray-400 text-sm">
          Use your iPhone's FaceID to complete secure authentication.
        </p>
      </div>

      {/* iPhone Instruction Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-500/20 rounded-2xl p-5"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-white font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              Your iPhone will prompt you to scan your FaceID.
            </p>
            <p className="text-gray-400 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400/70" />
              Keep your iPhone unlocked and nearby.
            </p>
            <p className="text-gray-400 flex items-center gap-2">
              <ScanFace className="w-4 h-4 text-cyan-400/70" />
              Look at your iPhone when the FaceID prompt appears.
            </p>
          </div>
        </div>
      </motion.div>

      {/* FaceID Scanner */}
      <div className="flex justify-center py-6">
        <AnimatePresence mode="wait">
          {status === 'idle' ? (
            <motion.button
              key="faceid-idle"
              onClick={handleFaceIDVerification}
              className="cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {renderFaceIDIcon()}
            </motion.button>
          ) : (
            renderFaceIDIcon()
          )}
        </AnimatePresence>
      </div>

      {/* Status Progress */}
      <motion.div
        className="text-center space-y-3"
        animate={{ opacity: 1 }}
      >
        {/* Progress dots */}
        {(status === 'preparing' || status === 'waiting_device' || status === 'authenticating') && (
          <div className="flex justify-center gap-2">
            {['preparing', 'waiting_device', 'authenticating'].map((step, idx) => (
              <motion.div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  ['preparing', 'waiting_device', 'authenticating'].indexOf(status) >= idx
                    ? 'bg-cyan-400'
                    : 'bg-gray-600'
                }`}
                animate={status === step ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            ))}
          </div>
        )}

        {/* Status message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={progressMessage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`text-sm font-medium ${
              status === 'success' 
                ? 'text-green-400' 
                : status === 'error' || status === 'timeout' || status === 'cancelled'
                  ? 'text-red-400'
                  : status === 'authenticating'
                    ? 'text-cyan-400'
                    : 'text-gray-400'
            }`}
          >
            {progressMessage || statusMessages[status]}
          </motion.p>
        </AnimatePresence>

        {/* Attempts counter */}
        <p className="text-xs text-gray-500">
          Attempts: {attempts}/{maxAttempts}
        </p>
      </motion.div>

      {/* Action Button */}
      <div className="space-y-4">
        {status === 'idle' && (
          <Button
            onClick={handleFaceIDVerification}
            disabled={attempts >= maxAttempts}
            className="w-full h-14 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-lg font-semibold shadow-lg shadow-cyan-500/25 border-0"
          >
            <ScanFace className="w-5 h-5 mr-2" />
            Verify with FaceID
          </Button>
        )}

        {(status === 'preparing' || status === 'waiting_device' || status === 'authenticating') && (
          <Button
            disabled
            className="w-full h-14 bg-gradient-to-r from-cyan-600/50 to-cyan-500/50 text-white text-lg font-semibold"
          >
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {status === 'preparing' && 'Preparing...'}
            {status === 'waiting_device' && 'Waiting for iPhone...'}
            {status === 'authenticating' && 'Authenticating...'}
          </Button>
        )}

        {(status === 'error' || status === 'timeout' || status === 'cancelled') && (
          <Button
            onClick={() => {
              setStatus('idle');
              setProgressMessage("");
            }}
            disabled={attempts >= maxAttempts}
            className="w-full h-14 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-lg font-semibold shadow-lg shadow-cyan-500/25"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
        )}
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
      >
        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-400 leading-relaxed">
          <span className="text-emerald-400 font-medium">Security Notice:</span>{" "}
          FaceID is processed inside the Secure Enclave on your iPhone. No biometric data ever leaves your device.
          This is a cryptographic verification — no camera access required.
        </div>
      </motion.div>

      {/* Dual Biometric Badge */}
      <div className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
        >
          <Fingerprint className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-gray-400">TouchID</span>
          <Sparkles className="w-3 h-3 text-yellow-400" />
          <ScanFace className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-gray-400">FaceID</span>
          <span className="text-xs text-emerald-400 font-medium ml-1">Dual Biometric</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FaceIDVerification;
