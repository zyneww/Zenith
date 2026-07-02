const API_KEY = process.env.NEWS_API_KEY || "";

export interface NewsArticle {
  source: string;
  author: string | null;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  category: string;
}

export async function fetchMacroNews(): Promise<NewsArticle[]> {
  if (!API_KEY) return [];
  const res = await fetch(
    `https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=20&apiKey=${API_KEY}`,
    { signal: AbortSignal.timeout(5000), next: { revalidate: 900 } }
  );
  if (!res.ok) throw new Error(`NewsAPI ${res.status}`);
  const json = await res.json();
  return (json.articles || []).map((a: any) => ({
    source: a.source?.name || "NewsAPI",
    author: a.author,
    title: a.title,
    description: a.description || "",
    url: a.url,
    imageUrl: a.urlToImage,
    publishedAt: a.publishedAt,
    category: "macro",
  }));
}
