"use client";

import { useState, useMemo } from "react";
import { ArrowRight, Star, Search, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { useRealtimePrice } from "@/lib/hooks/useRealtimePrice";
import Link from "next/link";
import Header from "@/components/landing/Header";

interface MarketAsset {
  rank: number;
  name: string;
  symbol: string;
  price: number;
  h1: string;
  h24: string;
  d7: string;
  marketCap: string;
  volume: string;
  sparklinePath: string;
  iconBg: string;
  iconText: string;
  category: string;
}

const ALL_ASSETS: MarketAsset[] = [
  { rank: 1, name: "Bitcoin", symbol: "BTC", price: 64330.91, h1: "+0.12%", h24: "+2.45%", d7: "+5.12%", marketCap: "$1.54T", volume: "$52.90B", sparklinePath: "M0,20 Q10,10 20,25 T40,15 T60,20 T80,5 T100,10", iconBg: "bg-orange-500", iconText: "₿", category: "Layer 1" },
  { rank: 2, name: "Ethereum", symbol: "ETH", price: 1788.33, h1: "-0.08%", h24: "+1.82%", d7: "+3.45%", marketCap: "$418.00B", volume: "$24.30B", sparklinePath: "M0,15 Q10,25 20,10 T40,20 T60,10 T80,15 T100,5", iconBg: "bg-blue-500", iconText: "Ξ", category: "Layer 1" },
  { rank: 3, name: "Solana", symbol: "SOL", price: 172.34, h1: "+1.05%", h24: "+5.23%", d7: "+12.50%", marketCap: "$79.00B", volume: "$3.80B", sparklinePath: "M0,25 Q15,20 25,10 T50,15 T75,5 T100,0", iconBg: "bg-gradient-to-tr from-green-400 to-purple-500", iconText: "S", category: "Layer 1" },
  { rank: 4, name: "BNB", symbol: "BNB", price: 605.20, h1: "+0.45%", h24: "+0.92%", d7: "+1.23%", marketCap: "$88.00B", volume: "$1.20B", sparklinePath: "M0,15 Q10,10 20,20 T40,15 T60,25 T80,10 T100,15", iconBg: "bg-yellow-500", iconText: "B", category: "Layer 1" },
  { rank: 5, name: "XRP", symbol: "XRP", price: 0.62, h1: "+0.32%", h24: "+1.15%", d7: "+2.80%", marketCap: "$34.00B", volume: "$2.10B", sparklinePath: "M0,20 Q10,15 20,25 T40,10 T60,20 T80,5 T100,10", iconBg: "bg-gray-800", iconText: "X", category: "Layer 1" },
  { rank: 6, name: "Cardano", symbol: "ADA", price: 0.45, h1: "-0.15%", h24: "+0.85%", d7: "+1.50%", marketCap: "$16.00B", volume: "$450M", sparklinePath: "M0,15 Q10,20 20,10 T40,25 T60,15 T80,20 T100,10", iconBg: "bg-blue-700", iconText: "A", category: "Layer 1" },
  { rank: 7, name: "Dogecoin", symbol: "DOGE", price: 0.12, h1: "+2.50%", h24: "+4.12%", d7: "+8.30%", marketCap: "$18.00B", volume: "$1.50B", sparklinePath: "M0,25 Q10,20 20,10 T50,15 T75,5 T100,0", iconBg: "bg-yellow-600", iconText: "D", category: "Meme" },
  { rank: 8, name: "Polygon", symbol: "MATIC", price: 0.58, h1: "+0.22%", h24: "+1.45%", d7: "+3.20%", marketCap: "$5.40B", volume: "$280M", sparklinePath: "M0,20 Q10,15 20,25 T40,10 T60,20 T80,5 T100,15", iconBg: "bg-purple-600", iconText: "M", category: "Layer 2" },
  { rank: 9, name: "Polkadot", symbol: "DOT", price: 7.20, h1: "-0.35%", h24: "+0.65%", d7: "+1.80%", marketCap: "$9.80B", volume: "$180M", sparklinePath: "M0,15 Q10,25 20,10 T40,20 T60,10 T80,15 T100,5", iconBg: "bg-pink-500", iconText: "D", category: "Layer 1" },
  { rank: 10, name: "Avalanche", symbol: "AVAX", price: 35.40, h1: "+0.85%", h24: "+2.10%", d7: "+4.50%", marketCap: "$13.00B", volume: "$320M", sparklinePath: "M0,20 Q10,10 20,25 T40,15 T60,20 T80,5 T100,10", iconBg: "bg-red-500", iconText: "A", category: "Layer 1" },
];

const CATEGORIES = ["All", "Layer 1", "Layer 2", "DeFi", "Stablecoins", "Meme"];

function PercentBadge({ value }: { value: string }) {
  const isPositive = value.startsWith("+");
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${
      isPositive ? "bg-up/10 text-up border-up/20" : "bg-down/10 text-down border-down/20"
    }`}>
      {value}
    </span>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (price >= 1) {
    return `$${price.toFixed(2)}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  }
  return `$${price.toFixed(6)}`;
}

