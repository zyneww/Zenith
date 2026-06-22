export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
}

const RSS_FEEDS = [
  {
    url: "https://cointelegraph.com/rss",
    source: "CoinTelegraph",
  },
  {
    url: "https://cryptopanic.com/news/rss",
    source: "CryptoPanic",
  },
  {
    url: "https://news.bitcoin.com/feed/",
    source: "Bitcoin.com",
  },
];

const CACHE = new Map<string, { data: NewsItem[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 min

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

async function fetchRSS(url: string, source: string): Promise<NewsItem[]> {
  const res = await fetch(url, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  const items: NewsItem[] = [];

  // Parse both RSS 2.0 and Atom formats
  const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
    const block = match[1];

    const title = (block.match(/<(?:title|media:title)[^>]*>([\s\S]*?)<\/(?:title|media:title)>/i) || [])[1] || "";
    const link =
      (block.match(/<link[^>]*href="([^"]*)"/i) || [])[1] || // Atom
      (block.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || ""; // RSS
    const desc = (block.match(/<(?:description|summary|content:encoded)[^>]*>([\s\S]*?)<\/(?:description|summary|content:encoded)>/i) || [])[1] || "";
    const pubDate = (block.match(/<(?:pubDate|published|updated)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated)>/i) || [])[1] || "";

    if (!title || !link) continue;
    items.push({
      title: stripHtml(title).slice(0, 120),
      url: link.trim(),
      source,
      publishedAt: pubDate.trim(),
      summary: stripHtml(desc).slice(0, 200).replace(/\s+/g, " "),
    });
  }
  return items;
}

export async function getLatestNews(): Promise<NewsItem[]> {
  const now = Date.now();
  const cached = CACHE.get("news");
  if (cached && now - cached.ts < CACHE_TTL) return cached.data;

  const results = await Promise.allSettled(
    RSS_FEEDS.map(({ url, source }) => fetchRSS(url, source))
  );

  const all: NewsItem[] = [];
  const seen = new Set<string>();

  for (const r of results) {
    if (r.status === "fulfilled") {
      for (const item of r.value) {
        const key = item.title.toLowerCase().slice(0, 60);
        if (!seen.has(key)) {
          seen.add(key);
          all.push(item);
        }
      }
    }
  }

  all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const items = all.slice(0, 20);
  CACHE.set("news", { data: items, ts: now });
  return items;
}
