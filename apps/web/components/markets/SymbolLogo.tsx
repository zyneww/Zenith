"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { MarketDataPoint } from "@/lib/market-data/types";

interface SymbolLogoProps {
  symbol: string;
  assetClass?: MarketDataPoint["assetClass"];
  size?: "xs" | "sm" | "md" | "lg";
  showName?: boolean;
}

const SIZE_MAP: Record<NonNullable<SymbolLogoProps["size"]>, { box: string; text: string }> = {
  xs: { box: "w-5 h-5 text-[9px]", text: "text-xs" },
  sm: { box: "w-6 h-6 text-[10px]", text: "text-sm" },
  md: { box: "w-8 h-8 text-xs", text: "text-sm" },
  lg: { box: "w-10 h-10 text-sm", text: "text-base" },
};

const SYMBOL_BRAND_COLORS: Record<string, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  SOL: "#14f195",
  BNB: "#f0b90b",
  XRP: "#23292f",
  DOGE: "#c2a633",
  ADA: "#0033ad",
  AVAX: "#e84142",
  DOT: "#e6007a",
  MATIC: "#8247e5",
  LINK: "#2a5ada",
  UNI: "#ff007a",
  LTC: "#345d9d",
  "^GSPC": "#ff4d4d",
  "^IXIC": "#00e5ff",
  "^DJI": "#959494",
  "^FCHI": "#3185ff",
  "^GDAXI": "#fc4c02",
  "^FTSE": "#ef2cc1",
  "^N225": "#bdbbff",
  "^HSI": "#22c55e",
  "EUR/USD": "#0052b4",
  "GBP/USD": "#012169",
  "USD/JPY": "#bc002d",
  "USD/CHF": "#d52b1e",
  "AUD/USD": "#012169",
  "USD/CAD": "#d52b1e",
  AAPL: "#a2aaad",
  MSFT: "#5e5e5e",
  GOOGL: "#4285f4",
  AMZN: "#ff9900",
  TSLA: "#cc0000",
  NVDA: "#76b900",
  ES: "#3185ff",
  NQ: "#00e5ff",
  YM: "#fc4c02",
  GC: "#ffd700",
  CL: "#262626",
  SI: "#c0c0c0",
  NG: "#3185ff",
  HG: "#b87333",
};

const BASE_SYMBOLS: Record<string, string> = {
  BTCUSDT: "BTC",
  ETHUSDT: "ETH",
  SOLUSDT: "SOL",
  BNBUSDT: "BNB",
  XRPUSDT: "XRP",
  DOGEUSDT: "DOGE",
  ADAUSDT: "ADA",
  AVAXUSDT: "AVAX",
  MATICUSDT: "MATIC",
  LINKUSDT: "LINK",
  UNIUSDT: "UNI",
  LTCUSDT: "LTC",
  ES_F: "ES",
  NQ_F: "NQ",
  YM_F: "YM",
  GC_F: "GC",
  CL_F: "CL",
  SI_F: "SI",
  NG_F: "NG",
  HG_F: "HG",
};

function normalizeSymbol(raw: string): string {
  if (!raw) return "";
  if (BASE_SYMBOLS[raw]) return BASE_SYMBOLS[raw];
  return raw.replace(/=F$/i, "").replace(/USDT$/i, "").replace(/USD$/i, "");
}

function getBrandColor(symbol: string): string {
  return SYMBOL_BRAND_COLORS[symbol] || "#6b7280";
}

function getInitials(symbol: string): string {
  const clean = symbol.replace(/[\^=_\-]/g, "");
  if (clean.length <= 3) return clean;
  if (clean.length === 4) return clean.slice(0, 2);
  return clean.slice(0, 3);
}

export default function SymbolLogo({
  symbol,
  assetClass,
  size = "sm",
  showName = false,
}: SymbolLogoProps) {
  const [imgError, setImgError] = useState(false);
  const norm = normalizeSymbol(symbol);
  const sizes = SIZE_MAP[size];
  const brand = getBrandColor(norm);
  const initials = getInitials(norm);

  const useImage = !imgError && (norm.length === 3 || norm.length === 4 || norm.length === 6);

  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <span
        className={`${sizes.box} rounded-full flex items-center justify-center font-semibold shrink-0 overflow-hidden`}
        style={{
          background: `${brand}22`,
          color: brand,
          boxShadow: `inset 0 0 0 1px ${brand}55`,
        }}
        aria-hidden="true"
      >
        {useImage ? (
          <img
            src={`https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/${norm.toLowerCase()}.png`}
            alt=""
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-0.5"
            loading="lazy"
          />
        ) : (
          <span>{initials}</span>
        )}
      </span>
      {showName && (
        <span className={`${sizes.text} font-medium text-primary`}>
          {norm}
        </span>
      )}
    </span>
  );
}

interface SymbolRowProps {
  item: MarketDataPoint;
  size?: SymbolLogoProps["size"];
  withDirectionIcon?: boolean;
}

export function SymbolRow({ item, size = "sm", withDirectionIcon = true }: SymbolRowProps) {
  const positive = item.changePercent >= 0;
  return (
    <span className="inline-flex items-center gap-2">
      <SymbolLogo symbol={item.symbol} assetClass={item.assetClass} size={size} />
      <span className="font-medium text-primary text-sm">{normalizeSymbol(item.symbol)}</span>
      {withDirectionIcon && (
        positive ? (
          <TrendingUp className="w-3 h-3 text-accent" />
        ) : (
          <TrendingDown className="w-3 h-3 text-[#ef4444]" />
        )
      )}
    </span>
  );
}
