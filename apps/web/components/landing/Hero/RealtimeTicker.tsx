"use client";

import { useRealtimePrice } from "@/lib/hooks/useRealtimePrice";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"] as const;

const DISPLAY: { symbol: string; label: string }[] = [
  { symbol: "BTCUSDT", label: "BTC" },
  { symbol: "ETHUSDT", label: "ETH" },
  { symbol: "SOLUSDT", label: "SOL" },
  { symbol: "BNBUSDT", label: "BNB" },
  { symbol: "XRPUSDT", label: "XRP" },
];

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  const ms = d.getMilliseconds().toString().padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}

function formatPrice(p: number): string {
  if (p >= 1000) {
    return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (p >= 1) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(6)}`;
}

export default function RealtimeTicker() {
  const { prices, isConnected } = useRealtimePrice([...SYMBOLS]);

  return (
    <div className="bg-card border border-surface rounded-xl p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono-caps text-secondary">WebSocket Feed</div>
        <div
          className={`font-mono-caps ${isConnected ? "text-up" : "text-down"}`}
          aria-live="polite"
        >
          {isConnected ? "● LIVE" : "● Reconnect..."}
        </div>
      </div>

      <div className="relative h-[280px] overflow-hidden">
        <div className="flex flex-col animate-[scroll-vertical_22s_linear_infinite] hover:[animation-play-state:paused]">
          {[0, 1].map((setIdx) => (
            <div key={setIdx} aria-hidden={setIdx === 1}>
              {DISPLAY.map(({ symbol, label }) => {
                const p = prices[symbol];
                const side = p?.side;
                return (
                  <div
                    key={`${setIdx}-${symbol}`}
                    className="flex items-center gap-3 py-2.5 border-b border-surface/50 last:border-b-0"
                  >
                    <span className="font-mono text-[11px] text-tertiary w-[88px] tabular-nums">
                      {p ? formatTime(p.timestamp) : "--:--:--.---"}
                    </span>
                    <span className="font-mono text-sm text-primary w-12">{label}</span>
                    {side ? (
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider ${
                          side === "BUY"
                            ? "text-up bg-up-subtle"
                            : "text-down bg-down-subtle"
                        }`}
                      >
                        {side}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 font-mono text-[10px] text-tertiary">—</span>
                    )}
                    <span className="font-mono text-sm text-primary ml-auto tabular-nums">
                      {p ? formatPrice(p.price) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
