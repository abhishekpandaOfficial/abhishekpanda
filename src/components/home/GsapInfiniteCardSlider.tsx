import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type GsapInfiniteCardSliderProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  speed?: number;
  reverse?: boolean;
  showNavigation?: boolean;
  autoPlay?: boolean;
};

export function GsapInfiniteCardSlider<T>({
  items,
  renderItem,
  className,
  itemClassName,
  speed = 46,
  reverse = false,
  showNavigation = true,
  autoPlay = true,
}: GsapInfiniteCardSliderProps<T>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
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
        gsap.set(track, { x: reverse ? -track.scrollWidth / 2 : 0 });

        const loopDistance = track.scrollWidth / 2;
        if (loopDistance <= 0) return;

        if (!autoPlay) return;

        loopTween = gsap.to(track, {
          x: reverse ? 0 : -loopDistance,
          duration: Math.max(24, loopDistance / speed),
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

      if (autoPlay) {
        viewport.addEventListener("mouseenter", onEnter);
        viewport.addEventListener("mouseleave", onLeave);
        viewport.addEventListener("touchstart", onEnter, { passive: true });
        viewport.addEventListener("touchend", onLeave);
      }

      return () => {
        resizeObserver.disconnect();
        if (autoPlay) {
          viewport.removeEventListener("mouseenter", onEnter);
          viewport.removeEventListener("mouseleave", onLeave);
          viewport.removeEventListener("touchstart", onEnter);
          viewport.removeEventListener("touchend", onLeave);
        }
        loopTween?.kill();
      };
    }, root);

    return () => ctx.revert();
  }, [autoPlay, items, reverse, speed]);

  if (!items.length) return null;

  const nudgeTrack = (direction: "prev" | "next") => {
    if (!autoPlay) {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const amount = Math.max(260, Math.round(viewport.clientWidth * 0.82));
      viewport.scrollBy({
        left: direction === "next" ? amount : -amount,
        behavior: "smooth",
      });
      return;
    }

    const track = trackRef.current;
    if (!track) return;

    const amount = direction === "next" ? -320 : 320;
    gsap.killTweensOf(track);
    gsap.to(track, {
      x: `+=${amount}`,
      duration: 0.45,
      ease: "power2.out",
      overwrite: true,
      onComplete: () => {
        const loopDistance = track.scrollWidth / 2;
        const currentX = gsap.getProperty(track, "x") as number;
        if (currentX <= -loopDistance) {
          gsap.set(track, { x: currentX + loopDistance });
        } else if (currentX > 0) {
          gsap.set(track, { x: currentX - loopDistance });
        }
      },
    });
  };

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      {showNavigation ? (
        <div className="mb-4 flex items-center justify-end gap-2">
          <button
            type="button"
            aria-label="Scroll cards left"
            onClick={() => nudgeTrack("prev")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground transition hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll cards right"
            onClick={() => nudgeTrack("next")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground transition hover:border-primary/40 hover:text-primary"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      <div
        ref={viewportRef}
        className={cn(
          "relative rounded-[2rem] border border-border/60 bg-background/45 px-3 py-3 md:px-4",
          autoPlay
            ? "overflow-hidden"
            : "overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 bg-gradient-to-r from-background via-background/80 to-transparent md:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-gradient-to-l from-background via-background/80 to-transparent md:w-16" />

        <div
          ref={trackRef}
          className={cn("flex w-max gap-5 md:gap-6", !autoPlay && "min-w-full")}
        >
          {(autoPlay ? loopItems : items).map((item, index) => (
            <div
              key={`${autoPlay ? "loop" : "item"}-${index}`}
              className={cn(
                "w-[280px] shrink-0 md:w-[340px] xl:w-[360px]",
                !autoPlay && "snap-start",
                itemClassName,
              )}
            >
              {renderItem(item, index % items.length)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GsapInfiniteCardSlider;
