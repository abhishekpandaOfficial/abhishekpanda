import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  coverImage: string;
  title: string;
  spineText?: string;
  thickness?: number;
  accentColor?: string;
  className?: string;
};

export function Book3D({
  coverImage,
  title,
  spineText,
  thickness = 16,
  accentColor = "#2563eb",
  className = "",
}: Props) {
  const [hover, setHover] = useState({ rx: -8, ry: 12 });

  const style = useMemo(
    () => ({
      transformStyle: "preserve-3d" as const,
      perspective: "1200px",
      ["--book-thickness" as string]: `${thickness}px`,
      ["--accent" as string]: accentColor,
    }),
    [thickness, accentColor]
  );

  return (
    <motion.div
      className={`relative h-[300px] w-[220px] select-none [transform-style:preserve-3d] ${className}`}
      style={style}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setHover({ rx: -y * 14, ry: x * 18 });
      }}
      onMouseLeave={() => setHover({ rx: -8, ry: 12 })}
      animate={{ rotateX: hover.rx, rotateY: hover.ry }}
      transition={{ type: "spring", stiffness: 140, damping: 14 }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-black/30 to-black/10 blur-xl translate-x-4 translate-y-4" />

      <div className="absolute inset-0 rounded-xl overflow-hidden border border-white/20 shadow-[0_18px_38px_rgba(0,0,0,0.45)] [transform:translateZ(calc(var(--book-thickness)/2))]">
        <img src={coverImage} alt={title} className="h-full w-full object-cover" loading="lazy" />
      </div>

      <div className="absolute top-0 bottom-0 left-0 w-[var(--book-thickness)] rounded-l-xl bg-[var(--accent)]/85 border border-white/10 [transform:rotateY(-90deg)_translateZ(calc(var(--book-thickness)/2))] [transform-origin:left_center]">
        <div className="h-full w-full flex items-center justify-center">
          <span className="-rotate-90 text-[10px] tracking-[0.18em] text-white/90 uppercase whitespace-nowrap">
            {spineText || "Abhishek Panda"}
          </span>
        </div>
      </div>

      <div className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <div className="md:hidden absolute inset-0" />
    </motion.div>
  );
}
