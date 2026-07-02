"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface NewsDrawerContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const NewsDrawerContext = createContext<NewsDrawerContextValue | null>(null);

export function NewsDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <NewsDrawerContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((prev) => !prev),
      }}
    >
      {children}
    </NewsDrawerContext.Provider>
  );
}

export function useNewsDrawer() {
  const ctx = useContext(NewsDrawerContext);
  if (!ctx) throw new Error("useNewsDrawer must be used inside NewsDrawerProvider");
  return ctx;
}
