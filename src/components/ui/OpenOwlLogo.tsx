import { OpenOwlAnimatedLogo } from "@/components/ui/OpenOwlAnimatedLogo";

type OpenOwlLogoProps = {
  className?: string;
  imageClassName?: string;
  compact?: boolean;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
};

export const OpenOwlLogo = (props: OpenOwlLogoProps) => {
  return <OpenOwlAnimatedLogo {...props} />;
};
