import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useUserAuth } from "@/hooks/useUserAuth";
import { Markdown } from "@/components/blog/Markdown";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Lock,
  Calendar,
  Clock,
  ArrowLeft,
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

type CacheRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  hero_image: string | null;
  tags: string[] | null;
  is_premium: boolean;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  reading_time_minutes: number;
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
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  views: number | null;
  code_theme: string | null;
  updated_at: string;
};

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) ||
  "https://www.abhishekpanda.com";

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
  const [shareCopied, setShareCopied] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [downloadingEpub, setDownloadingEpub] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);

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
            "id,title,slug,excerpt,hero_image,tags,is_premium,is_published,published_at,meta_title,meta_description,updated_at,content"
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
          published_at: row.published_at,
          meta_title: row.meta_title,
          meta_description: row.meta_description,
          updated_at: row.updated_at,
          reading_time_minutes: rt,
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
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.max(0, Math.min(100, pct)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 items-start">
            <article className="min-w-0">
              <header className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {meta.tags?.length ? (
                    meta.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold border bg-primary/20 text-primary border-primary/30">
                        {tag}
                      </span>
                    ))
                  ) : null}
                  {meta.is_premium ? (
                    <span className="badge-premium">
                      <Lock className="w-3 h-3" />
                      Premium
                    </span>
                  ) : null}
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                  {meta.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {meta.published_at ? (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {new Date(meta.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    {Math.max(1, meta.reading_time_minutes || 0)} min read
                  </span>
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
                  <Markdown
                    value={post?.content || ""}
                    codeTheme={post?.code_theme || "github-light"}
                  />

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
                </>
              )}
            </article>

            <aside className="hidden lg:block sticky top-24 space-y-4">
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
                <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-primary" />
                    AbhishekPanda Branding
                  </span>
                </div>
              </div>

              {toc.length > 0 && !showPaywall ? (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold text-foreground mb-3">On this page</p>
                  <nav className="space-y-2">
                    {toc.map((h) => (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        className={`block text-sm text-muted-foreground hover:text-foreground transition-colors ${
                          h.depth === 3 ? "pl-3" : ""
                        }`}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold text-foreground mb-1">More</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore more posts from the blog.
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/blog">Browse</Link>
                  </Button>
                </div>
              )}
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
