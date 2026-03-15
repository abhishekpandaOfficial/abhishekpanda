const routeImporters: Array<[pattern: RegExp, () => Promise<unknown>]> = [
  [/^\/about$/, () => import("@/pages/About")],
  [/^\/blog$/, () => import("@/pages/Blog")],
  [/^\/blogs$/, () => import("@/pages/BlogAggregator")],
  [/^\/techhub$/, () => import("@/pages/BlogAggregator")],
  [/^\/techhub\/[^/]+$/, () => import("@/pages/BlogSeries")],
  [/^\/cheatsheets(\/|$)/, () => import("@/pages/BlogSeries")],
  [/^\/ai-ml-blogs$/, () => import("@/pages/AiMlBlogsHub")],
  [/^\/ai-ml-blogs\/[^/]+$/, () => import("@/pages/AiMlSeries")],
  [/^\/ai-ml-hub$/, () => import("@/pages/AiMlBlogsHub")],
  [/^\/ai-ml-hub\/[^/]+$/, () => import("@/pages/AiMlSeries")],
  [/^\/articles(\/|$)/, () => import("@/pages/Articles")],
  [/^\/scriptures(\/|$)/, () => import("@/pages/Scriptures")],
  [/^\/projects$/, () => import("@/pages/Projects")],
  [/^\/courses(\/|$)/, () => import("@/pages/Courses")],
  [/^\/ebooks(\/|$)/, () => import("@/pages/Ebooks")],
  [/^\/mentorship$/, () => import("@/pages/Mentorship")],
  [/^\/products$/, () => import("@/pages/Products")],
  [/^\/products\/[^/]+$/, () => import("@/pages/ProductDetail")],
  [/^\/contact$/, () => import("@/pages/Contact")],
  [/^\/llm-galaxy(\/|$)/, () => import("@/pages/LLMGalaxy")],
  [/^\/openowl$/, () => import("@/pages/OpenOwlLanding")],
  [/^\/chronyx$/, () => import("@/pages/Chronyx")],
];

const prefetchedRoutes = new Set<string>();
const scheduledRoutes = new Set<string>();

const normalizePath = (to: string) => {
  try {
    const url = new URL(to, "https://www.abhishekpanda.com");
    return url.pathname;
  } catch {
    return to;
  }
};

const canPrefetch = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const connection = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  if (connection.connection?.saveData) return false;
  if (connection.connection?.effectiveType && ["slow-2g", "2g"].includes(connection.connection.effectiveType)) {
    return false;
  }

  return true;
};

const scheduleIdlePrefetch = (pathname: string, importer: () => Promise<unknown>) => {
  if (scheduledRoutes.has(pathname)) return;
  scheduledRoutes.add(pathname);

  const run = () => {
    prefetchedRoutes.add(pathname);
    scheduledRoutes.delete(pathname);
    void importer();
  };

  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number }).requestIdleCallback(
      () => run(),
      { timeout: 1200 },
    );
    return;
  }

  window.setTimeout(run, 120);
};

export const prefetchRoute = (to: string) => {
  const pathname = normalizePath(to);
  if (!pathname.startsWith("/") || prefetchedRoutes.has(pathname) || !canPrefetch()) return;

  const match = routeImporters.find(([pattern]) => pattern.test(pathname));
  if (!match) return;

  scheduleIdlePrefetch(pathname, match[1]);
};
