"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  BarChart3,
  LineChart,
  Newspaper,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Search,
  Bell,
  Wallet,
  LayoutDashboard,
  Briefcase,
  CreditCard,
  Headphones,
  HelpCircle,
  MessageSquare,
  Rocket,
  ArrowRight,
  Bitcoin,
  Coins,
  DollarSign,
  Package,
  Landmark,
  Zap,
  Flame,
  BarChart2,
  Activity,
  Scale,
  Clock,
  Globe,
  Eye,
  PieChart,
  Calculator,
  Target,
  BookOpen,
  LifeBuoy,
  Map,
  Users,
  CandlestickChart,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const iconMap: Record<string, LucideIcon> = {
  BarChart3,
  LineChart,
  Newspaper,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Search,
  Bell,
  Wallet,
  LayoutDashboard,
  Briefcase,
  CreditCard,
  Headphones,
  HelpCircle,
  MessageSquare,
  Rocket,
  ArrowRight,
  Bitcoin,
  Coins,
  DollarSign,
  Package,
  Landmark,
  Zap,
  Flame,
  BarChart2,
  Activity,
  Scale,
  Clock,
  Globe,
  Eye,
  PieChart,
  Calculator,
  Target,
  BookOpen,
  LifeBuoy,
  Map,
  Users,
  CandlestickChart,
};

export interface DropdownItem {
  iconName?: string;
  label?: string;
  description?: string;
  href?: string;
  disabled?: boolean;
  featured?: boolean;
  separator?: boolean;
  group?: string;
}

interface DropdownMenuProps {
  trigger: string;
  items: DropdownItem[];
}

export default function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const getFocusableItems = (): HTMLElement[] => {
    if (!dropdownRef.current) return [];
    return Array.from(
      dropdownRef.current.querySelectorAll<HTMLElement>(
        'a:not([tabindex="-1"]), button:not([tabindex="-1"])'
      )
    );
  };

  const open = () => {
    setIsOpen(true);
    setActiveIndex(0);
    requestAnimationFrame(() => {
      const items = getFocusableItems();
      items[0]?.focus();
    });
  };

  const close = () => {
    setIsOpen(false);
    setActiveIndex(-1);
    triggerRef.current?.focus();
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      if (e.key === "Enter" || e.key === " ") {
        if (isOpen) {
          e.preventDefault();
          const items = getFocusableItems();
          items[0]?.click();
          return;
        }
      }
      e.preventDefault();
      if (!isOpen) open();
      else {
        const items = getFocusableItems();
        const next = (activeIndex + 1) % items.length;
        setActiveIndex(next);
        items[next]?.focus();
      }
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const items = getFocusableItems();
      const prev = (activeIndex - 1 + items.length) % items.length;
      setActiveIndex(prev);
      items[prev]?.focus();
    }
    if (e.key === "Escape") {
      close();
    }
    if (e.key === "Tab") {
      if (isOpen) {
        close();
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Featured item (rendered at top, outside groups)
  const featuredItem = items.find((item) => item.featured);

  // Group normal items by group field
  const normalItems = items.filter((item) => !item.featured);
  const groups: Record<string, DropdownItem[]> = {};
  normalItems.forEach((item) => {
    const group = item.group || "default";
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  });

  // Order groups deterministically
  const groupKeys = Object.keys(groups);

  const focusableItems: DropdownItem[] = [];
  if (featuredItem && featuredItem.href && !featuredItem.disabled) {
    focusableItems.push(featuredItem);
  }
  normalItems.forEach((item) => {
    if (item.href && !item.disabled) {
      focusableItems.push(item);
    }
  });

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <button
        ref={triggerRef}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-sm ${
          isOpen
            ? "text-primary bg-raised/50"
            : "text-secondary hover:text-primary hover:bg-raised/50"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
        onClick={() => (isOpen ? close() : open())}
      >
        {trigger}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 w-[560px] bg-card border border-surface rounded-sm overflow-hidden z-50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="menu"
            aria-label={`${trigger} menu`}
          >
            {/* Featured Item */}
            {featuredItem && (
              <div className="m-2 mb-1">
                {featuredItem.disabled || !featuredItem.href ? (
                  <div className="flex items-start gap-3 p-3 rounded-sm opacity-50 cursor-not-allowed bg-raised/50">
                    {featuredItem.iconName && (
                      <FeaturedIcon name={featuredItem.iconName} />
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
                    className="flex items-start gap-3 p-3 rounded-sm hover:bg-raised transition-colors group bg-accent-subtle border border-accent/20"
                  >
                    {featuredItem.iconName && (
                      <FeaturedIcon name={featuredItem.iconName} />
                    )}
                    <div>
                      <div className="text-primary font-semibold text-sm group-hover:text-accent transition-colors">
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

            {/* Separator after featured */}
            {featuredItem && (
              <div className="border-b border-surface/40 mx-3 my-2" />
            )}

            {/* Groups — multi-column grid */}
            <div
              className="p-3 pt-1"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "0 24px",
              }}
            >
              {groupKeys.map((groupKey) => {
                const isLastCol =
                  groupKeys.indexOf(groupKey) % 3 === 2 ||
                  groupKey === groupKeys[groupKeys.length - 1];
                return (
                  <div
                    key={groupKey}
                    className={!isLastCol ? "border-r border-surface/30 pr-2" : ""}
                  >
                    {/* Group title */}
                    {groupKey !== "default" && (
                      <div className="text-[10px] uppercase tracking-widest text-secondary font-semibold px-3 py-2">
                        {groupKey}
                      </div>
                    )}

                    {/* Group items */}
                    <div className="space-y-0.5">
                      {groups[groupKey].map((item, index) => (
                        <div key={index}>
                          {item.separator ? (
                            <div className="border-t border-surface/40 my-1.5 mx-2" />
                          ) : item.disabled || !item.href ? (
                            <div className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-secondary cursor-not-allowed opacity-60 rounded-sm">
                              {item.iconName && (
                                <NormalIcon name={item.iconName} />
                              )}
                              <span>{item.label}</span>
                            </div>
                          ) : (
                            <Link
                              href={item.href}
                              className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-secondary hover:bg-raised hover:text-primary transition-colors rounded-sm"
                            >
                              {item.iconName && (
                                <NormalIcon name={item.iconName} />
                              )}
                              <span>{item.label}</span>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeaturedIcon({ name }: { name: string }) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return (
    <div className="w-9 h-9 rounded-sm bg-accent-subtle flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-accent" />
    </div>
  );
}

function NormalIcon({ name }: { name: string }) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className="w-4 h-4 flex-shrink-0 text-secondary" />;
}
