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
      <h1 className="text-2xl font-semibold text-primary mb-1">NFT</h1>
      <p className="text-secondary text-sm mb-6">Collections NFT — CoinGecko & OpenSea</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setSource("coingecko")}
          className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition ${source === "coingecko" ? "bg-accent-solid text-white" : "bg-card text-secondary border border-default"}`}>
          CoinGecko
        </button>
        <button onClick={() => setSource("opensea")}
          className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition ${source === "opensea" ? "bg-accent-solid text-white" : "bg-card text-secondary border border-default"}`}>
          OpenSea
        </button>
      </div>

      {platforms.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setChain("all")}
            className={`px-3 py-1 rounded-full text-[11px] ${chain === "all" ? "bg-raised text-primary" : "bg-card text-tertiary border border-default"}`}>
            Toutes
          </button>
          {platforms.slice(0, 8).map(p => (
            <button key={p} onClick={() => setChain(p)}
              className={`px-3 py-1 rounded-full text-[11px] ${chain === p ? "bg-raised text-primary" : "bg-card text-tertiary border border-default"}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {loading ? <p className="text-tertiary">Chargement...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.slice(0, 50).map((col) => (
            <div key={col.id} className="bg-card rounded-xl border border-default p-4 hover:border-accent/40 transition">
              <div className="w-full aspect-square rounded-lg bg-canvas flex items-center justify-center mb-3">
                <span className="text-3xl">{col.symbol?.charAt(0).toUpperCase() || "?"}</span>
              </div>
              <h3 className="text-[13px] font-medium text-primary truncate">{col.name}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-tertiary uppercase">{col.assetPlatform || "-"}</span>
                <span className="text-[11px] font-mono text-secondary">{col.symbol}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
