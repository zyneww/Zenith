"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface Article {
  title: string; url: string; source: string; publishedAt: string; domain: string; kind: string;
}

interface NewsFeedProps { symbol?: string; type?: string; name?: string; limit?: number; }

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 0) return "now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NewsFeed({ symbol = "BTC", type = "crypto", name, limit = 5 }: NewsFeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const t = useTranslations("common");

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ symbol, type });
      if (name) params.set("name", name);
      params.set("limit", String(limit));
      const res = await fetch(`/api/market/news?${params}`);
      if (res.ok) { const json = await res.json(); setArticles(json.articles ?? []); }
      else setError(true);
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNews(); }, [symbol, type, name, limit]);

  if (loading) return <div className="text-[11px] text-primary text-center py-6">{t("loading")}...</div>;
  if (error) return (
    <div className="text-center py-4">
      <p className="text-[11px] text-secondary mb-2">{t("error")}</p>
      <button onClick={fetchNews} className="text-[10px] text-accent hover:underline">{t("retry")}</button>
    </div>
  );
  if (articles.length === 0) return <div className="text-[11px] text-secondary text-center py-6">{t("loading")}...</div>;

  return (
    <div className="divide-y divide-default/50">
      {articles.map((a, i) => (
        <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="block px-3 py-2 hover:bg-raised/30 transition-colors">
          <div className="text-[11px] text-primary leading-snug line-clamp-2">{a.title}</div>
          <div className="flex items-center gap-2 mt-0.5 text-[9px] text-tertiary">
            <span>{a.source || a.domain}</span>
            <span>•</span>
            <span>{timeAgo(a.publishedAt)}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
