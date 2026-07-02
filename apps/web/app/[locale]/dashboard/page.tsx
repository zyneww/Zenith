"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/landing/Header";
import MetricsCards from "@/components/dashboard/MetricsCards";
import PortfolioChart from "@/components/dashboard/PortfolioChart";
import ActivePositions from "@/components/dashboard/ActivePositions";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import { useCurrency, CURRENCY_SYMBOLS } from "@/lib/context/CurrencyContext";

interface GlobalData {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  marketCapChange24h: number;
}

export default function DashboardPage() {
  const [global, setGlobal] = useState<GlobalData | null>(null);
  const { convertFromUsd, formatNumber, currency } = useCurrency();

  const fmtCompact = useCallback((n: number) => {
    const converted = convertFromUsd(n);
    const compact = formatNumber(converted, { notation: "compact", compactDisplay: "short", maximumFractionDigits: 2 });
    return `${CURRENCY_SYMBOLS[currency]}${compact}`;
  }, [convertFromUsd, formatNumber, currency]);

  useEffect(() => {
    fetch("/api/market/global").then(r => r.json()).then(setGlobal).catch(() => {});
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-canvas text-primary">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-medium text-primary mb-2">Dashboard</h1>
            <p className="text-secondary">
              Vue d'ensemble de votre portfolio et performances du marché.
            </p>
          </div>

          {global && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-card border border-surface rounded-lg p-5">
                <p className="text-secondary text-sm mb-1">Capitalisation Totale</p>
                <p className="text-2xl font-medium text-primary">{fmtCompact(global.totalMarketCap)}</p>
                <p className={`text-sm font-medium mt-2 ${global.marketCapChange24h >= 0 ? "text-up" : "text-down"}`}>
                  {global.marketCapChange24h >= 0 ? "+" : ""}{global.marketCapChange24h.toFixed(2)}%
                </p>
              </div>
              <div className="bg-card border border-surface rounded-lg p-5">
                <p className="text-secondary text-sm mb-1">Dominance BTC</p>
                <p className="text-2xl font-medium text-primary">{global.btcDominance.toFixed(1)}%</p>
              </div>
              <div className="bg-card border border-surface rounded-lg p-5">
                <p className="text-secondary text-sm mb-1">Volume 24h Marché</p>
                <p className="text-2xl font-medium text-primary">{fmtCompact(global.totalVolume)}</p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <MetricsCards />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart - takes 2 columns */}
            <div className="lg:col-span-2">
              <PortfolioChart />
            </div>

            {/* Alerts */}
            <div className="lg:col-span-1">
              <RecentAlerts />
            </div>
          </div>

          {/* Positions */}
          <div className="mt-8">
            <ActivePositions />
          </div>
        </div>
      </main>
    </>
  );
}
