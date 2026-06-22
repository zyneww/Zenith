"use client";

import { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function NewsRSS() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("/api/news");
        if (res.ok) setNews(await res.json());
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchNews();
    const i = setInterval(fetchNews, 300000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="bg-card border border-surface rounded-sm p-3">
      <div className="flex items-center gap-1.5 mb-3">
        <Newspaper className="w-3.5 h-3.5 text-accent" />
        <span className="text-xs font-medium text-primary">Crypto News</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-5 bg-raised rounded animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {news.slice(0, 8).map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="text-xs text-primary group-hover:text-accent transition-colors leading-snug line-clamp-2">
                {item.title}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-secondary">{item.source}</span>
                <span className="text-[10px] text-secondary">·</span>
                <span className="text-[10px] text-secondary">{timeAgo(item.publishedAt)}</span>
              </div>
            </a>
          ))}
          {news.length === 0 && (
            <p className="text-xs text-secondary">Aucune news disponible</p>
          )}
        </div>
      )}
    </div>
  );
}
