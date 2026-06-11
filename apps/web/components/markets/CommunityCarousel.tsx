"use client";

import Image from "next/image";
import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowRight, ThumbsUp, MessageCircle } from "lucide-react";

interface CommunityIdea {
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

const IDEAS: CommunityIdea[] = [
  {
    id: "1",
    author: "AnalystPro",
    avatar: "A",
    title: "BTC: Double bottom en formation sur le 4H",
    asset: "BTC/USD",
    direction: "long",
    chartUrl: "",
    likes: 234,
    comments: 45,
    publishedAt: "2h ago",
    tags: ["crypto", "bitcoin", "technical"],
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
    publishedAt: "4h ago",
    tags: ["forex", "eurusd", "breakout"],
  },
  {
    id: "3",
    author: "GoldHunter",
    avatar: "G",
    title: "Or: Support clé à 2320$, rebond attendu",
    asset: "GOLD",
    direction: "long",
    chartUrl: "",
    likes: 312,
    comments: 67,
    publishedAt: "6h ago",
    tags: ["commodities", "gold", "support"],
  },
  {
    id: "4",
    author: "TechTrader",
    avatar: "T",
    title: "S&P 500: Divergence baissière RSI à surveiller",
    asset: "SPX",
    direction: "short",
    chartUrl: "",
    likes: 156,
    comments: 28,
    publishedAt: "8h ago",
    tags: ["indices", "sp500", "rsi"],
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
    comments: 52,
    publishedAt: "12h ago",
    tags: ["crypto", "solana", "accumulation"],
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
    publishedAt: "1d ago",
    tags: ["commodities", "oil", "triangle"],
  },
];

export default function CommunityCarousel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Idées communautaires</h2>
          <p className="text-xs text-[#7a8498]">Analyses et signaux de la communauté</p>
        </div>
        <Link
          href="/markets/ideas"
          className="flex items-center gap-1 text-xs text-[#00e5ff] hover:text-[#00e5ff]/80 transition-colors"
        >
          Voir tout
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {IDEAS.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </div>
    </div>
  );
}

function IdeaCard({ idea }: { idea: CommunityIdea }) {
  const isLong = idea.direction === "long";

  return (
    <div className="bg-[#131722] border border-[#1a1f2e] rounded-xl p-4 hover:border-[#2a2f3e] transition-colors cursor-pointer group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1a1f2e] flex items-center justify-center text-xs font-bold text-[#00e5ff]">
            {idea.avatar}
          </div>
          <div>
            <p className="text-xs font-medium text-white">{idea.author}</p>
            <p className="text-[10px] text-[#7a8498]">{idea.publishedAt}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${isLong ? "text-[#00d26a] bg-[#00d26a]/10" : "text-[#ff6b6b] bg-[#ff6b6b]/10"}`}>
          {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isLong ? "Long" : "Short"}
        </div>
      </div>

      <h3 className="text-sm font-medium text-white mb-2 group-hover:text-[#00e5ff] transition-colors">
        {idea.title}
      </h3>

      <div className="flex items-center gap-1 mb-3">
        <span className="text-xs font-medium text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded">
          {idea.asset}
        </span>
        {idea.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-[10px] text-[#7a8498] bg-[#1a1f2e] px-2 py-0.5 rounded">
            #{tag}
          </span>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="bg-[#0b0e14] rounded-lg h-32 mb-3 flex items-center justify-center">
        <div className="text-[#7a8498] text-xs">Graphique</div>
      </div>

      <div className="flex items-center gap-4 text-xs text-[#7a8498]">
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-3 h-3" />
          <span>{idea.likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          <span>{idea.comments}</span>
        </div>
      </div>
    </div>
  );
}
