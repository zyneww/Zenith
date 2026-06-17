"use client";

import { useMemo } from "react";
import { Sparkles, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { MarketDataPoint, EconomicEvent } from "@/lib/market-data/types";

interface MarketBriefIAProps {
  data: MarketDataPoint[];
  events?: EconomicEvent[];
  isLoading?: boolean;
}

function pickMovers(items: MarketDataPoint[], n: number, direction: "up" | "down") {
  return [...items]
    .filter((d) => d.symbol && d.price > 0)
    .sort((a, b) => (direction === "up" ? b.changePercent - a.changePercent : a.changePercent - b.changePercent))
    .slice(0, n);
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

function timeOfDay(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export default function MarketBriefIA({
  data,
  events = [],
  isLoading = false,
}: MarketBriefIAProps) {
  const brief = useMemo(() => {
    if (data.length === 0) {
      return {
        title: "Marchés calmes",
        sentiment: "neutral" as const,
        body: "Données insuffisantes pour générer un brief. Réessayez dans quelques instants.",
        highlights: [],
        upcoming: [],
      };
    }

    const totalChange = data.reduce((acc, d) => acc + d.changePercent, 0) / data.length;
    const sentiment: "bullish" | "bearish" | "neutral" =
      totalChange > 0.5 ? "bullish" : totalChange < -0.5 ? "bearish" : "neutral";

    const gainers = pickMovers(data, 3, "up");
    const losers = pickMovers(data, 3, "down");

    const sentimentWord = {
      bullish: "haussière",
      bearish: "baissière",
      neutral: "neutre",
    }[sentiment];

    const session = timeOfDay();
    const sessionWord = { morning: "ce matin", afternoon: "cet après-midi", evening: "ce soir" }[session];

    let body = `La séance s'ouvre sur une tendance ${sentimentWord} ${sessionWord}, avec une variation moyenne de ${totalChange >= 0 ? "+" : ""}${totalChange.toFixed(2)}% sur l'ensemble des actifs suivis.`;

    if (gainers.length > 0) {
      const list = gainers
        .map((g) => `${normalizeSymbol(g.symbol)} (${g.changePercent >= 0 ? "+" : ""}${g.changePercent.toFixed(2)}%)`)
        .join(", ");
      body += ` Les principaux gagnants sont ${list}.`;
    }

    if (losers.length > 0 && losers[0].changePercent < -1) {
      const list = losers
        .map((l) => `${normalizeSymbol(l.symbol)} (${l.changePercent.toFixed(2)}%)`)
        .join(", ");
      body += ` À l'inverse, ${list} reculent.`;
    }

    const highImportance = events.filter((e) => e.importance === "high").slice(0, 3);

    return {
      title: `Brief du marché — ${sentiment === "bullish" ? "🟢 Tendance haussière" : sentiment === "bearish" ? "🔴 Tendance baissière" : "⚪ Marché équilibré"}`,
      sentiment,
      body,
      highlights: gainers.slice(0, 3).map((g) => ({
        symbol: normalizeSymbol(g.symbol),
        name: g.name,
        change: g.changePercent,
        positive: true,
      })),
      upcoming: highImportance.map((e) => ({
        time: e.time,
        currency: e.currency,
        event: e.event,
        impact: e.impact ?? "neutral",
      })),
    };
  }, [data, events]);

  if (isLoading) {
    return (
      <div className="bg-card border border-surface rounded-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="font-medium text-sm text-primary">Market Brief IA</h3>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-raised rounded animate-pulse w-1/3" />
          <div className="h-3 bg-raised rounded animate-pulse w-full" />
          <div className="h-3 bg-raised rounded animate-pulse w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-surface rounded-sm p-5 relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{
          background:
            brief.sentiment === "bullish"
              ? "#22c55e"
              : brief.sentiment === "bearish"
              ? "#ef4444"
              : "#c8f6f9",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="font-medium text-sm text-primary">Market Brief IA</h3>
            <span className="text-[10px] font-mono-caps bg-accent-subtle text-accent px-1.5 py-0.5 rounded-sm">
              AUTO
            </span>
          </div>
        </div>

        <h4 className="text-base font-medium text-primary mb-2">{brief.title}</h4>
        <p className="text-sm text-secondary leading-relaxed mb-4">{brief.body}</p>

        {brief.highlights.length > 0 && (
          <div className="mb-4">
            <div className="text-[10px] font-mono-caps text-secondary mb-2">
              À surveiller
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {brief.highlights.map((h) => (
                <div
                  key={h.symbol}
                  className="bg-raised/40 border border-surface rounded-sm p-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-primary">
                      {h.symbol}
                    </span>
                    <span
                      className={`text-xs font-mono font-semibold ${
                        h.positive ? "text-accent" : "text-[#ef4444]"
                      }`}
                    >
                      {h.change >= 0 ? "+" : ""}{h.change.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-secondary mt-0.5 truncate">
                    {h.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {brief.upcoming.length > 0 && (
          <div>
            <div className="text-[10px] font-mono-caps text-secondary mb-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Événements à fort impact
            </div>
            <ul className="space-y-1">
              {brief.upcoming.map((e, i) => (
                <li
                  key={i}
                  className="text-xs text-secondary flex items-center gap-2"
                >
                  <span className="text-primary font-mono w-12 shrink-0">{e.time}</span>
                  <span className="font-semibold text-primary w-10 shrink-0">{e.currency}</span>
                  <span className="truncate">{e.event}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
