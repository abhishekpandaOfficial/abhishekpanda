import { Helmet } from "react-helmet-async";
import { matchPath, useLocation } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

type SeoData = {
  title: string;
  description: string;
  keywords?: string;
  robots?: string;
};

const PAGE_SEO: Array<{ pattern: string; data: SeoData }> = [
  {
    pattern: "/",
    data: {
      title: "Abhishek Panda | AI Architect, Technical Architect, Founder",
      description:
        "Official website of Abhishek Panda featuring engineering blog posts, Stackcraft learning tracks, CHRONYX, mentorship, and LLM Galaxy insights.",
      keywords:
        "Abhishek Panda, Abhishek, AI Architect, Technical Architect, OriginX Labs, OpenOwl, Chronyx, LLM Galaxy, software architecture blog",
    },
  },
  {
    pattern: "/about",
    data: {
      title: "About Abhishek Panda | Technical Architect & AI Leader",
      description:
        "Learn about Abhishek Panda’s background, architecture experience, AI work, leadership journey, and OriginX Labs mission.",
      keywords: "about Abhishek Panda, Abhishek Panda profile, AI leader, Technical Architect India",
    },
  },
  {
    pattern: "/blog",
    data: {
      title: "Abhishek Panda Blog | .NET, Azure, AI/ML, NLP, Agentic AI",
      description:
        "Read Abhishek Panda blog posts and Stackcraft learning tracks covering .NET, Azure, SQL, AI/ML, deep learning, NLP, Agentic AI, and Web3.",
      keywords:
        "Abhishek Panda blog, .NET blog, Azure blog, AI blog, software architecture articles, stackcraft",
    },
  },
  {
    pattern: "/cheatsheets",
    data: {
      title: "All Blogs | Abhishek Panda",
      description:
        "Browse all mastery blog series and website blog cards from Abhishek Panda in one place.",
      keywords: "Abhishek Panda blogs, mastery series, engineering blog hub, blog series cards",
    },
  },
  {
    pattern: "/blogs",
    data: {
      title: "All Blogs | Abhishek Panda",
      description:
        "Browse all mastery blog series and website blog cards from Abhishek Panda in one place.",
      keywords: "Abhishek Panda blogs, mastery series, engineering blog hub, blog series cards",
    },
  },
  {
    pattern: "/cheatsheets/:seriesSlug",
    data: {
      title: "Blog Series | Abhishek Panda",
      description:
        "Open a mastery series TOC with modules, chapters, topics, and related website blog posts.",
    },
  },
  {
    pattern: "/ai-ml-blogs",
    data: {
      title: "AI / ML Blogs | Abhishek Panda",
      description:
        "Browse AI and machine learning mastery tracks across math, statistics, Python, feature engineering, ML core, NLP, and computer vision.",
      keywords: "AI blogs, machine learning blogs, data science mastery, Abhishek Panda AI ML",
    },
  },
  {
    pattern: "/ai-ml-blogs/:seriesSlug",
    data: {
      title: "AI / ML Series | Abhishek Panda",
      description:
        "Open an AI / ML mastery series with starter topics, focus areas, and structured learning blocks.",
    },
  },
  {
    pattern: "/articles",
    data: {
      title: "Articles | Abhishek Panda",
      description:
        "Browse route-native articles with editorial cards, technical iconography, tags, and long-form detail pages.",
      keywords: "Abhishek Panda articles, privacy article, long-form articles, editorial dashboards",
    },
  },
  {
    pattern: "/scriptures",
    data: {
      title: "Scriptures | Abhishek Panda",
      description:
        "Read scripture guides with symbolic cards, religion tags, and a focused long-form reading experience with progress and timing.",
      keywords: "Bhagavad Gita guide, Holy Quran guide, scriptures, spiritual reading, Abhishek Panda scriptures",
    },
  },
  {
    pattern: "/scriptures/:slug",
    data: {
      title: "Scripture Guide | Abhishek Panda",
      description:
        "Open scripture detail pages with complete guide rendering, reading progress, timer insights, and structured navigation.",
    },
  },
  {
    pattern: "/articles/:slug",
    data: {
      title: "Article | Abhishek Panda",
      description:
        "Read detailed routed articles with supporting navigation, related content, and theme-aware presentation.",
    },
  },
  {
    pattern: "/case-studies",
    data: {
      title: "Case Studies | Abhishek Panda",
      description:
        "Browse case-study style engineering breakdowns across .NET architecture, distributed systems, privacy, and roadmap-driven technical writing.",
    },
  },
  {
    pattern: "/case-studies/:slug",
    data: {
      title: "Case Study | Abhishek Panda",
      description:
        "Open a dedicated engineering case-study page with routed detail view, section-aware reading flow, and related long-form content.",
    },
  },
  {
    pattern: "/interview",
    data: {
      title: "Interview | Abhishek Panda",
      description:
        "Open interview-focused courses, ebooks, architect preparation packs, and mentorship routes from one top-level hub.",
    },
  },
  {
    pattern: "/projects",
    data: {
      title: "Projects | Abhishek Panda",
      description:
        "Explore live products, engineering platforms, and project-oriented learning destinations across the website.",
    },
  },
  {
    pattern: "/courses",
    data: {
      title: "Courses | Abhishek Panda",
      description:
        "Explore premium and free courses by Abhishek Panda on modern software engineering, architecture, cloud, and AI.",
    },
  },
  {
    pattern: "/academy",
    data: {
      title: "Courses | Abhishek Panda",
      description:
        "Legacy academy URL. Redirecting to the new Courses hub.",
      robots: "noindex,follow",
    },
  },
  {
    pattern: "/tech",
    data: {
      title: "Tech Redirect | Abhishek Panda",
      description: "Legacy route redirecting to the active tech hub.",
      robots: "noindex,follow",
    },
  },
  {
    pattern: "/tech/:slug",
    data: {
      title: "Tech Redirect | Abhishek Panda",
      description: "Legacy route redirecting to the active tech hub.",
      robots: "noindex,follow",
    },
  },
  {
    pattern: "/blog/techstacks",
    data: {
      title: "Tech Stacks Redirect | Abhishek Panda",
      description: "Legacy route redirecting to the active tech hub.",
      robots: "noindex,follow",
    },
  },
  {
    pattern: "/open-owl",
    data: {
      title: "OpenOwl Redirect | Abhishek Panda",
      description: "Legacy route redirecting to OpenOwl.",
      robots: "noindex,follow",
    },
  },
  {
    pattern: "/ai-closed_models_2026.html",
    data: {
      title: "Closed Models Redirect | Abhishek Panda",
      description: "Legacy route redirecting to LLM Galaxy.",
      robots: "noindex,follow",
    },
  },
  {
    pattern: "/open-source-models-march-2026.html",
    data: {
      title: "Open Models Redirect | Abhishek Panda",
      description: "Legacy route redirecting to LLM Galaxy.",
      robots: "noindex,follow",
    },
  },
  {
    pattern: "/ai-model-comparison.html",
    data: {
      title: "Model Comparison Redirect | Abhishek Panda",
      description: "Legacy route redirecting to LLM Galaxy.",
      robots: "noindex,follow",
    },
  },
  {
    pattern: "/install",
    data: {
      title: "Install App | Abhishek Panda",
      description: "Install helper route.",
      robots: "noindex,follow",
    },
  },
  {
    pattern: "/courses/:courseId",
    data: {
      title: "Course Detail | Abhishek Panda Courses",
      description: "Course content, outcomes, and enrollment details from Abhishek Panda Courses.",
    },
  },
  {
    pattern: "/ebooks",
    data: {
      title: "Ebooks | Abhishek Panda",
      description:
        "Explore premium and free ebooks by Abhishek Panda with browser preview, OTP gated free downloads, and Chronyx Hub reading support.",
    },
  },
  {
    pattern: "/ebooks/:slug",
    data: {
      title: "Ebook Details | Abhishek Panda",
      description: "View ebook overview, preview, tech stack, and unlock/download options.",
    },
  },
  {
    pattern: "/products",
    data: {
      title: "Products | Abhishek Panda",
      description: "Explore products, tools, and digital offerings by Abhishek Panda and OriginX Labs.",
    },
  },
  {
    pattern: "/mentorship",
    data: {
      title: "Mentorship | 1:1 with Abhishek Panda",
      description:
        "Book one-on-one mentorship with Abhishek Panda for architecture reviews, AI strategy, and career growth planning.",
    },
  },
  {
    pattern: "/contact",
    data: {
      title: "Contact Abhishek Panda",
      description:
        "Contact Abhishek Panda for collaborations, speaking, consulting, technical advisory, and strategic partnerships.",
    },
  },
  {
    pattern: "/privacy",
    data: {
      title: "Privacy Policy | Abhishek Panda",
      description: "Read the privacy policy for abhishekpanda.com, including data collection, usage, and protection practices.",
    },
  },
  {
    pattern: "/terms",
    data: {
      title: "Terms of Service | Abhishek Panda",
      description: "Review terms governing access and use of abhishekpanda.com services, content, and digital products.",
    },
  },
  {
    pattern: "/refund",
    data: {
      title: "Refund Policy | Abhishek Panda",
      description: "Review refund eligibility, timelines, and process for courses, digital products, and mentorship services.",
    },
  },
  {
    pattern: "/llm-galaxy",
    data: {
      title: "LLM Galaxy | AI Model Intelligence Hub by OriginX",
      description:
        "Explore LLM Galaxy for model discovery, categories, capabilities, comparisons, and AI model insights across open and closed ecosystems.",
      keywords: "LLM Galaxy, AI models, OpenAI, Anthropic, Gemini, model routing, LLM comparison",
    },
  },
  {
    pattern: "/llm-galaxy/model/:modelId",
    data: {
      title: "Model Details | LLM Galaxy",
      description:
        "View model-level details, capabilities, links, and category intelligence inside the LLM Galaxy experience.",
    },
  },
  {
    pattern: "/llm-galaxy/closed-source-models",
    data: {
      title: "Closed Source Models | LLM Galaxy",
      description:
        "Explore ranked closed-source AI models, benchmark context, and capability insights inside LLM Galaxy.",
    },
  },
  {
    pattern: "/llm-galaxy/open-source-models",
    data: {
      title: "Open Source Models | LLM Galaxy",
      description:
        "Explore top open-source and open-weight AI models, strengths, and benchmark-driven comparisons in LLM Galaxy.",
    },
  },
  {
    pattern: "/llm-galaxy/model-comparison",
    data: {
      title: "Model Comparison | LLM Galaxy",
      description:
        "Compare model families across providers with benchmark and capability context in the LLM Galaxy model comparison view.",
    },
  },
  {
    pattern: "/chronyx",
    data: {
      title: "CHRONYX | Personal Intelligence Space",
      description:
        "Explore CHRONYX, the personal intelligence and productivity space by Abhishek Panda with focused tools and guided workflows.",
      keywords: "Chronyx, personal command center, productivity, Abhishek Panda",
    },
  },
  {
    pattern: "/openowl",
    data: {
      title: "OpenOwl | Intelligent Assistant by Abhishek Panda",
      description:
        "Discover OpenOwl, the AI assistant experience by Abhishek Panda for contextual answers, model intelligence, and ecosystem guidance.",
      keywords: "OpenOwl, AbhishekPanda Assistant, AI assistant, LLM assistant, task automation",
    },
  },
  {
    pattern: "/openowl/assistant",
    data: {
      title: "OpenOwl Assistant | AbhishekPanda Assistant",
      description:
        "Chat with AbhishekPanda Assistant in a focused full-screen experience with source-aware, approval-safe guidance.",
    },
  },
  {
    pattern: "/openowl/admin/*",
    data: {
      title: "OpenOwl Admin Center | Abhishek Panda",
      description:
        "OpenOwl Admin Center for overview dashboards, content studio, publish pipeline, delivery tracking, and settings.",
      robots: "noindex,nofollow",
    },
  },
  {
    pattern: "/login",
    data: {
      title: "Sign In | Abhishek Panda",
      description: "Secure sign in with magic link to access account and premium blog experiences.",
      robots: "noindex,follow",
    },
  },
  {
    pattern: "/account",
    data: {
      title: "Your Account | Abhishek Panda",
      description: "Manage your account access and premium content experience.",
      robots: "noindex,follow",
    },
  },
  {
    pattern: "/admin/*",
    data: {
      title: "Admin | Abhishek Panda",
      description: "Administrative control panel.",
      robots: "noindex,nofollow",
    },
  },
];