export default function MarketsPage() {
const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const symbols = useMemo(() => ALL_ASSETS.map((a) => a.symbol), []);
  const { prices, isConnected } = useRealtimePrice(symbols);

  const filteredAssets = useMemo(() => {
    let filtered = ALL_ASSETS;

    if (activeCategory !== "All") {
      filtered = filtered.filter((a) => a.category === activeCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.symbol.toLowerCase().includes(query)
      );
    }

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let valA: number, valB: number;
        switch (sortColumn) {
          case "price":
            valA = a.price;
            valB = b.price;
            break;
          case "h24":
            valA = parseFloat(a.h24);
            valB = parseFloat(b.h24);
            break;
          case "d7":
            valA = parseFloat(a.d7);
            valB = parseFloat(b.d7);
            break;
          case "rank":
          default:
            valA = a.rank;
            valB = b.rank;
        }
        return sortDirection === "asc" ? valA - valB : valB - valA;
      });
    }

    return filtered;
  }, [activeCategory, searchQuery, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0e14] text-white">
        {/* Header */}
      <div className="border-b border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Marchés</h1>
              <p className="text-gray-400 text-sm mt-1">
                {filteredAssets.length} actifs listés · Mis à jour en temps réel
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${isConnected ? "bg-up/20 text-up" : "bg-warn/20 text-warn"}`}>
                {isConnected ? "● LIVE" : "◌ OFFLINE"}
              </span>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un actif..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131722] border border-[#1f2937] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan transition"
              />
            </div>
            <button className="flex items-center gap-2 bg-[#131722] border border-[#1f2937] rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white transition">
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
            </button>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-brand-cyan/20 border border-brand-cyan text-brand-cyan"
                    : "border border-gray-700 text-gray-400 hover:bg-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm whitespace-nowrap">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="py-3 px-2 font-medium w-8">#</th>
                <th className="py-3 px-2 font-medium">NOM</th>
                <th 
                  className="py-3 px-2 font-medium text-right cursor-pointer hover:text-white transition"
                  onClick={() => handleSort("price")}
                >
                  PRIX {sortColumn === "price" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 px-2 font-medium text-right">1H</th>
                <th 
                  className="py-3 px-2 font-medium text-right cursor-pointer hover:text-white transition"
                  onClick={() => handleSort("h24")}
                >
                  24H {sortColumn === "h24" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="py-3 px-2 font-medium text-right cursor-pointer hover:text-white transition"
                  onClick={() => handleSort("d7")}
                >
                  7J {sortColumn === "d7" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 px-2 font-medium text-right">MARKET CAP</th>
                <th className="py-3 px-2 font-medium text-right">VOL 24H</th>
                <th className="py-3 px-2 font-medium text-right">7J</th>
                <th className="py-3 px-2 font-medium w-8"></th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {filteredAssets.map((asset, idx) => {
                const livePrice = prices[asset.symbol];
                const displayPrice = livePrice
                  ? formatPrice(livePrice.price)
                  : formatPrice(asset.price);
                const isPositive = asset.h24.startsWith("+");
                const slug = asset.name.toLowerCase();

                return (
                  <motion.tr
                    key={asset.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="border-b border-gray-800/50 hover:bg-[#131722]/50 transition cursor-pointer group"
                  >
                    <td className="py-4 px-2 text-gray-500">{asset.rank}</td>
                    <td className="py-4 px-2">
                      <Link href={`/markets/${slug}`} className="flex items-center gap-2 md:gap-3">
                        <div className={`w-6 h-6 rounded-full ${asset.iconBg} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                          {asset.iconText}
                        </div>
                        <div>
                          <div className="font-bold group-hover:text-brand-cyan transition">{asset.name}</div>
                          <div className="text-[10px] md:text-xs text-gray-500">{asset.symbol}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-2 text-right font-medium">
                      <span className={`transition-colors duration-200 ${livePrice ? (livePrice.side === "BUY" ? "text-up" : "text-down") : ""}`}>
                        {displayPrice}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right"><PercentBadge value={asset.h1} /></td>
                    <td className="py-4 px-2 text-right"><PercentBadge value={asset.h24} /></td>
                    <td className="py-4 px-2 text-right"><PercentBadge value={asset.d7} /></td>
                    <td className="py-4 px-2 text-right text-gray-400">{asset.marketCap}</td>
                    <td className="py-4 px-2 text-right text-gray-400">{asset.volume}</td>
                    <td className="py-4 px-2 text-right">
                      <svg className="w-12 md:w-16 h-6 inline-block" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path d={asset.sparklinePath} fill="none" stroke={isPositive ? "#22c55e" : "#ef4444"} strokeWidth="1.5" />
                      </svg>
                    </td>
                    <td className="py-4 px-2 text-right text-gray-600 hover:text-yellow-500">
                      <Star className="w-4 h-4 ml-auto" />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun actif trouvé pour cette recherche.</p>
          </div>
        )}
      </div>
    </main>
    </>
  );
}
