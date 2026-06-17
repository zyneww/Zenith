"use client";

import { useMemo } from "react";
import { Network, TrendingUp, TrendingDown } from "lucide-react";
import { MarketDataPoint } from "@/lib/market-data/types";

interface CrossRatesGridProps {
  data: MarketDataPoint[];
  isLoading?: boolean;
}

const MAJORS = ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"];

function getRateVsUsd(symbol: string, price: number): number {
  if (!symbol || !price) return 0;
  if (symbol.startsWith("USD")) return 1 / price;
  return price;
}

function usdPerUnit(currency: string, usdRates: Record<string, number>): number {
  if (currency === "USD") return 1;
  return usdRates[currency] ?? 0;
}

function computeCrossRate(
  base: string,
  quote: string,
  usdRates: Record<string, number>
): number {
  if (base === quote) return 1;
  if (base === "USD") return 1 / usdPerUnit(quote, usdRates);
  if (quote === "USD") return usdPerUnit(base, usdRates);
  return usdPerUnit(base, usdRates) / usdPerUnit(quote, usdRates);
}

export default function CrossRatesGrid({ data, isLoading = false }: CrossRatesGridProps) {
  const { usdRates, changePct } = useMemo(() => {
    const rates: Record<string, number> = {};
    const ch: Record<string, number> = {};

    for (const item of data) {
      const symbol = item.symbol.toUpperCase();
      let base: string | null = null;
      let quote: string | null = null;
      if (symbol.includes("/")) {
        const parts = symbol.split("/");
        base = parts[0];
        quote = parts[1];
      }
      if (!base || !quote) continue;

      if (quote === "USD") {
        rates[base] = item.price;
        ch[base] = item.changePercent;
      } else if (base === "USD") {
        rates[quote] = 1 / item.price;
        ch[quote] = -item.changePercent;
      }
    }

    rates["USD"] = 1;
    rates["EUR"] = rates["EUR"] ?? 1.08;
    rates["JPY"] = rates["JPY"] ?? 0.0067;
    rates["GBP"] = rates["GBP"] ?? 1.27;
    rates["CHF"] = rates["CHF"] ?? 1.13;
    rates["AUD"] = rates["AUD"] ?? 0.66;
    rates["CAD"] = rates["CAD"] ?? 0.74;
    rates["NZD"] = rates["NZD"] ?? 0.61;

    ch["USD"] = 0;
    ch["EUR"] = ch["EUR"] ?? 0;
    ch["JPY"] = ch["JPY"] ?? 0;
    ch["GBP"] = ch["GBP"] ?? 0;
    ch["CHF"] = ch["CHF"] ?? 0;
    ch["AUD"] = ch["AUD"] ?? 0;
    ch["CAD"] = ch["CAD"] ?? 0;
    ch["NZD"] = ch["NZD"] ?? 0;

    return { usdRates: rates, changePct: ch };
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-card border border-surface rounded-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Network className="w-4 h-4 text-accent" />
          <h3 className="font-medium text-sm text-primary">Taux croisés</h3>
        </div>
        <div className="h-[420px] bg-raised rounded-sm animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-surface rounded-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-accent" />
          <h3 className="font-medium text-sm text-primary">Taux croisés Forex</h3>
        </div>
        <span className="text-[10px] text-secondary font-mono-caps">8 devises majeures</span>
      </div>
      <p className="text-xs text-secondary mb-3">
        Grille triangulaire — calculée à partir des taux USD
      </p>
      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-1.5 text-left text-secondary font-mono-caps text-[10px]"></th>
              {MAJORS.map((c) => (
                <th
                  key={c}
                  className="p-1.5 text-right text-secondary font-mono-caps text-[10px] font-semibold"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MAJORS.map((row) => (
              <tr key={row} className="border-t border-surface">
                <td className="p-1.5 font-semibold text-primary text-[10px]">{row}</td>
                {MAJORS.map((col) => {
                  if (row === col) {
                    return (
                      <td
                        key={col}
                        className="p-1.5 text-right text-secondary text-[10px] bg-raised/40"
                      >
                        —
                      </td>
                    );
                  }
                  const rate = computeCrossRate(row, col, usdRates);
                  const isDiag = MAJORS.indexOf(col) < MAJORS.indexOf(row);
                  const ch = changePct[row] ?? 0;
                  const isPositive = ch >= 0;
                  return (
                    <td
                      key={col}
                      className={`p-1.5 text-right text-[11px] font-mono ${
                        isDiag ? "text-secondary" : "text-primary"
                      }`}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {rate.toFixed(rate < 0.01 ? 5 : rate < 1 ? 4 : 3)}
                        {!isDiag && Math.abs(ch) > 0.01 && (
                          isPositive ? (
                            <TrendingUp className="w-2.5 h-2.5 text-accent" />
                          ) : (
                            <TrendingDown className="w-2.5 h-2.5 text-[#ef4444]" />
                          )
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
