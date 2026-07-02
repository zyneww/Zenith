import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";



/* ─── Types ─── */

type Provider = "finnhub" | "coingecko" | "rss";
type Category = "crypto" | "forex" | "markets" | "macro" | "general";

interface NormalizedArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  provider: Provider;
  category: Category;
  sentiment?: number;
  imageUrl?: string;
}

/* ─── Server cache (2 min) ─── */

const serverCache = new Map<string, { articles: NormalizedArticle[]; ts: number }>();
const CACHE_TTL = 120_000;

function cacheKey(category: string, limit: number) {
  return `${category}:${limit}`;
}

/* ─── Helpers ─── */

function hashTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
}

function deduplicate(articles: NormalizedArticle[]): NormalizedArticle[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const h = hashTitle(a.title);
    if (seen.has(h)) return false;
    seen.add(h);
    return true;
  });
}

function guessCategory(title: string): NormalizedArticle["category"] {
  const t = title.toLowerCase();
  if (/\b(btc|bitcoin|eth|ethereum|sol|solana|crypto|defi|nft|token|blockchain|altcoin|web3)\b/.test(t)) return "crypto";
  if (/\b(forex|eur\/usd|gbp|jpy|currency|currencies|dollar|euro|yen|pound|fx)\b/.test(t)) return "forex";
  if (/\b(s&p|nasdaq|dow|dax|ftse|nikkei|stock|equity|indices|shares|etf|futures|commodities|gold|oil|silver)\b/.test(t)) return "markets";
  if (/\b(cpi|inflation|fed|ecb|gdp|rate|interest|macro|recession|employment|jobs|nfp|pmi)\b/.test(t)) return "macro";
  return "general";
}

/* ─── RSS Parser ─── */

const rssParser = new XMLParser({ ignoreAttributes: false });

function parseRSSItems(xml: string): { title: string; link: string; pubDate?: string; description?: string; enclosure?: string }[] {
  try {
    const parsed = rssParser.parse(xml);
    const channel = parsed?.rss?.channel ?? parsed?.feed;
    if (!channel) return [];
    const items = channel.item ?? channel.entry ?? [];
    const arr = Array.isArray(items) ? items : [items];
    return arr.slice(0, 15).map((item: any) => {
      const link = typeof item.link === "object" ? (item.link["@_href"] ?? "") : (item.link ?? "");
      const enclosure = item.enclosure?.["@_url"] ?? item["media:content"]?.["@_url"] ?? undefined;
      return {
        title: (item.title ?? "").toString().trim(),
        link: link.toString().trim(),
        pubDate: item.pubDate ?? item.published ?? item.updated ?? undefined,
        description: (item.description ?? item.summary ?? "").toString().slice(0, 300),
        enclosure,
      };
    });
  } catch {
    return [];
  }
}

/* ─── RSS Feed Fetchers ─── */

async function fetchRSSFeed(
  feedUrl: string,
  category: Category,
  sourceName: string,
  limit = 10,
): Promise<NormalizedArticle[]> {
  try {
    const res = await fetch(feedUrl, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ZenithBot/1.0)" },
    });
    if (!res.ok) throw new Error(`rss ${res.status}`);
    const xml = await res.text();
    const items = parseRSSItems(xml);
    return items
      .filter((i) => i.title && i.link)
      .slice(0, limit)
      .map((i) => ({
        title: i.title,
        url: i.link,
        source: sourceName,
        publishedAt: i.pubDate ? new Date(i.pubDate).toISOString() : new Date().toISOString(),
        provider: "rss" as const,
        category,
        imageUrl: i.enclosure || undefined,
      }));
  } catch {
    return [];
  }
}

// Crypto RSS feeds
function fetchCoinDesk(limit: number) {
  return fetchRSSFeed("https://www.coindesk.com/arc/outboundfeeds/rss/", "crypto", "CoinDesk", limit);
}
function fetchCointelegraph(limit: number) {
  return fetchRSSFeed("https://cointelegraph.com/rss", "crypto", "Cointelegraph", limit);
}
function fetchTheBlock(limit: number) {
  return fetchRSSFeed("https://www.theblock.co/rss.xml", "crypto", "The Block", limit);
}
function fetchBeInCrypto(limit: number) {
  return fetchRSSFeed("https://beincrypto.com/feed/", "crypto", "BeInCrypto", limit);
}
function fetchCryptoSlate(limit: number) {
  return fetchRSSFeed("https://cryptoslate.com/feed/", "crypto", "CryptoSlate", limit);
}
function fetchBitcoinMagazine(limit: number) {
  return fetchRSSFeed("https://bitcoinmagazine.com/feed", "crypto", "Bitcoin Magazine", limit);
}
function fetchCoinacademy(limit: number) {
  return fetchRSSFeed("https://coinacademy.org/feed", "crypto", "Coinacademy", limit);
}
function fetchProtos(limit: number) {
  return fetchRSSFeed("https://protos.com/feed/", "crypto", "Protos", limit);
}
function fetchBankless(limit: number) {
  return fetchRSSFeed("https://feeds.bankless.com/rss", "crypto", "Bankless", limit);
}

