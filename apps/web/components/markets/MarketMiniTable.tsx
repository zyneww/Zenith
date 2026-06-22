"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { MarketDataPoint, AssetClass } from "@/lib/market-data/types";
import SymbolLogo from "./SymbolLogo";

export type CapMode = "absolute" | "relative";

interface Column {
  key: string;
  label: string;
  align?: "left" | "right";
}

interface MarketMiniTableProps {
  title: string;
  icon: React.ReactNode;
  data: MarketDataPoint[];
  columns: Column[];
  linkHref: string;
  linkLabel: string;
  isLoading?: boolean;
  showCapToggle?: boolean;
  assetClass?: AssetClass;
}

export default function MarketMiniTable({
  title,
  icon,
  data,
  columns,
  linkHref,
  linkLabel,
  isLoading = false,
  showCapToggle = false,
  assetClass,
}: MarketMiniTableProps) {
  const [capMode, setCapMode] = useState<CapMode>("absolute");

  const sortedData = useMemo(() => {
    if (!showCapToggle) return data;
    if (capMode === "relative") {
      return [...data].sort(
        (a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)
      );
    }
    return [...data].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
  }, [data, capMode, showCapToggle]);

  const defaultColumns: Column[] = [
    { key: "symbol", label: "Symbole" },
    { key: "price", label: "Prix", align: "right" },
    { key: "changePercent", label: "Variation", align: "right" },
  ];

  const cols = columns.length > 0 ? columns : defaultColumns;
  const displayData = useMemo(() => sortedData.slice(0, 7), [sortedData]);

  const getCellValue = (item: MarketDataPoint, key: string) => {
    switch (key) {
      case "symbol":
        return normalizeSymbol(item.symbol);
      case "name":
        return item.name || "-";
      case "price":
        return item.price.toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      case "change":
        return (item.change ?? 0).toFixed(2);
      case "changePercent":
        return `${item.changePercent >= 0 ? "+" : ""}${item.changePercent.toFixed(2)}%`;
      case "high":
        return item.high?.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) ?? "-";
      case "low":
        return item.low?.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) ?? "-";
      case "volume":
        return item.volume ? formatVolume(item.volume) : "-";
      default:
        return "-";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-surface rounded-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="font-medium text-sm text-primary">{title}</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-raised rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-surface rounded-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-medium text-sm text-primary">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {showCapToggle && (
            <div className="flex items-center gap-1 text-[10px] font-mono-caps">
              <button
                onClick={() => setCapMode("absolute")}
                className={`px-2 py-0.5 rounded-sm transition-colors ${
                  capMode === "absolute"
                    ? "bg-raised text-primary"
                    : "text-secondary hover:text-primary"
                }`}
                title="Classé par capitalisation boursière"
              >
                Cap
              </button>
              <span className="text-secondary">|</span>
              <button
                onClick={() => setCapMode("relative")}
                className={`px-2 py-0.5 rounded-sm transition-colors ${
                  capMode === "relative"
                    ? "bg-raised text-primary"
                    : "text-secondary hover:text-primary"
                }`}
                title="Classé par variation relative"
              >
                Relatif
              </button>
            </div>
          )}
          <Link
            href={linkHref}
            className="text-xs text-accent hover:text-accent/80 transition-colors font-medium flex items-center gap-1"
          >
            {linkLabel}
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-secondary font-mono-caps">
            {cols.map((col) => (
              <th
                key={col.key}
                className={`pb-2 font-normal ${col.align === "right" ? "text-right" : "text-left"}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((item) => (
            <tr
              key={item.symbol}
              className="border-t border-surface hover:bg-raised/50 transition-colors"
            >
              {cols.map((col) => {
                const value = getCellValue(item, col.key);
                const isChange =
                  col.key === "changePercent" || col.key === "change";
                const isPositive =
                  col.key === "changePercent"
                    ? item.changePercent >= 0
                    : item.change >= 0;
                const isSymbol = col.key === "symbol";
                return (
                  <td
                    key={col.key}
                    className={`py-2 ${col.align === "right" ? "text-right" : "text-left"} ${
                      isChange
                        ? isPositive
                          ? "text-accent"
                          : "text-down"
                        : "text-primary"
                    }`}
                  >
                    <span
                      className={`flex items-center gap-1.5 ${
                        col.align === "right" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {isSymbol && (
                        <SymbolLogo
                          symbol={item.symbol}
                          assetClass={item.assetClass}
                          size="xs"
                        />
                      )}
                      {isChange &&
                        (isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        ))}
                      {value}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function normalizeSymbol(raw: string): string {
  if (!raw) return "";
  const map: Record<string, string> = {
    BTCUSDT: "BTC", ETHUSDT: "ETH", SOLUSDT: "SOL", BNBUSDT: "BNB",
    XRPUSDT: "XRP", DOGEUSDT: "DOGE", ADAUSDT: "ADA", AVAXUSDT: "AVAX",
    MATICUSDT: "MATIC", LINKUSDT: "LINK", UNIUSDT: "UNI", LTCUSDT: "LTC",
  };
  if (map[raw]) return map[raw];
  return raw.replace(/=F$/i, "").replace(/USDT$/i, "").replace(/USD$/i, "");
}

function formatVolume(v: number): string {
  if (v >= 1e12) return (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toString();
}
