"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sparkline from "@/components/ui/Sparkline";

interface Quote {
  symbol: string; name: string; domain: string;
  price: number; change: number; changePercent: number;
  high: number; low: number; volume: number; previousClose: number;
}

export default function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [sparkline, setSparkline] = useState<{ value: number }[]>([]);

  useEffect(() => {
    if (!symbol) return;
    fetch(`/api/market/stocks/quote?symbol=${symbol}`).then(r => r.json()).then(setQuote);
    fetch(`/api/market/stocks/sparkline?symbol=${symbol}`).then(r => r.json()).then(d => {
      if (d?.data) setSparkline(d.data.map((p: any) => ({ value: typeof p === "number" ? p : p.value || p.close || p.price })));
    });
  }, [symbol]);

  if (!quote) return <div className="max-w-4xl mx-auto px-4 py-8 text-zinc-500">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <img src={`https://logo.clearbit.com/${quote.domain}`} alt="" className="w-10 h-10 rounded-full bg-[#252525]"
          onError={e => (e.target as HTMLImageElement).style.display = "none"} />
        <div>
          <h1 className="text-2xl font-semibold text-[#e3e2e0]">{quote.name}</h1>
          <span className="text-zinc-500 text-sm">{quote.symbol} · {quote.domain}</span>
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-semibold text-[#e3e2e0]">${quote.price.toFixed(2)}</div>
          <span className={`text-sm font-medium ${quote.changePercent >= 0 ? "text-[#4dab9a]" : "text-[#ff7369]"}`}>
            {quote.changePercent >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#252525] p-3 rounded-xl border border-[#333]">
          <div className="text-[11px] text-zinc-500 uppercase">Ouverture</div>
          <div className="text-sm font-medium text-[#e3e2e0]">${quote.previousClose.toFixed(2)}</div>
        </div>
        <div className="bg-[#252525] p-3 rounded-xl border border-[#333]">
          <div className="text-[11px] text-zinc-500 uppercase">Haut</div>
          <div className="text-sm font-medium text-[#4dab9a]">${quote.high.toFixed(2)}</div>
        </div>
        <div className="bg-[#252525] p-3 rounded-xl border border-[#333]">
          <div className="text-[11px] text-zinc-500 uppercase">Bas</div>
          <div className="text-sm font-medium text-[#ff7369]">${quote.low.toFixed(2)}</div>
        </div>
        <div className="bg-[#252525] p-3 rounded-xl border border-[#333]">
          <div className="text-[11px] text-zinc-500 uppercase">Volume</div>
          <div className="text-sm font-medium text-[#e3e2e0]">{quote.volume.toLocaleString()}</div>
        </div>
      </div>

      {sparkline.length > 0 && (
        <div className="bg-[#252525] rounded-xl border border-[#333] p-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Intraday (1min)</h3>
          <Sparkline data={sparkline} width={600} height={100} />
        </div>
      )}
    </div>
  );
}
