import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useUserAuth } from "@/hooks/useUserAuth";
import { Markdown } from "@/components/blog/Markdown";
import { useOriginXUpdates } from "@/hooks/useOriginXUpdates";
import { useLLMNews } from "@/hooks/useLLMNews";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Lock,
  Calendar,
  Clock,
  Eye,
  Coffee,
  Flame,
  ListOrdered,
  Newspaper,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ChevronRight,
  House,
  Link as LinkIcon,
  Download,
  Share2,
  FileText,
  BookOpen,
  AtSign,
  Linkedin,
  Facebook,
  MessageCircle,
  Send,
  Mail,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GithubSlugger from "github-slugger";
import { GiscusComments } from "@/components/blog/GiscusComments";

type CacheRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  hero_image: string | null;
  tags: string[] | null;
  is_premium: boolean;
  is_published: boolean;
  level: string | null;
  original_published_at: string | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  reading_time_minutes: number;
  views: number;
  updated_at: string;
};

type PostRow = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  hero_image: string | null;
  tags: string[] | null;
  is_premium: boolean | null;
  is_published: boolean | null;
  level: string | null;
  original_published_at: string | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  views: number | null;
  code_theme: string | null;
  updated_at: string;
};
type TagStyleRow = {
  tag: string;
  bg_color: string;
  text_color: string;
  border_color: string;
};

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) ||
  "https://www.abhishekpanda.com";
const titleCaseLevel = (level: string | null | undefined) => {
  if (!level) return "General";
  return level.charAt(0).toUpperCase() + level.slice(1);
};

type EpubChapter = {
  id: string;
  title: string;
  fileName: string;
  htmlBody: string;
};

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escapeXml = (input: string) =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const sanitizeId = (input: string, fallback: string) => {
  const v = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return v || fallback;
};