const defaultSeo: SeoData = {
  title: "Abhishek Panda | Engineering, AI, and Stackcraft",
  description:
    "Official website of Abhishek Panda with blog posts, Stackcraft learning tracks, CHRONYX, LLM Galaxy, and engineering insights.",
  keywords:
    "Abhishek Panda, engineering, AI, cloud architecture, OpenOwl, Chronyx, Stackcraft",
};

export function RouteSeo() {
  const location = useLocation();
  const pathname = location.pathname;

  // Let BlogPost and ModelDetail own their dynamic metadata.
  const isDynamicRoute = !!matchPath("/blog/:slug", pathname);
  if (isDynamicRoute) return null;

  const matched = PAGE_SEO.find((entry) => matchPath({ path: entry.pattern, end: true }, pathname));
  const seo = matched?.data || defaultSeo;
  const canonical = `${SITE_URL}${pathname === "/" ? "" : pathname}`;
  const robots = seo.robots || "index,follow";
  const keywords = seo.keywords || defaultSeo.keywords;

  const schemaGraph = buildSchemaGraph(pathname, canonical, seo.title, seo.description);

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <meta name="bingbot" content={robots} />
      <meta name="author" content="Abhishek Panda" />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="en" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />
      <link rel="alternate" type="application/rss+xml" title="Abhishek Panda Blog RSS" href={`${SITE_URL}/rss.xml`} />
      <link rel="alternate" type="text/plain" title="LLMs.txt" href={`${SITE_URL}/llms.txt`} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      <meta property="og:image:alt" content="Abhishek Panda official website cover image" />
      <meta property="og:site_name" content="Abhishek Panda" />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@Panda_Abhishek8" />
      <meta name="twitter:creator" content="@Panda_Abhishek8" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />

      <script type="application/ld+json">{JSON.stringify(schemaGraph)}</script>
    </Helmet>
  );
}

