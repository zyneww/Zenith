"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface ThemeContextType {
  theme: "dark" | "light";
  resolvedTheme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
  animationsEnabled: boolean;
  toggleAnimations: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY_ANIMATIONS = "zenith-animations";
const STORAGE_KEY_THEME = "zenith-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Hydration: read persisted theme + system preference
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (storedTheme === "dark" || storedTheme === "light") {
      setThemeState(storedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeState(prefersDark ? "dark" : "light");
    }
    const storedAnimations = localStorage.getItem(STORAGE_KEY_ANIMATIONS);
    if (storedAnimations !== null) {
      setAnimationsEnabled(storedAnimations !== "false");
    }
  }, []);

  // Apply theme class + meta tag
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    if (!animationsEnabled) {
      root.classList.add("reduce-animations");
    } else {
      root.classList.remove("reduce-animations");
    }
    // Update theme-color meta tag
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#010120" : "#f5f5f7");
    }
  }, [theme, animationsEnabled, mounted]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY_THEME, next);
      return next;
    });
  }, []);

  const setTheme = useCallback((next: "dark" | "light") => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
  }, []);

  const toggleAnimations = useCallback(() => {
    setAnimationsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_ANIMATIONS, String(next));
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: theme,
        toggleTheme,
        setTheme,
        animationsEnabled,
        toggleAnimations,
      }}
    >
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
