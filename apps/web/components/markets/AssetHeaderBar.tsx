"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { Star, ChevronDown, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { tokens } from "@/lib/theme/bybit";
import { AssetMeta, ASSET_REGISTRY } from "@/lib/assets/registry";
import { useFormatPrice, useCurrency, CURRENCY_SYMBOLS } from "@/lib/context/CurrencyContext";

const TYPE_LABELS: Record<string, string> = {
  crypto: "Crypto", forex: "Forex", commodity: "Matière", index: "Indice", stock: "Action", etf: "ETF", futures: "Futures",
};

interface AssetHeaderBarProps {
  asset: AssetMeta;
  price: { current: number; change24h: number; high24h: number; low24h: number; volume24h: number; turnover24h: number; marketCap: number; };
  symbol: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isConnected: boolean;
  locale?: string;
}

const FAV_KEY = "zenith:favorites";

function getFavorites(): string[] {
  try { const raw = localStorage.getItem(FAV_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function setFavorites(list: string[]) { try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch {} }

export default function AssetHeaderBar({
  asset, price, symbol, isFavorite, onToggleFavorite, isConnected, locale = "fr-FR"
}: AssetHeaderBarProps) {
  const router = useRouter();
  const routingLocale = useLocale();
  const isUp = price.change24h >= 0;
  const formatPrice = useFormatPrice();
  const { convertFromUsd, formatNumber, currency } = useCurrency();

  const fmtCompact = (val: number): string => {
    if (!val) return "—";
    const converted = convertFromUsd(val);
    const compact = formatNumber(converted, { notation: "compact", compactDisplay: "short", maximumFractionDigits: 2 });
    return `${CURRENCY_SYMBOLS[currency]}${compact}`;
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavoritesState] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setFavoritesState(getFavorites()); }, [isFavorite]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleFavoriteSymbol = useCallback((sym: string) => {
    const list = getFavorites();
    const next = list.includes(sym) ? list.filter((s) => s !== sym) : [...list, sym];
    setFavorites(next); setFavoritesState(next);
  }, []);

  // Global registry search
  const allAssets = useMemo(() => Object.values(ASSET_REGISTRY), []);
  const filteredAssets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allAssets;
    return allAssets.filter((a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
  }, [searchQuery, allAssets]);

  const favAssets = useMemo(() => filteredAssets.filter((a) => favorites.includes(a.slug)), [filteredAssets, favorites]);
  const otherAssets = useMemo(() => filteredAssets.filter((a) => !favorites.includes(a.slug)), [filteredAssets, favorites]);

  const handleSelectAsset = useCallback((slug: string) => {
    router.push(`/${routingLocale}/markets/${slug}`);
    setDropdownOpen(false);
  }, [router, routingLocale]);

  const StatItem = ({ label, value, colorClass = tokens.color.text.secondary }: { label: string; value: string; colorClass?: string }) => (
    <div className="flex flex-col items-start min-w-[55px] px-2 first:pl-0 last:pr-0">
      <span className="text-[10px] leading-tight mb-0.5" style={{ color: tokens.color.text.muted }}>{label}</span>
      <span className="text-[12px] font-medium tabular-nums leading-tight" style={{ color: colorClass }}>{value}</span>
    </div>
  );

  return (
    <div className="px-2 py-1.5" style={{ backgroundColor: tokens.color.bg.panel }}>
      <div className="flex items-center gap-1">
        {/* Pair selector */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-sm transition-colors"
            style={{ backgroundColor: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.color.bg.raised; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden" style={{ backgroundColor: asset.fallbackColor }}>
              {asset.logoUrl ? (
                <Image src={asset.logoUrl} alt={asset.name} width={24} height={24} className="w-6 h-6 object-cover" unoptimized />
              ) : (
                <span style={{ color: tokens.color.text.primary }}>{asset.symbol.charAt(0)}</span>
              )}
            </div>
            <span className="font-bold text-sm" style={{ color: tokens.color.text.primary }}>{asset.type === "crypto" ? `${asset.symbol}/USDT` : asset.symbol}</span>
            <ChevronDown className="w-3 h-3 transition-transform" style={{ color: tokens.color.text.muted, transform: dropdownOpen ? "rotate(180deg)" : "none" }} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-[360px] rounded-sm shadow-xl z-50 overflow-hidden" style={{ backgroundColor: tokens.color.bg.dark, border: `1px solid ${tokens.color.border.default}` }}>
              <div className="p-2 border-b" style={{ borderColor: tokens.color.border.default }}>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: tokens.color.text.muted }} />
                  <input type="text" placeholder="Rechercher un actif..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-sm pl-7 pr-7 py-1.5 text-xs focus:outline-none"
                    style={{ backgroundColor: tokens.color.bg.dark, border: `1px solid ${tokens.color.border.default}`, color: tokens.color.text.primary }}
                    autoFocus />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: tokens.color.text.muted }}>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {favAssets.length > 0 && <><div className="px-3 py-1 text-[10px] uppercase font-medium" style={{ color: tokens.color.text.muted }}>Favoris</div>{favAssets.map((a) => <AssetRow key={a.slug} asset={a} isFav onToggleFav={() => toggleFavoriteSymbol(a.slug)} onClick={() => handleSelectAsset(a.slug)} />)}</>}
                {otherAssets.length > 0 && <>{favAssets.length > 0 && <div className="px-3 py-1 text-[10px] uppercase font-medium" style={{ color: tokens.color.text.muted }}>Tous les actifs</div>}{otherAssets.map((a) => <AssetRow key={a.slug} asset={a} isFav={favorites.includes(a.slug)} onToggleFav={() => toggleFavoriteSymbol(a.slug)} onClick={() => handleSelectAsset(a.slug)} />)}</>}
              </div>
            </div>
          )}
        </div>

        <span className="text-[10px] px-1.5 py-0.5 rounded-sm font-medium leading-tight shrink-0" style={{ backgroundColor: tokens.color.bg.raised, color: tokens.color.text.muted }}>Spot</span>
        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-sm font-medium leading-tight shrink-0" style={{ backgroundColor: `${tokens.color.accent.primary}18`, color: tokens.color.accent.primary }}>{TYPE_LABELS[asset.type]}</span>



        {/* Last price — moved left next to name */}
        <div className="flex flex-col items-start px-1.5">
          <span className="text-[10px] leading-tight mb-0.5" style={{ color: tokens.color.text.muted }}>Dernier prix</span>
          <span className="text-lg xl:text-xl font-bold tabular-nums leading-tight" style={{ color: isUp ? tokens.color.accent.green : tokens.color.accent.red }}>
            {formatPrice(price.current)}
            <span className="text-[11px] ml-1">{isUp ? "↑" : "↓"}</span>
          </span>
        </div>

        <div className="w-px h-5 mx-1" style={{ backgroundColor: tokens.color.border.default }} />

        <StatItem label="Var. 24h" value={`${isUp ? "+" : ""}${price.change24h.toFixed(2)}%`} colorClass={isUp ? tokens.color.accent.green : tokens.color.accent.red} />
        <StatItem label="Haut 24h" value={formatPrice(price.high24h)} />
        <StatItem label="Bas 24h" value={formatPrice(price.low24h)} />
        <StatItem label="Vol 24h" value={fmtCompact(price.volume24h)} />
        <StatItem label="Turnover 24h" value={fmtCompact(price.turnover24h)} />

        <div className="ml-auto flex items-center gap-1">
          <button onClick={onToggleFavorite} className="p-1.5 transition shrink-0" aria-label={isFavorite ? "Retirer" : "Ajouter"} style={{ color: tokens.color.text.muted }} onMouseEnter={(e) => { e.currentTarget.style.color = tokens.color.accent.primary; }} onMouseLeave={(e) => { e.currentTarget.style.color = tokens.color.text.muted; }}>
            <Star className="w-4 h-4" fill={isFavorite ? tokens.color.accent.primary : "none"} style={{ color: isFavorite ? tokens.color.accent.primary : undefined }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AssetRow({ asset, isFav, onToggleFav, onClick }: { asset: AssetMeta; isFav: boolean; onToggleFav: () => void; onClick: () => void; }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors" style={{ backgroundColor: "transparent" }} onClick={onClick} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.color.bg.raised; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
      <button onClick={(e) => { e.stopPropagation(); onToggleFav(); }} className="transition shrink-0" style={{ color: tokens.color.text.muted }} onMouseEnter={(e) => { e.currentTarget.style.color = tokens.color.accent.primary; }} onMouseLeave={(e) => { e.currentTarget.style.color = tokens.color.text.muted; }}>
        <Star className="w-3 h-3" fill={isFav ? tokens.color.accent.primary : "none"} style={{ color: isFav ? tokens.color.accent.primary : undefined }} />
      </button>
      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 overflow-hidden" style={{ backgroundColor: asset.fallbackColor }}>
        {asset.logoUrl ? (
          <Image src={asset.logoUrl} alt={asset.name} width={20} height={20} className="w-5 h-5 object-cover" unoptimized />
        ) : (
          <span style={{ color: "#fff" }}>{asset.symbol.charAt(0)}</span>
        )}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-medium truncate" style={{ color: tokens.color.text.primary }}>{asset.name}</span>
        <span className="text-[10px]" style={{ color: tokens.color.text.muted }}>{asset.symbol}{asset.type !== "crypto" ? "" : "/USDT"} · {TYPE_LABELS[asset.type]}</span>
      </div>
    </div>
  );
}
