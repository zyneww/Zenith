"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";

interface FundingRow {
  symbol: string;
  fundingRate: number;
  exchange: string;
  nextFundingTime: number;
}

const columns = [
  { key: "symbol", label: "Symbole", sortable: true },
  { key: "fundingRate", label: "Funding Rate", sortable: true, align: "right" as const, render: (r: FundingRow) => {
    const pct = r.fundingRate * 100;
    const color = pct > 0.005 ? "#ff7369" : pct < -0.005 ? "#4dab9a" : "#e3e2e0";
    return <span style={{ color }}>{(pct > 0 ? "+" : "")}{pct.toFixed(4)}%</span>;
  }},
  { key: "exchange", label: "Exchange", sortable: true, render: (r: FundingRow) => {
    const colors: Record<string, string> = { binance: "#f0b90b", okx: "#0c0c1d", bybit: "#4a9eff" };
    return <span style={{ color: colors[r.exchange] || "#888" }} className="font-medium">{r.exchange}</span>;
  }},
  { key: "nextFundingTime", label: "Prochain Funding", align: "right" as const, render: (r: FundingRow) => {
    const d = new Date(r.nextFundingTime);
    const diff = Math.max(0, Math.floor((d.getTime() - Date.now()) / 3600000));
    return <span className="text-zinc-400">{diff}h</span>;
  }},
];

export default function DerivativesPage() {
  const [data, setData] = useState<FundingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchange, setExchange] = useState("all");

  useEffect(() => {
    fetch("/api/market/derivatives/funding").then(r => r.json()).then(json => {
      const rows: FundingRow[] = [];
      for (const ex of ["binance", "okx", "bybit"]) {
        for (const item of json[ex] || []) rows.push(item);
      }
      setData(rows);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = exchange === "all" ? data : data.filter(r => r.exchange === exchange);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-[#e3e2e0] mb-1">Derivatives</h1>
      <p className="text-zinc-400 text-sm mb-6">Funding rates temps réel — Binance, OKX, Bybit</p>

      <div className="flex gap-2 mb-4">
        {["all", "binance", "okx", "bybit"].map(ex => (
          <button key={ex} onClick={() => setExchange(ex)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition ${exchange === ex ? "bg-[#4da6ff] text-white" : "bg-[#252525] text-zinc-400 hover:text-zinc-200 border border-[#333]"}`}
          >{ex === "all" ? "Tous" : ex}</button>
        ))}
      </div>

      {loading ? <p className="text-zinc-500">Chargement...</p> : (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden">
          <DataTable columns={columns} data={filtered} defaultSort="fundingRate" />
        </div>
      )}
    </div>
  );
}
