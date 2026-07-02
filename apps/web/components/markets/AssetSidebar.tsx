"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";
import { getAllSlugs, getAssetsByType, type AssetMeta } from "@/lib/assets/registry";

type Category = "crypto" | "forex" | "commodity" | "index" | "stock" | "etf";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "crypto", label: "Crypto" },
  { key: "forex", label: "Forex" },
  { key: "commodity", label: "Matières" },
  { key: "index", label: "Indices" },
  { key: "stock", label: "Actions" },
  { key: "etf", label: "ETF" },
];

const TAG_OPTIONS = ["Tous", "AI", "DeFi", "Layer 1", "Meme", "Stablecoin", "RWA", "R&D"];

interface Props {
  open: boolean;
  onClose: () => void;
  currentSlug?: string;
}

export default function AssetSidebar({ open, onClose, currentSlug }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const [category, setCategory] = useState<Category>("crypto");
  const [search, setSearch] = useState("");
  const [quoteAsset, setQuoteAsset] = useState<string>("Toutes");
  const [activeTag, setActiveTag] = useState("Tous");
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const assets = useMemo(() => {
    let list = getAssetsByType(category) as AssetMeta[];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.slug.includes(q) || a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
    }
    if (quoteAsset !== "Toutes") {
      list = list.filter((a) => a.quoteAsset === quoteAsset);
    }
    if (activeTag !== "Tous" && category === "crypto") {
      list = list.filter((a) => a.tags?.includes(activeTag));
    }
    return list;
  }, [category, search, quoteAsset, activeTag]);

  const quoteAssets = useMemo(() => {
    const qas = [...new Set(getAssetsByType(category).map((a: AssetMeta) => a.quoteAsset))].sort();
    return qas;
  }, [category]);

  useEffect(() => {
    if (open) {
      setSparklines({});
      const slugs = getAssetsByType(category).slice(0, 50).map((a: AssetMeta) => a.slug).join(",");
      if (slugs) {
        fetch(`/api/market/sparklines?assets=${slugs}`)
          .then((r) => r.json())
          .then((d) => setSparklines(d))
          .catch(() => {});
      }
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, category]);

  const navigate = useCallback(
    (slug: string) => {
      router.push(`/${locale}/markets/${slug}`);
      if (window.innerWidth < 1024) onClose();
    },
    [router, onClose]
  );

  // WS live prices for sidebar assets
  const [wsPrices, setWsPrices] = useState<Record<string, { price: number; change24h: number }>>({});
  useEffect(() => {
    if (!open || category !== "crypto") return;
    const slugs = getAssetsByType("crypto").slice(0, 50).map((a: AssetMeta) => {
      const s = a.symbol.toLowerCase();
      return `${s}usdt@ticker`;
    });
    if (!slugs.length) return;
    const streams = slugs.join("/");
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.data?.s) {
          const symbol = msg.data.s.replace("USDT", "").toLowerCase();
          const asset = (getAssetsByType("crypto") as AssetMeta[]).find((a: AssetMeta) => a.symbol.toLowerCase() === symbol);
          if (asset) {
            setWsPrices((prev) => ({
              ...prev,
              [asset.slug]: { price: parseFloat(msg.data.c), change24h: parseFloat(msg.data.P) },
            }));
          }
        }
      } catch {}
    };
    ws.onerror = () => {};
    return () => ws.close();
  }, [open, category]);

  const priceFor = useCallback(
    (slug: string): { price: number; change: number; spark: number[] } => {
      const ws = wsPrices[slug];
      if (ws) return { price: ws.price, change: ws.change24h, spark: sparklines[slug] || [] };
      return { price: 0, change: 0, spark: sparklines[slug] || [] };
    },
    [wsPrices, sparklines]
  );

  const minVal = (arr: number[]) => arr.length ? Math.min(...arr) : 0;
  const maxVal = (arr: number[]) => arr.length ? Math.max(...arr) : 1;
  const sparkPath = (vals: number[], w = 80, h = 24) => {
    if (vals.length < 2) return "";
    const min = minVal(vals);
    const max = maxVal(vals);
    const range = max - min || 1;
    const dx = w / (vals.length - 1);
    return vals.map((v, i) => `${i === 0 ? "M" : "L"}${i * dx},${h - ((v - min) / range) * h}`).join(" ");
  };
  const sparkColor = (vals: number[]) => (vals.length >= 2 && vals[vals.length - 1] >= vals[0] ? "#4dab9a" : "#ff7369");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-[300px] bg-canvas border-r border-default z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 h-12 border-b border-default shrink-0">
              <span className="text-sm font-semibold">Marchés</span>
              <button onClick={onClose} className="p-1 hover:bg-raised rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-3 pt-3 pb-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tertiary" />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-8 pr-3 py-1.5 bg-canvas border border-default rounded text-xs text-primary placeholder-tertiary outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Category tabs */}
            <div className="px-3 pb-2 shrink-0 overflow-x-auto scrollbar-none">
              <div className="flex gap-1 text-xs">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => { setCategory(c.key); setQuoteAsset("Toutes"); setActiveTag("Tous"); }}
                    className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                      category === c.key ? "bg-accent-solid text-white" : "text-tertiary hover:text-primary hover:bg-raised"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quote asset sub-tabs + tags */}
            {category === "crypto" && (
              <div className="px-3 pb-2 shrink-0">
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {["Toutes", ...quoteAssets].map((qa) => (
                    <button
                      key={qa}
                      onClick={() => setQuoteAsset(qa)}
                      className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                        quoteAsset === qa ? "bg-raised text-accent" : "text-tertiary hover:text-secondary"
                      }`}
                    >
                      {qa}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {TAG_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(tag)}
                      className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                        activeTag === tag ? "bg-raised text-accent" : "text-tertiary hover:text-secondary"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Asset list */}
            <div className="flex-1 overflow-y-auto text-xs">
              {assets.length === 0 ? (
                <div className="px-3 py-8 text-center text-tertiary">Aucun actif trouvé</div>
              ) : (
                assets.map((asset, idx) => {
                  const p = priceFor(asset.slug);
                  return (
                    <motion.div
                      key={asset.slug}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.01, duration: 0.15 }}
                      onClick={() => navigate(asset.slug)}
                      className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors hover:bg-raised ${
                        currentSlug === asset.slug ? "bg-raised border-l-2 border-accent" : ""
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-raised flex items-center justify-center text-[9px] font-bold text-secondary shrink-0">
                        {asset.symbol.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium truncate">{asset.symbol}</span>
                          {asset.tags?.length ? (
                            <span className="text-[8px] px-1 py-0.5 rounded bg-raised text-tertiary leading-none">
                              {asset.tags[0]}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {/* Sparkline */}
                      <div className="w-16 h-6 shrink-0">
                        {p.spark.length > 1 ? (
                          <svg viewBox={`0 0 80 24`} className="w-full h-full">
                            <path d={sparkPath(p.spark)} fill="none" stroke={sparkColor(p.spark)} strokeWidth="1.5" />
                          </svg>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-4 h-[1px] bg-border-default" />
                          </div>
                        )}
                      </div>
                      {/* Price */}
                      <div className="text-right min-w-[70px]">
                        <div className="font-mono text-[11px]">
                          {p.price > 0 ? p.price.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: asset.displayDecimals || 2 }) : "—"}
                        </div>
                        <div
                          className={`text-[10px] leading-tight ${p.change >= 0 ? "text-up" : "text-down"}`}
                        >
                          {p.change > 0 ? "+" : ""}{p.change.toFixed(2)}%
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
