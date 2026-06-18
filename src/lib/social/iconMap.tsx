import {
  Globe,
} from "lucide-react";
import {
  SiDiscord,
  SiFacebook,
  SiGithub,
  SiHashnode,
  SiInstagram,
  SiLinkedin,
  SiMedium,
  SiPinterest,
  SiReddit,
  SiStackexchange,
  SiSubstack,
  SiTelegram,
  SiThreads,
  SiTiktok,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from "react-icons/si";
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
  | "pinterest"
  | "whatsapp";

export function iconForKey(key: string) {
  const normalized = key?.toLowerCase().replace(/\s+/g, "").replace(/[_-]/g, "") || "";
  switch (normalized) {
    case "instagram":
      return SiInstagram;
    case "facebook":
      return SiFacebook;
    case "youtube":
      return SiYoutube;
    case "linkedin":
      return SiLinkedin;
    case "github":
      return SiGithub;
    case "x":
      return SiX;
    case "medium":
      return SiMedium;
    case "substack":
      return SiSubstack;
    case "hashnode":
      return SiHashnode;
    case "stackexchange":
    case "stackoverflow":
      return SiStackexchange;
    case "stackcraft":
      return StackcraftIcon as any;
    case "website":
      return Globe;
    case "threads":
      return SiThreads;
    case "reddit":
      return SiReddit;
    case "telegram":
      return SiTelegram;
    case "discord":
      return SiDiscord;
    case "tiktok":
      return SiTiktok;
    case "pinterest":
      return SiPinterest;
    case "whatsapp":
      return SiWhatsapp;
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
