"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  X,
  ExternalLink,
  Newspaper,
  RefreshCw,
  ChevronDown,
  Check,
  Bitcoin,
  DollarSign,
  TrendingUp,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ─── Types ─── */

interface Article {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  provider: "currents" | "finnhub" | "coingecko" | "cryptopanic" | "rss";
  category: "crypto" | "forex" | "markets" | "macro" | "general";
  sentiment?: number;
  imageUrl?: string;
}

interface NewsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onWidthChange?: (width: number) => void;
  side?: "left" | "right";
}

/* ─── Constants ─── */

const DEFAULT_WIDTH = 380;
const MIN_WIDTH = 280;
const MAX_WIDTH_RATIO = 0.5;
const MAX_WIDTH_ABS = 600;
const WIDTH_KEY = "zenith:news:width";
const SOURCES_KEY = "zenith:news:sources";

const CATEGORIES = [
  { key: "all", label: "Tout" },
  { key: "crypto", label: "Crypto" },
  { key: "forex", label: "Forex" },
  { key: "markets", label: "Marchés" },
  { key: "macro", label: "Macro" },
] as const;

const PROVIDER_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  currents: { bg: "bg-blue-500/15", text: "text-blue-400", label: "Currents" },
  finnhub: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Finnhub" },
  coingecko: { bg: "bg-amber-500/15", text: "text-amber-400", label: "CoinGecko" },
  cryptopanic: { bg: "bg-orange-500/15", text: "text-orange-400", label: "CryptoPanic" },
  rss: { bg: "bg-violet-500/15", text: "text-violet-400", label: "RSS" },
};

// Known source → category mapping for grouping in dropdown
const SOURCE_CATEGORIES: Record<string, string> = {
  CoinDesk: "Crypto",
  Cointelegraph: "Crypto",
  "The Block": "Crypto",
  CryptoSlate: "Crypto",
  "BeInCrypto": "Crypto",
  "Bitcoin Magazine": "Crypto",
  Coinacademy: "Crypto",
  Protos: "Crypto",
  Bankless: "Crypto",
  CoinGecko: "Crypto",
  FXStreet: "Forex",
  Bloomberg: "Marchés",
  Finnhub: "Finance",
};

const CATEGORY_ICONS: Record<string, typeof Bitcoin> = {
  crypto: Bitcoin,
  forex: DollarSign,
  markets: TrendingUp,
  macro: Building2,
  general: Newspaper,
};

const CACHE_KEY = "zenith:news:cache";
const CACHE_TTL = 5 * 60_000;

/* ─── Helpers ─── */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}j`;
}

function isLive(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 5 * 60_000;
}

function getCached(category: string): Article[] | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}:${category}`);
    if (!raw) return null;
    const { articles, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return articles;
  } catch {
    return null;
  }
}

function setCache(category: string, articles: Article[]) {
  try {
    localStorage.setItem(`${CACHE_KEY}:${category}`, JSON.stringify({ articles, ts: Date.now() }));
  } catch { /* storage full */ }
}

function sentimentIcon(s?: number) {
  if (s === undefined || s === 0) return null;
  if (s > 0) return <span className="text-emerald-400 text-[10px]" title={`Sentiment: ${s.toFixed(1)}`}>● Bull</span>;
  return <span className="text-red-400 text-[10px]" title={`Sentiment: ${s.toFixed(1)}`}>● Bear</span>;
}

function providerBadge(provider: string) {
  const c = PROVIDER_COLORS[provider];
  if (!c) return null;
  return (
    <span className={`px-1.5 py-0.5 rounded ${c.bg} ${c.text} text-[9px] font-medium uppercase tracking-wider`}>
      {c.label}
    </span>
  );
}

function getMaxWidth() {
  if (typeof window === "undefined") return MAX_WIDTH_ABS;
  return Math.min(MAX_WIDTH_ABS, Math.floor(window.innerWidth * MAX_WIDTH_RATIO));
}

/* ─── Image with fallback ─── */

function ArticleImage({ article }: { article: Article }) {
  const [errored, setErrored] = useState(false);
  const Icon = CATEGORY_ICONS[article.category] || Newspaper;

  if (article.imageUrl && !errored) {
    return (
      <img
        src={article.imageUrl}
        alt={article.title}
        loading="lazy"
        onError={() => setErrored(true)}
        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-raised"
      />
    );
  }

  return (
    <div className="w-16 h-16 rounded-lg bg-raised flex items-center justify-center flex-shrink-0">
      <Icon className="w-6 h-6 text-muted" />
    </div>
  );
}

/* ─── Sources dropdown ─── */

