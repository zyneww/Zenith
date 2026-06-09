"use client";

import { useState } from "react";
import {
  Menu,
  BarChart3,
  LineChart,
  Newspaper,
  CalendarDays,
  TrendingUp,
  Search,
  Bell,
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
  User,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import DropdownMenu from "@/components/ui/DropdownMenu";
import MobileDrawer from "@/components/ui/MobileDrawer";
import UserMenu from "@/components/ui/UserMenu";
import LocaleCurrencySwitcher from "@/components/ui/LocaleCurrencySwitcher";
import { useCommandPalette } from "@/lib/context/CommandPaletteContext";
import type { DropdownItem } from "@/components/ui/DropdownMenu";

// ─── Données des dropdowns ───

const marketsItems: DropdownItem[] = [
  {
    iconName: "BarChart3",
    label: "Superchart",
    description: "Analyse graphique temps réel",
    href: "/markets",
    featured: true,
  },
  { iconName: "Bitcoin", label: "Crypto", href: "/markets?category=crypto" },
  { iconName: "DollarSign", label: "Forex", href: "/markets?category=forex" },
  { iconName: "Package", label: "Commodités", href: "/markets?category=commodities" },
  { iconName: "Landmark", label: "Indices", href: "/markets?category=indices" },
  { iconName: "Coins", label: "ETFs", href: "/markets?category=etfs" },
  { separator: true },
  { iconName: "ArrowRight", label: "Tous les marchés", href: "/markets" },
];

const newsItems: DropdownItem[] = [
  { iconName: "Newspaper", label: "Actualités Crypto", href: "/news/crypto" },
  { iconName: "Newspaper", label: "Actualités Forex", href: "/news/forex" },
  { iconName: "Newspaper", label: "Actualités Marchés", href: "/news/markets" },
  { separator: true },
  { iconName: "CalendarDays", label: "Calendrier économique", href: "/news/economic-calendar" },
  { iconName: "TrendingUp", label: "Analyses techniques", href: "/news/technical-analysis" },
];

const toolsItems: DropdownItem[] = [
  { iconName: "Search", label: "Screener", href: "/markets" },
  { iconName: "Bell", label: "Alertes de prix", disabled: true },
  { iconName: "LineChart", label: "Convertisseur", disabled: true },
  { separator: true },
  { iconName: "LayoutDashboard", label: "Dashboard", href: "/dashboard" },
  { iconName: "Briefcase", label: "Portfolio", href: "/portfolio" },
];

const helpItems: DropdownItem[] = [
  { iconName: "CreditCard", label: "Abonnement", href: "/help/subscription" },
  { iconName: "Headphones", label: "Assistance", href: "/help/support" },
  { iconName: "HelpCircle", label: "FAQ", href: "/help/faq" },
  { separator: true },
  { iconName: "Rocket", label: "Pourquoi Zenith", href: "/help/why-zenith" },
  { iconName: "MessageSquare", label: "Nous contacter", href: "/help/contact" },
];

const mobileSections = [
  { title: "Marchés", items: marketsItems },
  { title: "Actualités", items: newsItems },
  { title: "Outils", items: toolsItems },
  { title: "Aide", items: helpItems },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { open: openPalette } = useCommandPalette();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-4 z-50 bg-transparent border-b border-transparent"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center h-[80px] px-28">
        {/* ─── Logo ─── */}
        <Link href="/" className="flex items-center self-center group flex-shrink-0 justify-self-center">
          <img
            src="/logo2.svg"
            alt="Zenith"
            width={72}
            height={72}
            className="h-[72px] w-auto transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {/* ─── Desktop Nav (page center) ─── */}
        <nav className="hidden lg:flex items-center self-center gap-1">
          <DropdownMenu trigger="Marchés" items={marketsItems} />
          <DropdownMenu trigger="Actualités" items={newsItems} />
          <DropdownMenu trigger="Outils" items={toolsItems} />
          <DropdownMenu trigger="Aide" items={helpItems} />
        </nav>

        {/* ─── Actions ─── */}
        <div className="flex items-center self-center justify-end gap-3">
          {/* Language + Currency switcher */}
          <LocaleCurrencySwitcher mode="language" />

          {/* Search icon */}
          <button
            onClick={openPalette}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 hidden lg:flex"
            aria-label="Rechercher"
            type="button"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="hidden lg:block">
            <UserMenu />
          </div>

          {/* Commencer button */}
          <Link
            href="/pricing"
            className="hidden lg:block bg-brand-purple text-white hover:bg-[#6833c9] text-sm font-semibold px-5 py-2 rounded-full transition-colors shadow-glow-purple"
          >
            Commencer
          </Link>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-gray-400 hover:text-white transition-colors p-2"
            onClick={() => setDrawerOpen(true)}
            aria-label="Ouvrir le menu"
            type="button"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sections={mobileSections}
      />
    </motion.header>
  );
}
