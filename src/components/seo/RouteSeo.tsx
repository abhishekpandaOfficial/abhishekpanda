import { Helmet } from "react-helmet-async";
import { matchPath, useLocation } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

type SeoData = {
  title: string;
  description: string;
  robots?: string;
};

const PAGE_SEO: Array<{ pattern: string; data: SeoData }> = [
  {
    pattern: "/",
    data: {
      title: "Abhishek Panda | AI Architect, Technical Architect, Founder",
      description:
        "Official website of Abhishek Panda featuring engineering blog posts, Stackcraft learning tracks, CHRONYX, mentorship, and LLM Galaxy insights.",
    },
  },
  {
    pattern: "/about",
    data: {
      title: "About Abhishek Panda | Technical Architect & AI Leader",
      description:
        "Learn about Abhishek Panda’s background, architecture experience, AI work, leadership journey, and OriginX Labs mission.",
    },
  },
  {
    pattern: "/blog",
    data: {
      title: "Abhishek Panda Blog | .NET, Azure, AI/ML, NLP, Agentic AI",
      description:
        "Read Abhishek Panda blog posts and Stackcraft learning tracks covering .NET, Azure, SQL, AI/ML, deep learning, NLP, Agentic AI, and Web3.",
    },
  },
  {
    pattern: "/blogs",
    data: {
      title: "Blog Aggregator | Abhishek Panda + Stackcraft + Social Writing",
      description:
        "Discover content from Abhishek Panda across Stackcraft, Medium, Substack, Hashnode, and other official channels.",
    },
  },
  {
    pattern: "/academy",
    data: {
      title: "Academy | Courses by Abhishek Panda",
      description:
        "Explore premium and free courses by Abhishek Panda on modern software engineering, architecture, cloud, and AI.",
    },
  },
  {
    pattern: "/courses/:courseId",
    data: {
      title: "Course Detail | Abhishek Panda Academy",
      description: "Course content, outcomes, and enrollment details from Abhishek Panda Academy.",
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
    pattern: "/llm-galaxy",
    data: {
      title: "LLM Galaxy | AI Model Intelligence Hub by OriginX",
      description:
        "Explore LLM Galaxy for model discovery, categories, capabilities, comparisons, and AI model insights across open and closed ecosystems.",
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
    pattern: "/chronyx",
    data: {
      title: "CHRONYX | Personal Intelligence Space",
      description:
        "Explore CHRONYX, the personal intelligence and productivity space by Abhishek Panda with focused tools and guided workflows.",
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

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
    </Helmet>
  );
}
