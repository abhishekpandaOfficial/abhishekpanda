import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(6,182,212,0.22),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(16,185,129,0.2),transparent_45%),linear-gradient(160deg,#020617,#0f172a,#111827)]" />
      <div className="absolute inset-0 opacity-30 [background:linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-xl mx-auto"
      >
        <div className="rounded-3xl border border-cyan-400/25 bg-slate-900/70 backdrop-blur-xl p-6 md:p-10 shadow-[0_0_55px_rgba(6,182,212,0.18)]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1.5 mb-6"
          >
            <Shield className="w-4 h-4 text-cyan-300" />
            <span className="text-xs uppercase tracking-[0.25em] text-cyan-100">Abhishekpanda Error Gateway</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-300"
          >
            ERROR 404
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-3 text-2xl md:text-3xl font-semibold text-white"
          >
            Route not found
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-4 text-slate-300 text-base md:text-lg leading-relaxed"
          >
            This URL does not exist in the Abhishekpanda network map. Use the primary route or admin login below.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-7 flex flex-col sm:flex-row gap-3"
          >
            <Button asChild size="lg" className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold">
              <Link to="/">
                <Home className="w-5 h-5" />
                Home
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 border-cyan-300/40 bg-slate-900/60 text-cyan-100 hover:bg-cyan-500/15">
              <Link to="/admin/login">
                <ArrowLeft className="w-5 h-5" />
                Admin Login
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-6 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Attempted Path</p>
            <code className="mt-1 inline-block text-sm text-cyan-200 font-mono">{location.pathname}</code>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
