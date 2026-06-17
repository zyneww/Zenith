"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MarketDataPoint } from "@/lib/market-data/types";

const FUTURES_SYMBOLS = [
  "ES=F", "NQ=F", "YM=F", "GCF", "CLF", "SIF", "NG=F", "ZWF", "ZCF", "ZSF"
];

function getChangeColor(change: number): string {
  return change >= 0 ? "text-accent" : "text-[#ef4444]";
}

export default function FuturesClient() {
  const t = useTranslations("markets");
  const [futures, setFutures] = useState<MarketDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFutures() {
      try {
        const res = await fetch(`/api/markets/futures?symbols=${FUTURES_SYMBOLS.join(",")}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setFutures(data);
      } catch (error) {
        console.error("Error fetching futures:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFutures();
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
          <div className="text-secondary text-sm mb-1">{t("futures.stats.total")}</div>
          <div className="text-2xl font-medium text-primary">{futures.length}</div>
        </div>
        <div className="bg-card rounded-sm border border-surface p-4">
          <div className="text-secondary text-sm mb-1">{t("futures.stats.rising")}</div>
          <div className="text-2xl font-medium text-accent">
            {futures.filter((f) => f.changePercent >= 0).length}
          </div>
        </div>
        <div className="bg-card rounded-sm border border-surface p-4">
          <div className="text-secondary text-sm mb-1">{t("futures.stats.falling")}</div>
          <div className="text-2xl font-medium text-[#ef4444]">
            {futures.filter((f) => f.changePercent < 0).length}
          </div>
        </div>
        <div className="bg-card rounded-sm border border-surface p-4">
          <div className="text-secondary text-sm mb-1">{t("futures.stats.bestPerf")}</div>
          <div className="text-2xl font-medium text-accent">
            {futures.length > 0 ? `+${Math.max(...futures.map((f) => f.changePercent)).toFixed(2)}%` : "—"}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-sm border border-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface">
                <th className="text-left text-secondary text-sm font-medium px-4 py-3">{t("futures.table.contract")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("futures.table.price")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("futures.table.change")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("futures.table.high")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("futures.table.low")}</th>
              </tr>
            </thead>
            <tbody>
              {futures.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-secondary py-12">{t("futures.noData")}</td>
                </tr>
              ) : (
                futures.map((future) => (
                  <tr key={future.symbol} className="border-b border-surface/50 hover:bg-raised transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-primary text-sm font-medium">{future.symbol}</div>
                        <div className="text-secondary text-xs">{future.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-primary text-sm font-medium">{future.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${getChangeColor(future.changePercent)}`}>
                        {future.changePercent >= 0 ? "+" : ""}{future.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-primary text-sm">{future.high.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-primary text-sm">{future.low.toFixed(2)}</td>
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
