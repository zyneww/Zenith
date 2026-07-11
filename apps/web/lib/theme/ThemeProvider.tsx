"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  animationsEnabled: boolean;
  toggleAnimations: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY_THEME = "zenith-theme-v3";
const STORAGE_KEY_ANIMATIONS = "zenith-animations-v2";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((nextTheme: Theme) => {
    const resolved = nextTheme === "system" ? getSystemTheme() : nextTheme;
    setResolvedTheme(resolved);

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);

    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (meta) {
      meta.content = resolved === "dark" ? "#0b0e11" : "#ffffff";
    }
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
    applyTheme(nextTheme);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const resolved = prev === "system" ? getSystemTheme() : prev;
      const next = resolved === "dark" ? "light" : "dark";
      return next;
    });
  }, [setTheme]);

  const toggleAnimations = useCallback(() => {
    setAnimationsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_ANIMATIONS, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    setMounted(true);

    const storedTheme = localStorage.getItem(STORAGE_KEY_THEME) as Theme | null;
    const initialTheme = storedTheme ?? "light";
    setThemeState(initialTheme);
    applyTheme(initialTheme);

    const storedAnimations = localStorage.getItem(STORAGE_KEY_ANIMATIONS);
    if (storedAnimations !== null) setAnimationsEnabled(storedAnimations !== "false");

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [applyTheme, theme]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (!animationsEnabled) root.classList.add("reduce-animations");
    else root.classList.remove("reduce-animations");
  }, [animationsEnabled, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme, animationsEnabled, toggleAnimations }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
