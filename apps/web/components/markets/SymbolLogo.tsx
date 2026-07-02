"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { MarketDataPoint } from "@/lib/market-data/types";
import { getAssetBySymbol, type AssetMeta, type AssetType } from "@/lib/assets/registry";

interface SymbolLogoProps {
  symbol: string;
  assetClass?: MarketDataPoint["assetClass"];
  logoUrl?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showName?: boolean;
}

const SIZE_MAP: Record<NonNullable<SymbolLogoProps["size"]>, { box: string; text: string }> = {
  xs: { box: "w-5 h-5 text-[9px]", text: "text-xs" },
  sm: { box: "w-6 h-6 text-[10px]", text: "text-sm" },
  md: { box: "w-8 h-8 text-xs", text: "text-sm" },
  lg: { box: "w-10 h-10 text-sm", text: "text-base" },
};

// Explicit brand-color overrides. Registry fallbackColor is used when no override exists.
const SYMBOL_BRAND_COLORS: Record<string, string> = {
  // crypto
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
  // forex majors
  "EUR/USD": "#0052b4",
  "GBP/USD": "#012169",
  "USD/JPY": "#bc002d",
  "USD/CHF": "#d52b1e",
  "AUD/USD": "#012169",
  "USD/CAD": "#d52b1e",
  "NZD/USD": "#003366",
  "USD/CNY": "#de2910",
  "USD/CNH": "#de2910",
  "EUR/GBP": "#003399",
  "EUR/JPY": "#bc002d",
  "EUR/CHF": "#d52b1e",
  "EUR/CAD": "#0052b4",
  "EUR/AUD": "#012169",
  "GBP/JPY": "#bc002d",
  "GBP/CHF": "#d52b1e",
  "GBP/CAD": "#d52b1e",
  "USD/SEK": "#00529b",
  "USD/NOK": "#ba0c2f",
  "USD/MXN": "#006847",
  "USD/TRY": "#e30a17",
  "USD/ZAR": "#007749",
  "USD/PLN": "#dc143c",
  "USD/HKD": "#de2910",
  "USD/INR": "#ff9933",
  "USD/SGD": "#c00",
  // commodities
  XAU: "#ffd700",
  XAG: "#c0c0c0",
  WTI: "#8b4513",
  BRENT: "#000000",
  CL: "#262626",
  GC: "#ffd700",
  SI: "#c0c0c0",
  NG: "#3185ff",
  HG: "#b87333",
  PL: "#e5e4e2",
  // indices
  SPX: "#003b71",
  NDX: "#000000",
  DJI: "#003b71",
  DAX: "#000000",
  CAC: "#002395",
  FTSE: "#0f2041",
  N225: "#000000",
  HSI: "#de2910",
  VIX: "#7b3fe4",
  RUT: "#003b71",
  SSEC: "#ee1c25",
  // caret-prefixed index aliases
  "^GSPC": "#ff4d4d",
  "^IXIC": "#00e5ff",
  "^DJI": "#959494",
  "^FCHI": "#3185ff",
  "^GDAXI": "#fc4c02",
  "^FTSE": "#ef2cc1",
  "^N225": "#bdbbff",
  "^HSI": "#22c55e",
  // stocks
  AAPL: "#a2aaad",
  MSFT: "#5e5e5e",
  GOOGL: "#4285f4",
  AMZN: "#ff9900",
  TSLA: "#cc0000",
  NVDA: "#76b900",
  META: "#0668e1",
  JPM: "#004488",
  NFLX: "#e50914",
  AMD: "#ed1c24",
  INTC: "#0071c5",
  PYPL: "#003087",
  DIS: "#113ccf",
  // etfs
  SPY: "#003b71",
  QQQ: "#000000",
  VOO: "#b41f3d",
  IVV: "#003b71",
  VTI: "#b41f3d",
  IWM: "#003b71",
  // futures
  ES: "#3185ff",
  NQ: "#00e5ff",
  YM: "#fc4c02",
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

const INDEX_CARET_MAP: Record<string, string> = {
  "^GSPC": "SPX",
  "^IXIC": "NDX",
  "^DJI": "DJI",
  "^FCHI": "CAC",
  "^GDAXI": "DAX",
  "^FTSE": "FTSE",
  "^N225": "N225",
  "^HSI": "HSI",
};

function canonicalType(assetClass?: MarketDataPoint["assetClass"]): AssetType | undefined {
  switch (assetClass) {
    case "crypto":
      return "crypto";
    case "forex":
      return "forex";
    case "commodity":
    case "commodities":
      return "commodity";
    case "index":
    case "indices":
      return "index";
    case "stock":
    case "stocks":
      return "stock";
    case "etf":
      return "etf";
    case "futures":
      // Futures can be commodity or index futures; do not narrow here.
      return undefined;
    default:
      return undefined;
  }
}

function normalizeSymbol(raw: string): string {
  if (!raw) return "";
  if (BASE_SYMBOLS[raw]) return BASE_SYMBOLS[raw];
  if (INDEX_CARET_MAP[raw]) return INDEX_CARET_MAP[raw];
  return raw.replace(/=F$/i, "").replace(/USDT$/i, "").replace(/USD$/i, "");
}

function findAssetMeta(symbol: string, assetClass?: MarketDataPoint["assetClass"]): AssetMeta | undefined {
  const targetType = canonicalType(assetClass);
  const candidates: AssetMeta[] = [];

  const exact = getAssetBySymbol(symbol);
  if (exact) candidates.push(exact);

  const norm = normalizeSymbol(symbol);
  if (norm && norm !== symbol) {
    const byNorm = getAssetBySymbol(norm);
    if (byNorm) candidates.push(byNorm);
  }

  // Prefer a candidate whose type matches the supplied asset class.
  for (const meta of candidates) {
    if (!targetType || meta.type === targetType) return meta;
  }

  // For futures or when no type is supplied, accept any candidate.
  return candidates[0];
}

function getBrandColor(symbol: string, assetMeta?: AssetMeta): string {
  return SYMBOL_BRAND_COLORS[symbol] || assetMeta?.fallbackColor || "#6b7280";
}

function getInitials(symbol: string): string {
  if (symbol.includes("/")) {
    const parts = symbol.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return parts.map((p) => p.replace(/^[\^]/, "").charAt(0)).join("/").toUpperCase();
    }
  }

  const clean = symbol.replace(/[\^=_\-]/g, "");
  if (clean.length <= 3) return clean.toUpperCase();
  if (clean.length === 4) return clean.slice(0, 2).toUpperCase();
  return clean.slice(0, 3).toUpperCase();
}

