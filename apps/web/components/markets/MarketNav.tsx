"use client";

import { useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Globe,
  Wheat,
  PieChart,
  Calendar,
  Lightbulb,
} from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "apercu", label: "Aperçu", icon: null },
  { id: "movers", label: "Top variations", icon: null },
  { id: "indices", label: "Indices", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "crypto", label: "Crypto", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: "forex", label: "Forex", icon: <DollarSign className="w-3.5 h-3.5" /> },
  { id: "futures", label: "Futures", icon: <Globe className="w-3.5 h-3.5" /> },
  { id: "commodities", label: "Matières", icon: <Wheat className="w-3.5 h-3.5" /> },
  { id: "etfs", label: "ETFs", icon: <PieChart className="w-3.5 h-3.5" /> },
  { id: "calendar", label: "Calendrier", icon: <Calendar className="w-3.5 h-3.5" /> },
  { id: "ideas", label: "Idées", icon: <Lightbulb className="w-3.5 h-3.5" /> },
];

interface MarketNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isFilterMode?: boolean;
}

export default function MarketNav({ activeTab, onTabChange, isFilterMode = false }: MarketNavProps) {
  const handleClick = useCallback(
    (tabId: string) => {
      onTabChange(tabId);
    },
    [onTabChange]
  );

  return (
    <nav className="border-b border-surface overflow-x-auto hide-scrollbar">
      <div className="flex max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleClick(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-accent text-accent"
                : "border-transparent text-secondary hover:text-primary hover:border-hover"
            }`}
          >
            {tab.icon}
            {tab.label}
            {isFilterMode && activeTab === tab.id && tab.id !== "apercu" && tab.id !== "movers" && (
              <span className="ml-1 px-1 py-0.5 text-[10px] bg-accent-subtle rounded-sm">Filtre</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
