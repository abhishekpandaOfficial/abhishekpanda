import { useMemo, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { CheatsheetGuideShell } from "@/components/cheatsheets/CheatsheetGuideShell";

const STATIC_GUIDE_VERSION = "2026-03-09-angular-mastery-guide-v2";

const AngularMasteryGuide = () => {
  const { theme } = useTheme();
  const initialThemeRef = useRef(theme);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      embedded: "1",
      theme: initialThemeRef.current,
      v: STATIC_GUIDE_VERSION,
    });

    return `/embedded/angular-mastery.html?${params.toString()}`;
  }, []);

  return (
    <CheatsheetGuideShell
      iframeSrc={iframeSrc}
      iframeTitle="Angular Mastery"
      seriesSlug="angular-mastery"
    />
  );
};

export default AngularMasteryGuide;
