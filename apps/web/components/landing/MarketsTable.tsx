"use client";

import { useMemo } from "react";
import { Star, ArrowRight } from "lucide-react";
import { useRealtimePrice } from "@/lib/hooks/useRealtimePrice";

interface AssetData {
  rank: number;
  name: string;
  symbol: string;
  basePrice: number;
  h1: string;
  h24: string;
  d7: string;
  marketCap: string;
  volume: string;
  sparklinePath: string;
  iconBg: string;
  iconText: string;
  positive: boolean;
}

const STATIC_ASSETS: AssetData[] = [
  {
    rank: 1,
    name: "Bitcoin",
    symbol: "BTC",
    basePrice: 77834.5,
    h1: "+0.12%",
    h24: "+2.45%",
    d7: "+5.12%",
    marketCap: "$1.54T",
    volume: "$52.90B",
    sparklinePath:
      "M0,20 Q10,10 20,25 T40,15 T60,20 T80,5 T100,10",
    iconBg: "bg-orange-500",
    iconText: "₿",
    positive: true,
  },
  {
    rank: 2,
    name: "Ethereum",
    symbol: "ETH",
    basePrice: 3482.15,
    h1: "-0.08%",
    h24: "+1.82%",
    d7: "+3.45%",
    marketCap: "$418.00B",
    volume: "$24.30B",
    sparklinePath:
      "M0,15 Q10,25 20,10 T40,20 T60,10 T80,15 T100,5",
    iconBg: "bg-blue-500",
    iconText: "Ξ",
    positive: false,
  },
  {
    rank: 3,
    name: "Solana",
    symbol: "SOL",
    basePrice: 172.34,
    h1: "+1.05%",
    h24: "+5.23%",
    d7: "+12.50%",
    marketCap: "$79.00B",
    volume: "$3.80B",
    sparklinePath:
      "M0,25 Q15,20 25,10 T50,15 T75,5 T100,0",
    iconBg: "bg-card",
    iconText: "S",
    positive: true,
  },
];

function PercentBadge({ value }: { value: string }) {
  const isPositive = value.startsWith("+");
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${
        isPositive
          ? "bg-up/10 text-up border-up/20"
          : "bg-down/10 text-down border-down/20"
      }`}
    >
      {value}
    </span>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (price >= 1) {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else if (price >= 0.0001) {
    return `$${price.toFixed(6)}`;
  }
  return `$${price.toExponential(4)}`;
}

export default function MarketsTable() {
  const symbols = useMemo(
    () => STATIC_ASSETS.map((a) => a.symbol),
    []
  );
  const { prices, isConnected } = useRealtimePrice(symbols);

  return (
    <section className="py-12 px-4 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-accent text-xs font-bold tracking-wider uppercase">
              Fig 02 — Marchés temps réel
            </p>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isConnected
                  ? "bg-up/20 text-up"
                  : "bg-warn/20 text-warn"
              }`}
            >
              {isConnected ? "● LIVE" : "◌ OFFLINE"}
            </span>
          </div>
          <h2 className="heading-2 text-3xl font-bold text-primary mb-2">
            Top 15 cryptos, <span className="text-accent">en direct</span>
          </h2>
          <p className="text-secondary text-sm">
            Prix, variations et volumes mis à jour en continu. Filtrez par
            catégorie pour focus.
          </p>
        </div>
        <button className="text-sm border border-surface px-4 py-2 rounded-full hover:bg-raised transition flex items-center gap-2 w-fit text-primary">
          Voir tout le marché
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Category pills */}
      <div className="flex gap-3 mb-6 overflow-x-auto hide-scrollbar">
        {[
          "Tous",
          "Layer 1",
          "Layer 2",
          "DeFi",
          "Stablecoins",
          "Memecoins",
        ].map((cat, i) => (
          <button
            key={cat}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
              i === 0
                ? "bg-accent-subtle border border-accent text-accent"
                : "border border-surface text-secondary hover:bg-raised"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm whitespace-nowrap">
          <thead>
            <tr className="text-secondary border-b border-surface">
              <th className="py-3 px-1 font-medium w-6">#</th>
              <th className="py-3 px-1 font-medium">NOM</th>
              <th className="py-3 px-1 font-medium text-right">PRIX</th>
              <th className="py-3 px-1 font-medium text-right">1H</th>
              <th className="py-3 px-1 font-medium text-right">24H</th>
              <th className="py-3 px-1 font-medium text-right">7J</th>
              <th className="py-3 px-1 font-medium text-right">MARKET CAP</th>
              <th className="py-3 px-1 font-medium text-right">VOL 24H</th>
              <th className="py-3 px-1 font-medium text-right">7J</th>
              <th className="py-3 px-1 font-medium w-8"></th>
            </tr>
          </thead>
          <tbody className="text-primary">
            {STATIC_ASSETS.map((asset, idx) => {
              const livePrice = prices[asset.symbol];
              const displayPrice = livePrice
                ? formatPrice(livePrice.price)
                : formatPrice(asset.basePrice);

              return (
                <tr
                  key={asset.symbol}
                  className="border-b border-surface/50 hover:bg-card/50 transition cursor-pointer"
                >
                  <td className="py-4 px-1 text-secondary">{asset.rank}</td>
                  <td className="py-4 px-1">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div
                        className={`w-6 h-6 rounded-full ${asset.iconBg} flex items-center justify-center text-[10px] font-bold text-primary shrink-0`}
                      >
                        {asset.iconText}
                      </div>
                      <div>
                        <div className="font-bold">{asset.name}</div>
                        <div className="text-[10px] md:text-xs text-secondary">
                          {asset.symbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-1 text-right font-medium">
                    <span
                      className={`transition-colors duration-200 ${
                        livePrice
                          ? livePrice.side === "BUY"
                            ? "text-up"
                            : "text-down"
                          : ""
                      }`}
                    >
                      {displayPrice}
                    </span>
                  </td>
                  <td className="py-4 px-1 text-right">
                    <PercentBadge value={asset.h1} />
                  </td>
                  <td className="py-4 px-1 text-right">
                    <PercentBadge value={asset.h24} />
                  </td>
                  <td className="py-4 px-1 text-right">
                    <PercentBadge value={asset.d7} />
                  </td>
                  <td className="py-4 px-1 text-right text-secondary">
                    {asset.marketCap}
                  </td>
                  <td className="py-4 px-1 text-right text-secondary">
                    {asset.volume}
                  </td>
                  <td className="py-4 px-1 text-right">
                    <svg
                      className="w-12 md:w-16 h-6 inline-block"
                      viewBox="0 0 100 30"
                      preserveAspectRatio="none"
                    >
                      <path
                        d={asset.sparklinePath}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className={asset.positive ? "text-up" : "text-down"}
                      />
                    </svg>
                  </td>
                  <td className="py-4 px-1 text-right text-secondary hover:text-accent">
                    <Star className="w-4 h-4 ml-auto" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
