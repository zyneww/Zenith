"use client";

import { useRef, useEffect, useMemo } from "react";
import { History } from "lucide-react";
import { useRecentTrades } from "@/lib/hooks/useRecentTrades";
import { Card, CardTitle } from "@/components/ui/Card";
import { tokens } from "@/lib/theme/bybit";
import type { TradeData } from "@/lib/realtime/SocketContext";

interface RecentTradesPanelProps {
  symbol: string;
  decimals: number;
  tradesOverride?: TradeData[];
  compact?: boolean;
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

export default function RecentTradesPanel({ symbol, decimals, tradesOverride, compact }: RecentTradesPanelProps) {
  const tradesSocket = useRecentTrades(symbol);
  const trades = tradesOverride ?? tradesSocket;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [trades.length]);

  const rows = useMemo(() => trades.slice(0, 50), [trades]);
  const isEmpty = rows.length === 0;

  if (compact) {
    return (
      <div className="p-2">
        <div className="flex justify-between items-center pb-2 mb-2" style={{ borderBottom: `1px solid ${tokens.color.border.default}` }}>
          <div className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" style={{ color: tokens.color.accent.primary }} />
            <span className="font-bold text-xs tracking-wider uppercase" style={{ color: tokens.color.accent.primary }}>Transactions Récentes</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase" style={{ backgroundColor: tokens.color.bg.dark, color: tokens.color.accent.green }}>Live</span>
        </div>
        {isEmpty ? (
          <p className="text-[10px] text-secondary py-4 text-center">En attente...</p>
        ) : (
          <>
            <div className="flex justify-between text-[9px] text-tertiary uppercase px-1 pb-1">
              <span>Prix (USDT)</span>
              <span>Qté</span>
              <span>Heure</span>
            </div>
            <div ref={scrollRef} className="space-y-[1px] max-h-[260px] overflow-y-auto hide-scrollbar">
              {rows.map((t, i) => {
                const isUp = t.side === "BUY";
                return (
                  <div key={`${t.time}-${i}`} className="relative flex justify-between text-[10px] font-mono px-1 py-[1.5px] hover:bg-raised/60 transition-colors">
                    <span className={isUp ? "text-up" : "text-down"}>
                      {t.price.toFixed(decimals)}
                    </span>
                    <span className="text-tertiary tabular-nums">{t.size.toFixed(6)}</span>
                    <span className="text-muted tabular-nums">{fmtTime(t.time)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Card padding="sm">
      <CardTitle>Transactions</CardTitle>
      {isEmpty ? (
        <p className="text-xs text-secondary py-4 text-center">En attente de transactions...</p>
      ) : (
        <>
          <div className="flex justify-between text-[10px] text-secondary uppercase px-1 pb-0.5">
            <span>Prix (USDT)</span>
            <span>Qté</span>
            <span>Heure</span>
          </div>
          <div ref={scrollRef} className="space-y-[1px] max-h-[260px] overflow-y-auto hide-scrollbar">
            {rows.map((t, i) => {
              const isUp = t.side === "BUY";
              return (
                <div key={`${t.time}-${i}`} className="flex justify-between text-[11px] font-mono px-1 py-[1px] hover:bg-raised/40 transition-colors">
                  <span className={isUp ? "text-up" : "text-down"}>{t.price.toFixed(decimals)}</span>
                  <span className="text-secondary tabular-nums">{t.size.toFixed(6)}</span>
                  <span className="text-secondary/60 tabular-nums">{new Date(t.time).toLocaleTimeString()}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}
