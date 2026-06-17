"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Menu,
  BarChart3,
  LineChart,
  Newspaper,
  CalendarDays,
  TrendingUp,
  TrendingDown,
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
  Zap,
  Flame,
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
  Activity,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { SignUpButton } from "@clerk/nextjs";
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
    iconName: "TrendingUp",
    label: "Top 100 par cap",
    description: "Les plus grosses capitalisations",
    href: "/markets",
    featured: true,
  },
  { iconName: "Bitcoin", label: "Crypto", href: "/markets?category=crypto", group: "Par catégorie" },
  { iconName: "DollarSign", label: "Forex", href: "/markets?category=forex", group: "Par catégorie" },
  { iconName: "Package", label: "Commodités", href: "/markets?category=commodities", group: "Par catégorie" },
  { iconName: "Landmark", label: "Indices", href: "/markets?category=indices", group: "Par catégorie" },
  { iconName: "Coins", label: "ETFs", href: "/markets?category=etfs", group: "Par catégorie" },
  { iconName: "Zap", label: "Gainers & Losers", href: "/markets", group: "Populaire" },
  { iconName: "Flame", label: "Tendances", href: "/markets", group: "Populaire" },
  { iconName: "Clock", label: "Nouveaux actifs", href: "/markets", group: "Populaire" },
];

const newsItems: DropdownItem[] = [
  {
    iconName: "CalendarDays",
    label: "Calendrier économique",
    description: "Événements macroéconomiques clés",
    href: "/news/economic-calendar",
    featured: true,
  },
  { iconName: "CandlestickChart", label: "Analyse technique", href: "/news/technical-analysis", group: "Analyses" },
  { iconName: "BarChart3", label: "Analyse fondamentale", href: "/news/fundamental-analysis", group: "Analyses" },
  { iconName: "Activity", label: "Sentiment", href: "/news/sentiment", group: "Analyses" },
  { iconName: "Scale", label: "Heatmap", href: "/tools/heatmaps", group: "Outils" },
  { iconName: "Globe", label: "Flux en direct", href: "/news/flow", group: "Outils" },
];

const toolsItems: DropdownItem[] = [
  { iconName: "BarChart3", label: "SuperChart", href: "/markets", group: "Analyse" },
  { iconName: "Search", label: "Screener", href: "/tools/screener", group: "Analyse" },
  { iconName: "Scale", label: "Comparer", href: "/tools/compare", group: "Analyse" },
  { iconName: "Activity", label: "Corrélation", href: "/tools/correlation", group: "Analyse" },
  { iconName: "Bell", label: "Alertes prix", href: "/tools/alerts", group: "Suivi" },
  { iconName: "Eye", label: "Watchlist", href: "/tools/watchlist", group: "Suivi" },
  { iconName: "PieChart", label: "Portfolio", href: "/portfolio", group: "Suivi" },
  { iconName: "Coins", label: "Convertisseur", href: "/tools/converter", group: "Calculatrices" },
  { iconName: "Calculator", label: "Calculateur P&L", href: "/tools/calculator/pnl", group: "Calculatrices" },
  { iconName: "Target", label: "Calculateur position", href: "/tools/calculator/position", group: "Calculatrices" },
];

const helpItems: DropdownItem[] = [
  { iconName: "HelpCircle", label: "FAQ", href: "/help/faq", group: "Support" },
  { iconName: "BookOpen", label: "Centre d'aide", href: "/help/support", group: "Support" },
  { iconName: "MessageSquare", label: "Nous contacter", href: "/help/contact", group: "Support" },
  { iconName: "Rocket", label: "Pourquoi Zenith", href: "/help/why-zenith", group: "Zenith" },
  { iconName: "Map", label: "Roadmap", href: "/help/roadmap", group: "Zenith" },
  { iconName: "Users", label: "Communauté", href: "/help/community", group: "Zenith" },
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
      <div className="max-w-7xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center h-[80px] px-4 sm:px-8 lg:px-16 xl:px-28">
        {/* ─── Logo ─── */}
        <Link href="/" className="flex items-center self-center group flex-shrink-0 justify-self-center">
          <Image
            src="/logo2.svg"
            alt="Zenith"
            width={72}
            height={72}
            priority
            className="transition-all duration-300 motion-safe:group-hover:scale-110 w-auto h-10 sm:h-12"
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
          {/* Language switcher */}
          <LocaleCurrencySwitcher mode="language" iconOnly />

          {/* Search icon */}
          <button
            onClick={openPalette}
            className="text-secondary hover:text-primary transition-colors p-2 rounded-full hover:bg-raised/50 hidden lg:flex"
            aria-label="Rechercher"
            type="button"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="hidden lg:block">
            <UserMenu />
          </div>

          {/* Commencer button — black mono-caps */}
          <SignUpButton mode="modal" forceRedirectUrl="/pricing">
            <button
              className="hidden lg:block bg-inverse text-primary font-mono text-sm uppercase tracking-wider px-5 py-2 rounded-sm transition-colors hover:bg-raised cursor-pointer"
              type="button"
            >
              Commencer
            </button>
          </SignUpButton>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-secondary hover:text-primary transition-colors p-2"
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
