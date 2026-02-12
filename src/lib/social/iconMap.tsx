import {
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Globe,
  Hash,
  BookOpen,
  Layers,
  Twitter,
  Facebook,
  MessageCircle,
  Send,
  MessageSquare,
  Music2,
  Bookmark,
} from "lucide-react";
import { StackcraftIcon } from "@/components/icons/StackcraftIcon";

export type SocialIconKey =
  | "instagram"
  | "facebook"
  | "youtube"
  | "linkedin"
  | "github"
  | "x"
  | "medium"
  | "substack"
  | "hashnode"
  | "stackexchange"
  | "stackcraft"
  | "website"
  | "threads"
  | "reddit"
  | "telegram"
  | "discord"
  | "tiktok"
  | "pinterest";

export function iconForKey(key: string) {
  switch (key) {
    case "instagram":
      return Instagram;
    case "facebook":
      return Facebook;
    case "youtube":
      return Youtube;
    case "linkedin":
      return Linkedin;
    case "github":
      return Github;
    case "x":
      return Twitter; // lucide "Twitter" glyph; link label says X.
    case "medium":
      return BookOpen;
    case "substack":
      return Layers;
    case "hashnode":
      return Hash;
    case "stackexchange":
      return Layers;
    case "stackcraft":
      return StackcraftIcon as any;
    case "website":
      return Globe;
    case "threads":
      return MessageCircle;
    case "reddit":
      return MessageSquare;
    case "telegram":
      return Send;
    case "discord":
      return MessageCircle;
    case "tiktok":
      return Music2;
    case "pinterest":
      return Bookmark;
    default:
      return LinkFallback;
  }
}

function LinkFallback(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="currentColor" aria-hidden="true">
      <path d="M10.59 13.41a1.996 1.996 0 0 1 0-2.82l3.18-3.18a2 2 0 0 1 2.83 2.83l-1.06 1.06a1 1 0 1 0 1.41 1.41l1.06-1.06a4 4 0 0 0-5.65-5.65l-3.18 3.18a4 4 0 0 0 0 5.65 1 1 0 0 0 1.41-1.42z" />
      <path d="M13.41 10.59a1.996 1.996 0 0 1 0 2.82l-3.18 3.18a2 2 0 0 1-2.83-2.83l1.06-1.06a1 1 0 1 0-1.41-1.41l-1.06 1.06a4 4 0 0 0 5.65 5.65l3.18-3.18a4 4 0 0 0 0-5.65 1 1 0 0 0-1.41 1.42z" />
    </svg>
  );
}
