"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MarketDataPoint } from "@/lib/market-data/types";

const FOREX_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD",
  "EUR/GBP", "EUR/JPY", "GBP/JPY", "EUR/CHF", "AUD/JPY", "NZD/USD",
  "USD/CNY", "USD/SEK", "USD/NOK", "USD/DKK", "USD/ZAR", "USD/MXN"
];

function getChangeColor(change: number): string {
  return change >= 0 ? "text-accent" : "text-[#ef4444]";
}

export default function ForexClient() {
  const t = useTranslations("markets");
  const [pairs, setPairs] = useState<MarketDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPairs() {
      try {
        const res = await fetch(`/api/markets/forex?symbols=${FOREX_PAIRS.join(",")}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPairs(data);
      } catch (error) {
        console.error("Error fetching forex:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPairs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-sm border border-surface p-4">
          <div className="text-secondary text-sm mb-1">{t("forex.stats.totalPairs")}</div>
          <div className="text-2xl font-medium text-primary">{pairs.length}</div>
        </div>
        <div className="bg-card rounded-sm border border-surface p-4">
          <div className="text-secondary text-sm mb-1">{t("forex.stats.rising")}</div>
          <div className="text-2xl font-medium text-accent">
            {pairs.filter((p) => p.changePercent >= 0).length}
          </div>
        </div>
        <div className="bg-card rounded-sm border border-surface p-4">
          <div className="text-secondary text-sm mb-1">{t("forex.stats.falling")}</div>
          <div className="text-2xl font-medium text-[#ef4444]">
            {pairs.filter((p) => p.changePercent < 0).length}
          </div>
        </div>
        <div className="bg-card rounded-sm border border-surface p-4">
          <div className="text-secondary text-sm mb-1">{t("forex.stats.mostActive")}</div>
          <div className="text-2xl font-medium text-primary">
            {pairs.length > 0 ? pairs.reduce((max, p) => Math.abs(p.changePercent) > Math.abs(max.changePercent) ? p : max).symbol : "—"}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-sm border border-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface">
                <th className="text-left text-secondary text-sm font-medium px-4 py-3">{t("forex.table.pair")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("forex.table.price")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("forex.table.change")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("forex.table.high")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("forex.table.low")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("forex.table.spread")}</th>
              </tr>
            </thead>
            <tbody>
              {pairs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-secondary py-12">{t("forex.noData")}</td>
                </tr>
              ) : (
                pairs.map((pair) => (
                  <tr key={pair.symbol} className="border-b border-surface/50 hover:bg-raised transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-primary text-sm font-medium">{pair.symbol}</div>
                        <div className="text-secondary text-xs">{pair.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-primary text-sm font-medium">{pair.price.toFixed(5)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${getChangeColor(pair.changePercent)}`}>
                        {pair.changePercent >= 0 ? "+" : ""}{pair.changePercent.toFixed(3)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-primary text-sm">{pair.high.toFixed(5)}</td>
                    <td className="px-4 py-3 text-right text-primary text-sm">{pair.low.toFixed(5)}</td>
                    <td className="px-4 py-3 text-right text-primary text-sm">{(pair.high - pair.low).toFixed(5)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
