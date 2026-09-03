import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const STORAGE_KEY = "abhishekpanda-blog-reading-mode";

export function useReadingMode() {
  const { setTheme } = useTheme();
  const [isReadingMode, setIsReadingMode] = useState(false);

  useEffect(() => {
    setTheme("light");
    setIsReadingMode(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.dataset.readingMode = isReadingMode ? "true" : "false";
    window.localStorage.setItem(STORAGE_KEY, String(isReadingMode));
    return () => {
      delete document.documentElement.dataset.readingMode;
    };
  }, [isReadingMode]);

  return {
    isReadingMode,
    toggleReadingMode: () => setIsReadingMode((current) => !current),
  };
}
