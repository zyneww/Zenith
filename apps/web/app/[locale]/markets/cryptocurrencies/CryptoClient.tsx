"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MarketDataPoint } from "@/lib/market-data/types";

function getChangeColor(change: number): string {
  return change >= 0 ? "text-accent" : "text-[#ef4444]";
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CryptoClient() {
  const t = useTranslations("markets");
  const [coins, setCoins] = useState<MarketDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoins() {
      try {
        const res = await fetch("/api/markets/crypto?limit=20");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCoins(data);
      } catch (error) {
        console.error("Error fetching crypto:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCoins();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" />
      </div>
    );
  }

  const totalVolume = coins.reduce((sum, coin) => sum + (coin.volume || 0), 0);
  const totalMarketCap = coins.reduce((sum, coin) => sum + (coin.price * (coin.volume || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-sm border border-surface p-4">
          <div className="text-secondary text-sm mb-1">{t("crypto.stats.totalCoins")}</div>
          <div className="text-2xl font-medium text-primary">{coins.length}</div>
        </div>
        <div className="bg-card rounded-sm border border-surface p-4">
          <div className="text-secondary text-sm mb-1">{t("crypto.stats.rising")}</div>
          <div className="text-2xl font-medium text-accent">
            {coins.filter((c) => c.changePercent >= 0).length}
          </div>
        </div>
        <div className="bg-card rounded-sm border border-surface p-4">
          <div className="text-secondary text-sm mb-1">{t("crypto.stats.volume24h")}</div>
          <div className="text-2xl font-medium text-primary">
            {(totalVolume / 1e9).toFixed(1)}B
          </div>
        </div>
        <div className="bg-card rounded-sm border border-surface p-4">
          <div className="text-secondary text-sm mb-1">{t("crypto.stats.bestPerf")}</div>
          <div className="text-2xl font-medium text-accent">
            {coins.length > 0 ? `+${Math.max(...coins.map((c) => c.changePercent)).toFixed(2)}%` : "—"}
          </div>
        </div>
      </div>

      {/* Coins Table */}
      <div className="bg-card rounded-sm border border-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface">
                <th className="text-left text-secondary text-sm font-medium px-4 py-3">{t("crypto.table.rank")}</th>
                <th className="text-left text-secondary text-sm font-medium px-4 py-3">{t("crypto.table.name")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("crypto.table.price")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("crypto.table.change24h")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("crypto.table.high24h")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("crypto.table.low24h")}</th>
                <th className="text-right text-secondary text-sm font-medium px-4 py-3">{t("crypto.table.volume")}</th>
              </tr>
            </thead>
            <tbody>
              {coins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-secondary py-12">
                    {t("crypto.noData")}
                  </td>
                </tr>
              ) : (
                coins.map((coin, index) => (
                  <tr key={coin.symbol} className="border-b border-surface/50 hover:bg-raised transition-colors">
                    <td className="px-4 py-3 text-secondary text-sm">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-raised flex items-center justify-center text-sm font-medium text-primary">
                          {coin.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="text-primary text-sm font-medium">{coin.name}</div>
                          <div className="text-secondary text-xs">{coin.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-primary text-sm font-medium">
                      ${formatPrice(coin.price)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${getChangeColor(coin.changePercent)}`}>
                        {coin.changePercent >= 0 ? "+" : ""}
                        {coin.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-primary text-sm">${formatPrice(coin.high)}</td>
                    <td className="px-4 py-3 text-right text-primary text-sm">${formatPrice(coin.low)}</td>
                    <td className="px-4 py-3 text-right text-primary text-sm">
                      {(coin.volume ? (coin.volume / 1e9).toFixed(1) : "—")}B
                    </td>
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