function SourcesDropdown({
  sources,
  selected,
  onChange,
}: {
  sources: string[];
  selected: Set<string>;
  onChange: (s: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const allSelected = sources.length === 0 || selected.size === 0;
  const count = allSelected ? 0 : selected.size;

  // Group sources by category
  const grouped = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const src of sources) {
      const cat = SOURCE_CATEGORIES[src] || "Autre";
      (groups[cat] ??= []).push(src);
    }
    return groups;
  }, [sources]);

  const groupOrder = ["Crypto", "Forex", "Marchés", "Finance"];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors bg-raised text-secondary hover:text-primary hover:bg-raised/80"
        type="button"
      >
        Sources
        {count > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-accent text-on-accent text-[9px] font-bold leading-none">
            {count}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-64 bg-card border border-surface rounded-lg shadow-lg z-[60] py-1"
          >
            {/* "All" option */}
            <button
              onClick={() => onChange(new Set())}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-raised transition-colors text-left"
              type="button"
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center ${allSelected ? "bg-accent border-accent" : "border-muted"}`}>
                {allSelected && <Check className="w-3 h-3 text-on-accent" />}
              </span>
              <span className={allSelected ? "text-primary font-medium" : "text-secondary"}>
                Toutes les sources
              </span>
            </button>

            {/* Grouped sources */}
            {groupOrder.map((group) => {
              const groupSources = grouped[group];
              if (!groupSources?.length) return null;
              return (
                <div key={group}>
                  <div className="border-t border-surface/50 my-0.5" />
                  <div className="px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-tertiary">
                    {group}
                  </div>
                  {groupSources.map((src) => {
                    const active = selected.has(src);
                    return (
                      <button
                        key={src}
                        onClick={() => {
                          const next = new Set(selected);
                          if (active) next.delete(src);
                          else next.add(src);
                          onChange(next);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-raised transition-colors text-left"
                        type="button"
                      >
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${active ? "bg-accent border-accent" : "border-muted"}`}>
                          {active && <Check className="w-3 h-3 text-on-accent" />}
                        </span>
                        <span className={active ? "text-primary font-medium" : "text-secondary"}>
                          {src}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Component ─── */

