"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SignUpButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  X, ChevronRight, BarChart3, LineChart, Newspaper, CalendarDays,
  TrendingUp, TrendingDown, Search, Bell, Wallet, LayoutDashboard, Briefcase,
  CreditCard, Headphones, HelpCircle, MessageSquare, Rocket,
  ArrowRight, Bitcoin, Coins, DollarSign, Package, Landmark,
  Zap, Flame, BarChart2, Activity, Scale, Clock, Globe,
  Eye, PieChart, Calculator, Target, BookOpen, LifeBuoy,
  Map, Users, CandlestickChart,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Accordion from "./Accordion";
import type { DropdownItem } from "./DropdownMenu";

const iconMap: Record<string, LucideIcon> = {
  BarChart3, LineChart, Newspaper, CalendarDays, TrendingUp, TrendingDown,
  Search, Bell, Wallet, LayoutDashboard, Briefcase,
  CreditCard, Headphones, HelpCircle, MessageSquare, Rocket,
  ArrowRight, Bitcoin, Coins, DollarSign, Package, Landmark,
  Zap, Flame, BarChart2, Activity, Scale, Clock, Globe,
  Eye, PieChart, Calculator, Target, BookOpen, LifeBuoy,
  Map, Users, CandlestickChart,
};

interface MobileSection {
  title: string;
  items: DropdownItem[];
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sections: MobileSection[];
}

export default function MobileDrawer({ isOpen, onClose, sections }: MobileDrawerProps) {
  const { isSignedIn } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "Tab" && drawerRef.current) {
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => drawerRef.current?.querySelector<HTMLElement>("button")?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 right-0 h-full w-[320px] max-w-[85vw] bg-canvas border-l border-surface z-50 overflow-y-auto overscroll-contain"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface">
              <span className="text-primary font-bold text-lg">Menu</span>
              <button
                onClick={onClose}
                className="p-2 text-secondary hover:text-primary transition-colors"
                type="button"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sections */}
            <div className="px-4">
              {sections.map((section) => {
                const featuredItem = section.items.find((item) => item.featured);
                const normalItems = section.items.filter((item) => !item.featured);

                // Group normal items by group
                const groups: Record<string, DropdownItem[]> = {};
                normalItems.forEach((item) => {
                  const group = item.group || "default";
                  if (!groups[group]) groups[group] = [];
                  groups[group].push(item);
                });
                const groupKeys = Object.keys(groups);

                return (
                  <Accordion key={section.title} title={section.title}>
                    {/* Featured item */}
                    {featuredItem && (
                      <div className="mb-3 pb-3 border-b border-surface">
                        {featuredItem.disabled || !featuredItem.href ? (
                          <div className="flex items-start gap-3 opacity-50 cursor-not-allowed">
                            {featuredItem.iconName && (
                              <IconRenderer name={featuredItem.iconName} size="lg" />
                            )}
                            <div>
                              <div className="text-primary font-semibold text-sm">
                                {featuredItem.label}
                              </div>
                              {featuredItem.description && (
                                <div className="text-xs text-secondary mt-0.5">
                                  {featuredItem.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={featuredItem.href}
                            className="flex items-start gap-3 py-2"
                            onClick={onClose}
                          >
                            {featuredItem.iconName && (
                              <IconRenderer name={featuredItem.iconName} size="lg" />
                            )}
                            <div>
                              <div className="text-primary font-semibold text-sm">
                                {featuredItem.label}
                              </div>
                              {featuredItem.description && (
                                <div className="text-xs text-secondary mt-0.5">
                                  {featuredItem.description}
                                </div>
                              )}
                            </div>
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Groups */}
                    {groupKeys.map((groupKey, groupIndex) => (
                      <div key={groupKey}>
                        {/* Group title */}
                        {groupKey !== "default" && (
                          <div className="text-[11px] uppercase tracking-wider text-secondary font-semibold px-1 py-1.5 mt-1">
                            {groupKey}
                          </div>
                        )}

                        {/* Group items */}
                        <div className="space-y-0.5">
                          {groups[groupKey].map((item, idx) => (
                            <div key={idx}>
                              {item.separator ? (
                                <div className="border-t border-surface my-2" />
                              ) : item.disabled || !item.href ? (
                                <div className="flex items-center gap-3 py-2 text-sm text-secondary cursor-not-allowed opacity-60">
                                  {item.iconName && <IconRenderer name={item.iconName} size="sm" />}
                                  <span>{item.label}</span>
                                  <span className="ml-auto text-[10px]">bientôt</span>
                                </div>
                              ) : (
                                <Link
                                  href={item.href}
                                  className="flex items-center gap-3 py-2 text-sm text-primary hover:text-primary transition-colors"
                                  onClick={onClose}
                                >
                                  {item.iconName && <IconRenderer name={item.iconName} size="sm" />}
                                  <span>{item.label}</span>
                                  <ChevronRight className="w-3 h-3 ml-auto text-secondary" />
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Separator between groups */}
                        {groupIndex < groupKeys.length - 1 && (
                          <div className="border-b border-surface mx-1 my-2" />
                        )}
                      </div>
                    ))}
                  </Accordion>
                );
              })}
            </div>

            {/* Bottom actions */}
            <div className="sticky bottom-0 left-0 right-0 p-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-canvas border-t border-surface">
              {!isSignedIn && (
                <SignUpButton mode="modal" forceRedirectUrl="/pricing">
                  <button
                    onClick={onClose}
                    className="block w-full bg-accent-dark text-primary hover:bg-accent-dark/80 text-sm font-semibold px-4 py-3 rounded-full transition-colors text-center cursor-pointer"
                    type="button"
                  >
                    Commencer
                  </button>
                </SignUpButton>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper to render icons by name in MobileDrawer
function IconRenderer({ name, size }: { name: string; size: "sm" | "lg" }) {
  const Icon = iconMap[name as keyof typeof iconMap];
  if (!Icon) return null;
  const className = size === "lg" ? "w-5 h-5 text-accent mt-0.5 flex-shrink-0" : "w-4 h-4 flex-shrink-0";
  return <Icon className={className} />;
}
