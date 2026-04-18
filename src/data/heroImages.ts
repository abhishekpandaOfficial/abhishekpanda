import { Briefcase, Landmark, Sun, Palette, Heart } from "lucide-react";
import type { SliderPhotoItem } from "@/components/about/GsapInfinitePhotoSlider";

import professional from "@/assets/about/professional.jpg";
import traditional from "@/assets/about/traditional.jpg";
import lifestyle from "@/assets/about/lifestyle.jpg";
import artistic from "@/assets/about/artistic.jpg";
import family from "@/assets/about/family.jpg";
import aboutPortraitPrimary from "@/assets/about/myimage2.png";
import aboutPortraitSecondary from "@/assets/about/IMG_2863.jpg";
import attachedImageOne from "@/assets/about/hero-attached-1.png";
import attachedImageTwo from "@/assets/about/hero-attached-2.png";
import attachedImageThree from "@/assets/about/hero-attached-3.png";
import attachedImageFour from "@/assets/about/hero-attached-4.png";

export const heroImages: SliderPhotoItem[] = [
  {
    src: attachedImageTwo,
    alt: "Abhishek Panda featured portrait with Awake While Alive",
    title: "Author Portrait",
    caption: "Awake While Alive",
    borderGradient: "linear-gradient(135deg, #0ea5e9, #2563eb, #4f46e5)",
    badgeColor: "bg-blue-500/85 text-white",
    icon: Briefcase,
    imageClassName: "object-center",
  },
  {
    src: attachedImageFour,
    alt: "Abhishek Panda executive portrait",
    title: "Executive Portrait",
    caption: "Professional Signature",
    borderGradient: "linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)",
    badgeColor: "bg-violet-500/85 text-white",
    icon: Briefcase,
    imageClassName: "object-center",
  },
  {
    src: attachedImageOne,
    alt: "Abhishek Panda featured portrait 1",
    title: "Featured 1",
    caption: "Featured Portrait",
    borderGradient: "linear-gradient(135deg, #22d3ee, #3b82f6, #6366f1)",
    badgeColor: "bg-cyan-500/85 text-white",
    icon: Briefcase,
    imageClassName: "object-center",
  },
  {
    src: attachedImageThree,
    alt: "Abhishek Panda featured portrait 3",
    title: "Featured 3",
    caption: "Featured Portrait",
    borderGradient: "linear-gradient(135deg, #f43f5e, #ec4899, #a855f7)",
    badgeColor: "bg-pink-500/85 text-white",
    icon: Briefcase,
    imageClassName: "object-center",
  },
  {
    src: aboutPortraitPrimary,
    alt: "Abhishek Panda portrait",
    title: "Signature",
    caption: "Leadership & Architecture",
    borderGradient: "linear-gradient(135deg, #22d3ee, #3b82f6, #6366f1)",
    badgeColor: "bg-cyan-500/85 text-white",
    icon: Briefcase,
    imageClassName: "object-[center_14%]",
  },
  {
    src: aboutPortraitSecondary,
    alt: "Abhishek Panda formal portrait",
    title: "Formal",
    caption: "Presence & Professionalism",
    borderGradient: "linear-gradient(135deg, #0ea5e9, #2563eb, #4f46e5)",
    badgeColor: "bg-blue-500/85 text-white",
    icon: Briefcase,
    imageClassName: "object-[center_12%]",
  },
  {
    src: professional,
    alt: "Professional",
    title: "Professional",
    caption: "Studio Portrait",
    borderGradient: "linear-gradient(135deg, #f59e0b, #f97316, #ef4444)",
    badgeColor: "bg-amber-500/85 text-white",
    icon: Landmark,
  },
  {
    src: traditional,
    alt: "Traditional",
    title: "Traditional",
    caption: "Culture & Roots",
    borderGradient: "linear-gradient(135deg, #f59e0b, #f97316, #ef4444)",
    badgeColor: "bg-amber-500/85 text-white",
    icon: Landmark,
  },
  {
    src: lifestyle,
    alt: "Lifestyle",
    title: "Lifestyle",
    caption: "Balanced Momentum",
    borderGradient: "linear-gradient(135deg, #f43f5e, #ec4899, #a855f7)",
    badgeColor: "bg-pink-500/85 text-white",
    icon: Sun,
  },
  {
    src: artistic,
    alt: "Artistic",
    title: "Artistic",
    caption: "Creativity in Motion",
    borderGradient: "linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)",
    badgeColor: "bg-violet-500/85 text-white",
    icon: Palette,
  },
  {
    src: family,
    alt: "Family",
    title: "Family",
    caption: "Values First",
    borderGradient: "linear-gradient(135deg, #ef4444, #f97316, #f59e0b)",
    badgeColor: "bg-rose-500/85 text-white",
    icon: Heart,
  },
];
