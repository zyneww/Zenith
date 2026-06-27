"use client";

import { useEffect, useState } from "react";

interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  assetPlatform: string;
}

export default function NFTPage() {
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"coingecko" | "opensea">("coingecko");
  const [chain, setChain] = useState("all");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/market/nfts?source=${source}`).then(r => r.json()).then(d => {
      setCollections(d.collections || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [source]);

  const filtered = chain === "all" ? collections : collections.filter(c => c.assetPlatform === chain);

  const platforms = Array.from(new Set(collections.map(c => c.assetPlatform).filter(Boolean)));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-[#e3e2e0] mb-1">NFT</h1>
      <p className="text-zinc-400 text-sm mb-6">Collections NFT — CoinGecko & OpenSea</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setSource("coingecko")}
          className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition ${source === "coingecko" ? "bg-[#4da6ff] text-white" : "bg-[#252525] text-zinc-400 border border-[#333]"}`}>
          CoinGecko
        </button>
        <button onClick={() => setSource("opensea")}
          className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition ${source === "opensea" ? "bg-[#4da6ff] text-white" : "bg-[#252525] text-zinc-400 border border-[#333]"}`}>
          OpenSea
        </button>
      </div>

      {platforms.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setChain("all")}
            className={`px-3 py-1 rounded-full text-[11px] ${chain === "all" ? "bg-zinc-700 text-zinc-200" : "bg-[#252525] text-zinc-500 border border-[#333]"}`}>
            Toutes
          </button>
          {platforms.slice(0, 8).map(p => (
            <button key={p} onClick={() => setChain(p)}
              className={`px-3 py-1 rounded-full text-[11px] ${chain === p ? "bg-zinc-700 text-zinc-200" : "bg-[#252525] text-zinc-500 border border-[#333]"}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {loading ? <p className="text-zinc-500">Chargement...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.slice(0, 50).map((col) => (
            <div key={col.id} className="bg-[#252525] rounded-xl border border-[#333] p-4 hover:border-[#4da6ff]/40 transition">
              <div className="w-full aspect-square rounded-lg bg-[#1a1a1a] flex items-center justify-center mb-3">
                <span className="text-3xl">{col.symbol?.charAt(0).toUpperCase() || "?"}</span>
              </div>
              <h3 className="text-[13px] font-medium text-[#e3e2e0] truncate">{col.name}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-zinc-500 uppercase">{col.assetPlatform || "-"}</span>
                <span className="text-[11px] font-mono text-zinc-400">{col.symbol}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
