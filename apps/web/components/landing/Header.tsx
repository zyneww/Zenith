"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Menu,
  BarChart3,
  LineChart,
  CalendarDays,
  TrendingUp,
  Search,
  Bell,
  Newspaper,
  HelpCircle,
  MessageSquare,
  Rocket,
  Bitcoin,
  Coins,
  DollarSign,
  Package,
  Landmark,
  Zap,
  Clock,
  Globe,
  Eye,
  PieChart,
  Target,
  BookOpen,
  Map,
  Users,
  CandlestickChart,
  Activity,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import DropdownMenu from "@/components/ui/DropdownMenu";
import MobileDrawer from "@/components/ui/MobileDrawer";
import UserMenu from "@/components/ui/UserMenu";
import SettingsDropdown from "@/components/ui/SettingsDropdown";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useCommandPalette } from "@/lib/context/CommandPaletteContext";
import { useNewsDrawer } from "@/lib/context/NewsDrawerContext";
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
  { iconName: "Bitcoin", label: "Crypto", href: "/markets/cryptocurrencies", group: "Par catégorie" },
  { iconName: "DollarSign", label: "Forex", href: "/markets/forex", group: "Par catégorie" },
  { iconName: "Package", label: "Commodités", href: "/markets/commodities", group: "Par catégorie" },
  { iconName: "Landmark", label: "Indices", href: "/markets/indices", group: "Par catégorie" },
  { iconName: "Activity", label: "Actions", href: "/markets/stocks", group: "Par catégorie" },
  { iconName: "Zap", label: "Futures", href: "/markets/futures", group: "Par catégorie" },
  { iconName: "CandlestickChart", label: "Dérivés", href: "/derivatives", group: "Marchés avancés" },
  { iconName: "LineChart", label: "NFT", href: "/nfts", group: "Marchés avancés" },
  { iconName: "Globe", label: "On-chain", href: "/onchain", group: "Marchés avancés" },
  { iconName: "Eye", label: "Idées", href: "/markets/ideas", group: "Marchés avancés" },
  { iconName: "CalendarDays", label: "Calendrier éco", href: "/markets/economic-calendar", group: "Marchés avancés" },
];

const newsItems: DropdownItem[] = [
  {
    iconName: "CalendarDays",
    label: "Calendrier",
    description: "Événements macroéconomiques et résultats d'entreprises",
    href: "/calendrier",
    featured: true,
  },
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
  { iconName: "Search", label: "Screener", href: "/tools/screener", group: "Analyse" },
  { iconName: "PieChart", label: "Heatmaps", href: "/tools/heatmaps", group: "Analyse" },
  { iconName: "Activity", label: "Corrélation", href: "/tools/correlation", group: "Analyse" },
  { iconName: "Bell", label: "Alertes prix", href: "/tools/alerts", group: "Suivi" },
  { iconName: "Eye", label: "Watchlist", href: "/tools/watchlist", group: "Suivi" },
  { iconName: "Briefcase", label: "Portfolio", href: "/portfolio", group: "Suivi" },
  { iconName: "Coins", label: "Convertisseur", href: "/tools/converter", group: "Utilitaires" },
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { open: openPalette } = useCommandPalette();
  const { toggle: toggleNews } = useNewsDrawer();

  return (
    <header
      className="sticky top-0 z-50 bg-[#0B0E11] border-b border-[#222930]"
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
          {/* Theme */}
          <ThemeToggle />

          {/* Settings */}
          <SettingsDropdown />

          {/* News drawer toggle */}
          <button
            onClick={toggleNews}
            className="text-[#848E9C] hover:text-[#EAECEF] transition-colors p-2 rounded-full hover:bg-[#1A1E23]/50 hidden lg:flex"
            aria-label="Actualités"
            type="button"
          >
            <Newspaper className="w-5 h-5" />
          </button>

          {/* Search icon */}
          <button
            onClick={openPalette}
            className="text-[#848E9C] hover:text-[#EAECEF] transition-colors p-2 rounded-full hover:bg-[#1A1E23]/50 hidden lg:flex"
            aria-label="Rechercher"
            type="button"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="hidden lg:block">
            <UserMenu />
          </div>

          {/* Get Pro */}
          <Link
            href="/pricing"
            className="hidden lg:flex items-center gap-1.5 bg-pro text-on-accent font-mono text-sm uppercase tracking-wider px-5 py-2 rounded-md transition-colors hover:opacity-90 cursor-pointer"
          >
            Get Pro
          </Link>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-[#848E9C] hover:text-[#EAECEF] transition-colors p-2"
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
