import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Lock, Mail, Eye, EyeOff, KeyRound, Loader2, AlertCircle, 
  AlertTriangle, Skull, Fingerprint, CheckCircle2, ArrowRight,
  ShieldCheck, Sparkles, ChevronRight, MapPin, Globe, Smartphone
} from "lucide-react";
import { ActiveSessionModal } from "@/components/admin/ActiveSessionModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useWebAuthn } from "@/hooks/useWebAuthn";
import { useSecurityAlert } from "@/hooks/useSecurityAlert";
import { useGeoBlocking } from "@/hooks/useGeoBlocking";
import { useActiveSession } from "@/hooks/useActiveSession";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

// Utility to get device info for audit logging
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let deviceType = 'Desktop';

  if (ua.includes('Chrome') && !ua.includes('Edge')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  if (/Mobi|Android/i.test(ua)) deviceType = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'Tablet';

  return { browser, deviceType, userAgent: ua };
};

// Log login attempt to audit table
const logLoginAttempt = async (email: string, status: string, failureReason?: string) => {
  const { browser, deviceType, userAgent } = getDeviceInfo();
  
  try {
    await supabase.from('login_audit_logs').insert({
      email,
      user_agent: userAgent,
      device_type: deviceType,
      browser,
      status,
      failure_reason: failureReason || null,
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};

type AuthPhase = "password" | "passkey_setup" | "fingerprint" | "success";

// Detect if running as PWA
const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

// Detect mobile device
const isMobileDevice = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<AuthPhase>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [fingerprintStatus, setFingerprintStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRunningAsPWA, setIsRunningAsPWA] = useState(false);
  
  const { 
    isSupported, 
    registerCredential, 
    authenticateWithCredential, 
    detectCapabilities, 
    credentials, 
    loadCredentials, 
    error: webAuthnError,
    debug: webAuthnDebug,
    resetPasskeyState,
    availableMethods,
  } = useWebAuthn();
  const { sendSecurityAlert, resetAttempts, getAttemptCount } = useSecurityAlert();
  const { validateLogin, recordFailedAttempt, resetRateLimit, currentLocation, riskLevel } = useGeoBlocking();
  const { hasOtherActiveSessions, otherSessionDevice, registerSession, killAllOtherSessions, refreshSessions } = useActiveSession();
  
  const [fingerprintAttempts, setFingerprintAttempts] = useState(0);
  const [geoWarnings, setGeoWarnings] = useState<string[]>([]);
  const [isGeoBlocked, setIsGeoBlocked] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [pendingLoginAction, setPendingLoginAction] = useState<(() => void) | null>(null);

  // Check platform and PWA status on mount
  useEffect(() => {
    setIsMobile(isMobileDevice());
    setIsRunningAsPWA(isPWA());
    
    // Show PWA prompt if on mobile but not running as PWA
    if (isMobileDevice() && !isPWA()) {
      // Don't show immediately, let user see the login page first
      const timer = setTimeout(() => {
        setShowPWAPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Check if returning user with passkey - redirect to biometric flow
  useEffect(() => {
    const hasPasskey = localStorage.getItem('admin_passkey_registered') === 'true';
    const is2FAComplete = sessionStorage.getItem('admin_2fa_verified') === 'true';
    
    if (hasPasskey && is2FAComplete) {
      navigate('/admin');
    }
  }, [navigate]);

  // Auto-navigate to admin panel after success phase (especially important for mobile)
  useEffect(() => {
    if (phase === 'success') {
      // Wait for animation to complete then auto-navigate
      const timer = setTimeout(() => {
        navigate('/admin');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [phase, navigate]);

  useEffect(() => {
    detectCapabilities();
    loadCredentials();
  }, [detectCapabilities, loadCredentials]);

  // Lock countdown timer
  useEffect(() => {
    if (lockCountdown > 0) {
      const timer = setTimeout(() => setLockCountdown(lockCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (lockCountdown === 0 && isLocked) {
      setIsLocked(false);
      setFailedAttempts(0);
    }
  }, [lockCountdown, isLocked]);

  const handleFirstTimeSetup = async () => {
    setError("");
    setIsLoading(true);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      const { data, error: setupError } = await supabase.functions.invoke('admin-setup', {
        body: { email, password }
      });

      if (setupError) throw new Error(setupError.message || "Setup failed");
      if (data?.error) throw new Error(data.error);

      toast.success("Admin account created! Now sign in with your credentials.");
      setIsFirstTimeSetup(false);

    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || "Setup failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // PHASE 1: Password verification
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    setError("");
    setIsLoading(true);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      await logLoginAttempt(email, 'attempt');

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        await logLoginAttempt(email, 'failed', signInError.message);
        
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);

        if (newFailedAttempts >= 3) {
          setIsLocked(true);
          setLockCountdown(30);
          setError("Account locked for 30 seconds due to multiple failed attempts.");
          return;
        }

        if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid credentials. Use 'First Time Setup' if new.");
          return;
        }
        throw new Error(signInError.message);
      }

      if (!data.user) {
        await logLoginAttempt(email, 'failed', 'No user data returned');
        throw new Error("Authentication failed");
      }

      // Check admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleData) {
        await logLoginAttempt(email, 'blocked', 'No admin privileges');
        await supabase.auth.signOut();
        throw new Error("Access denied. Admin privileges required.");
      }

      setUserId(data.user.id);
      setFailedAttempts(0);

      // Check if passkey is already registered
      const hasExistingPasskey = localStorage.getItem('admin_passkey_registered') === 'true';
      
      // Check for other active sessions before proceeding
      await refreshSessions();
      
      if (hasOtherActiveSessions && otherSessionDevice) {
        setShowSessionModal(true);
        setPendingLoginAction(() => () => {
          // If no passkey, go to passkey setup first
          if (!hasExistingPasskey) {
            setPhase("passkey_setup");
            toast.success("Password verified! Now register your passkey.");
          } else {
            // Has passkey - proceed to passkey verification
            setPhase("fingerprint");
            toast.success("Password verified! Now verify your passkey.");
          }
        });
      } else {
        // If no passkey, go to passkey setup first
        if (!hasExistingPasskey) {
          setPhase("passkey_setup");
          toast.success("Password verified! Now register your passkey.");
        } else {
          // Has passkey - proceed to passkey verification
          setPhase("fingerprint");
          toast.success("Password verified! Now verify your passkey.");
        }
      }

    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || "Authentication failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // PASSKEY SETUP PHASE - After password
  const handlePasskeySetup = async () => {
    setError("");
    setIsLoading(true);

    // Check if in iframe first
    const isInIframe = window !== window.top;
    if (isInIframe) {
      setError('Passkey registration cannot work in the preview iframe. Please open the deployed/published app URL directly.');
      setIsLoading(false);
      toast.error('Cannot register passkey in preview mode');
      return;
    }

    try {
      // Show a toast to guide the user
      toast.info('Touch ID prompt will appear shortly - place your finger on the sensor when the system asks', { 
        duration: 10000,
        id: 'touchid-setup-hint'
      });
      
      // Small delay to let the toast appear first
      await new Promise(resolve => setTimeout(resolve, 500));

      const success = await registerCredential({ passkeyOnly: true });
      
      toast.dismiss('touchid-setup-hint');

      if (success) {
        localStorage.setItem('admin_passkey_registered', 'true');
        sessionStorage.setItem('admin_2fa_verified', 'true');
        sessionStorage.setItem('admin_2fa_timestamp', Date.now().toString());
        sessionStorage.setItem('biometric_verified', Date.now().toString());
        toast.success('Passkey registered! Access granted.');
        setPhase("success");
      } else {
        // Use the error from webAuthn hook if available
        const errorMsg = webAuthnError || 'Passkey registration failed. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      toast.dismiss('touchid-setup-hint');
      
      if (err?.name === 'NotAllowedError') {
        setError('Touch the Touch ID sensor when the system prompts you.');
      } else if (err?.name === 'InvalidStateError') {
        // Passkey already exists - proceed anyway
        localStorage.setItem('admin_passkey_registered', 'true');
        sessionStorage.setItem('admin_2fa_verified', 'true');
        sessionStorage.setItem('admin_2fa_timestamp', Date.now().toString());
        sessionStorage.setItem('biometric_verified', Date.now().toString());
        toast.success('Passkey already registered! Access granted.');
        setPhase("success");
      } else {
        setError(err.message || 'Failed to register passkey');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasskeyState = async () => {
    const ok = await resetPasskeyState();
    if (ok) {
      toast.success("Passkey state reset. You can register again.");
    } else {
      toast.error("Failed to reset passkey state. Check debug panel.");
    }
  };

  // PHASE 2: Passkey verification
  const handleFingerprintAuth = async () => {
    if (fingerprintAttempts >= 5) {
      setError("Too many failed attempts. Account locked.");
      toast.error("Account temporarily locked due to multiple failed attempts");
      return;
    }

    setFingerprintStatus('scanning');
    setError("");

    try {
      const hasExistingPasskey = localStorage.getItem('admin_passkey_registered') === 'true';
      
      let success = false;
      
      if (hasExistingPasskey) {
        // Passkey-only verification
        success = await authenticateWithCredential({ passkeyOnly: true });
      } else {
        // Force passkey setup first
        success = await registerCredential({ passkeyOnly: true });
      }

      if (success) {
        setFingerprintStatus('success');
        setFingerprintAttempts(0);
        resetAttempts(email, 'Passkey');
        await new Promise(resolve => setTimeout(resolve, 1500));
        sessionStorage.setItem('admin_2fa_verified', 'true');
        sessionStorage.setItem('admin_2fa_timestamp', Date.now().toString());
        sessionStorage.setItem('biometric_verified', Date.now().toString());
        toast.success("Passkey verified! Access granted.");
        setPhase("success");
      } else {
        await handleFingerprintFailure();
      }
    } catch (error: any) {
      console.error('Fingerprint error:', error);
      await handleFingerprintFailure(error.message);
    }
  };

  const handleFingerprintFailure = async (customError?: string) => {
    const newAttempts = fingerprintAttempts + 1;
    setFingerprintAttempts(newAttempts);
    setFingerprintStatus('error');

    // Send security alert for failed fingerprint (triggers after 2+ attempts)
    const { attemptCount, alertSent } = await sendSecurityAlert(
      email,
      'Passkey Verification',
      'failed_biometric'
    );

    if (alertSent) {
      setError(`Passkey failed. Security alert sent (Attempt ${attemptCount})`);
      toast.error(`Security alert triggered after ${attemptCount} failed passkey attempts`);
    } else {
      setError(customError || "Passkey not recognized. Try again.");
    }

    if (newAttempts >= 5) {
      setError("Account temporarily locked due to multiple failed attempts");
    }

    setTimeout(() => setFingerprintStatus('idle'), 2500);
  };

  const handleEnterCommandCenter = async () => {
    await registerSession();
    navigate('/admin');
  };

  const handleSessionContinue = () => {
    setShowSessionModal(false);
    if (pendingLoginAction) {
      pendingLoginAction();
      setPendingLoginAction(null);
    }
  };

  const handleSessionKillAndContinue = async () => {
    await killAllOtherSessions();
    setShowSessionModal(false);
    toast.success('Previous session terminated');
    if (pendingLoginAction) {
      pendingLoginAction();
      setPendingLoginAction(null);
    }
  };

  const handleSessionCancel = async () => {
    setShowSessionModal(false);
    setPendingLoginAction(null);
    await supabase.auth.signOut();
    setPhase('password');
  };

  const getPhaseNumber = () => {
    switch (phase) {
      case 'password': return 1;
      case 'passkey_setup': return 2;
      case 'fingerprint': return 2;
      case 'success': return 3;
      default: return 1;
    }
  };

  const renderProgressBar = () => {
    const totalSteps = 3;
    const currentStep = getPhaseNumber();
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep > step 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : currentStep === step 
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' 
                      : 'border-gray-700 text-gray-600 bg-gray-800/50'
                }`}
                animate={currentStep === step ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: currentStep === step ? Infinity : 0, repeatDelay: 1 }}
              >
                {currentStep > step ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{step}</span>
                )}
              </motion.div>
              {step < totalSteps && (
                <div className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${
                  currentStep > step ? 'bg-emerald-500' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            Step {Math.min(currentStep, totalSteps)} of {totalSteps}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Danger Warning Banner */}
        {phase === 'password' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/20 via-red-600/20 to-red-500/20 border-2 border-red-500/50 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Skull className="w-7 h-7 text-red-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-red-500 font-bold text-sm uppercase tracking-wider">DANGER ZONE</span>
                </div>
                <p className="text-red-400 text-sm font-semibold mt-1">
                  ⚠️ Don't Try to Login — I Am Watching!
                </p>
                <p className="text-red-400/70 text-xs mt-1">
                  Unauthorized access attempts are logged and traced.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Card */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-70" />
          <div className="relative bg-[#12121a]/95 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 shadow-2xl">
            
            {/* Progress Bar - show for phases 1-4 */}
            {phase !== 'success' && renderProgressBar()}

            <AnimatePresence mode="wait">
              {/* PHASE 1: Password Verification */}
              {phase === "password" && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                      <Lock className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Secure Login — Step 1 of 3</h2>
                    <p className="text-gray-400 text-sm mt-1">Enter your administrator credentials.</p>
                  </div>

                  <form onSubmit={isFirstTimeSetup ? (e) => { e.preventDefault(); handleFirstTimeSetup(); } : handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@example.com"
                          className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500/50"
                          disabled={isLoading || isLocked}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500/50"
                          disabled={isLoading || isLocked}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, x: 0 }}
                        animate={{ opacity: 1, y: 0, x: failedAttempts > 0 ? [0, -5, 5, -5, 5, 0] : 0 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    {isLocked && (
                      <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="text-red-400 font-medium">Account Locked</p>
                        <p className="text-red-400/70 text-sm">Try again in {lockCountdown} seconds</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || isLocked}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white h-12 shadow-lg shadow-emerald-500/25"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          {isFirstTimeSetup ? 'Create Admin Account' : 'Verify Password'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    {/* First Time Setup - Disabled for security */}
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={true}
                        className="w-full border-gray-700 bg-gray-800/30 text-gray-500 cursor-not-allowed opacity-50"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        First Time Setup (Disabled)
                      </Button>
                      <p className="text-[10px] text-gray-500 text-center mt-2">
                        Admin accounts can only be created by system administrators
                      </p>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* PHASE 2: Passkey Setup (only shown if no passkey registered) */}
              {phase === "passkey_setup" && (
                <motion.div
                  key="passkey_setup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                      <KeyRound className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Register Passkey — Step 2 of 3</h2>
                    <p className="text-gray-400 text-sm mt-1">Set up biometric authentication for secure access.</p>
                  </div>

                  {/* Passkey Info */}
                  <div className="space-y-3">
                    {[
                      { icon: Shield, text: 'Military-grade encryption' },
                      { icon: Fingerprint, text: 'Uses device biometrics for passkeys' },
                      { icon: Lock, text: 'Biometrics never leave your device' },
                    ].map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50"
                      >
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <feature.icon className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-gray-300">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <p className="text-xs text-blue-300 text-center">
                      When you click the button below, a system dialog will appear. Place your finger on the Touch ID sensor when prompted.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handlePasskeySetup}
                      disabled={isLoading}
                      className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-lg font-semibold shadow-lg shadow-emerald-500/25 rounded-xl"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Waiting for Touch ID...
                        </>
                      ) : (
                        <>
                          <Fingerprint className="w-5 h-5 mr-2" />
                          Register Passkey
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetPasskeyState}
                      className="w-full border-gray-700 bg-gray-800/30 text-gray-300 hover:bg-gray-800/60"
                    >
                      Reset Passkey State
                    </Button>
                  </div>

                  <div className="rounded-xl border border-gray-700/60 bg-gray-900/40 p-4 text-xs text-gray-300">
                    <div className="text-gray-400 font-semibold mb-2">WebAuthn Debug</div>
                    <div>Supported: {isSupported ? "true" : "false"}</div>
                    <div>Methods: {availableMethods.length ? availableMethods.join(", ") : "none"}</div>
                    <div>Last Action: {webAuthnDebug.lastAction ?? "none"}</div>
                    <div>Hook Error: {webAuthnError ?? "none"}</div>
                    <div>
                      WebAuthn Error: {webAuthnDebug.lastWebAuthnError ? `${webAuthnDebug.lastWebAuthnError.name ?? "Error"}: ${webAuthnDebug.lastWebAuthnError.message ?? ""}` : "none"}
                    </div>
                    <div>
                      Edge Error: {webAuthnDebug.lastEdgeError ? `${webAuthnDebug.lastEdgeError.name ?? "Error"}: ${webAuthnDebug.lastEdgeError.message ?? ""}` : "none"}
                    </div>
                    <div className="mt-2 text-gray-400">Edge Response:</div>
                    <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-black/40 p-2 text-[10px] text-gray-200">
                      {JSON.stringify(webAuthnDebug.lastEdgeResponse ?? {}, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              )}

              {/* PHASE 2: Passkey Verification */}
              {phase === "fingerprint" && (
                <motion.div
                  key="fingerprint"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-white">Passkey Verification — Step 2 of 3</h2>
                    <p className="text-gray-400 text-sm mt-1">Authenticate with your Passkey to continue.</p>
                  </div>

                  {/* Fingerprint Scanner */}
                  <div className="flex justify-center py-8">
                    <AnimatePresence mode="wait">
                      {fingerprintStatus === 'idle' && (
                        <motion.button
                          key="fp-idle"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          onClick={handleFingerprintAuth}
                          className="relative group cursor-pointer"
                        >
                          <motion.div
                            className="absolute inset-0 bg-emerald-500/30 rounded-full blur-2xl"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/40 flex items-center justify-center transition-all group-hover:border-emerald-400 group-hover:shadow-lg group-hover:shadow-emerald-500/30">
                            <Fingerprint className="w-20 h-20 text-emerald-400 group-hover:scale-110 transition-transform" />
                          </div>
                        </motion.button>
                      )}

                      {fingerprintStatus === 'scanning' && (
                        <motion.div
                          key="fp-scanning"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="relative"
                        >
                          <motion.div
                            className="absolute inset-0 bg-emerald-500/40 rounded-full blur-2xl"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                          <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-2 border-emerald-400 flex items-center justify-center">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                            >
                              <Fingerprint className="w-20 h-20 text-emerald-400" />
                            </motion.div>
                          </div>
                          <motion.div
                            className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                            animate={{ top: ['20%', '80%', '20%'] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          />
                        </motion.div>
                      )}

                      {fingerprintStatus === 'success' && (
                        <motion.div
                          key="fp-success"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative"
                        >
                          <div className="absolute inset-0 bg-green-500/40 rounded-full blur-2xl" />
                          <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-green-500/30 to-green-600/20 border-2 border-green-400 flex items-center justify-center">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                            >
                              <CheckCircle2 className="w-20 h-20 text-green-400" />
                            </motion.div>
                          </div>
                        </motion.div>
                      )}

                      {fingerprintStatus === 'error' && (
                        <motion.div
                          key="fp-error"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1, x: [0, -10, 10, -10, 10, 0] }}
                          transition={{ x: { duration: 0.4 } }}
                          className="relative"
                        >
                          <div className="absolute inset-0 bg-red-500/40 rounded-full blur-2xl" />
                          <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 border-2 border-red-400 flex items-center justify-center">
                            <Fingerprint className="w-20 h-20 text-red-400" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Status Text */}
                  <div className="text-center">
                    {fingerprintStatus === 'idle' && (
                      <p className="text-gray-400 text-sm">Place your finger on the sensor</p>
                    )}
                    {fingerprintStatus === 'scanning' && (
                      <div className="flex items-center justify-center gap-2 text-emerald-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Scanning fingerprint...</span>
                      </div>
                    )}
                    {fingerprintStatus === 'success' && (
                      <p className="text-green-400 text-sm font-medium">Passkey verified!</p>
                    )}
                    {fingerprintStatus === 'error' && (
                      <p className="text-red-400 text-sm">{error || "Passkey not recognized"}</p>
                    )}
                  </div>

                  {fingerprintStatus === 'idle' && (
                    <Button
                      onClick={handleFingerprintAuth}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white h-12 shadow-lg shadow-emerald-500/25"
                    >
                      <Fingerprint className="w-5 h-5 mr-2" />
                      Use Passkey
                    </Button>
                  )}

                  {fingerprintStatus === 'error' && (
                    <Button
                      onClick={() => setFingerprintStatus('idle')}
                      variant="outline"
                      className="w-full border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-300"
                    >
                      Try again
                    </Button>
                  )}
                </motion.div>
              )}

              {/* FINAL SUCCESS: All Verified */}
              {phase === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8 text-center py-4"
                >
                  {/* Success Shield Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="flex justify-center"
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-emerald-500/40 rounded-full blur-3xl"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-2 border-emerald-400 flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', delay: 0.4 }}
                        >
                          <ShieldCheck className="w-14 h-14 text-emerald-400" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Success Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <h2 className="text-2xl font-bold text-white">Verification Complete</h2>
                    <p className="text-gray-400">All security layers validated.</p>
                  </motion.div>

                  {/* Verified Steps */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { icon: Lock, label: 'Password', color: 'emerald' },
                      { icon: Fingerprint, label: 'Passkey', color: 'emerald' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-${item.color}-500/20 flex items-center justify-center`}>
                          <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                        </div>
                        <span className="text-gray-300 text-sm">{item.label}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Enter Command Center Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <Button
                      onClick={handleEnterCommandCenter}
                      className="w-full bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white h-14 text-lg shadow-lg shadow-emerald-500/25"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Enter Command Center
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Security Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center space-y-3"
        >
          <p className="text-xs text-gray-600">
            🔒 CIA+ Zero Trust Security • WebAuthn Protocol • No Alternative Paths
          </p>
          
          {/* Mobile Install Link */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <Button
              variant="link"
              onClick={() => navigate('/install')}
              className="text-emerald-500/70 hover:text-emerald-400 text-xs"
            >
              <Smartphone className="w-3 h-3 mr-1" />
              Install PWA for Passkeys
            </Button>
            <Button
              variant="link"
              onClick={() => navigate('/admin/register-passkey')}
              className="text-cyan-500/70 hover:text-cyan-400 text-xs"
            >
              <KeyRound className="w-3 h-3 mr-1" />
              Register New Passkey
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* PWA Install Prompt Modal for Mobile */}
      <AnimatePresence>
        {showPWAPrompt && isMobile && !isRunningAsPWA && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-t-3xl sm:rounded-3xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 pb-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                >
                  <Smartphone className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Install Admin App
                </h3>
                <p className="text-gray-400 text-sm">
                  For the best passkey experience and secure admin access, install this app on your device.
                </p>
              </div>

              {/* Benefits */}
              <div className="px-6 pb-4 space-y-2">
                {[
                  { icon: Fingerprint, text: 'Native passkey support' },
                  { icon: Shield, text: 'Enhanced Security Features' },
                  { icon: Sparkles, text: 'Faster, App-Like Experience' },
                ].map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-gray-300 text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="p-6 pt-2 space-y-3">
                <Button
                  onClick={() => navigate('/install')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white h-12 shadow-lg shadow-emerald-500/25"
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  Install Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowPWAPrompt(false)}
                  className="w-full text-gray-400 hover:text-white"
                >
                  Continue in Browser
                </Button>
              </div>

              {/* Disclaimer */}
              <div className="px-6 pb-6">
                <p className="text-[10px] text-gray-500 text-center">
                  Installing the app provides hardware-level biometric security via Secure Enclave.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Session Modal */}
      <ActiveSessionModal
        isOpen={showSessionModal}
        deviceName={otherSessionDevice || 'Unknown Device'}
        onContinue={handleSessionContinue}
        onKillAndContinue={handleSessionKillAndContinue}
        onCancel={handleSessionCancel}
      />
    </div>
  );
};

export default AdminLogin;
