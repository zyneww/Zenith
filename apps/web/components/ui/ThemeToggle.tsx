"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useState, useRef, useEffect } from "react";

type ThemeOption = { value: "light" | "dark" | "system"; label: string; icon: React.ReactNode };

const options: ThemeOption[] = [
  { value: "light", label: "Clair", icon: <Sun className="w-4 h-4" /> },
  { value: "dark", label: "Sombre", icon: <Moon className="w-4 h-4" /> },
  { value: "system", label: "Système", icon: <Monitor className="w-4 h-4" /> },
];

export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "select" }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = options.find((o) => o.value === theme) ?? options[0];

  if (variant === "select") {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-surface bg-card hover:bg-raised transition-colors text-primary"
          type="button"
          aria-label="Thème"
        >
          {resolvedTheme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span className="capitalize">{active.label}</span>
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-surface rounded-lg shadow-level-1 overflow-hidden z-50">
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  setTheme(o.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                  theme === o.value ? "bg-raised text-accent" : "text-primary hover:bg-raised"
                }`}
                type="button"
              >
                {o.icon}
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full text-secondary hover:text-primary hover:bg-raised transition-colors"
      aria-label={resolvedTheme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      type="button"
    >
      {resolvedTheme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}
