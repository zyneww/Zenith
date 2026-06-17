"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MarketDataPoint } from "@/lib/market-data/types";

interface MoversData {
  gainers: MarketDataPoint[];
  losers: MarketDataPoint[];
}

function MoversPanel({
  title,
  icon,
  items,
  isGainers,
  isLoading,
}: {
  title: string;
  icon: React.ReactNode;
  items: MarketDataPoint[];
  isGainers: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-card border border-surface rounded-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-medium text-sm text-primary">{title}</h3>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-raised rounded animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-secondary py-4 text-center">Aucune donnée</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.symbol}
              className="flex items-center justify-between py-2 px-2 -mx-2 rounded-sm hover:bg-raised/50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-xs text-primary truncate">
                  {item.symbol}
                </span>
                <span className="text-xs text-secondary truncate hidden sm:inline">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-primary font-medium tabular-nums">
                  ${item.price.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span
                  className={`flex items-center gap-1 font-medium tabular-nums w-20 justify-end ${
                    isGainers ? "text-accent" : "text-[#ef4444]"
                  }`}
                >
                  {isGainers ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {item.changePercent >= 0 ? "+" : ""}
                  {item.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopMovers() {
  const [data, setData] = useState<MoversData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMovers() {
      try {
        const res = await fetch("/api/markets/movers", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const json: MoversData = await res.json();
        setData(json);
      } catch {
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMovers();
    const interval = setInterval(fetchMovers, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MoversPanel
        title="Gagnants"
        icon={<TrendingUp className="w-4 h-4 text-accent" />}
        items={data?.gainers ?? []}
        isGainers={true}
        isLoading={isLoading}
      />
      <MoversPanel
        title="Perdants"
        icon={<TrendingDown className="w-4 h-4 text-[#ef4444]" />}
        items={data?.losers ?? []}
        isGainers={false}
        isLoading={isLoading}
      />
    </div>
  );
}
