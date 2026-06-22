"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface ThemeContextType {
  theme: "dark";
  resolvedTheme: "dark";
  toggleTheme: () => void;
  setTheme: (theme: "dark") => void;
  animationsEnabled: boolean;
  toggleAnimations: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY_ANIMATIONS = "zenith-animations-v2";
const STORAGE_KEY_THEME = "zenith-theme-v3";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    root.classList.add("dark");
    localStorage.setItem(STORAGE_KEY_THEME, "dark");
    const storedAnimations = localStorage.getItem(STORAGE_KEY_ANIMATIONS);
    if (storedAnimations !== null) setAnimationsEnabled(storedAnimations !== "false");
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (!animationsEnabled) root.classList.add("reduce-animations");
    else root.classList.remove("reduce-animations");
  }, [animationsEnabled, mounted]);

  const toggleTheme = useCallback(() => {}, []);
  const setTheme = useCallback(() => {}, []);

  const toggleAnimations = useCallback(() => {
    setAnimationsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_ANIMATIONS, String(next));
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark", resolvedTheme: "dark", toggleTheme, setTheme, animationsEnabled, toggleAnimations }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}