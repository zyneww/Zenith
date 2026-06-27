"use client";

import Image from "next/image";
import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { AssetMeta } from "@/lib/assets/registry";

const TYPE_LABELS: Record<string, string> = {
  crypto: "Crypto",
  forex: "Forex",
  commodity: "Matière première",
  index: "Indice",
  stock: "Action",
  etf: "ETF",
};

interface AssetHeaderProps {
  asset: AssetMeta;
  price: {
    current: number;
    change1h: number;
    change24h: number;
    change7d: number;
    high24h: number;
    low24h: number;
    marketCap: number;
    volume24h: number;
  };
  isServiceDown: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isConnected: boolean;
  locale?: string;
}

function fmtPrice(val: number, decimals: number, locale = "fr-FR"): string {
  if (!val && val !== 0) return "—";
  return val.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtCompact(val: number | undefined): string {
  if (!val) return "—";
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  return `$${val.toLocaleString("fr-FR")}`;
}

function ChangePill({ value, label }: { value: number; label: string }) {
  if (!value && value !== 0) return null;
  const isUp = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded ${isUp ? "text-up bg-up/10" : "text-down bg-down/10"}`}>
      {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {isUp ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
}

export default function AssetHeader({ asset, price, isServiceDown, isFavorite, onToggleFavorite, isConnected, locale = "fr-FR" }: AssetHeaderProps) {
  const change24h = price?.change24h ?? 0;
  const isUp = change24h >= 0;

  return (
    <div className="bg-card border border-surface rounded-lg p-4 md:p-5">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden"
          style={{ backgroundColor: asset.fallbackColor }}
        >
          {asset.logoUrl ? (
            <Image src={asset.logoUrl} alt={asset.name} width={40} height={40} className="w-10 h-10 object-cover" unoptimized />
          ) : (
            <span className="text-white">{asset.symbol.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-primary truncate">{asset.name}</h1>
            <span className="text-xs uppercase px-1.5 py-0.5 rounded bg-raised text-secondary font-medium">{asset.symbol}</span>
            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-accent-subtle text-accent font-medium">{TYPE_LABELS[asset.type]}</span>
            {isConnected ? (
              <span className="text-[10px] text-up flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-up animate-pulse" />LIVE</span>
            ) : (
              <span className="text-[10px] text-amber-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />OFFLINE</span>
            )}
          </div>
        </div>
        <button onClick={onToggleFavorite} className="text-secondary hover:text-warning transition shrink-0" aria-label={isFavorite ? "Retirer" : "Ajouter"}>
          <Star className={`w-4 h-4 ${isFavorite ? "fill-warning text-warning" : ""}`} />
        </button>
      </div>

      {isServiceDown ? (
        <div className="mt-4 text-sm text-secondary">Service de données indisponible</div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl md:text-4xl font-bold text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
              ${fmtPrice(price.current, asset.displayDecimals, locale)}
            </span>
            <span className={`text-base font-medium ${isUp ? "text-up" : "text-down"}`}>
              {isUp ? "+" : ""}{change24h.toFixed(2)}%
            </span>
            <div className="flex gap-1.5">
              <ChangePill value={price.change1h} label="1h" />
              <ChangePill value={price.change7d} label="7j" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div><span className="text-secondary">High 24h</span><p className="text-primary font-medium tabular-nums">${fmtPrice(price.high24h, asset.displayDecimals, locale)}</p></div>
            <div><span className="text-secondary">Low 24h</span><p className="text-primary font-medium tabular-nums">${fmtPrice(price.low24h, asset.displayDecimals, locale)}</p></div>
            <div><span className="text-secondary">Volume 24h</span><p className="text-primary font-medium">{fmtCompact(price.volume24h)}</p></div>
            <div><span className="text-secondary">Market Cap</span><p className="text-primary font-medium">{fmtCompact(price.marketCap)}</p></div>
          </div>
        </>
      )}
    </div>
  );
}
