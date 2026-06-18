export type FallbackSocialCategory = "social" | "blog" | "platform";

export type FallbackSocialLink = {
  platform: string;
  display_name: string;
  category: FallbackSocialCategory;
  profile_url: string;
  icon_key: string;
  brand_color: string;
  sort_order: number;
};

export const FALLBACK_SOCIAL_LINKS: FallbackSocialLink[] = [
  {
    platform: "github",
    display_name: "GitHub",
    category: "social",
    profile_url: "https://github.com/abhishekpandaOfficial",
    icon_key: "github",
    brand_color: "#171515",
    sort_order: 1,
  },
  {
    platform: "linkedin",
    display_name: "LinkedIn",
    category: "social",
    profile_url: "https://www.linkedin.com/in/abhishekpandaofficial/",
    icon_key: "linkedin",
    brand_color: "#0a66c2",
    sort_order: 2,
  },
  {
    platform: "instagram",
    display_name: "Instagram",
    category: "social",
    profile_url: "https://www.instagram.com/official_abhishekpanda",
    icon_key: "instagram",
    brand_color: "#e1306c",
    sort_order: 3,
  },
  {
    platform: "youtube",
    display_name: "YouTube",
    category: "social",
    profile_url: "https://www.youtube.com/@the_abhishekpanda",
    icon_key: "youtube",
    brand_color: "#ff0000",
    sort_order: 4,
  },
  {
    platform: "x",
    display_name: "X",
    category: "social",
    profile_url: "https://x.com/Panda_Abhishek8",
    icon_key: "x",
    brand_color: "#111111",
    sort_order: 5,
  },
  {
    platform: "whatsapp",
    display_name: "WhatsApp",
    category: "social",
    profile_url: "https://chat.whatsapp.com/BIz1l1qK9lu1oZEIJOBmDS?mode=gi_t",
    icon_key: "whatsapp",
    brand_color: "#25d366",
    sort_order: 6,
  },
  {
    platform: "substack",
    display_name: "Substack",
    category: "blog",
    profile_url: "https://pandaabhishek.substack.com/",
    icon_key: "substack",
    brand_color: "#ff6719",
    sort_order: 7,
  },
  {
    platform: "hashnode",
    display_name: "Hashnode",
    category: "blog",
    profile_url: "https://abhishekpanda.hashnode.dev/",
    icon_key: "hashnode",
    brand_color: "#2962ff",
    sort_order: 8,
  },
  {
    platform: "medium",
    display_name: "Medium",
    category: "blog",
    profile_url: "https://medium.com/@official.abhishekpanda",
    icon_key: "medium",
    brand_color: "#12100e",
    sort_order: 9,
  },
];
