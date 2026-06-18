import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, Tablet, AlertTriangle, X, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActiveSessionModalProps {
  isOpen: boolean;
  deviceName: string;
  onContinue: () => void;
  onKillAndContinue: () => void;
  onCancel: () => void;
}

export const ActiveSessionModal = ({
  isOpen,
  deviceName,
  onContinue,
  onKillAndContinue,
  onCancel,
}: ActiveSessionModalProps) => {
  const getDeviceIcon = () => {
    const lower = deviceName.toLowerCase();
    if (lower.includes('iphone') || lower.includes('android')) {
      return Smartphone;
    } else if (lower.includes('ipad') || lower.includes('tablet')) {
      return Tablet;
    }
    return Monitor;
  };

  const DeviceIcon = getDeviceIcon();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 shadow-2xl shadow-amber-500/10">
              {/* Close button */}
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Warning Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="relative"
                >
                  <motion.div
                    className="absolute inset-0 bg-amber-500/30 rounded-full blur-2xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/20 border-2 border-amber-500/50 flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-amber-400" />
                  </div>
                </motion.div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Active Session Detected
                </h2>
                <p className="text-muted-foreground text-sm">
                  Another session is currently active on:
                </p>
              </div>

              {/* Device Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <DeviceIcon className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{deviceName}</p>
                  <p className="text-xs text-muted-foreground">Session active now</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              </motion.div>

              {/* Options */}
              <div className="space-y-3">
                <Button
                  onClick={onKillAndContinue}
                  className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-semibold shadow-lg shadow-amber-500/25"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Kill Previous Session & Continue
                </Button>

                <Button
                  onClick={onContinue}
                  variant="outline"
                  className="w-full h-12 border-border/50 text-foreground hover:bg-muted/50"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Continue Anyway (Multi-Session)
                </Button>

                <Button
                  onClick={onCancel}
                  variant="ghost"
                  className="w-full h-10 text-muted-foreground hover:text-foreground"
                >
                  Cancel Login
                </Button>
              </div>

              {/* Security Note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-xs text-muted-foreground mt-4"
              >
                🔐 All session activity is logged for security
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
