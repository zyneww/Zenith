"use client";

import { useState } from "react";
import {
  User,
  LogIn,
  HelpCircle,
  Sparkles,
  Play,
  Pause,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";

export default function UserMenu() {
  const { theme, toggleTheme, animationsEnabled, toggleAnimations } = useTheme();
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <>
      <div className="relative">
        {!isSignedIn ? (
          <button
            onClick={() => setOpen(!open)}
            className="icon-default hover:text-primary transition-colors p-2 rounded-full hover:bg-[var(--text-primary)]/5"
            aria-label="Menu utilisateur"
            aria-expanded={open}
          >
            <User className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="icon-default hover:text-primary transition-colors p-2 rounded-full hover:bg-[var(--text-primary)]/5"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full",
                  userButtonPopoverCard: "bg-raised border-surface/50",
                }
              }}
            />
          </div>
        )}

        <AnimatePresence>
          {open && !isSignedIn && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-64 rounded-sm shadow-2xl border z-50 py-2 bg-raised border-surface/50"
              >
                <SignInButton mode="modal">
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-3 text-accent hover:bg-[var(--text-primary)]/5"
                    type="button"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </button>
                </SignInButton>

                <div className="mx-4 my-1 h-px border-surface/50" />

                <Link
                  href="/help/faq"
                  onClick={() => setOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-3 text-primary hover:bg-[var(--text-primary)]/5"
                >
                  <HelpCircle className="w-4 h-4 opacity-70" />
                  Help Center
                </Link>

                <Link
                  href="/help/why-zenith"
                  onClick={() => setOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-3 text-primary hover:bg-[var(--text-primary)]/5"
                >
                  <Sparkles className="w-4 h-4 opacity-70" />
                  What&apos;s new
                </Link>

                <div className="mx-4 my-1 h-px border-surface/50" />

                {/* Theme Toggle */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between text-primary hover:bg-[var(--text-primary)]/5"
                  type="button"
                >
                  <span className="flex items-center gap-3">
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4 opacity-70" />
                    ) : (
                      <Moon className="w-4 h-4 opacity-70" />
                    )}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                  <span
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                      theme === "dark" ? "bg-accent" : "bg-[var(--text-tertiary)]"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-inverse transition-transform duration-200 ${
                        theme === "dark" ? "translate-x-[18px]" : "translate-x-[2px]"
                      }`}
                    />
                  </span>
                </button>

                {/* Animations Toggle */}
                <button
                  onClick={toggleAnimations}
                  className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between text-primary hover:bg-[var(--text-primary)]/5"
                  type="button"
                >
                  <span className="flex items-center gap-3">
                    {animationsEnabled ? (
                      <Play className="w-4 h-4 opacity-70" />
                    ) : (
                      <Pause className="w-4 h-4 opacity-70" />
                    )}
                    Animations
                  </span>
                  <span
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                      animationsEnabled ? "bg-accent" : "bg-[var(--text-tertiary)]"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-inverse transition-transform duration-200 ${
                        animationsEnabled ? "translate-x-[18px]" : "translate-x-[2px]"
                      }`}
                    />
                  </span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
