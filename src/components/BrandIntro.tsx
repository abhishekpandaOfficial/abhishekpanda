import { motion } from "framer-motion";
import { BurningLogo } from "@/components/ui/BurningLogo";

const brandText = "ABHISHEK PANDA".split("");

export function BrandIntro() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeInOut" } }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[radial-gradient(circle_at_top,_#15203f_0%,_#06070f_45%,_#04040a_100%)]"
      aria-label="Loading Abhishek Panda website"
    >
      <div className="relative flex flex-col items-center px-6">
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <BurningLogo size="xl" animate variant="image" />
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-[0.15rem] text-xl sm:text-2xl md:text-3xl font-black tracking-[0.2em] text-white">
          {brandText.map((char, idx) => (
            <motion.span
              // include idx in key to preserve spaces
              key={`${char}-${idx}`}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + idx * 0.04, duration: 0.32, ease: "easeOut" }}
              className={char === " " ? "w-2 sm:w-3" : ""}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.25, duration: 1.2, ease: "easeInOut" }}
          className="mt-5 h-[2px] w-44 origin-left rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-blue-400"
        />
      </div>
    </motion.div>
  );
}
