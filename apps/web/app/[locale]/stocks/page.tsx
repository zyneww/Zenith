"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Sparkline from "@/components/ui/Sparkline";

interface StockRow {
  symbol: string;
  name: string;
  domain: string;
  price: number;
  changePercent: number;
}

export default function StocksPage() {
  const [stocks, setStocks] = useState<StockRow[]>([]);
  const [quotes, setQuotes] = useState<Record<string, any>>({});
  const [sparklines, setSparklines] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/market/stocks/quote?list=popular").then(r => r.json()).then((list: StockRow[]) => {
      setStocks(list);
      // Fetch quotes for top 20
      const top = list.slice(0, 20);
      Promise.all(top.map(s => fetch(`/api/market/stocks/quote?symbol=${s.symbol}`).then(r => r.json()).catch(() => null)))
        .then(results => {
          const q: Record<string, any> = {};
          results.forEach((r) => { if (r) q[r.symbol] = r; });
          setQuotes(q);
        });
      // Fetch sparklines for top 10
      Promise.all(top.slice(0, 10).map(s => fetch(`/api/market/stocks/sparkline?symbol=${s.symbol}`).then(r => r.json()).catch(() => null)))
        .then(results => {
          const sp: Record<string, any[]> = {};
          results.forEach((r) => { if (r?.data) { sp[r.symbol] = r.data; } });
          setSparklines(sp);
        });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = search ? stocks.filter(s => s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase())) : stocks;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-[#e3e2e0] mb-1">Stocks</h1>
      <p className="text-zinc-400 text-sm mb-6">Top 50 stocks US — prix temps réel via Twelve Data</p>

      <input
        type="text" placeholder="Rechercher par symbole ou nom..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2.5 bg-[#252525] border border-[#333] rounded-xl text-[#e3e2e0] text-sm focus:outline-none focus:border-[#4da6ff]"
      />

      {loading ? <p className="text-zinc-500">Chargement...</p> : (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#333]">
                <th className="py-3 px-4 text-[11px] text-zinc-400 uppercase tracking-wider text-left">#</th>
                <th className="py-3 px-4 text-[11px] text-zinc-400 uppercase tracking-wider text-left">Symbole</th>
                <th className="py-3 px-4 text-[11px] text-zinc-400 uppercase tracking-wider text-left">Nom</th>
                <th className="py-3 px-4 text-[11px] text-zinc-400 uppercase tracking-wider text-right">Prix</th>
                <th className="py-3 px-4 text-[11px] text-zinc-400 uppercase tracking-wider text-right">Change</th>
                <th className="py-3 px-4 text-[11px] text-zinc-400 uppercase tracking-wider text-right">Sparkline</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((stock, i) => {
                const q = quotes[stock.symbol];
                const sp = sparklines[stock.symbol];
                return (
                  <tr key={stock.symbol} className="border-b border-[#222] hover:bg-[#2a2a2a]">
                    <td className="py-2.5 px-4 text-zinc-500">{i + 1}</td>
                    <td className="py-2.5 px-4">
                      <Link href={`/stocks/${stock.symbol}`} className="text-[#4da6ff] hover:underline font-medium">{stock.symbol}</Link>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-300">{stock.name}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#e3e2e0]">${q?.price?.toFixed(2) || "-"}</td>
                    <td className="py-2.5 px-4 text-right">
                      {q && (
                        <span className={`font-medium ${q.changePercent >= 0 ? "text-[#4dab9a]" : "text-[#ff7369]"}`}>
                          {q.changePercent >= 0 ? "+" : ""}{q.changePercent.toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {sp && <Sparkline data={sp.map((d: any) => ({ value: typeof d === 'number' ? d : d.value || d.close || d.price }))} width={80} height={24} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
