import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BurningLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-10 h-10 text-xl',
  lg: 'w-16 h-16 text-3xl',
  xl: 'w-24 h-24 text-5xl',
};

export const BurningLogo = ({ size = 'md', className, animate = true }: BurningLogoProps) => {
  return (
    <div className={cn('relative overflow-hidden rounded-xl', sizeClasses[size], className)}>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500" />
      
      {/* Animated fire glow */}
      {animate && (
        <>
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-orange-600 via-red-500 to-yellow-400 opacity-80"
            animate={{ opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          {/* Fire particles */}
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1/3 bg-gradient-to-t from-orange-500 to-transparent blur-sm"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          {/* Flickering flame effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-yellow-400/30 via-transparent to-transparent"
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              y: [0, -2, 0]
            }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
          />
        </>
      )}
      
      {/* The A letter */}
      <motion.span 
        className="relative z-10 flex items-center justify-center w-full h-full text-white font-black drop-shadow-lg"
        style={{ 
          textShadow: '0 0 10px #ff6b00, 0 0 20px #ff4500, 0 0 30px #ff0000, 0 0 40px #ff6600'
        }}
        animate={animate ? {
          textShadow: [
            '0 0 10px #ff6b00, 0 0 20px #ff4500, 0 0 30px #ff0000, 0 0 40px #ff6600',
            '0 0 15px #ff8c00, 0 0 30px #ff6b00, 0 0 45px #ff4500, 0 0 60px #ff0000',
            '0 0 10px #ff6b00, 0 0 20px #ff4500, 0 0 30px #ff0000, 0 0 40px #ff6600',
          ]
        } : undefined}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        A
      </motion.span>
    </div>
  );
};

export default BurningLogo;
