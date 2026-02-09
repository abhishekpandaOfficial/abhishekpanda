import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BurningLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export const BurningLogo = ({ size = 'md', className, animate = true }: BurningLogoProps) => {
  return (
    <div className={cn('relative', sizeClasses[size], className)} aria-label="Abhishek Panda logo">
      {/* Glow aura */}
      {animate ? (
        <motion.div
          className="absolute -inset-2 rounded-2xl blur-xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255,140,0,0.55), rgba(255,69,0,0.25), rgba(0,0,0,0))",
          }}
          // Subtle: keep the glow tight and low-amplitude.
          animate={{ opacity: [0.22, 0.35, 0.22], scale: [0.99, 1.02, 0.99] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      <div className="relative w-full h-full rounded-xl overflow-hidden border border-border/60 bg-background shadow-sm">
        <img
          src="/favicon.png"
          alt="Abhishek Panda"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />

        {/* Flames */}
        {animate ? (
          <>
            <motion.div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-[70%] h-[70%] rounded-full blur-sm mix-blend-screen"
              style={{
                background:
                  "radial-gradient(circle at 50% 75%, rgba(255,220,120,0.95), rgba(255,120,0,0.65) 45%, rgba(255,0,0,0) 70%)",
              }}
              animate={{
                // Subtle flicker
                y: [-1, -3, -2, -3.5, -1],
                scale: [1, 1.03, 1.01, 1.04, 1],
                opacity: [0.22, 0.35, 0.26, 0.32, 0.22],
              }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -top-1 left-[32%] w-[32%] h-[42%] rounded-full blur-md mix-blend-screen"
              style={{
                background:
                  "radial-gradient(circle at 50% 80%, rgba(255,255,255,0.9), rgba(255,170,0,0.6) 45%, rgba(255,0,0,0) 72%)",
              }}
              animate={{ y: [-1, -4, -2], x: [-0.5, 0.5, -0.5], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -top-1 right-[24%] w-[28%] h-[38%] rounded-full blur-md mix-blend-screen"
              style={{
                background:
                  "radial-gradient(circle at 50% 80%, rgba(255,240,200,0.85), rgba(255,110,0,0.55) 45%, rgba(255,0,0,0) 72%)",
              }}
              animate={{ y: [-1, -3.5, -2], x: [0.5, -0.5, 0.5], opacity: [0.06, 0.16, 0.06] }}
              transition={{ duration: 1.45, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* ember flicker */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.03, 0.06, 0.035] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
              style={{
                background:
                  "radial-gradient(circle at 20% 30%, rgba(255,210,120,0.35), transparent 35%), radial-gradient(circle at 75% 25%, rgba(255,140,0,0.25), transparent 40%), radial-gradient(circle at 55% 60%, rgba(255,80,0,0.18), transparent 45%)",
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};

export default BurningLogo;
