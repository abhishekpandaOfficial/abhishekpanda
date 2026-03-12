import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/lib/routePrefetch";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    const targetPath = typeof to === "string" ? to : `${to.pathname || ""}${to.search || ""}${to.hash || ""}`;

    return (
      <RouterNavLink
        ref={ref}
        to={to}
        onMouseEnter={(event) => {
          prefetchRoute(targetPath);
          props.onMouseEnter?.(event);
        }}
        onFocus={(event) => {
          prefetchRoute(targetPath);
          props.onFocus?.(event);
        }}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
