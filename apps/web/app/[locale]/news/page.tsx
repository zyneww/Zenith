"use client";

import { useEffect, useState } from "react";

interface Article {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: string;
  category: string;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/news/macro").then(r => r.json()).catch(() => ({ articles: [] })),
    ]).then(([macro]) => {
      setArticles(macro.articles || []);
      setLoading(false);
    });
  }, []);

  const filtered = category === "all" ? articles : articles.filter(a => a.category === category);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-[#e3e2e0] mb-1">Actualités</h1>
      <p className="text-zinc-400 text-sm mb-6">Macroéconomie et marchés financiers</p>

      <div className="flex gap-2 mb-6">
        {["all", "macro"].map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition ${category === cat ? "bg-[#4da6ff] text-white" : "bg-[#252525] text-zinc-400 hover:text-zinc-200 border border-[#333]"}`}
          >{cat === "all" ? "Tous" : cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
        ))}
      </div>

      {loading ? <p className="text-zinc-500">Chargement...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
              className="block bg-[#252525] rounded-xl border border-[#333] overflow-hidden hover:border-[#4da6ff]/40 transition">
              {a.imageUrl && <img src={a.imageUrl} alt="" className="w-full h-40 object-cover" onError={e => (e.target as HTMLImageElement).style.display = "none"} />}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-zinc-500 uppercase">{a.source}</span>
                  <span className="text-[10px] text-zinc-600">{new Date(a.publishedAt).toLocaleDateString("fr")}</span>
                </div>
                <h3 className="text-sm font-medium text-[#e3e2e0] leading-snug mb-1 line-clamp-2">{a.title}</h3>
                {a.description && <p className="text-[12px] text-zinc-400 line-clamp-2">{a.description}</p>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
