"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X, ChevronRight, BarChart3, LineChart, Newspaper, CalendarDays,
  TrendingUp, Search, Bell, Wallet, LayoutDashboard, Briefcase,
  CreditCard, Headphones, HelpCircle, MessageSquare, Rocket,
  ArrowRight, Bitcoin, Coins, DollarSign, Package, Landmark,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Accordion from "./Accordion";
import type { DropdownItem } from "./DropdownMenu";

const iconMap: Record<string, LucideIcon> = {
  BarChart3, LineChart, Newspaper, CalendarDays, TrendingUp,
  Search, Bell, Wallet, LayoutDashboard, Briefcase,
  CreditCard, Headphones, HelpCircle, MessageSquare, Rocket,
  ArrowRight, Bitcoin, Coins, DollarSign, Package, Landmark,
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
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 right-0 h-full w-[320px] max-w-[85vw] bg-[#0b0e14] border-l border-[#1f2937] z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1f2937]">
              <span className="text-white font-bold text-lg">Menu</span>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
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

                return (
                  <Accordion key={section.title} title={section.title}>
                    {/* Featured item */}
                    {featuredItem && (
                      <div className="mb-3 pb-3 border-b border-[#1f2937]">
                        {featuredItem.disabled || !featuredItem.href ? (
                          <div className="flex items-start gap-3 opacity-50 cursor-not-allowed">
                            {featuredItem.iconName && (
                              <IconRenderer name={featuredItem.iconName} size="lg" />
                            )}
                            <div>
                              <div className="text-white font-semibold text-sm">
                                {featuredItem.label}
                              </div>
                              {featuredItem.description && (
                                <div className="text-xs text-gray-400 mt-0.5">
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
                              <div className="text-white font-semibold text-sm">
                                {featuredItem.label}
                              </div>
                              {featuredItem.description && (
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {featuredItem.description}
                                </div>
                              )}
                            </div>
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Normal items */}
                    <div className="space-y-1">
                      {normalItems.map((item, idx) => (
                        <div key={idx}>
                          {item.separator ? (
                            <div className="border-t border-[#1f2937] my-2" />
                          ) : item.disabled || !item.href ? (
                            <div className="flex items-center gap-3 py-2 text-sm text-gray-500 cursor-not-allowed opacity-60">
                              {item.iconName && <IconRenderer name={item.iconName} size="sm" />}
                              <span>{item.label}</span>
                              <span className="ml-auto text-[10px]">bientôt</span>
                            </div>
                          ) : (
                            <Link
                              href={item.href}
                              className="flex items-center gap-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                              onClick={onClose}
                            >
                              {item.iconName && <IconRenderer name={item.iconName} size="sm" />}
                              <span>{item.label}</span>
                              <ChevronRight className="w-3 h-3 ml-auto text-gray-600" />
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </Accordion>
                );
              })}
            </div>

            {/* Bottom actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0b0e14] border-t border-[#1f2937]">
              <Link
                href="/pricing"
                className="block w-full bg-brand-purple text-white hover:bg-[#6833c9] text-sm font-semibold px-4 py-3 rounded-full transition-colors shadow-glow-purple text-center"
                onClick={onClose}
              >
                Commencer
              </Link>
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
  const className = size === "lg" ? "w-5 h-5 text-brand-cyan mt-0.5 flex-shrink-0" : "w-4 h-4 flex-shrink-0";
  return <Icon className={className} />;
}