const splitIntoEpubChapters = (htmlBody: string, fallbackTitle: string): EpubChapter[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="epub-root">${htmlBody}</div>`, "text/html");
  const root = doc.getElementById("epub-root");
  if (!root) {
    return [{ id: "chapter-1", title: fallbackTitle, fileName: "chapter-001.xhtml", htmlBody }];
  }
  const nodes = Array.from(root.childNodes);
  const chapters: EpubChapter[] = [];
  let currentTitle = fallbackTitle;
  let currentNodes: Node[] = [];

  const flush = () => {
    if (currentNodes.length === 0) return;
    const holder = doc.createElement("div");
    currentNodes.forEach((n) => holder.appendChild(n.cloneNode(true)));
    const idx = chapters.length + 1;
    const base = sanitizeId(currentTitle, `chapter-${idx}`);
    chapters.push({
      id: `${base}-${idx}`,
      title: currentTitle,
      fileName: `chapter-${String(idx).padStart(3, "0")}.xhtml`,
      htmlBody: holder.innerHTML || "<p></p>",
    });
    currentNodes = [];
  };

  for (const n of nodes) {
    const isHeading =
      n.nodeType === Node.ELEMENT_NODE && ["H1", "H2"].includes((n as HTMLElement).tagName);
    if (isHeading) {
      const headingText = (n.textContent || "").trim();
      if (currentNodes.length > 0) flush();
      currentTitle = headingText || `Chapter ${chapters.length + 1}`;
      currentNodes.push(n.cloneNode(true));
      continue;
    }
    currentNodes.push(n.cloneNode(true));
  }

  flush();
  if (chapters.length === 0) {
    return [{ id: "chapter-1", title: fallbackTitle, fileName: "chapter-001.xhtml", htmlBody }];
  }
  return chapters;
};

const BlogPost = () => {
  const { slug } = useParams();
  const { user } = useUserAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [supportQrBroken, setSupportQrBroken] = useState(false);
  const [downloadingEpub, setDownloadingEpub] = useState(false);
  const [desktopLayout, setDesktopLayout] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const articleBodyRef = useRef<HTMLDivElement | null>(null);
  const articleScrollRef = useRef<HTMLElement | null>(null);

  const { data: meta, isLoading: metaLoading, error: metaError } = useQuery({
    queryKey: ["blog-post-meta", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await supabase
        .from("blog_posts_public_cache")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .single();

      if (!res.error) return res.data as CacheRow;

      // Migration not applied yet fallback
      if ((res.error as { code?: unknown }).code === "PGRST205") {
        const fb = await supabase
          .from("blog_posts")
          .select(
            "id,title,slug,excerpt,hero_image,tags,is_premium,is_published,level,original_published_at,published_at,meta_title,meta_description,updated_at,content,views"
          )
          .eq("slug", slug!)
          .eq("is_published", true)
          .single();
        if (fb.error) throw fb.error;
        const row = fb.data as unknown as PostRow;
        const content = row.content;
        const wc = content ? content.split(/\s+/).filter(Boolean).length : 0;
        const rt = Math.ceil(wc / 200);
        return {
          id: row.id,
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt,
          hero_image: row.hero_image,
          tags: row.tags,
          is_premium: !!row.is_premium,
          is_published: !!row.is_published,
          level: row.level,
          original_published_at: row.original_published_at,
          published_at: row.published_at,
          meta_title: row.meta_title,
          meta_description: row.meta_description,
          updated_at: row.updated_at,
          reading_time_minutes: rt,
          views: row.views ?? 0,
        } as CacheRow;
      }

      throw res.error;
    },
  });

  const { data: entitlementOk = false, isLoading: entLoading } = useQuery({
    queryKey: ["blog-premium-entitlement", user?.id],
    enabled: !!user?.id && !!meta?.is_premium,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_entitlements")
        .select("entitlement, expires_at")
        .eq("user_id", user!.id)
        .eq("entitlement", "blog_premium")
        .limit(1);
      if (error) throw error;
      const row = data?.[0];
      if (!row) return false;
      if (!row.expires_at) return true;
      return new Date(row.expires_at).getTime() > Date.now();
    },
  });

  const canReadPremium = !!user && entitlementOk;
  const shouldFetchFull = !!meta && (!meta.is_premium || canReadPremium);

  const { data: allPosts = [] } = useQuery({
    queryKey: ["blog-posts-cache-nav"],
    enabled: !!meta,
    queryFn: async () => {
      const res = await supabase
        .from("blog_posts_public_cache")
        .select("title,slug,excerpt,hero_image,tags,is_premium,published_at,updated_at,is_published")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(200);
      if (!res.error) return (res.data ?? []) as Array<Pick<CacheRow, "title" | "slug" | "excerpt" | "hero_image" | "tags" | "is_premium" | "published_at" | "updated_at">>;

      if ((res.error as { code?: unknown }).code === "PGRST205") {
        const fb = await supabase
          .from("blog_posts")
          .select("title,slug,excerpt,hero_image,tags,is_premium,published_at,updated_at,is_published")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(200);
        if (fb.error) throw fb.error;
        return (fb.data ?? []) as Array<any>;
      }
      throw res.error;
    },
  });

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["blog-post-full", slug, canReadPremium],
    enabled: !!slug && shouldFetchFull,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data as PostRow;
    },
  });

  const { data: relatedCourses = [] } = useQuery({
    queryKey: ["blog-related-courses", meta?.slug, meta?.tags, meta?.level],
    enabled: !!meta,
    queryFn: async () => {
      const tags = meta?.tags || [];
      const level = meta?.level || null;

      let query = supabase
        .from("courses")
        .select("id,title,slug,description,tags,level,is_premium,duration")
        .eq("is_published", true)
        .limit(6);

      if (tags.length > 0) {
        query = query.overlaps("tags", tags);
      }
      if (level) {
        query = query.ilike("level", level);
      }

      const primary = await query.order("created_at", { ascending: false });
      if (!primary.error && (primary.data?.length || 0) > 0) return primary.data ?? [];

      const fallback = await supabase
        .from("courses")
        .select("id,title,slug,description,tags,level,is_premium,duration")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (fallback.error) return [];
      return fallback.data ?? [];
    },
  });
  const { data: tagStyles = [] } = useQuery({
    queryKey: ["blog-tag-styles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_tag_styles")
        .select("tag,bg_color,text_color,border_color");
      if (error) return [];
      return (data ?? []) as TagStyleRow[];
    },
  });
  const { data: originxUpdates = [] } = useOriginXUpdates(6);
  const { data: llmNews = [] } = useLLMNews(8);

  const { data: popularPosts = [] } = useQuery({
    queryKey: ["blog-popular-posts", slug],
    enabled: !!slug,
    queryFn: async () => {
      const cacheRes = await supabase
        .from("blog_posts_public_cache")
        .select("title,slug,views,published_at")
        .eq("is_published", true)
        .neq("slug", slug!)
        .order("views", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(5);
      if (!cacheRes.error) return cacheRes.data ?? [];

      const code = (cacheRes.error as { code?: unknown }).code;
      const isColumnDrift = code === "42703";
      const isMissingTable = code === "PGRST205";
      if (isColumnDrift || isMissingTable) {
        const legacy = await supabase
          .from("blog_posts")
          .select("title,slug,views,published_at")
          .eq("is_published", true)
          .neq("slug", slug!)
          .order("views", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(5);
        if (legacy.error) return [];
        return legacy.data ?? [];
      }

      return [];
    },
  });

  // Increment view count only after successfully loading readable content.
  useEffect(() => {
    if (!slug) return;
    if (!shouldFetchFull) return;
    if (!post) return;
    supabase.rpc("increment_blog_post_view", { _slug: slug }).then(
      () => {},
      () => {}
    );
  }, [slug, post, shouldFetchFull]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktopLayout(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const computeProgress = () => {
      if (desktopLayout && articleScrollRef.current) {
        const scrollTop = articleScrollRef.current.scrollTop;
        const scrollHeight =
          articleScrollRef.current.scrollHeight - articleScrollRef.current.clientHeight;
        const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollProgress(Math.max(0, Math.min(100, pct)));
        return;
      }
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.max(0, Math.min(100, pct)));
    };
    computeProgress();

    if (desktopLayout && articleScrollRef.current) {
      const el = articleScrollRef.current;
      el.addEventListener("scroll", computeProgress, { passive: true });
      return () => el.removeEventListener("scroll", computeProgress);
    }

    window.addEventListener("scroll", computeProgress, { passive: true });
    return () => window.removeEventListener("scroll", computeProgress);
  }, [desktopLayout, post?.id]);

  const toc = useMemo(() => {
    const md = post?.content || "";
    if (!md) return [];
    const slugger = new GithubSlugger();
    const lines = md.split("\n");
    const out: { depth: number; text: string; id: string }[] = [];
    for (const line of lines) {
      const m = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
      if (!m) continue;
      const depth = m[1].length;
      if (depth < 2 || depth > 3) continue;
      const text = m[2].replace(/\s+#\s*$/, "").trim();
      if (!text) continue;
      const id = slugger.slug(text);
      out.push({ depth, text, id });
    }
    return out;
  }, [post?.content]);

  useEffect(() => {
    if (!!meta?.is_premium && !canReadPremium) return;
    if (!articleBodyRef.current) return;
    if (toc.length === 0) return;

    const headings = Array.from(
      articleBodyRef.current.querySelectorAll<HTMLElement>("h2[id], h3[id]"),
    );
    if (headings.length === 0) return;

    const ids = new Set(toc.map((t) => t.id));
    const filtered = headings.filter((h) => ids.has(h.id));
    if (filtered.length === 0) return;
    setActiveHeadingId((prev) => prev || filtered[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target) {
          const id = (visible[0].target as HTMLElement).id;
          if (id) setActiveHeadingId(id);
        }
      },
      {
        root: desktopLayout ? articleScrollRef.current : null,
        rootMargin: "0px 0px -60% 0px",
        threshold: [0, 1],
      },
    );

    filtered.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc, post?.updated_at, meta?.is_premium, canReadPremium, desktopLayout]);

  const nav = useMemo(() => {
    if (!meta) return { prev: null as any, next: null as any, related: [] as any[] };
    const idx = allPosts.findIndex((p) => p.slug === meta.slug);
    const prev = idx > 0 ? allPosts[idx - 1] : null; // newer
    const next = idx >= 0 && idx < allPosts.length - 1 ? allPosts[idx + 1] : null; // older
    const tags = meta.tags || [];
    const tagSet = new Set(tags);
    const related =
      tags.length
        ? allPosts
            .filter((p) => p.slug !== meta.slug && (p.tags || []).some((t) => tagSet.has(t)))
            .slice(0, 3)
        : [];
    return { prev, next, related };
  }, [allPosts, meta]);

  const title = meta?.meta_title || meta?.title || "Blog";
  const description = meta?.meta_description || meta?.excerpt || "Blog post";
  const canonical = slug ? `${SITE_URL}/blog/${slug}` : `${SITE_URL}/blog`;
  const robots = meta?.is_premium ? "noindex,follow" : "index,follow";
  const showPaywall = !!meta?.is_premium && !canReadPremium;
  const canDownload = !showPaywall && !!post?.content;
  const effectiveOriginalPublished = meta?.original_published_at || meta?.published_at;
  const hasUpdatedDate =
    !!meta?.updated_at &&
    !!effectiveOriginalPublished &&
    new Date(meta.updated_at).getTime() > new Date(effectiveOriginalPublished).getTime();
  const totalReadMinutes = Math.max(1, meta?.reading_time_minutes || 1);
  const minutesRead = Math.max(0, Math.ceil((totalReadMinutes * scrollProgress) / 100));
  const minutesRemaining = Math.max(totalReadMinutes - minutesRead, 0);
  const activeTocIndex = toc.findIndex((h) => h.id === activeHeadingId);
  const tagAwareOriginX = useMemo(() => {
    const tags = new Set((meta?.tags || []).map((t) => t.toLowerCase()));
    if (tags.size === 0) return originxUpdates.slice(0, 3);
    const matched = originxUpdates.filter((u) => {
      const hay = `${u.title} ${u.summary} ${u.tag || ""}`.toLowerCase();
      return Array.from(tags).some((t) => hay.includes(t));
    });
    return (matched.length > 0 ? matched : originxUpdates).slice(0, 3);
  }, [originxUpdates, meta?.tags]);
  const tagAwareLlmNews = useMemo(() => {
    const tags = new Set((meta?.tags || []).map((t) => t.toLowerCase()));
    if (tags.size === 0) return llmNews.slice(0, 3);
    const matched = llmNews.filter((n) => {
      const headline = `${n.title} ${n.summary || ""}`.toLowerCase();
      const newsTags = (n.tags || []).map((t) => t.toLowerCase());
      return (
        newsTags.some((t) => tags.has(t)) ||
        Array.from(tags).some((t) => headline.includes(t))
      );
    });
    return (matched.length > 0 ? matched : llmNews).slice(0, 3);
  }, [llmNews, meta?.tags]);
  const tagStyleMap = useMemo(
    () => new Map(tagStyles.map((s) => [s.tag.toLowerCase(), s])),
    [tagStyles],
  );
  const getTagStyle = (tag: string) => {
    const style = tagStyleMap.get(tag.toLowerCase());
    if (!style) return undefined;
    return {
      backgroundColor: style.bg_color,
      color: style.text_color,
      borderColor: style.border_color,
    };
  };

  const scrollToTop = () => {
    if (desktopLayout && articleScrollRef.current) {
      articleScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const scrollToBottom = () => {
    if (desktopLayout && articleScrollRef.current) {
      articleScrollRef.current.scrollTo({
        top: articleScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      return;
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  };
  const jumpToHeading = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    setActiveHeadingId(id);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openSharePopup = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=720,height=760");
  };

  const shareText = `${meta?.title || "Blog post"}\n${canonical}`;
  const shareTargets = [
    {
      key: "x",
      label: "X",
      icon: AtSign,
      className:
        "border-zinc-300 hover:border-black hover:bg-black hover:text-white dark:hover:border-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-black",
      action: () =>
        openSharePopup(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(
            meta?.title || "Blog post",
          )}`,
        ),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: Linkedin,
      className:
        "border-sky-300 hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white",
      action: () =>
        openSharePopup(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`,
        ),
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: Facebook,
      className:
        "border-blue-300 hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white",
      action: () =>
        openSharePopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`),
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      className:
        "border-emerald-300 hover:border-[#25D366] hover:bg-[#25D366] hover:text-white",
      action: () => openSharePopup(`https://wa.me/?text=${encodeURIComponent(shareText)}`),
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: Send,
      className:
        "border-cyan-300 hover:border-[#229ED9] hover:bg-[#229ED9] hover:text-white",
      action: () =>
        openSharePopup(
          `https://t.me/share/url?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(
            meta?.title || "Blog post",
          )}`,
        ),
    },
    {
      key: "email",
      label: "Email",
      icon: Mail,
      className:
        "border-slate-300 hover:border-slate-700 hover:bg-slate-700 hover:text-white dark:hover:border-slate-200 dark:hover:bg-slate-200 dark:hover:text-slate-900",
      action: () =>
        (window.location.href = `mailto:?subject=${encodeURIComponent(
          meta?.title || "Blog post",
        )}&body=${encodeURIComponent(shareText)}`),
    },
  ];

  const handleDownloadPdf = () => {
    if (!canDownload || !exportRef.current) return;
    const html = exportRef.current.innerHTML;
    const win = window.open("", "_blank", "width=1200,height=900");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>${meta?.title || "Blog Post"}</title>
          <style>
            body { font-family: Inter, ui-sans-serif, system-ui; padding: 32px; color: #0f172a; }
            h1 { font-size: 32px; margin-bottom: 8px; }
            .excerpt { color: #475569; margin-bottom: 24px; }
            pre { background: #f1f5f9; padding: 12px; border-radius: 10px; overflow-x: auto; }
            code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
            img { max-width: 100%; border-radius: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; }
            a { color: #2563eb; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const handleDownloadEpub = async () => {
    if (!canDownload || !exportRef.current || !meta) return;
    setDownloadingEpub(true);
    try {
      const { default: JSZip } = await import("jszip");
      const htmlBody = exportRef.current.innerHTML;
      const docTitle = meta.title || "Untitled";
      const nowIso = new Date().toISOString();
      const chapters = splitIntoEpubChapters(htmlBody, docTitle);
      const navItems = chapters
        .map((c) => `<li><a href="${c.fileName}">${escapeXml(c.title)}</a></li>`)
        .join("\n");
      const manifestChapterItems = chapters
        .map((c) => `<item id="${c.id}" href="${c.fileName}" media-type="application/xhtml+xml"/>`)
        .join("\n");
      const spineItems = chapters.map((c) => `<itemref idref="${c.id}"/>`).join("\n");
      const ncxPoints = chapters
        .map(
          (c, idx) => `<navPoint id="navPoint-${idx + 1}" playOrder="${idx + 1}">
  <navLabel><text>${escapeXml(c.title)}</text></navLabel>
  <content src="${c.fileName}"/>
</navPoint>`,
        )
        .join("\n");

      const zip = new JSZip();
      zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
      zip.folder("META-INF")?.file(
        "container.xml",
        `<?xml version="1.0" encoding="UTF-8"?>
        <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
          <rootfiles>
            <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
          </rootfiles>
        </container>`,
      );
      const oebps = zip.folder("OEBPS");
      oebps?.file(
        "content.opf",
        `<?xml version="1.0" encoding="UTF-8"?>
        <package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id">
          <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:identifier id="book-id">${escapeXml(meta.id)}</dc:identifier>
            <dc:title>${escapeXml(docTitle)}</dc:title>
            <dc:creator>Abhishek Panda</dc:creator>
            <dc:language>en</dc:language>
            <meta property="dcterms:modified">${nowIso}</meta>
          </metadata>
          <manifest>
            <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
            <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
            <item id="style" href="styles.css" media-type="text/css"/>
            ${manifestChapterItems}
          </manifest>
          <spine toc="ncx">
            ${spineItems}
          </spine>
        </package>`,
      );
      oebps?.file(
        "nav.xhtml",
        `<?xml version="1.0" encoding="UTF-8"?>
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
          <head>
            <title>${escapeXml(docTitle)} - Table of Contents</title>
            <link rel="stylesheet" type="text/css" href="styles.css"/>
          </head>
          <body>
            <nav epub:type="toc" id="toc">
              <h1>Table of Contents</h1>
              <ol>${navItems}</ol>
            </nav>
          </body>
        </html>`,
      );
      oebps?.file(
        "toc.ncx",
        `<?xml version="1.0" encoding="UTF-8"?>
        <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
          <head>
            <meta name="dtb:uid" content="${escapeXml(meta.id)}"/>
            <meta name="dtb:depth" content="1"/>
            <meta name="dtb:totalPageCount" content="0"/>
            <meta name="dtb:maxPageNumber" content="0"/>
          </head>
          <docTitle><text>${escapeXml(docTitle)}</text></docTitle>
          <navMap>${ncxPoints}</navMap>
        </ncx>`,
      );
      oebps?.file(
        "styles.css",
        `html, body { margin: 0; padding: 0; }
        body { font-family: -apple-system, "SF Pro Text", "Georgia", "Times New Roman", serif; color: #111827; line-height: 1.65; }
        .chapter { padding: 1.2em 1.4em; }
        h1, h2, h3 { line-height: 1.25; page-break-after: avoid; break-after: avoid-page; }
        h1 { font-size: 1.8em; margin: 0 0 0.8em; }
        h2 { font-size: 1.45em; margin: 1.2em 0 0.6em; }
        p { margin: 0 0 0.9em; }
        .excerpt { color: #6b7280; margin-bottom: 1em; }
        pre { background: #f3f4f6; padding: 0.8em; border-radius: 0.6em; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }
        code { font-family: "SF Mono", "Menlo", "Consolas", monospace; }
        img { max-width: 100%; height: auto; border-radius: 0.5em; page-break-inside: avoid; break-inside: avoid; }
        table { width: 100%; border-collapse: collapse; margin: 1em 0; }
        th, td { border: 1px solid #d1d5db; padding: 0.45em; text-align: left; }
        blockquote { border-left: 0.25em solid #94a3b8; margin: 0.8em 0; padding: 0.4em 0 0.4em 0.8em; color: #334155; }
        a { color: #1d4ed8; text-decoration: underline; }`,
      );
      chapters.forEach((chapter) => {
        oebps?.file(
          chapter.fileName,
          `<?xml version="1.0" encoding="UTF-8"?>
          <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
              <title>${escapeXml(chapter.title)}</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="stylesheet" type="text/css" href="styles.css"/>
            </head>
            <body>
              <section class="chapter">${chapter.htmlBody}</section>
            </body>
          </html>`,
        );
      });
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugify(docTitle)}.epub`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } finally {
      setDownloadingEpub(false);
    }
  };

  if (metaLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-20 container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-10 w-2/3 mb-4" />
          <Skeleton className="h-4 w-1/3 mb-8" />
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </main>
        <Footer />
      </div>
    );
  }

  if (metaError || !meta) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-20 container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-black text-foreground mb-2">Post not found</h1>
          <p className="text-muted-foreground mb-6">This post doesn’t exist (or isn’t published).</p>
          <Button asChild variant="outline">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!showPaywall ? (
        <div
          className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-[60]"
          aria-hidden="true"
        >
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      ) : null}
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content={robots} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        {meta.hero_image ? <meta property="og:image" content={meta.hero_image} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {meta.hero_image ? <meta name="twitter:image" content={meta.hero_image} /> : null}
      </Helmet>

      <Navigation />
      <main className="pt-24 pb-20">
        <section className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <Button asChild variant="outline" size="sm">
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
            <article
              ref={articleScrollRef}
              className="min-w-0 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-4 lg:overscroll-contain lg:scroll-smooth"
            >
              <header className="mb-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 md:p-10 text-white">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
                  <House className="w-3.5 h-3.5" />
                  <Link to="/" className="hover:text-white">Home</Link>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <Link to="/blog" className="hover:text-white">Blog</Link>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="max-w-[18rem] truncate text-slate-100">{meta.title}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {meta.tags?.length ? (
                    meta.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-semibold border"
                        style={getTagStyle(tag)}
                      >
                        #{tag}
                      </span>
                    ))
                  ) : null}
                  {meta.level ? (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold border border-emerald-400/40 bg-emerald-500/20 text-emerald-300">
                      {titleCaseLevel(meta.level)}
                    </span>
                  ) : null}
                  {hasUpdatedDate ? (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold border border-blue-400/40 bg-blue-500/20 text-blue-300">
                      Updated
                    </span>
                  ) : null}
                  {meta.is_premium ? (
                    <span className="badge-premium">
                      <Lock className="w-3 h-3" />
                      Premium
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  {meta.title}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-300" />
                    {Math.max(1, meta.reading_time_minutes || 0)} min read
                  </span>
                  {effectiveOriginalPublished ? (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-300" />
                      {new Date(effectiveOriginalPublished).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  ) : null}
                  {hasUpdatedDate ? (
                    <span className="text-emerald-300">
                      Updated{" "}
                      {new Date(meta.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-300" />
                    {(meta.views ?? 0).toLocaleString()} views
                  </span>
                  <span className="px-2 py-1 rounded-full border border-slate-700 bg-slate-900/70 text-xs font-medium text-slate-200">
                    {minutesRemaining} min remaining
                  </span>
                  <span className="px-2 py-1 rounded-full border border-slate-700 bg-slate-900/70 text-xs font-medium text-slate-200">
                    {minutesRead} min read already
                  </span>
                </div>

                <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 text-slate-950 grid place-items-center font-bold">
                    AP
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Abhishek Panda</p>
                    <p className="text-xs text-slate-300">Software Engineer</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(canonical);
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 1200);
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    {shareCopied ? "Copied" : "Copy Link"}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 lg:hidden">
                  <Button type="button" variant="outline" size="sm" onClick={handleDownloadPdf} disabled={!canDownload}>
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadEpub}
                    disabled={!canDownload || downloadingEpub}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {downloadingEpub ? "Preparing..." : "EPUB"}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {meta.hero_image ? (
                  <div className="mt-8 rounded-3xl overflow-hidden border border-border bg-card">
                    <img
                      src={meta.hero_image}
                      alt={meta.title}
                      className="w-full h-auto max-h-[420px] object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
              </header>

              {showPaywall ? (
                <div className="rounded-2xl border border-border bg-card p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-foreground mb-2">
                        Premium post
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        {meta.excerpt || "Sign in with premium access to read the full article."}
                      </p>
                      {!user ? (
                        <Button asChild>
                          <Link to={`/login?next=${encodeURIComponent(`/blog/${meta.slug}`)}`}>
                            Sign in to continue
                          </Link>
                        </Button>
                      ) : entLoading ? (
                        <Button disabled>Checking access...</Button>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Your account does not currently have `blog_premium`.
                          </p>
                          <Button asChild variant="outline">
                            <Link to="/account">Go to account</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : postLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <>
                  <div ref={articleBodyRef}>
                    <Markdown
                      value={post?.content || ""}
                      codeTheme={post?.code_theme || "github-light"}
                    />
                  </div>

                  {(nav.prev || nav.next || nav.related.length > 0) ? (
                    <div className="mt-12 pt-8 border-t border-border space-y-6">
                      {(nav.prev || nav.next) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {nav.prev ? (
                            <Link to={`/blog/${nav.prev.slug}`} className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors">
                              <p className="text-xs text-muted-foreground mb-1">Newer</p>
                              <p className="font-semibold text-foreground line-clamp-2">{nav.prev.title}</p>
                              {nav.prev.excerpt ? <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{nav.prev.excerpt}</p> : null}
                            </Link>
                          ) : <div />}
                          {nav.next ? (
                            <Link to={`/blog/${nav.next.slug}`} className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors">
                              <p className="text-xs text-muted-foreground mb-1">Older</p>
                              <p className="font-semibold text-foreground line-clamp-2">{nav.next.title}</p>
                              {nav.next.excerpt ? <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{nav.next.excerpt}</p> : null}
                            </Link>
                          ) : <div />}
                        </div>
                      ) : null}

                      {nav.related.length > 0 ? (
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-3">Related</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {nav.related.map((p) => (
                              <Link key={p.slug} to={`/blog/${p.slug}`} className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors">
                                <p className="font-semibold text-foreground line-clamp-2">{p.title}</p>
                                {p.excerpt ? <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{p.excerpt}</p> : null}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {relatedCourses.length > 0 ? (
                    <div className="mt-12 pt-8 border-t border-border">
                      <p className="text-sm font-semibold text-foreground mb-4">Recommended Courses</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {relatedCourses.map((course: any) => (
                          <Link
                            key={course.id}
                            to={`/courses/${course.slug}`}
                            className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">{course.level || "General"}</span>
                              {course.is_premium ? (
                                <span className="badge-premium">
                                  <Lock className="w-3 h-3" />
                                  Premium
                                </span>
                              ) : (
                                <span className="badge-free">Free</span>
                              )}
                            </div>
                            <p className="font-semibold text-foreground line-clamp-2">{course.title}</p>
                            {course.description ? (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{course.description}</p>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {tagAwareOriginX.length > 0 || tagAwareLlmNews.length > 0 ? (
                    <div className="mt-12 pt-8 border-t border-border">
                      <p className="text-sm font-semibold text-foreground mb-4">Tech News & LLM Galaxy News</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-border bg-card p-5">
                          <div className="inline-flex items-center gap-2 mb-3 text-foreground">
                            <Newspaper className="w-4 h-4 text-primary" />
                            <p className="font-semibold text-sm">Tech News</p>
                          </div>
                          <div className="space-y-3">
                            {tagAwareOriginX.map((item) => (
                              <a
                                key={item.id}
                                href={item.url || "#"}
                                target={item.url?.startsWith("http") ? "_blank" : undefined}
                                rel={item.url?.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="block rounded-xl border border-border p-3 hover:border-primary/40 transition-colors"
                              >
                                <p className="font-medium text-sm text-foreground line-clamp-2">{item.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.summary}</p>
                                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                  <span>{item.tag || "Update"}</span>
                                  <span>
                                    {new Date(item.published_at).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5">
                          <div className="inline-flex items-center gap-2 mb-3 text-foreground">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <p className="font-semibold text-sm">LLM Galaxy News</p>
                          </div>
                          <div className="space-y-3">
                            {tagAwareLlmNews.map((item) => (
                              <a
                                key={item.id}
                                href={item.article_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-xl border border-border p-3 hover:border-primary/40 transition-colors"
                              >
                                <p className="font-medium text-sm text-foreground line-clamp-2">{item.title}</p>
                                {item.summary ? (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.summary}</p>
                                ) : null}
                                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                  <span>{item.source_name}</span>
                                  <span>
                                    {new Date(item.published_at).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {!showPaywall ? (
                    <div className="mt-12 pt-8 border-t border-border">
                      <h3 className="text-2xl font-bold text-foreground mb-2">What's your feedback?</h3>
                      <p className="text-sm text-muted-foreground mb-5">
                        Do let me know your thoughts around this article.
                      </p>
                      <GiscusComments />
                    </div>
                  ) : null}

                  <div className="lg:hidden mt-10 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-5 dark:border-indigo-500/25 dark:from-slate-950 dark:to-slate-900">
                      <div className="inline-flex items-center gap-2 mb-4">
                        <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                          <Flame className="w-4 h-4" />
                        </span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Popular Articles</p>
                      </div>
                      <div className="space-y-2 mb-4">
                        {popularPosts.length > 0 ? (
                          popularPosts.map((p: any, idx: number) => (
                            <Link
                              key={p.slug}
                              to={`/blog/${p.slug}`}
                              className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-800/60 transition-colors"
                            >
                              <span className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center justify-center dark:bg-slate-800 dark:text-slate-300">
                                {idx + 1}
                              </span>
                              <span className="text-sm text-slate-700 line-clamp-2 dark:text-slate-300">{p.title}</span>
                            </Link>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400">No popular articles yet.</p>
                        )}
                      </div>
                      <Button asChild size="sm" variant="outline" className="w-full border-slate-300 bg-slate-200/70 text-slate-700 hover:bg-slate-300/80 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-700/70">
                        <Link to="/blog">View all articles</Link>
                      </Button>
                    </div>

                    {toc.length > 0 && !showPaywall ? (
                      <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-5 dark:border-indigo-500/25 dark:from-slate-950 dark:to-slate-900">
                        <div className="flex items-center justify-between mb-4">
                          <div className="inline-flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                              <ListOrdered className="w-4 h-4" />
                            </span>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">On This Page</p>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {activeTocIndex >= 0 ? activeTocIndex + 1 : 1} / {toc.length}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className="w-14 h-14 rounded-full grid place-items-center text-sm font-bold text-slate-900 dark:text-slate-100"
                            style={{
                              background: `conic-gradient(rgb(99 102 241) ${Math.round(scrollProgress)}%, rgb(226 232 240) 0%)`,
                            }}
                          >
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 grid place-items-center">
                              {Math.round(scrollProgress)}%
                            </div>
                          </div>
                          <div className="text-xs text-slate-600 space-y-1 dark:text-slate-300">
                            <p>{totalReadMinutes} min total</p>
                            <p>{minutesRead} min read</p>
                            <p>{minutesRemaining} min pending</p>
                          </div>
                        </div>
                        <nav className="space-y-1 max-h-64 overflow-auto pr-1">
                          {toc.map((h, idx) => {
                            const active = activeHeadingId === h.id;
                            return (
                              <a
                                key={h.id}
                                href={`#${h.id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  jumpToHeading(h.id);
                                }}
                                className={`block text-sm rounded-lg px-2 py-2 transition-colors ${
                                  active
                                    ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
                                } ${h.depth === 3 ? "ml-4" : ""}`}
                              >
                                <span className="text-xs text-slate-500 dark:text-slate-500 mr-2">{String(idx + 1).padStart(2, "0")}</span>
                                {h.text}
                              </a>
                            );
                          })}
                        </nav>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <Button type="button" size="sm" variant="outline" className="border-slate-300 bg-slate-200/70 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200" onClick={scrollToTop}>
                            <ArrowUp className="w-4 h-4 mr-1" />
                            Top
                          </Button>
                          <Button type="button" size="sm" variant="outline" className="border-slate-300 bg-slate-200/70 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200" onClick={scrollToBottom}>
                            <ArrowDown className="w-4 h-4 mr-1" />
                            Bottom
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {!showPaywall ? (
                      <div className="rounded-2xl p-5 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-orange-500 text-white relative overflow-hidden">
                        <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-white/15" />
                        <div className="absolute -left-6 -bottom-6 w-16 h-16 rounded-full bg-white/10" />
                        <p className="text-2xl font-bold mb-1">Support My Work</p>
                        <p className="text-sm text-white/90 mb-3">
                          Enjoyed this? Buy me a coffee to keep the content coming.
                        </p>
                        <Button type="button" size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={() => setSupportDialogOpen(true)}>
                          <Coffee className="w-4 h-4 mr-1" />
                          Buy me a coffee
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </article>

            <aside className="hidden lg:flex lg:flex-col sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto pr-1 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-5 dark:border-indigo-500/25 dark:from-slate-950 dark:to-slate-900">
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Popular Articles</p>
                </div>
                <div className="space-y-2 mb-4">
                  {popularPosts.length > 0 ? (
                    popularPosts.map((p: any, idx: number) => (
                      <Link
                        key={p.slug}
                        to={`/blog/${p.slug}`}
                        className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-800/60 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center justify-center dark:bg-slate-800 dark:text-slate-300">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-slate-700 line-clamp-2 dark:text-slate-300">{p.title}</span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No popular articles yet.</p>
                  )}
                </div>
                <Button asChild size="sm" variant="outline" className="w-full border-slate-300 bg-slate-200/70 text-slate-700 hover:bg-slate-300/80 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-700/70">
                  <Link to="/blog">View all articles</Link>
                </Button>
              </div>

              {toc.length > 0 && !showPaywall ? (
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-5 dark:border-indigo-500/25 dark:from-slate-950 dark:to-slate-900">
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                        <ListOrdered className="w-4 h-4" />
                      </span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">On This Page</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeTocIndex >= 0 ? activeTocIndex + 1 : 1} / {toc.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-full grid place-items-center text-sm font-bold text-slate-900 dark:text-slate-100"
                      style={{
                        background: `conic-gradient(rgb(99 102 241) ${Math.round(scrollProgress)}%, rgb(226 232 240) 0%)`,
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 grid place-items-center">
                        {Math.round(scrollProgress)}%
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1 dark:text-slate-300">
                      <p>{totalReadMinutes} min total</p>
                      <p>{minutesRead} min read</p>
                      <p>{minutesRemaining} min pending</p>
                    </div>
                  </div>
                  <nav className="space-y-1 max-h-72 overflow-auto pr-1">
                    {toc.map((h, idx) => {
                      const active = activeHeadingId === h.id;
                      return (
                        <a
                          key={h.id}
                          href={`#${h.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            jumpToHeading(h.id);
                          }}
                          className={`block text-sm rounded-lg px-2 py-2 transition-colors ${
                            active
                              ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
                          } ${h.depth === 3 ? "ml-4" : ""}`}
                        >
                          <span className="text-xs text-slate-500 mr-2">{String(idx + 1).padStart(2, "0")}</span>
                          {h.text}
                        </a>
                      );
                    })}
                  </nav>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button type="button" size="sm" variant="outline" className="border-slate-300 bg-slate-200/70 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200" onClick={scrollToTop}>
                      <ArrowUp className="w-4 h-4 mr-1" />
                      Top
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="border-slate-300 bg-slate-200/70 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200" onClick={scrollToBottom}>
                      <ArrowDown className="w-4 h-4 mr-1" />
                      Bottom
                    </Button>
                  </div>
                </div>
              ) : null}

              {!showPaywall ? (
                <div className="rounded-2xl p-5 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-orange-500 text-white relative overflow-hidden">
                  <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-white/15" />
                  <div className="absolute -left-6 -bottom-6 w-16 h-16 rounded-full bg-white/10" />
                  <p className="text-2xl font-bold mb-1">Support My Work</p>
                  <p className="text-sm text-white/90 mb-3">
                    Enjoyed this? Buy me a coffee to keep the content coming.
                  </p>
                  <Button type="button" size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={() => setSupportDialogOpen(true)}>
                    <Coffee className="w-4 h-4 mr-1" />
                    Buy me a coffee
                  </Button>
                </div>
              ) : null}

              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm font-semibold text-foreground mb-3">Actions</p>
                <div className="space-y-2">
                  <Button type="button" variant="outline" size="sm" className="w-full justify-start" onClick={handleDownloadPdf} disabled={!canDownload}>
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleDownloadEpub}
                    disabled={!canDownload || downloadingEpub}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {downloadingEpub ? "Preparing EPUB..." : "Download EPUB"}
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="w-full justify-start" onClick={() => setShareDialogOpen(true)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-lg bg-background border-border">
          <DialogHeader>
            <DialogTitle>Share This Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="font-semibold text-foreground">AbhishekPanda</p>
              <p className="text-sm text-muted-foreground">Knowledge, engineering, and architecture insights.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {shareTargets.map((target) => (
                <Button
                  key={target.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`justify-start transition-colors ${target.className}`}
                  onClick={target.action}
                >
                  <target.icon className="w-4 h-4 mr-2" />
                  {target.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(canonical);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 1200);
                  } catch {
                    // ignore
                  }
                }}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                {shareCopied ? "Copied" : "Copy Link"}
              </Button>
              {"share" in navigator ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.share({ title: meta?.title, text: meta?.excerpt || "", url: canonical });
                    } catch {
                      // ignore
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Native Share
                </Button>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={supportDialogOpen}
        onOpenChange={(open) => {
          setSupportDialogOpen(open);
          if (open) setSupportQrBroken(false);
        }}
      >
        <DialogContent className="max-w-lg bg-slate-950 border-indigo-500/30 text-slate-100">
          <DialogHeader>
            <DialogTitle>Support My Work</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-sm font-semibold text-emerald-300">
                Thank you for supporting me. Really appreciate it. Best wishes.
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <img
                src="/payments/sbi-upi-qr.png"
                alt="UPI QR code for support payments"
                className="w-full rounded-lg border border-slate-700 bg-white"
                loading="lazy"
                onError={() => setSupportQrBroken(true)}
              />
              {supportQrBroken ? (
                <p className="mt-3 text-xs text-amber-300">
                  QR image missing at `public/payments/sbi-upi-qr.png`. Add your SBI/PhonePe QR file there.
                </p>
              ) : null}
              <p className="mt-3 text-sm text-slate-300">
                Scan in any UPI app (PhonePe, GPay, Paytm, BHIM). Thank you for helping keep these articles free.
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="outline" className="border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700" onClick={() => setSupportDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="hidden">
        <div ref={exportRef} className="prose prose-neutral max-w-none">
          {meta?.hero_image ? <img src={meta.hero_image} alt="" /> : null}
          <h1>{meta?.title}</h1>
          {meta?.excerpt ? <p className="excerpt">{meta.excerpt}</p> : null}
          <Markdown value={post?.content || ""} codeTheme={post?.code_theme || "github-light"} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPost;
