import { createContext, useContext, useEffect, useState } from "react";

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
  theme: "dark",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "abhishekpanda-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme("dark");
  }, [defaultTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  }, [theme]);

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("abhishekpanda-theme");
      channel.addEventListener("message", () => setTheme("dark"));
    } catch {}

    return () => {
      channel?.close();
    };
  }, [defaultTheme]);

  const value = {
    theme,
    setTheme: (_nextTheme: Theme) => {
      localStorage.setItem(storageKey, "dark");
      // Broadcast to embedded iframes via BroadcastChannel (same-origin, any tab)
      try {
        const bc = new BroadcastChannel("abhishekpanda-theme");
        bc.postMessage({ type: "theme-change", theme: "dark" });
        bc.close();
      } catch {}
      setTheme("dark");
    },
  };

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
