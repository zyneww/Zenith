"use client";

import { useState, useMemo } from "react";
import { ListOrdered } from "lucide-react";
import { useOrderBook } from "@/lib/hooks/useOrderBook";
import { tokens } from "@/lib/theme/bybit";
import type { DepthData } from "@/lib/realtime/SocketContext";

interface OrderBookPanelProps {
  symbol: string;
  decimals?: number;
  depthOverride?: DepthData | null;
  compact?: boolean;
}

function roundToPrecision(value: number, precision: number): number {
  return Math.round(value / precision) * precision;
}

export default function OrderBookPanel({ symbol, decimals = 2, depthOverride, compact }: OrderBookPanelProps) {
  const depthSocket = useOrderBook(symbol);
  const depth = depthOverride ?? depthSocket;
  const bids = depth?.bids ?? [];
  const asks = depth?.asks ?? [];

  const precisions = useMemo(() => {
    const d = decimals;
    const vals = [10 ** (-d), 10 ** (-d + 1), 10 ** (-d + 2), 10 ** (-d + 3), 1].filter((p) => p >= 0.00000001);
    return vals.length > 0 ? vals : [0.01];
  }, [decimals]);

  const [precision, setPrecision] = useState(precisions[0] ?? 0.01);

  const aggregatedAsks = useMemo(() => {
    const map = new Map<number, number>();
    asks.forEach((a) => {
      const p = roundToPrecision(parseFloat(a[0]), precision);
      const q = parseFloat(a[1]);
      map.set(p, (map.get(p) ?? 0) + q);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]).slice(-15).reverse();
  }, [asks, precision]);

  const aggregatedBids = useMemo(() => {
    const map = new Map<number, number>();
    bids.forEach((b) => {
      const p = roundToPrecision(parseFloat(b[0]), precision);
      const q = parseFloat(b[1]);
      map.set(p, (map.get(p) ?? 0) + q);
    });
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]).slice(0, 15);
  }, [bids, precision]);

  const maxAskSize = Math.max(...aggregatedAsks.map((a) => a[1]), 0.001);
  const maxBidSize = Math.max(...aggregatedBids.map((b) => b[1]), 0.001);

  const bidTotal = useMemo(() => aggregatedBids.reduce((s, b) => s + b[0] * b[1], 0), [aggregatedBids]);
  const askTotal = useMemo(() => aggregatedAsks.reduce((s, a) => s + a[0] * a[1], 0), [aggregatedAsks]);
  const sumTotal = bidTotal + askTotal;
  const buyRatio = sumTotal > 0 ? (bidTotal / sumTotal) * 100 : 50;
  const sellRatio = 100 - buyRatio;

  const isEmpty = aggregatedBids.length === 0 && aggregatedAsks.length === 0;

  const rowClass = compact
    ? "relative flex justify-between text-[10px] font-mono px-1 py-[1.5px] transition-colors"
    : "relative flex justify-between text-[11px] font-mono px-1 py-[1px] transition-colors";

  const bidColor = tokens.color.accent.green;
  const askColor = tokens.color.accent.red;
  const bidBarColor = "rgba(77,171,154,0.08)";
  const askBarColor = "rgba(255,115,105,0.08)";

  const panelHeader = compact ? (
    <div className="flex justify-between items-center pb-2 mb-2" style={{ borderBottom: `1px solid ${tokens.color.border.default}` }}>
      <div className="flex items-center gap-1.5">
        <ListOrdered className="w-3.5 h-3.5" style={{ color: tokens.color.accent.primary }} />
        <span className="font-bold text-xs tracking-wider uppercase" style={{ color: tokens.color.accent.primary }}>Carnet d&apos;Ordres</span>
      </div>
      <span className="text-[10px]" style={{ color: tokens.color.text.muted }}>Précision Auto</span>
    </div>
  ) : null;

  const header = (
    <div className="flex justify-between text-[9px] uppercase px-1 pb-1" style={{ color: tokens.color.text.muted }}>
      <span>Prix (USDT)</span>
      <span>Qté</span>
      <span>Total</span>
    </div>
  );

  const precisionSelector = (
    <select
      value={precision}
      onChange={(e) => setPrecision(parseFloat(e.target.value))}
      className="rounded-sm text-[10px] px-1.5 py-0.5 focus:outline-none cursor-pointer"
      style={{ backgroundColor: tokens.color.bg.dark, border: `1px solid ${tokens.color.border.default}`, color: tokens.color.text.muted }}
    >
      {precisions.map((p, i) => (
        <option key={`${p}-${i}`} value={p}>{p >= 1 ? p.toFixed(0) : p.toString().replace(/^0\./, ".")}</option>
      ))}
    </select>
  );

  const content = (
    <>
      <div className="flex items-center justify-between mb-1">
        {header}
        {precisionSelector}
      </div>
      <div className="space-y-[1px] max-h-[160px] overflow-y-auto hide-scrollbar">
        {aggregatedAsks.map((ask, i) => {
          const [p, qty] = ask;
          const barW = maxAskSize > 0 ? (qty / maxAskSize) * 100 : 0;
          return (
            <div key={i} className={rowClass} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.color.bg.raised; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
              <div className="absolute right-0 top-0 h-full" style={{ width: `${barW}%`, background: askBarColor }} />
              <span className="relative z-[1] w-[80px] text-right" style={{ color: askColor }}>{p.toFixed(decimals)}</span>
              <span className="relative z-[1] w-[60px] text-right tabular-nums" style={{ color: tokens.color.text.muted }}>{qty.toFixed(4)}</span>
              <span className="relative z-[1] w-[60px] text-right tabular-nums" style={{ color: tokens.color.text.faint }}>{(p * qty).toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      <div className="text-xs font-bold text-center py-1.5 my-1 tabular-nums" style={{ borderTop: `1px solid ${tokens.color.border.default}`, borderBottom: `1px solid ${tokens.color.border.default}`, color: tokens.color.text.primary }}>
        {aggregatedBids[0] ? aggregatedBids[0][0].toFixed(decimals) : "—"}
      </div>

      <div className="space-y-[1px] max-h-[160px] overflow-y-auto hide-scrollbar">
        {aggregatedBids.map((bid, i) => {
          const [p, qty] = bid;
          const barW = maxBidSize > 0 ? (qty / maxBidSize) * 100 : 0;
          return (
            <div key={i} className={rowClass} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.color.bg.raised; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
              <div className="absolute right-0 top-0 h-full" style={{ width: `${barW}%`, background: bidBarColor }} />
              <span className="relative z-[1] w-[80px] text-right" style={{ color: bidColor }}>{p.toFixed(decimals)}</span>
              <span className="relative z-[1] w-[60px] text-right tabular-nums" style={{ color: tokens.color.text.muted }}>{qty.toFixed(4)}</span>
              <span className="relative z-[1] w-[60px] text-right tabular-nums" style={{ color: tokens.color.text.faint }}>{(p * qty).toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 h-4 rounded-sm overflow-hidden flex text-[8px] font-bold relative" style={{ backgroundColor: tokens.color.bg.raised }}>
        <div className="h-full flex items-center justify-center" style={{ width: `${buyRatio}%`, background: "rgba(77,171,154,0.15)", color: tokens.color.accent.green }}>
          {buyRatio >= 15 && `${buyRatio.toFixed(0)}%`}
        </div>
        <div className="h-full flex items-center justify-center ml-auto" style={{ width: `${sellRatio}%`, background: "rgba(255,115,105,0.15)", color: tokens.color.accent.red }}>
          {sellRatio >= 15 && `${sellRatio.toFixed(0)}%`}
        </div>
      </div>
    </>
  );

  if (isEmpty) {
    return (
      <div className="p-2">
        <div className="flex items-center justify-between mb-1">{header}{precisionSelector}</div>
        <p className="text-[10px] py-4 text-center" style={{ color: tokens.color.text.muted }}>En attente...</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="p-2">
        {panelHeader}
        {content}
      </div>
    );
  }

  return (
    <div className="p-3 rounded-sm" style={{ backgroundColor: tokens.color.bg.card, border: `1px solid ${tokens.color.border.default}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: tokens.color.text.primary }}>Carnet d&apos;ordres</span>
        {precisionSelector}
      </div>
      {content}
    </div>
  );
}
