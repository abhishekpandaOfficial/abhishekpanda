import { useMemo, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { CheatsheetGuideShell } from "@/components/cheatsheets/CheatsheetGuideShell";

const STATIC_GUIDE_VERSION = "2026-03-09-azure-mastery-guide-v2";

const AzureMasteryGuide = () => {
  const { theme } = useTheme();
  const initialThemeRef = useRef(theme);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      embedded: "1",
      theme: initialThemeRef.current,
      v: STATIC_GUIDE_VERSION,
    });

    return `/embedded/azure-dotnet10-mastery-syllabus-enhanced.html?${params.toString()}`;
  }, []);

  return (
    <CheatsheetGuideShell
      iframeSrc={iframeSrc}
      iframeTitle="Azure + .NET 10 Complete Mastery Syllabus"
      seriesSlug="azure-mastery"
    />
  );
};

export default AzureMasteryGuide;
