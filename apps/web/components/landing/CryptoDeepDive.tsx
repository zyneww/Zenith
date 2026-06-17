"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { ArrowRight, Star, Search } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRealtimePrice } from "@/lib/hooks/useRealtimePrice";

interface AssetData {
  rank: number;
  name: string;
  symbol: string;
  basePrice: number;
  h24: string;
  d7: string;
  marketCap: string;
  volume: string;
  sparklinePath: string;
  iconBg: string;
  iconText: string;
}

const ALL_ASSETS: AssetData[] = [
  {
    rank: 1, name: "Bitcoin", symbol: "BTC", basePrice: 64330.91,
    h24: "+2.45%", d7: "+5.12%", marketCap: "$1.54T", volume: "$52.90B",
    sparklinePath: "M0,20 Q10,10 20,25 T40,15 T60,20 T80,5 T100,10",
    iconBg: "bg-orange-500", iconText: "₿",
  },
  {
    rank: 2, name: "Ethereum", symbol: "ETH", basePrice: 1788.33,
    h24: "+1.82%", d7: "+3.45%", marketCap: "$418.00B", volume: "$24.30B",
    sparklinePath: "M0,15 Q10,25 20,10 T40,20 T60,10 T80,15 T100,5",
    iconBg: "bg-blue-500", iconText: "Ξ",
  },
  {
    rank: 3, name: "Solana", symbol: "SOL", basePrice: 172.34,
    h24: "+5.23%", d7: "+12.50%", marketCap: "$79.00B", volume: "$3.80B",
    sparklinePath: "M0,25 Q15,20 25,10 T50,15 T75,5 T100,0",
    iconBg: "bg-gradient-to-tr from-green-400 to-purple-500", iconText: "S",
  },
  {
    rank: 4, name: "BNB", symbol: "BNB", basePrice: 605.20,
    h24: "+0.92%", d7: "+1.23%", marketCap: "$88.00B", volume: "$1.20B",
    sparklinePath: "M0,15 Q10,10 20,20 T40,15 T60,25 T80,10 T100,15",
    iconBg: "bg-yellow-500", iconText: "B",
  },
  {
    rank: 5, name: "XRP", symbol: "XRP", basePrice: 0.62,
    h24: "+1.15%", d7: "+2.80%", marketCap: "$34.00B", volume: "$2.10B",
    sparklinePath: "M0,20 Q10,15 20,25 T40,10 T60,20 T80,5 T100,10",
    iconBg: "bg-gray-800", iconText: "X",
  },
  {
    rank: 6, name: "Cardano", symbol: "ADA", basePrice: 0.45,
    h24: "+0.85%", d7: "+1.50%", marketCap: "$16.00B", volume: "$450M",
    sparklinePath: "M0,15 Q10,20 20,10 T40,25 T60,15 T80,20 T100,10",
    iconBg: "bg-blue-700", iconText: "A",
  },
  {
    rank: 7, name: "Dogecoin", symbol: "DOGE", basePrice: 0.12,
    h24: "+4.12%", d7: "+8.30%", marketCap: "$18.00B", volume: "$1.50B",
    sparklinePath: "M0,25 Q10,20 20,10 T50,15 T75,5 T100,0",
    iconBg: "bg-yellow-600", iconText: "D",
  },
  {
    rank: 8, name: "Polygon", symbol: "MATIC", basePrice: 0.58,
    h24: "+1.45%", d7: "+3.20%", marketCap: "$5.40B", volume: "$280M",
    sparklinePath: "M0,20 Q10,15 20,25 T40,10 T60,20 T80,5 T100,15",
    iconBg: "bg-purple-600", iconText: "M",
  },
  {
    rank: 9, name: "Polkadot", symbol: "DOT", basePrice: 7.20,
    h24: "+0.65%", d7: "+1.80%", marketCap: "$9.80B", volume: "$180M",
    sparklinePath: "M0,15 Q10,25 20,10 T40,20 T60,10 T80,15 T100,5",
    iconBg: "bg-pink-500", iconText: "D",
  },
  {
    rank: 10, name: "Avalanche", symbol: "AVAX", basePrice: 35.40,
    h24: "+2.10%", d7: "+4.50%", marketCap: "$13.00B", volume: "$320M",
    sparklinePath: "M0,20 Q10,10 20,25 T40,15 T60,20 T80,5 T100,10",
    iconBg: "bg-red-500", iconText: "A",
  },
];

