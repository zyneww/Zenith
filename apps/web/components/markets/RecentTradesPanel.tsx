"use client";

import { useRecentTrades } from "@/lib/hooks/useRecentTrades";

interface RecentTradesPanelProps {
  symbol: string;
  decimals: number;
}

export default function RecentTradesPanel({ symbol, decimals }: RecentTradesPanelProps) {
  const trades = useRecentTrades(symbol);

  return (
    <div className="bg-card border border-surface rounded-lg p-3">
      <h3 className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">Transactions</h3>

      {trades.length === 0 ? (
        <p className="text-xs text-secondary">En attente de transactions...</p>
      ) : (
        <>
          <div className="flex justify-between text-[10px] text-secondary uppercase mb-1 px-1">
            <span>Prix (USDT)</span>
            <span>Qté</span>
            <span>Heure</span>
          </div>
          <div className="space-y-[2px] max-h-[300px] overflow-y-auto">
            {trades.map((t, i) => (
              <div key={i} className="flex justify-between text-[11px] font-mono px-1 py-[1px] hover:bg-raised/40">
                <span className={t.side === "BUY" ? "text-up" : "text-down"}>
                  {t.price.toFixed(decimals)}
                </span>
                <span className="text-secondary">{t.size.toFixed(4)}</span>
                <span className="text-secondary/60">{new Date(t.time).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
