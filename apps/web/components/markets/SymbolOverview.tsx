"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { MarketDataPoint } from "@/lib/market-data/types";
import SymbolLogo from "./SymbolLogo";

interface SymbolOverviewProps {
  item: MarketDataPoint;
  children: React.ReactNode;
  delayMs?: number;
  side?: "top" | "bottom";
}

const POPOVER_WIDTH = 340;
const POPOVER_HEIGHT = 260;

function generateSparkline(seed: number, currentPrice: number, changePercent: number): number[] {
  const points = 24;
  const trend = changePercent / 100;
  const base = currentPrice / (1 + trend);
  const variance = Math.abs(currentPrice * 0.005) + 0.01;
  const series: number[] = [];
  let pseudoRandom = seed * 9301 + 49297;
  for (let i = 0; i < points; i++) {
    pseudoRandom = (pseudoRandom * 9301 + 49297) % 233280;
    const r = pseudoRandom / 233280 - 0.5;
    const progress = i / (points - 1);
    const v = base * (1 + trend * progress) + r * variance;
    series.push(v);
  }
  series[points - 1] = currentPrice;
  return series;
}

function buildSparkPath(values: number[], width: number, height: number): string {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildAreaPath(values: number[], width: number, height: number): string {
  const line = buildSparkPath(values, width, height);
  if (!line) return "";
  return `${line} L${width},${height} L0,${height} Z`;
}

export default function SymbolOverview({
  item,
  children,
  delayMs = 200,
  side = "top",
}: SymbolOverviewProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [placing, setPlacing] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const series = useMemo(
    () => generateSparkline(hash(item.symbol), item.price, item.changePercent),
    [item.symbol, item.price, item.changePercent]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showPopover = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let px = r.left + r.width / 2 - POPOVER_WIDTH / 2;
      let py = side === "top" ? r.top - POPOVER_HEIGHT - 8 : r.bottom + 8;
      px = Math.max(8, Math.min(px, vw - POPOVER_WIDTH - 8));
      const useBottom = side === "top" ? py < 8 : py + POPOVER_HEIGHT > vh;
      setPlacing(useBottom ? (side === "top" ? "bottom" : "top") : side);
      setCoords({ x: px, y: useBottom ? (side === "top" ? r.bottom + 8 : r.top - POPOVER_HEIGHT - 8) : py });
      setOpen(true);
    }, delayMs);
  };

  const hidePopover = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 100);
  };

  const cancelHide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const positive = item.changePercent >= 0;
  const W = POPOVER_WIDTH - 32;
  const H = 80;
  const linePath = buildSparkPath(series, W, H);
  const areaPath = buildAreaPath(series, W, H);
  const stroke = positive ? "#c8f6f9" : "#ef4444";
  const fill = positive ? "url(#g-up)" : "url(#g-dn)";

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showPopover}
        onMouseLeave={hidePopover}
        className="inline-block"
      >
        {children}
      </span>
      {open && (
        <div
          ref={popRef}
          onMouseEnter={cancelHide}
          onMouseLeave={hidePopover}
          className="fixed z-[100] bg-raised border border-surface rounded-sm shadow-2xl p-4 pointer-events-auto"
          style={{
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            width: `${POPOVER_WIDTH}px`,
            minHeight: `${POPOVER_HEIGHT}px`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <SymbolLogo symbol={item.symbol} assetClass={item.assetClass} size="md" />
              <div className="min-w-0">
                <div className="font-semibold text-sm text-primary truncate">
                  {normalizeSymbol(item.symbol)}
                </div>
                <div className="text-[11px] text-secondary truncate">{item.name}</div>
              </div>
            </div>
            <Link
              href={`/markets/${encodeURIComponent(item.symbol)}`}
              className="text-accent hover:text-accent/80 shrink-0"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-primary font-mono">
              {item.price.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}
            </span>
            <span
              className={`text-sm font-mono font-semibold ${
                positive ? "text-accent" : "text-[#ef4444]"
              }`}
            >
              {positive ? "+" : ""}{item.change.toFixed(2)} ({positive ? "+" : ""}{item.changePercent.toFixed(2)}%)
            </span>
          </div>

          <div className="bg-canvas/50 rounded-sm p-2 mb-2">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              height={H}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="g-up" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={stroke} stopOpacity="0" />
                </linearGradient>
                <linearGradient id="g-dn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={stroke} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill={fill} />
              <path d={linePath} stroke={stroke} strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div>
              <div className="text-secondary font-mono-caps">Haut</div>
              <div className="text-primary font-mono font-semibold">
                {item.high.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-secondary font-mono-caps">Bas</div>
              <div className="text-primary font-mono font-semibold">
                {item.low.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-secondary font-mono-caps">Ouv.</div>
              <div className="text-primary font-mono font-semibold">
                {item.open.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-secondary font-mono-caps">Vol</div>
              <div className="text-primary font-mono font-semibold">
                {item.volume ? formatVolume(item.volume) : "—"}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function normalizeSymbol(raw: string): string {
  if (!raw) return "";
  const map: Record<string, string> = {
    BTCUSDT: "BTC", ETHUSDT: "ETH", SOLUSDT: "SOL", BNBUSDT: "BNB",
    XRPUSDT: "XRP", DOGEUSDT: "DOGE", ADAUSDT: "ADA", AVAXUSDT: "AVAX",
  };
  if (map[raw]) return map[raw];
  return raw.replace(/=F$/i, "").replace(/USDT$/i, "").replace(/USD$/i, "");
}

function formatVolume(v: number): string {
  if (v >= 1e12) return (v / 1e12).toFixed(1) + "T";
  if (v >= 1e9) return (v / 1e9).toFixed(1) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toString();
}