function PercentBadge({ value }: { value: string }) {
  const isPositive = value.startsWith("+");
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs border ${
      isPositive ? "bg-accent-subtle text-accent border-[#c8f6f9]/20" : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20"
    }`}>
      {value}
    </span>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

export default function CryptoDeepDive() {
  const t = useTranslations("crypto");
  const symbols = useMemo(() => ALL_ASSETS.map((a) => a.symbol), []);
  const { prices, isConnected } = useRealtimePrice(symbols);
  const CATEGORIES = useMemo(() => [
    { label: t("categories.all"), value: "all" },
    { label: t("categories.layer1"), value: "layer1" },
    { label: t("categories.layer2"), value: "layer2" },
    { label: t("categories.defi"), value: "defi" },
    { label: t("categories.memes"), value: "memes" },
  ], [t]);

  return (
    <section className="py-16 px-4 relative overflow-hidden bg-canvas">
      {/* Background accents */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-gradient-brand opacity-5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="font-mono-caps text-secondary">
                {t("badge")}
              </p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider font-mono ${
                isConnected ? "bg-accent/20 text-accent" : "bg-[#f59e0b]/20 text-[#f59e0b]"
              }`}>
                {isConnected ? t("live") : t("offline")}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-medium text-primary mb-2">
              {t.rich("title", { live: (chunks) => <span className="text-accent">{chunks}</span> })}
            </h2>
            <p className="text-secondary text-sm">
              {t("subtitle")}
            </p>
          </div>
          <Link
            href="/markets"
            className="text-sm border border-surface px-4 py-2 rounded-sm hover:bg-raised transition flex items-center gap-2 w-fit text-secondary hover:text-primary"
          >
            {t("seeAll")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar"
        >
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.value}
              className={`px-4 py-1.5 rounded-sm text-sm font-medium transition whitespace-nowrap ${
                i === 0
                  ? "bg-accent/10 border border-[#c8f6f9] text-accent"
                  : "border border-surface text-secondary hover:bg-raised"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm whitespace-nowrap">
            <thead>
              <tr className="font-mono-caps text-secondary border-b border-surface">
                <th className="py-3 px-2 w-8">{t("tableHeaders.num")}</th>
                <th className="py-3 px-2">{t("tableHeaders.name")}</th>
                <th className="py-3 px-2 text-right">{t("tableHeaders.price")}</th>
                <th className="py-3 px-2 text-right">{t("tableHeaders.24h")}</th>
                <th className="py-3 px-2 text-right">{t("tableHeaders.7d")}</th>
                <th className="py-3 px-2 text-right">{t("tableHeaders.marketCap")}</th>
                <th className="py-3 px-2 text-right">{t("tableHeaders.vol24h")}</th>
                <th className="py-3 px-2 text-right">{t("tableHeaders.7dVol")}</th>
                <th className="py-3 px-2 w-8"></th>
              </tr>
            </thead>
            <tbody className="text-primary">
              {ALL_ASSETS.map((asset, idx) => {
                const livePrice = prices[asset.symbol];
                const displayPrice = livePrice ? formatPrice(livePrice.price) : formatPrice(asset.basePrice);
                const isPositive = asset.h24.startsWith("+");
                const slug = asset.name.toLowerCase();

                return (
                  <motion.tr
                    key={asset.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="border-b border-surface/50 hover:bg-card/50 transition cursor-pointer group"
                  >
                    <td className="py-4 px-2 text-secondary">{asset.rank}</td>
                    <td className="py-4 px-2">
                      <Link href={`/markets/${slug}`} className="flex items-center gap-2 md:gap-3">
                        <div className={`w-6 h-6 rounded-full ${asset.iconBg} flex items-center justify-center text-[10px] font-bold text-primary shrink-0`}>
                          {asset.iconText}
                        </div>
                        <div>
                          <div className="font-medium group-hover:text-accent transition">{asset.name}</div>
                          <div className="text-[10px] md:text-xs text-secondary">{asset.symbol}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-2 text-right font-medium">
                      <span className={`transition-colors duration-200 ${livePrice ? (livePrice.side === "BUY" ? "text-accent" : "text-[#ef4444]") : ""}`}>
                        {displayPrice}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right"><PercentBadge value={asset.h24} /></td>
                    <td className="py-4 px-2 text-right"><PercentBadge value={asset.d7} /></td>
                    <td className="py-4 px-2 text-right text-secondary">{asset.marketCap}</td>
                    <td className="py-4 px-2 text-right text-secondary">{asset.volume}</td>
                    <td className="py-4 px-2 text-right">
                      <svg className="w-12 md:w-16 h-6 inline-block" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path d={asset.sparklinePath} fill="none" stroke={isPositive ? "#c8f6f9" : "#ef4444"} strokeWidth="1.5" />
                      </svg>
                    </td>
                    <td className="py-4 px-2 text-right text-secondary hover:text-[#fc4c02]">
                      <Star className="w-4 h-4 ml-auto" />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link
            href="/markets"
            className="inline-flex items-center gap-2 text-accent hover:text-primary transition-colors text-sm font-medium"
          >
            {t("exploreAll")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