function buildSchemaGraph(pathname: string, canonical: string, title: string, description: string) {
  const organization = {
    "@type": "Organization",
    "@id": "https://www.abhishekpanda.com/#organization",
    name: "Abhishek Panda",
    url: "https://www.abhishekpanda.com",
    logo: {
      "@type": "ImageObject",
      url: "https://www.abhishekpanda.com/favicon.png",
    },
  };

  const person = {
    "@type": "Person",
    "@id": "https://www.abhishekpanda.com/#person",
    name: "Abhishek Panda",
    url: "https://www.abhishekpanda.com",
    jobTitle: "Technical Architect, AI Architect",
    sameAs: [
      "https://www.linkedin.com/in/abhishekpandaofficial/",
      "https://github.com/abhishekpandaOfficial",
      "https://www.youtube.com/@abhishekpanda_official",
      "https://x.com/Panda_Abhishek8",
      "https://medium.com/@official.abhishekpanda",
      "https://substack.com/@abhishekpanda08",
      "https://hashnode.com/@abhishekpanda",
      "https://writing.stackexchange.com/users/82639/abhishek-official",
      "https://www.stackcraft.io/",
    ],
  };

  const website = {
    "@type": "WebSite",
    "@id": "https://www.abhishekpanda.com/#website",
    name: "Abhishek Panda",
    url: "https://www.abhishekpanda.com",
    publisher: { "@id": "https://www.abhishekpanda.com/#organization" },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.abhishekpanda.com/blog?query={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const webpage = {
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    isPartOf: { "@id": "https://www.abhishekpanda.com/#website" },
    about: { "@id": "https://www.abhishekpanda.com/#person" },
  };

  const breadcrumb = buildBreadcrumbSchema(pathname, canonical);
  const graph: Array<Record<string, unknown>> = [organization, person, website, webpage, breadcrumb];

  if (pathname.startsWith("/openowl")) {
    graph.push({
      "@type": "SoftwareApplication",
      name: "OpenOwl",
      applicationCategory: "AIApplication",
      operatingSystem: "Web",
      creator: { "@id": "https://www.abhishekpanda.com/#person" },
      url: "https://www.abhishekpanda.com/openowl",
      description: "OpenOwl is the AbhishekPanda Assistant for knowledge Q&A, task drafts, and safe action planning.",
    });
  }

  if (pathname === "/blog" || pathname === "/blogs" || pathname === "/cheatsheets") {
    graph.push({
      "@type": "Blog",
      name: "Abhishek Panda Blog",
      url: "https://www.abhishekpanda.com/blog",
      publisher: { "@id": "https://www.abhishekpanda.com/#person" },
      description: "Engineering blog and AI architecture insights by Abhishek Panda.",
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function buildBreadcrumbSchema(pathname: string, canonical: string) {
  const rawSegments = pathname.split("/").filter(Boolean);
  const segments = rawSegments.length ? rawSegments : [""];

  const itemListElement = segments.map((segment, index) => {
    const isRoot = segment === "";
    const name = isRoot
      ? "Home"
      : segment
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
    const itemPath = isRoot ? "/" : `/${rawSegments.slice(0, index + 1).join("/")}`;
    const item = `${SITE_URL}${itemPath === "/" ? "" : itemPath}`;

    return {
      "@type": "ListItem",
      position: index + 1,
      name,
      item,
    };
  });

  if (itemListElement[itemListElement.length - 1]) {
    itemListElement[itemListElement.length - 1].item = canonical;
  }

  return {
    "@type": "BreadcrumbList",
    itemListElement,
  };
}
