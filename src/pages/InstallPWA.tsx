import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Download, 
  Shield, 
  Fingerprint, 
  ScanFace, 
  Smartphone, 
  CheckCircle,
  Share,
  Plus,
  ArrowRight,
  Apple,
  Chrome,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import professional from "@/assets/about/professional.jpg";
import casual from "@/assets/about/casual.jpg";
import lifestyle from "@/assets/about/lifestyle.jpg";
import artistic from "@/assets/about/artistic.jpg";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInSafari, setIsInSafari] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const isPWAInstalled = window.matchMedia("(display-mode: standalone)").matches || 
                           (window.navigator as any).standalone === true;
    
    if (isPWAInstalled) {
      setIsInstalled(true);
    }

    // Detect device type
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroidDevice = /Android/.test(ua);
    
    // Check if running in Safari (not Chrome/Firefox on iOS)
    const isSafariBrowser = /Safari/.test(ua) && !/CriOS|FxiOS|Chrome/.test(ua);
    
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsInSafari(isSafariBrowser);

    // On iOS, automatically show instructions since there's no install prompt
    if (isIOSDevice && !isPWAInstalled) {
      // Small delay to let user see the page first
      const timer = setTimeout(() => {
        setShowIOSInstructions(true);
      }, 500);
      return () => clearTimeout(timer);
    }

    // Listen for install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (!isAndroid) {
      // Desktop without prompt - show generic instructions
      alert("To install: Click the browser menu (⋮) and select 'Install app' or 'Add to Home Screen'");
    }
  };

  const handleInstallWithPreview = async () => {
    setShowPreview(true);
  };

  const continueInstall = async () => {
    setShowPreview(false);
    await handleInstallClick();
  };

  const features = [
    {
      icon: ScanFace,
      title: "FaceID Authentication",
      description: "Use your iPhone's FaceID for secure biometric login",
    },
    {
      icon: Fingerprint,
      title: "TouchID Support",
      description: "Fingerprint authentication on supported devices",
    },
    {
      icon: Shield,
      title: "CIA-Level Security",
      description: "Multi-factor authentication with real-time alerts",
    },
    {
      icon: Smartphone,
      title: "Native App Experience",
      description: "Full-screen mode, offline support, push notifications",
    },
  ];

  const previewScreens = [
    { src: professional, label: "Profile & Identity" },
    { src: casual, label: "Timeline & Highlights" },
    { src: lifestyle, label: "Workflows & Insights" },
    { src: artistic, label: "Brand & Portfolio" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/30 to-red-500/20 flex items-center justify-center shadow-2xl shadow-orange-500/30">
            <img src="/favicon.png" alt="Abhishek Panda" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Abhishek Panda App
          </h1>
          <p className="text-slate-400">
            Install the app for quick access and a native experience
          </p>
        </motion.div>

        {/* Install Status */}
        {isInstalled ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="bg-emerald-500/20 border-emerald-500/30">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-emerald-400 mb-2">
                  App Installed!
                </h2>
                <p className="text-slate-300 text-sm mb-4">
                  You can now use FaceID/TouchID for secure authentication
                </p>
                <Button
                  onClick={() => window.location.href = "/admin/login"}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  Open Admin Panel
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* iOS Instructions - Always shown on iOS */}
            {isIOS ? (
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Apple className="w-8 h-8 text-white" />
                    <h2 className="text-xl font-bold">Install on iPhone</h2>
                  </div>
                  
                  {/* Safari warning if not in Safari */}
                  {!isInSafari && (
                    <div className="mb-4 p-3 rounded-lg bg-amber-500/20 border border-amber-500/30">
                      <p className="text-amber-400 text-sm font-medium">
                        ⚠️ Open this page in Safari to install
                      </p>
                      <p className="text-amber-400/70 text-xs mt-1">
                        iOS only allows PWA installation from Safari browser
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Tap the Share button</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                            <Share className="w-5 h-5 text-blue-400" />
                          </div>
                          <p className="text-sm text-slate-400">
                            At the bottom of Safari
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Scroll down and tap</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-8 h-8 rounded bg-slate-600 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white" />
                          </div>
                          <p className="text-sm text-slate-300 font-medium">
                            "Add to Home Screen"
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Tap "Add" in the top right</p>
                        <p className="text-sm text-slate-400 mt-1">
                          The app icon will appear on your home screen
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-emerald-400 text-sm">
                      ✨ After installing, open the app from your home screen to enable Face ID authentication
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Button
                  onClick={handleInstallWithPreview}
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 shadow-lg shadow-violet-500/30"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download App
                </Button>
                <p className="text-center text-slate-500 text-sm mt-3">
                  {isAndroid
                    ? "Install directly from Chrome"
                    : "Add to your home screen for the best experience"}
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-slate-300 mb-4">
            Why install the app?
          </h3>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{feature.title}</h4>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-slate-500 text-sm"
        >
          <p>
            Installing the app enables WebAuthn biometric authentication
          </p>
          <p className="mt-1">
            FaceID on iPhone • TouchID on Mac/iPad
          </p>
        </motion.div>

        {/* Skip Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <Button
            variant="link"
            className="text-slate-400 hover:text-white"
            onClick={() => window.location.href = "/admin/login"}
          >
            Skip and continue to login
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <img src="/favicon.png" alt="Abhishek Panda" className="h-8 w-8 object-contain" />
              Preview the App
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">
                A quick look before installing. Your app icon uses the Burning A logo.
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {previewScreens.map((screen) => (
                <div key={screen.label} className="rounded-2xl overflow-hidden border border-border bg-card">
                  <img src={screen.src} alt={screen.label} className="h-40 w-full object-cover" />
                  <div className="p-3 text-xs text-muted-foreground">{screen.label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
              <Button onClick={continueInstall} className="gap-2">
                <Download className="w-4 h-4" />
                Continue to Install
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstallPWA;