function buildCryptoIconUrl(symbol: string): string | null {
  const norm = normalizeSymbol(symbol);
  if (!norm) return null;
  if (norm.length === 3 || norm.length === 4 || norm.length === 6) {
    return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/${norm.toLowerCase()}.png`;
  }
  return null;
}

export default function SymbolLogo({
  symbol,
  assetClass,
  logoUrl: logoUrlProp,
  name,
  size = "sm",
  showName = false,
}: SymbolLogoProps) {
  const [imgError, setImgError] = useState(false);
  const assetMeta = findAssetMeta(symbol, assetClass);
  const norm = normalizeSymbol(symbol);
  const sizes = SIZE_MAP[size];
  const brand = getBrandColor(norm, assetMeta);
  const initials = getInitials(symbol);

  const resolvedLogoUrl = logoUrlProp || assetMeta?.logoUrl;
  const tryCryptoIcon =
    canonicalType(assetClass) === "crypto" ||
    (!canonicalType(assetClass) && !assetMeta);
  const cryptoIconUrl = resolvedLogoUrl || !tryCryptoIcon ? null : buildCryptoIconUrl(symbol);
  const src = resolvedLogoUrl || cryptoIconUrl;

  // Reset error when the image source changes (e.g. different logoUrl or symbol).
  useEffect(() => {
    setImgError(false);
  }, [src]);

  const useImage = !imgError && src;

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
            src={src}
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
          {name || norm}
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
  const assetMeta = getAssetBySymbol(item.symbol);
  return (
    <span className="inline-flex items-center gap-2">
      <SymbolLogo symbol={item.symbol} assetClass={item.assetClass} logoUrl={assetMeta?.logoUrl} size={size} name={item.name} />
      <span className="font-medium text-primary text-sm">{normalizeSymbol(item.symbol)}</span>
      {withDirectionIcon &&
        (positive ? (
          <TrendingUp className="w-3 h-3 text-accent" />
        ) : (
          <TrendingDown className="w-3 h-3 text-down" />
        ))}
    </span>
  );
}
