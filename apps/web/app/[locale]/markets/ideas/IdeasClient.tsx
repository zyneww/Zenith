"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Idea {
  id: string;
  author: string;
  avatar: string;
  title: string;
  asset: string;
  direction: "long" | "short";
  chartUrl: string;
  likes: number;
  comments: number;
  publishedAt: string;
  tags: string[];
}

const MOCK_IDEAS: Idea[] = [
  {
    id: "1",
    author: "AnalystPro",
    avatar: "A",
    title: "BTC: Double bottom en formation sur H4",
    asset: "BTC/USD",
    direction: "long",
    chartUrl: "",
    likes: 234,
    comments: 45,
    publishedAt: "2026-06-11T10:00:00Z",
    tags: ["Bitcoin", "Technical Analysis"],
  },
  {
    id: "2",
    author: "ForexMaster",
    avatar: "F",
    title: "EUR/USD: Breakout imminent du canal ascendant",
    asset: "EUR/USD",
    direction: "short",
    chartUrl: "",
    likes: 189,
    comments: 32,
    publishedAt: "2026-06-11T09:30:00Z",
    tags: ["Forex", "EUR/USD"],
  },
  {
    id: "3",
    author: "GoldHunter",
    avatar: "G",
    title: "Or: Support clé à 2320$, rebond attendu",
    asset: "GOLD",
    direction: "long",
    chartUrl: "",
    likes: 156,
    comments: 28,
    publishedAt: "2026-06-11T08:00:00Z",
    tags: ["Gold", "Commodities"],
  },
  {
    id: "4",
    author: "TechTrader",
    avatar: "T",
    title: "S&P 500: Divergence baissière RSI à surveiller",
    asset: "SPX",
    direction: "short",
    chartUrl: "",
    likes: 312,
    comments: 67,
    publishedAt: "2026-06-11T07:00:00Z",
    tags: ["Indices", "S&P 500"],
  },
  {
    id: "5",
    author: "CryptoWhale",
    avatar: "C",
    title: "SOL: Accumulation en cours avant le breakout",
    asset: "SOL/USD",
    direction: "long",
    chartUrl: "",
    likes: 278,
    comments: 54,
    publishedAt: "2026-06-11T06:00:00Z",
    tags: ["Solana", "Crypto"],
  },
  {
    id: "6",
    author: "OilKing",
    avatar: "O",
    title: "WTI: Triangle de compression sur le daily",
    asset: "WTI",
    direction: "long",
    chartUrl: "",
    likes: 145,
    comments: 19,
    publishedAt: "2026-06-11T05:00:00Z",
    tags: ["Oil", "Commodities"],
  },
];

function getDirectionColor(direction: string): string {
  return direction === "long" ? "text-accent bg-green-400/10" : "text-[#ef4444] bg-red-400/10";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IdeasClient() {
  const t = useTranslations("markets");
  const [filter, setFilter] = useState<"all" | "long" | "short">("all");

  const filteredIdeas = MOCK_IDEAS.filter((idea) => {
    if (filter === "all") return true;
    return idea.direction === filter;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "long", "short"] as const).map((dir) => (
          <button
            key={dir}
            onClick={() => setFilter(dir)}
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
              filter === dir
                ? "bg-accent text-inverse"
                : "bg-card text-secondary hover:text-primary"
            }`}
          >
            {dir === "all" ? t("ideas.filter.all") : dir === "long" ? t("ideas.filter.long") : t("ideas.filter.short")}
          </button>
        ))}
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="bg-card rounded-sm border border-surface p-4 hover:border-accent/30 transition-colors"
          >
            {/* Author */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-medium text-inverse">
                {idea.avatar}
              </div>
              <div>
                <div className="text-primary text-sm font-medium">{idea.author}</div>
                <div className="text-secondary text-xs">{formatDate(idea.publishedAt)}</div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-primary font-semibold text-sm mb-2">{idea.title}</h3>

            {/* Asset & Direction */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-secondary px-2 py-1 rounded bg-raised">
                {idea.asset}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${getDirectionColor(idea.direction)}`}>
                {idea.direction === "long" ? t("ideas.direction.long") : t("ideas.direction.short")}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {idea.tags.map((tag) => (
                <span key={tag} className="text-xs text-secondary px-2 py-1 rounded bg-raised">
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-secondary text-sm">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {idea.likes}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {idea.comments}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
