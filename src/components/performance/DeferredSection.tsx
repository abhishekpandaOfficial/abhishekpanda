import { useEffect, useRef, useState, type ReactNode } from "react";

type DeferredSectionProps = {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
  fallback?: ReactNode;
  className?: string;
};

export function DeferredSection({
  children,
  minHeight = 240,
  rootMargin = "320px 0px",
  fallback = null,
  className,
}: DeferredSectionProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || shouldRender) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return (
    <div ref={rootRef} className={className} style={{ minHeight: shouldRender ? undefined : minHeight }}>
      {shouldRender ? children : fallback}
    </div>
  );
}

