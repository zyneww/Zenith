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
import { SignUpButton, useAuth } from "@clerk/nextjs";
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
  { iconName: "Zap", label: "Gainers & Losers", href: "/markets?view=gainers", group: "Populaire" },
  { iconName: "Flame", label: "Tendances", href: "/markets?view=trending", group: "Populaire" },
  { iconName: "Clock", label: "Nouveaux actifs", href: "/markets?view=new", group: "Populaire" },
  { iconName: "LineChart", label: "Derivatives", href: "/derivatives", group: "Nouveau" },
  { iconName: "Activity", label: "Stocks", href: "/stocks", group: "Nouveau" },
  { iconName: "Coins", label: "NFT", href: "/nfts", group: "Nouveau" },
  { iconName: "Globe", label: "Forex", href: "/forex", group: "Nouveau" },
];

const newsItems: DropdownItem[] = [
  {
    iconName: "CalendarDays",
    label: "Calendrier",
    description: "Événements macroéconomiques et résultats d'entreprises",
    href: "/calendrier",
    featured: true,
  },
  { iconName: "Newspaper", label: "Actualités", href: "/news", group: "Actualités" },
  { iconName: "TrendingUp", label: "Tendances", href: "/apprendre/category/trends", group: "Apprendre" },
  { iconName: "BookOpen", label: "Tutoriels débutants", href: "/apprendre/category/beginners-tutorial", group: "Apprendre" },
  { iconName: "Target", label: "Stratégies", href: "/apprendre/category/strategies", group: "Apprendre" },
  { iconName: "Activity", label: "Analyses", href: "/apprendre/category/analysis", group: "Apprendre" },
  { iconName: "Globe", label: "Sentiment", href: "/apprendre/category/sentiment", group: "Apprendre" },
  { iconName: "CalendarDays", label: "Earnings", href: "/calendrier/earnings", group: "Calendrier" },
  { iconName: "CalendarDays", label: "Dividendes", href: "/calendrier/dividends", group: "Calendrier" },
  { iconName: "CalendarDays", label: "IPO", href: "/calendrier/ipos", group: "Calendrier" },
  { iconName: "CalendarDays", label: "Splits", href: "/calendrier/splits", group: "Calendrier" },
  { iconName: "CalendarDays", label: "Fermetures", href: "/calendrier/holidays", group: "Calendrier" },
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
  { title: "Apprendre", items: newsItems },
  { title: "Outils", items: toolsItems },
  { title: "Aide", items: helpItems },
];

export default function Header() {
  const { isSignedIn } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { open: openPalette } = useCommandPalette();

  return (
    <header
      className="sticky top-4 z-50 bg-transparent border-b border-transparent"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center h-[96px] px-4 sm:px-8 lg:px-16 xl:px-28">
        {/* ─── Logo ─── */}
        <Link href="/" className="flex items-center self-center group flex-shrink-0 justify-self-center">
          <Image
            src="/logo2.svg"
            alt="Zenith"
            width={72}
            height={72}
            priority
            className="w-auto h-16 sm:h-20"
          />
        </Link>

        {/* ─── Desktop Nav (page center) ─── */}
        <nav className="hidden lg:flex items-center self-center gap-1">
          <DropdownMenu trigger="Marchés" items={marketsItems} />
          <DropdownMenu trigger="Apprendre" items={newsItems} />
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

          {/* Commencer button — hidden when signed in */}
          {!isSignedIn && (
            <SignUpButton mode="modal" forceRedirectUrl="/pricing">
              <button
                className="hidden lg:block bg-inverse text-on-inverse font-mono text-sm uppercase tracking-wider px-5 py-2 rounded-sm transition-colors hover:bg-raised cursor-pointer"
                type="button"
              >
                Commencer
              </button>
            </SignUpButton>
          )}

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
    </header>
  );
}
