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

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

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

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <button
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
          isOpen
            ? "text-white bg-white/5"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
        aria-expanded={isOpen}
        type="button"
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
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 w-[340px] bg-[#131722] border border-[#1f2937]/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Featured Item */}
            {featuredItem && (
              <div className="m-2 mb-1">
                {featuredItem.disabled || !featuredItem.href ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg opacity-50 cursor-not-allowed bg-[#1a1f2e]/50">
                    {featuredItem.iconName && (
                      <FeaturedIcon name={featuredItem.iconName} />
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
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#1f2937] transition-colors group bg-[#00e5ff]/5 border border-[#00e5ff]/10"
                  >
                    {featuredItem.iconName && (
                      <FeaturedIcon name={featuredItem.iconName} />
                    )}
                    <div>
                      <div className="text-white font-semibold text-sm group-hover:text-brand-cyan transition-colors">
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

            {/* Separator after featured */}
            {featuredItem && (
              <div className="border-b border-[#1f2937]/40 mx-3 my-2" />
            )}

            {/* Groups */}
            <div className="p-2 pb-3">
              {groupKeys.map((groupKey, groupIndex) => (
                <div key={groupKey}>
                  {/* Group title */}
                  <div className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold px-3 py-1.5 mt-1">
                    {groupKey === "default" ? "" : groupKey}
                  </div>

                  {/* Group items */}
                  <div className="space-y-0.5">
                    {groups[groupKey].map((item, index) => (
                      <div key={index}>
                        {item.separator ? (
                          <div className="border-t border-[#1f2937]/40 my-1.5 mx-2" />
                        ) : item.disabled || !item.href ? (
                          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 cursor-not-allowed opacity-60 rounded-lg">
                            {item.iconName && (
                              <NormalIcon name={item.iconName} />
                            )}
                            <span>{item.label}</span>
                            <span className="ml-auto text-[10px] text-gray-600 bg-gray-800/50 px-1.5 py-0.5 rounded">
                              bientôt
                            </span>
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#1f2937] hover:text-white transition-colors rounded-lg"
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

                  {/* Separator between groups */}
                  {groupIndex < groupKeys.length - 1 && (
                    <div className="border-b border-[#1f2937]/40 mx-2 my-2" />
                  )}
                </div>
              ))}
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
    <div className="w-9 h-9 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-brand-cyan" />
    </div>
  );
}

function NormalIcon({ name }: { name: string }) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className="w-4 h-4 flex-shrink-0 text-gray-400" />;
}
