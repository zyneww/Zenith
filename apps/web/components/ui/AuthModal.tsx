"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = "login" | "register";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-md bg-card border border-surface rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex gap-1 bg-raised rounded-full p-1">
                <button
                  onClick={() => setTab("login")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    tab === "login"
                      ? "bg-accent text-on-accent"
                      : "text-secondary hover:text-primary"
                  }`}
                  type="button"
                >
                  Sign in
                </button>
                <button
                  onClick={() => setTab("register")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    tab === "register"
                      ? "bg-accent text-on-accent"
                      : "text-secondary hover:text-primary"
                  }`}
                  type="button"
                >
                  Register
                </button>
              </div>
              <button
                onClick={onClose}
                className="text-secondary hover:text-primary transition-colors p-1 rounded-full hover:bg-raised"
                type="button"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: tab === "login" ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: tab === "login" ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {tab === "register" && (
                    <div>
                      <label className="block text-sm text-secondary mb-1.5">Full name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full bg-raised border border-surface rounded-xs pl-10 pr-4 py-2.5 text-sm text-primary placeholder-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-secondary mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-raised border border-surface rounded-xs pl-10 pr-4 py-2.5 text-sm text-primary placeholder-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-secondary mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-raised border border-surface rounded-xs pl-10 pr-4 py-2.5 text-sm text-primary placeholder-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-accent hover:bg-accent/80 text-on-accent font-semibold py-2.5 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-on-accent/30 border-t-on-accent rounded-full animate-spin" />
                    ) : (
                      <>
                        {tab === "login" ? "Sign in" : "Create account"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              </AnimatePresence>

              <p className="text-xs text-secondary text-center mt-4">
                By continuing, you agree to our{" "}
                <Link href="/legal/terms" className="text-accent hover:underline" onClick={onClose}>
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="text-accent hover:underline" onClick={onClose}>
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
