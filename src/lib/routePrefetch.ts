const routeImporters: Array<[pattern: RegExp, () => Promise<unknown>]> = [
  [/^\/about$/, () => import("@/pages/About")],
  [/^\/blog$/, () => import("@/pages/Blog")],
  [/^\/blogs$/, () => import("@/pages/BlogAggregator")],
  [/^\/cheatsheets(\/|$)/, () => import("@/pages/BlogSeries")],
  [/^\/ai-ml-blogs$/, () => import("@/pages/AiMlBlogsHub")],
  [/^\/ai-ml-blogs\/[^/]+$/, () => import("@/pages/AiMlSeries")],
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

const normalizePath = (to: string) => {
  try {
    const url = new URL(to, "https://www.abhishekpanda.com");
    return url.pathname;
  } catch {
    return to;
  }
};

export const prefetchRoute = (to: string) => {
  const pathname = normalizePath(to);
  if (!pathname.startsWith("/") || prefetchedRoutes.has(pathname)) return;

  const match = routeImporters.find(([pattern]) => pattern.test(pathname));
  if (!match) return;

  prefetchedRoutes.add(pathname);
  void match[1]();
};
