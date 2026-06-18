import { forwardRef } from "react";
import { Link as RouterLink, type LinkProps } from "react-router-dom";

import { prefetchRoute } from "@/lib/routePrefetch";

type PrefetchLinkProps = LinkProps & {
  prefetch?: boolean;
};

export const PrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  ({ to, onMouseEnter, onFocus, onTouchStart, prefetch = true, ...props }, ref) => {
    const targetPath = typeof to === "string" ? to : `${to.pathname || ""}${to.search || ""}${to.hash || ""}`;

    const triggerPrefetch = () => {
      if (!prefetch) return;
      prefetchRoute(targetPath);
    };

    return (
      <RouterLink
        ref={ref}
        to={to}
        onMouseEnter={(event) => {
          triggerPrefetch();
          onMouseEnter?.(event);
        }}
        onFocus={(event) => {
          triggerPrefetch();
          onFocus?.(event);
        }}
        onTouchStart={(event) => {
          triggerPrefetch();
          onTouchStart?.(event);
        }}
        {...props}
      />
    );
  },
);

PrefetchLink.displayName = "PrefetchLink";

