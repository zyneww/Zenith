"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sparkline from "@/components/ui/Sparkline";
import { useFormatPrice } from "@/lib/context/CurrencyContext";

interface Quote {
  symbol: string; name: string; domain: string;
  price: number; change: number; changePercent: number;
  high: number; low: number; volume: number; previousClose: number;
}

export default function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [sparkline, setSparkline] = useState<{ value: number }[]>([]);
  const formatPrice = useFormatPrice();

  useEffect(() => {
    if (!symbol) return;
    fetch(`/api/market/stocks/quote?symbol=${symbol}`).then(r => r.json()).then(setQuote);
    fetch(`/api/market/stocks/sparkline?symbol=${symbol}`).then(r => r.json()).then(d => {
      if (d?.data) setSparkline(d.data.map((p: any) => ({ value: typeof p === "number" ? p : p.value || p.close || p.price })));
    });
  }, [symbol]);

  if (!quote) return <div className="max-w-4xl mx-auto px-4 py-8 text-tertiary">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <img src={`https://logo.clearbit.com/${quote.domain}`} alt="" className="w-10 h-10 rounded-full bg-card"
          onError={e => (e.target as HTMLImageElement).style.display = "none"} />
        <div>
          <h1 className="text-2xl font-semibold text-primary">{quote.name}</h1>
          <span className="text-tertiary text-sm">{quote.symbol} · {quote.domain}</span>
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-semibold text-primary">{formatPrice(quote.price)}</div>
          <span className={`text-sm font-medium ${quote.changePercent >= 0 ? "text-up" : "text-down"}`}>
            {quote.changePercent >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-3 rounded-xl border border-default">
          <div className="text-[11px] text-tertiary uppercase">Ouverture</div>
          <div className="text-sm font-medium text-primary">{formatPrice(quote.previousClose)}</div>
        </div>
        <div className="bg-card p-3 rounded-xl border border-default">
          <div className="text-[11px] text-tertiary uppercase">Haut</div>
          <div className="text-sm font-medium text-up">{formatPrice(quote.high)}</div>
        </div>
        <div className="bg-card p-3 rounded-xl border border-default">
          <div className="text-[11px] text-tertiary uppercase">Bas</div>
          <div className="text-sm font-medium text-down">{formatPrice(quote.low)}</div>
        </div>
        <div className="bg-card p-3 rounded-xl border border-default">
          <div className="text-[11px] text-tertiary uppercase">Volume</div>
          <div className="text-sm font-medium text-primary">{quote.volume.toLocaleString()}</div>
        </div>
      </div>

      {sparkline.length > 0 && (
        <div className="bg-card rounded-xl border border-default p-6">
          <h3 className="text-sm font-medium text-secondary mb-3">Intraday (1min)</h3>
          <Sparkline data={sparkline} width={600} height={100} />
        </div>
      )}
    </div>
  );
}
