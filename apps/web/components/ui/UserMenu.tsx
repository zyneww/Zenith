"use client";

import { useState } from "react";
import {
  User,
  LogIn,
  HelpCircle,
  Sparkles,
  Play,
  Pause,
} from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";

export default function UserMenu() {
  const { animationsEnabled, toggleAnimations } = useTheme();
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <>
      <div className="relative">
        {!isSignedIn ? (
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
            aria-label="Menu utilisateur"
            aria-expanded={open}
          >
            <User className="w-5 h-5" />
          </button>
        ) : (
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 rounded-full",
                userButtonPopoverCard: "bg-[#1a1f2e] border-gray-700/50",
              }
            }}
          />
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
                className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl border z-50 py-2 bg-[#1a1f2e] border-gray-700/50"
              >
                <SignInButton mode="modal">
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-3 text-brand-cyan hover:bg-white/5"
                    type="button"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </button>
                </SignInButton>

                <div className="mx-4 my-1 h-px bg-gray-700/50" />

                <Link
                  href="/help/faq"
                  onClick={() => setOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-3 text-gray-300 hover:bg-white/5"
                >
                  <HelpCircle className="w-4 h-4 opacity-70" />
                  Help Center
                </Link>

                <Link
                  href="/help/why-zenith"
                  onClick={() => setOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-3 text-gray-300 hover:bg-white/5"
                >
                  <Sparkles className="w-4 h-4 opacity-70" />
                  What&apos;s new
                </Link>

                <div className="mx-4 my-1 h-px bg-gray-700/50" />

                {/* Animations Toggle */}
                <button
                  onClick={toggleAnimations}
                  className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between text-gray-300 hover:bg-white/5"
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
                      animationsEnabled ? "bg-brand-purple" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                        animationsEnabled ? "translate-x-4.5" : "translate-x-0.5"
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
