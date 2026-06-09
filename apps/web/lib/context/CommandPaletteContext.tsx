"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface CommandPaletteContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <CommandPaletteContext.Provider value={{ open, close, isOpen }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}
