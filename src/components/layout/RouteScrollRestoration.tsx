import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const RouteScrollRestoration = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname, search, hash]);

  return null;
};
