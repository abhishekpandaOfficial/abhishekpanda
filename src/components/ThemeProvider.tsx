import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "abhishekpanda-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = typeof window === "undefined" ? null : window.localStorage.getItem(storageKey);
    return saved === "dark" || saved === "light" ? saved : defaultTheme;
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    setThemeState(saved === "dark" || saved === "light" ? saved : defaultTheme);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("abhishekpanda-theme");
      channel.addEventListener("message", (event) => {
        const nextTheme = event.data?.theme;
        if (nextTheme === "dark" || nextTheme === "light") setThemeState(nextTheme);
      });
    } catch {}

    return () => {
      channel?.close();
    };
  }, [defaultTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme);
      // Broadcast to embedded iframes via BroadcastChannel (same-origin, any tab)
      try {
        const bc = new BroadcastChannel("abhishekpanda-theme");
        bc.postMessage({ type: "theme-change", theme: nextTheme });
        bc.close();
      } catch {}
      setThemeState(nextTheme);
  }, [storageKey]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
