"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { useFormatPrice } from "@/lib/context/CurrencyContext";
import SymbolLogo from "@/components/markets/SymbolLogo";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: { price: number[] };
}

function buildSparkPath(prices: number[]): string {
  if (!prices || prices.length < 2) return "";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = prices.length - 1;
  return prices
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i / w) * 60},${24 - ((v - min) / range) * 20 - 2}`)
    .join(" ");
}

export default function TrendingAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const formatPrice = useFormatPrice();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/market/top-cryptos?limit=8");
      const data = await res.json();
      if (Array.isArray(data)) setAssets(data);
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-canvas-soft">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10 sm:mb-14">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight mb-3">
              Tendances du jour
            </h2>
            <p className="text-secondary text-base">Les actifs les plus suivis par la communauté Zenith.</p>
          </div>
          <Link
            href="/markets"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-rausch transition-colors"
          >
            Voir tous les marchés
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-card border border-surface animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {assets.slice(0, 8).map((asset, i) => {
              const isUp = asset.price_change_percentage_24h >= 0;
              const path = buildSparkPath(asset.sparkline_in_7d?.price ?? []);
              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link
                    href={`/markets/${asset.id}`}
                    className="group block rounded-2xl border border-surface bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_1px_1px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)] hover:border-hover transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <SymbolLogo symbol={asset.symbol} name={asset.name} size="lg" />
                        <div>
                          <h3 className="font-semibold text-primary leading-tight">{asset.name}</h3>
                          <p className="text-xs text-tertiary uppercase">{asset.symbol}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                          isUp ? "bg-up-subtle text-up" : "bg-down-subtle text-down"
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? "+" : ""}
                        {asset.price_change_percentage_24h?.toFixed(2) ?? "0.00"}%
                      </span>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-tertiary mb-0.5">Prix actuel</p>
                        <p className="text-xl font-semibold text-primary">{formatPrice(asset.current_price)}</p>
                      </div>
                      {path && (
                        <svg width="60" height="26" className="opacity-60 group-hover:opacity-100 transition-opacity">
                          <path
                            d={path}
                            fill="none"
                            stroke={isUp ? "var(--text-up)" : "var(--text-down)"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/markets"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-rausch transition-colors"
          >
            Voir tous les marchés
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
