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
  theme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function resolveInitialTheme(stored: string | null, defaultTheme: Theme): Theme {
  if (stored === "dark" || stored === "light") return stored;

  // Backward compatibility for previous 'system' value.
  if (stored === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return defaultTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "abhishekpanda-theme",
  ...props
}: ThemeProviderProps) {
  const resetKey = "abhishekpanda-theme-reset-2026-03-12-light";
  const [theme, setTheme] = useState<Theme>(() =>
    resolveInitialTheme(localStorage.getItem(storageKey), defaultTheme),
  );

  useEffect(() => {
    try {
      if (defaultTheme !== "light") return;
      if (localStorage.getItem(resetKey) === "done") return;
      localStorage.setItem(storageKey, "light");
      localStorage.setItem(resetKey, "done");
      setTheme("light");
    } catch {
      return;
    }
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      setTheme(resolveInitialTheme(event.newValue, defaultTheme));
    };

    let channel: BroadcastChannel | null = null;
    const onBroadcastMessage = (event: MessageEvent<{ type?: string; theme?: Theme }>) => {
      if (event.data?.type !== "theme-change") return;
      if (event.data.theme === "dark" || event.data.theme === "light") {
        setTheme(event.data.theme);
      }
    };

    window.addEventListener("storage", onStorage);
    try {
      channel = new BroadcastChannel("abhishekpanda-theme");
      channel.addEventListener("message", onBroadcastMessage);
    } catch {}

    return () => {
      window.removeEventListener("storage", onStorage);
      channel?.removeEventListener("message", onBroadcastMessage);
      channel?.close();
    };
  }, [defaultTheme, storageKey]);

  const value = {
    theme,
    setTheme: (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme);
      // Broadcast to embedded iframes via BroadcastChannel (same-origin, any tab)
      try {
        const bc = new BroadcastChannel("abhishekpanda-theme");
        bc.postMessage({ type: "theme-change", theme: nextTheme });
        bc.close();
      } catch {}
      setTheme(nextTheme);
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
