import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SliderPhotoItem = {
  src: string;
  alt: string;
  title: string;
  caption: string;
  borderGradient: string;
  badgeColor: string;
  icon: LucideIcon;
  imageClassName?: string;
};

type GsapInfinitePhotoSliderProps = {
  items: SliderPhotoItem[];
  className?: string;
};

export function GsapInfinitePhotoSlider({ items, className }: GsapInfinitePhotoSliderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const loopItems = useMemo(() => [...items, ...items], [items]);

  useEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!root || !viewport || !track || items.length === 0) return;

    const ctx = gsap.context(() => {
      let loopTween: gsap.core.Tween | null = null;

      const rebuildLoop = () => {
        loopTween?.kill();
        gsap.set(track, { x: 0 });

        const loopDistance = track.scrollWidth / 2;
        if (loopDistance <= 0) return;

        loopTween = gsap.to(track, {
          x: -loopDistance,
          duration: Math.max(26, loopDistance / 46),
          ease: "none",
          repeat: -1,
        });
      };

      rebuildLoop();

      const resizeObserver = new ResizeObserver(() => rebuildLoop());
      resizeObserver.observe(track);
      resizeObserver.observe(viewport);

      const onEnter = () => loopTween?.pause();
      const onLeave = () => loopTween?.resume();

      viewport.addEventListener("mouseenter", onEnter);
      viewport.addEventListener("mouseleave", onLeave);
      viewport.addEventListener("touchstart", onEnter, { passive: true });
      viewport.addEventListener("touchend", onLeave);

      const previewTicker = window.setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % items.length);
      }, 2400);

      return () => {
        clearInterval(previewTicker);
        resizeObserver.disconnect();
        viewport.removeEventListener("mouseenter", onEnter);
        viewport.removeEventListener("mouseleave", onLeave);
        viewport.removeEventListener("touchstart", onEnter);
        viewport.removeEventListener("touchend", onLeave);
        loopTween?.kill();
      };
    }, root);

    return () => ctx.revert();
  }, [items]);

  return (
    <div ref={rootRef} className={cn("relative left-1/2 w-screen max-w-none -translate-x-1/2", className)}>
      <div
        ref={viewportRef}
        className="relative overflow-hidden rounded-none border-y border-border/50 bg-card/60 p-3 shadow-[0_16px_50px_rgba(2,6,23,0.3)] md:rounded-[2rem] md:border"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-background to-transparent" />

        <div ref={trackRef} className="flex w-max gap-4">
          {loopItems.map((item, index) => {
            const original = index % items.length;
            const isActive = original === activeIndex;
            return (
              <article
                key={`${item.title}-${index}`}
                className={cn(
                  "relative h-[340px] w-[230px] shrink-0 overflow-hidden rounded-3xl border border-white/20 transition-transform duration-500 md:h-[430px] md:w-[280px]",
                  isActive && "scale-[1.02]",
                )}
              >
                <span className="absolute inset-0 z-10 opacity-80" style={{ backgroundImage: `linear-gradient(to top, rgba(2,6,23,0.72), transparent 50%)` }} />
                <span
                  className="pointer-events-none absolute inset-0 z-0 opacity-30 blur-xl"
                  style={{ backgroundImage: item.borderGradient }}
                />

                <img
                  src={item.src}
                  alt={item.alt}
                  className={cn("h-full w-full object-cover object-top", item.imageClassName)}
                  draggable={false}
                />

                <div className="absolute bottom-3 right-3 z-20 rounded-full bg-black/55 px-3 py-1.5 text-[11px] text-white backdrop-blur-sm md:text-xs">
                  {item.caption}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((item, index) => (
          <button
            key={`${item.title}-dot`}
            type="button"
            aria-label={`Focus ${item.title}`}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              activeIndex === index ? "w-8" : "w-2 bg-muted-foreground/40",
            )}
            style={activeIndex === index ? { backgroundImage: item.borderGradient } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
