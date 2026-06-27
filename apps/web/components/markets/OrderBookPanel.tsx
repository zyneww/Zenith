"use client";

import { useOrderBook } from "@/lib/hooks/useOrderBook";

interface OrderBookPanelProps {
  symbol: string;
}

export default function OrderBookPanel({ symbol }: OrderBookPanelProps) {
  const depth = useOrderBook(symbol);

  const bids = depth?.bids ?? [];
  const asks = depth?.asks ?? [];

  const maxBidSize = Math.max(...bids.map((b) => parseFloat(b[1])), 0.001);
  const maxAskSize = Math.max(...asks.map((a) => parseFloat(a[1])), 0.001);

  return (
    <div className="bg-card border border-surface rounded-lg p-3">
      <h3 className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">Carnet d'ordres</h3>

      {bids.length === 0 && asks.length === 0 ? (
        <p className="text-xs text-secondary">En attente de données...</p>
      ) : (
        <>
          <div className="flex justify-between text-[10px] text-secondary uppercase mb-1 px-1">
            <span>Prix (USDT)</span>
            <span>Quantité</span>
            <span>Total</span>
          </div>

          <div className="space-y-[1px]">
            {asks.slice(0, 12).reverse().map((ask, i) => {
              const qty = parseFloat(ask[1]);
              const price = parseFloat(ask[0]);
              const total = price * qty;
              const barWidth = maxAskSize > 0 ? (qty / maxAskSize) * 100 : 0;
              return (
                <div key={i} className="relative flex justify-between text-[11px] font-mono px-1 py-[1px] hover:bg-raised/40">
                  <div className="absolute right-0 top-0 h-full rounded" style={{ width: `${barWidth}%`, background: "rgba(239,68,68,0.12)" }} />
                  <span className="relative z-[1] text-down w-[70px] text-right">{price.toFixed(2)}</span>
                  <span className="relative z-[1] text-secondary w-[60px] text-right">{qty.toFixed(4)}</span>
                  <span className="relative z-[1] text-secondary/60 w-[60px] text-right">{total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="text-xs font-bold text-center py-1.5 border-y border-surface my-1 text-primary tabular-nums">
            {depth?.bids?.[0] ? parseFloat(depth.bids[0][0]).toFixed(2) : "—"}
          </div>

          <div className="space-y-[1px]">
            {bids.slice(0, 12).map((bid, i) => {
              const qty = parseFloat(bid[1]);
              const price = parseFloat(bid[0]);
              const total = price * qty;
              const barWidth = maxBidSize > 0 ? (qty / maxBidSize) * 100 : 0;
              return (
                <div key={i} className="relative flex justify-between text-[11px] font-mono px-1 py-[1px] hover:bg-raised/40">
                  <div className="absolute left-0 top-0 h-full rounded" style={{ width: `${barWidth}%`, background: "rgba(34,197,94,0.12)" }} />
                  <span className="relative z-[1] text-up w-[70px] text-right">{price.toFixed(2)}</span>
                  <span className="relative z-[1] text-secondary w-[60px] text-right">{qty.toFixed(4)}</span>
                  <span className="relative z-[1] text-secondary/60 w-[60px] text-right">{total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
