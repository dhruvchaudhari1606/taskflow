"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { useHydrated } from "@/hooks/use-hydrated";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "taskflow-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

// ─── Theme store (localStorage-backed) ───────────────────────────────────────
// Read through useSyncExternalStore so the saved preference is picked up on
// the client without a setState-in-effect, and stays in sync across tabs.

const listeners = new Set<() => void>();

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function readStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isTheme(saved) ? saved : "system";
  } catch {
    // Storage can be unavailable (private mode, blocked site data)
    return "system";
  }
}

function subscribeTheme(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function writeStoredTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore — the theme still applies for this session
  }
  listeners.forEach((listener) => listener());
}

function prefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

function applyTheme(theme: Theme) {
  const effectiveDark = theme === "system" ? prefersDark() : theme === "dark";
  document.documentElement.classList.toggle("dark", effectiveDark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readStoredTheme,
    () => "light" as Theme
  );
  const hydrated = useHydrated();

  // Reflect the active theme on <html>
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Follow OS-level changes while the "system" theme is selected
  useEffect(() => {
    if (theme !== "system") return;
    const mediaQuery = window.matchMedia(DARK_QUERY);
    const handleChange = () => applyTheme("system");
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    writeStoredTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    writeStoredTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  const isDark =
    hydrated && (theme === "dark" || (theme === "system" && prefersDark()));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