// Forex / Markets RSS
function fetchFXStreet(limit: number) {
  return fetchRSSFeed("https://www.fxstreet.com/rss/news", "forex", "FXStreet", limit);
}
function fetchBloomberg(limit: number) {
  return fetchRSSFeed("https://feeds.bloomberg.com/markets/news.rss", "markets", "Bloomberg", limit);
}

/* ─── API Fetchers ─── */

async function fetchFinnhub(category: string, limit: number): Promise<NormalizedArticle[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return [];

  const catMap: Record<string, string> = {
    crypto: "crypto",
    forex: "forex",
    markets: "general",
    macro: "general",
    general: "general",
  };

  try {
    const url = `https://finnhub.io/api/v1/news?category=${catMap[category] || "general"}&token=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) throw new Error(`finnhub ${res.status}`);
    const data = await res.json();

    return (data || []).slice(0, limit).map((a: any) => {
      const sentiment = a.sentiment
        ? a.sentiment === "Bullish"
          ? 0.6
          : a.sentiment === "Bearish"
            ? -0.6
            : 0
        : undefined;
      return {
        title: a.headline,
        url: a.url,
        source: a.source || "Finnhub",
        publishedAt: new Date(a.datetime * 1000).toISOString(),
        provider: "finnhub" as const,
        category: guessCategory(a.headline),
        sentiment,
        imageUrl: a.image || undefined,
      };
    });
  } catch {
    return [];
  }
}

async function fetchCoinGeckoNews(limit: number): Promise<NormalizedArticle[]> {
  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) return [];

  try {
    const url = `https://api.coingecko.com/api/v3/news?page=1&per_page=${Math.min(limit, 25)}&x_cg_demo_api_key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    const data = await res.json();

    return (data.data || []).map((a: any) => ({
      title: a.title,
      url: a.url,
      source: a.news_site || "CoinGecko",
      publishedAt: new Date(a.updated_at).toISOString(),
      provider: "coingecko" as const,
      category: "crypto" as const,
      imageUrl: a.thumb_2x || a.thumb || undefined,
    }));
  } catch {
    return [];
  }
}

/* ─── OpenGraph scraping (images fallback) ─── */

const ogCache = new Map<string, string | null>();
const OG_CACHE_TTL = 10 * 60 * 1000;
const ogCacheTs = new Map<string, number>();

async function scrapeOpenGraph(url: string): Promise<string | null> {
  const cached = ogCache.get(url);
  const ts = ogCacheTs.get(url);
  if (cached !== undefined && ts && Date.now() - ts < OG_CACHE_TTL) return cached;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(3000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ZenithBot/1.0)" },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch?.[1]) {
      ogCache.set(url, ogMatch[1]);
      ogCacheTs.set(url, Date.now());
      return ogMatch[1];
    }

    const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (twitterMatch?.[1]) {
      ogCache.set(url, twitterMatch[1]);
      ogCacheTs.set(url, Date.now());
      return twitterMatch[1];
    }

    ogCache.set(url, null);
    ogCacheTs.set(url, Date.now());
    return null;
  } catch {
    return null;
  }
}

async function enrichImages(articles: NormalizedArticle[], maxScrape = 5): Promise<void> {
  const missing = articles.filter((a) => !a.imageUrl).slice(0, maxScrape);
  if (missing.length === 0) return;

  await Promise.allSettled(
    missing.map(async (a) => {
      const img = await scrapeOpenGraph(a.url);
      if (img) a.imageUrl = img;
    })
  );
}

/* ─── Main handler ─── */

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") || "general";
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "20"), 30);

  const key = cacheKey(category, limit);
  const cached = serverCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ articles: cached.articles, ok: true, cached: true });
  }

  const perSource = Math.min(limit, 10);

  const results = await Promise.allSettled([
    // APIs
    fetchFinnhub(category, perSource),
    fetchCoinGeckoNews(perSource),
    // Crypto RSS
    ...(category === "crypto" || category === "all" ? [
      fetchCoinDesk(perSource),
      fetchCointelegraph(perSource),
      fetchTheBlock(perSource),
      fetchBeInCrypto(perSource),
      fetchCryptoSlate(perSource),
      fetchBitcoinMagazine(perSource),
      fetchCoinacademy(perSource),
      fetchProtos(perSource),
      fetchBankless(perSource),
    ] : []),
    // Forex RSS
    ...(category === "forex" || category === "all" ? [
      fetchFXStreet(perSource),
    ] : []),
    // Markets RSS
    ...(category === "markets" || category === "all" ? [
      fetchBloomberg(perSource),
    ] : []),
  ]);

  const articles: NormalizedArticle[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") articles.push(...r.value);
  }

  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const deduped = deduplicate(articles);
  const result = deduped.slice(0, limit);

  await enrichImages(result);

  serverCache.set(key, { articles: result, ts: Date.now() });

  return NextResponse.json({
    articles: result,
    ok: result.length > 0,
    providers: [...new Set(result.map((a) => a.provider))],
  });
}
