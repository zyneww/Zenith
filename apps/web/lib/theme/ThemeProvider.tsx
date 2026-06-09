"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface AnimationsContextType {
  animationsEnabled: boolean;
  toggleAnimations: () => void;
}

const AnimationsContext = createContext<AnimationsContextType | null>(null);

const STORAGE_KEY = "zenith-animations";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setAnimationsEnabled(stored !== "false");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.remove("light");

    if (!animationsEnabled) {
      root.classList.add("reduce-animations");
    } else {
      root.classList.remove("reduce-animations");
    }
  }, [animationsEnabled, mounted]);

  const toggleAnimations = useCallback(() => {
    setAnimationsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <AnimationsContext.Provider value={{ animationsEnabled, toggleAnimations }}>
      {children}
    </AnimationsContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(AnimationsContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return { resolvedTheme: "dark" as const, ...context };
}
