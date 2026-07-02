"use client";

import { useEffect, useState } from "react";
import type { Candle } from "@/lib/market-data/types";
import { useFormatPrice } from "@/lib/context/CurrencyContext";

interface IndResult {
  rsi: { value: number | null; period: number; signal: string | null } | null;
  ema: { period: number; value: number | null }[];
  macd: { macd: number; signalLine: number; histogram: number; trend: string | null } | null;
  bollinger: { upper: number; middle: number; lower: number } | null;
  stoch: { k: number; d: number | null } | null;
  vwap: number | null;
}

interface TechnicalIndicatorsProps {
  candles: Candle[];
  symbol?: string;
}

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[#0e121d] rounded px-2.5 py-1.5">
      <p className="text-[9px] text-white/30 uppercase">{label}</p>
      <p className="text-xs font-bold tabular-nums mt-0.5" style={color ? { color } : undefined}>{value}</p>
      {sub && <p className="text-[9px] text-white/30 mt-0.5">{sub}</p>}
    </div>
  );
}

function SignalBadge({ signal }: { signal: string | null }) {
  if (!signal) return null;
  const color = signal === "BULLISH" ? "#4dab9a" : signal === "BEARISH" ? "#ff7369" : signal === "SURACHAT" ? "#ff7369" : signal === "SURVENTE" ? "#4dab9a" : "#9b9a97";
  return <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color, background: `${color}15` }}>{signal}</span>;
}

export default function TechnicalIndicators({ candles, symbol }: TechnicalIndicatorsProps) {
  const [data, setData] = useState<IndResult | null>(null);
  const [loading, setLoading] = useState(true);
  const formatPrice = useFormatPrice();

  useEffect(() => {
    let cancelled = false;
    const fetchIndicators = async () => {
      setLoading(true);
      try {
        const sym = symbol || "BTC";
        const res = await fetch(`/api/market/indicators?symbol=${sym}&interval=1h&limit=200`);
        if (res.ok) {
          const json = await res.json();
          if (json.ok && !cancelled) setData(json.indicators);
        }
      } catch {} finally {
        if (!cancelled) setLoading(false);
      }
    };
    // Fallback to client-side if backend fails
    if (candles.length > 0 && !loading) fetchIndicators();
    fetchIndicators();
    return () => { cancelled = true; };
  }, [symbol, candles.length]);

  if (loading) {
    return <div className="text-xs text-secondary text-center py-6">Calcul des indicateurs...</div>;
  }

  if (!data) {
    return <div className="text-xs text-secondary text-center py-6">Données insuffisantes pour les indicateurs techniques</div>;
  }

  const rsiColor = data.rsi?.value != null ? (data.rsi.value >= 70 ? "#ff7369" : data.rsi.value <= 30 ? "#4dab9a" : undefined) : undefined;

  const emaRows = data.ema.filter(e => e.value != null);
  const latestClose = candles[candles.length - 1]?.c ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard
          label={`RSI (${data.rsi?.period ?? 14})`}
          value={data.rsi?.value?.toFixed(2) ?? "—"}
          sub={data.rsi?.signal ?? undefined}
          color={rsiColor}
        />
        <MetricCard
          label={`MACD`}
          value={data.macd?.macd.toFixed(4) ?? "—"}
          sub={data.macd ? `Signal: ${data.macd.signalLine.toFixed(4)}` : undefined}
        />
        <MetricCard
          label={`MACD Histogramme`}
          value={data.macd?.histogram.toFixed(4) ?? "—"}
          sub={data.macd?.trend ?? undefined}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {data.bollinger && (
          <>
            <MetricCard label="Bollinger Upper" value={formatPrice(data.bollinger.upper)} />
            <MetricCard label="Bollinger Middle" value={formatPrice(data.bollinger.middle)} />
            <MetricCard label="Bollinger Lower" value={formatPrice(data.bollinger.lower)} />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {emaRows.map(e => (
          <div key={e.period} className="bg-[#0e121d] rounded px-1.5 py-1.5 text-center">
            <p className="text-[8px] text-white/30">EMA {e.period}</p>
            <p className="text-[10px] font-bold tabular-nums mt-0.5">{formatPrice(e.value!)}</p>
            <p className={`text-[8px] ${latestClose >= e.value! ? "text-up" : "text-down"}`}>
              {latestClose >= e.value! ? "↗" : "↘"}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.stoch && (
          <MetricCard
            label={`Stochastique K (${data.stoch.k.toFixed(2)})`}
            value={`D: ${data.stoch.d?.toFixed(2) ?? "—"}`}
            sub={data.stoch.k >= 80 ? "SURACHAT" : data.stoch.k <= 20 ? "SURVENTE" : undefined}
            color={data.stoch.k >= 80 ? "#ff7369" : data.stoch.k <= 20 ? "#4dab9a" : undefined}
          />
        )}
        {data.vwap != null && (
          <MetricCard
            label="VWAP"
            value={formatPrice(data.vwap)}
            sub={latestClose >= data.vwap ? "Prix > VWAP" : "Prix < VWAP"}
            color={latestClose >= data.vwap ? "#4dab9a" : "#ff7369"}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {data.macd?.trend && <SignalBadge signal={data.macd.trend} />}
        {data.rsi?.signal && data.rsi.signal !== "NEUTRE" && <SignalBadge signal={data.rsi.signal} />}
      </div>
    </div>
  );
}