export default function NewsSidebar({ isOpen, onClose, onWidthChange, side = "left" }: NewsSidebarProps) {
  const isRight = side === "right";
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const isDragging = useRef(false);

  // Restore persisted width
  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(WIDTH_KEY) || "");
      if (saved >= MIN_WIDTH && saved <= getMaxWidth()) {
        setPanelWidth(saved);
        onWidthChange?.(saved);
      }
    } catch { /* ignore */ }
  }, [onWidthChange]);

  // Restore persisted sources
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SOURCES_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length > 0) setSelectedSources(new Set(arr));
      }
    } catch { /* ignore */ }
  }, []);

  // Notify parent of width on mount
  useEffect(() => {
    onWidthChange?.(panelWidth);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Resize handlers ───

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizeRef.current) return;
    const { startX, startWidth } = resizeRef.current;
    // ponytail: left panel grows when mouse moves right; right panel grows when mouse moves left
    const delta = isRight ? startX - e.clientX : e.clientX - startX;
    const newWidth = Math.max(MIN_WIDTH, Math.min(getMaxWidth(), startWidth + delta));
    setPanelWidth(newWidth);
    onWidthChange?.(newWidth);
  }, [onWidthChange, isRight]);

  const handleResizeUp = useCallback(() => {
    resizeRef.current = null;
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    try {
      localStorage.setItem(WIDTH_KEY, String(panelWidth));
    } catch { /* ignore */ }
  }, [panelWidth]);

  useEffect(() => {
    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeUp);
    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeUp);
    };
  }, [handleResizeMove, handleResizeUp]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizeRef.current = { startX: e.clientX, startWidth: panelWidth };
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [panelWidth]);

  // ─── Data fetching ───

  const fetchNews = useCallback(async (category: string, append: boolean) => {
    const cached = getCached(category);
    if (cached && !append) {
      setArticles(cached);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ category, limit: "20" });
      const res = await fetch(`/api/market/news?${params}`);
      const data = await res.json();

      const newArticles: Article[] = (data.articles || []).map((a: Article) => ({
        ...a,
        category: a.category || category,
      }));

      if (!append) setCache(category, newArticles);
      setArticles((prev) => (append ? [...prev, ...newArticles] : newArticles));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    try { localStorage.removeItem(`${CACHE_KEY}:${activeCategory}`); } catch { /* ignore */ }
    fetchNews(activeCategory, false);
  }, [activeCategory, fetchNews]);

  useEffect(() => {
    if (isOpen) fetchNews(activeCategory, false);
  }, [isOpen, activeCategory, fetchNews]);

  // Auto-refresh every 5 min
  useEffect(() => {
    if (!isOpen) {
      if (refreshRef.current) clearInterval(refreshRef.current);
      return;
    }
    refreshRef.current = setInterval(() => fetchNews(activeCategory, false), 120_000);
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [isOpen, activeCategory, fetchNews]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loading) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      fetchNews(activeCategory, true);
    }
  }, [loading, activeCategory, fetchNews]);

  // ─── Derived data ───

  const availableSources = useMemo(() => {
    const s = new Set(articles.map((a) => a.source));
    return [...s].sort();
  }, [articles]);

  const FRENCH_SOURCES = new Set(["FXStreet", "Kitco"]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (selectedSources.size > 0 && !selectedSources.has(a.source)) return false;
      return true;
    });
  }, [articles, selectedSources]);

  const persistSources = useCallback((next: Set<string>) => {
    setSelectedSources(next);
    try {
      localStorage.setItem(SOURCES_KEY, JSON.stringify([...next]));
    } catch { /* ignore */ }
  }, []);

  // ─── Render ───

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-[60]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: isRight ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRight ? "100%" : "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed top-0 h-full bg-canvas z-[70] flex flex-col ${
              isRight ? "right-0 border-l border-surface" : "left-0 border-r border-surface"
            }`}
            style={{ width: panelWidth, minWidth: MIN_WIDTH }}
            role="complementary"
            aria-label="Actualités en temps réel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface flex-shrink-0 flex-nowrap min-w-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Newspaper className="w-4 h-4 text-accent flex-shrink-0" />
                <h2 className="text-sm font-semibold text-primary whitespace-nowrap">Actualités</h2>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-up animate-pulse flex-shrink-0" />
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={handleRefresh}
                  className="p-1.5 text-secondary hover:text-primary transition-colors rounded-sm hover:bg-raised"
                  aria-label="Rafraîchir"
                  type="button"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-secondary hover:text-primary transition-colors rounded-sm hover:bg-raised"
                  aria-label="Fermer"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category pills + Sources filter */}
            <div className="flex items-center gap-1.5 px-5 py-3 flex-shrink-0 border-b border-surface/50 min-w-0">
              <div className="flex items-center gap-1.5 overflow-x-auto overflow-y-visible">
                {CATEGORIES.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors flex-shrink-0 ${
                      activeCategory === key
                        ? "bg-accent text-on-accent"
                        : "bg-raised text-secondary hover:text-primary hover:bg-raised/80"
                    }`}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="w-px h-5 bg-surface mx-1 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-shrink-0">
                <SourcesDropdown
                  sources={availableSources}
                  selected={selectedSources}
                  onChange={persistSources}
                />
              </div>
            </div>

            {/* Articles list */}
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto overscroll-contain px-5 py-3"
            >
              {filteredArticles.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center h-40 text-tertiary text-sm">
                  <Newspaper className="w-8 h-8 mb-2 opacity-40" />
                  Aucune actualité
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredArticles.map((article, i) => (
                    <a
                      key={`${article.url}-${i}`}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 px-3 py-3 rounded-sm hover:bg-raised transition-colors group"
                    >
                      {/* Thumbnail */}
                      <ArticleImage article={article} />

                      {/* Text block */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          {providerBadge(article.provider)}
                          {isLive(article.publishedAt) && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[9px] font-medium">
                              LIVE
                            </span>
                          )}
                          {sentimentIcon(article.sentiment)}
                        </div>
                        <p className="text-sm text-primary group-hover:text-accent transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-tertiary">
                          {article.category && (
                            <>
                              <span className="px-1.5 py-0.5 rounded bg-raised/80 text-secondary font-medium uppercase tracking-wider">
                                {CATEGORIES.find((c) => c.key === article.category)?.label || article.category}
                              </span>
                              <span>·</span>
                            </>
                          )}
                          <span>{timeAgo(article.publishedAt)}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            {article.source}
                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}

                  {loading && (
                    <div className="flex justify-center py-4">
                      <RefreshCw className="w-4 h-4 text-tertiary animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Resize handle — desktop only */}
            <div
              onMouseDown={startResize}
              className={`hidden lg:block absolute top-0 w-2 h-full cursor-col-resize z-10 group/handle ${
                isRight ? "left-0" : "right-0"
              }`}
              aria-hidden="true"
            >
              <div className={`absolute top-0 w-px h-full bg-transparent group-hover/handle:bg-accent/30 transition-colors ${
                isRight ? "left-0" : "right-0"
              }`} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
