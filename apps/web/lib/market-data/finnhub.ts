import { EconomicEvent } from "./types";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

const API_KEY = process.env.FINNHUB_API_KEY || "";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 300000; // 5 minutes

async function finnhubFetch<T>(endpoint: string, ttl = CACHE_TTL): Promise<T | null> {
  if (!API_KEY || API_KEY === "your_free_finnhub_key_here") {
    return null;
  }

  const cacheKey = endpoint;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }

  try {
    const url = new URL(endpoint, FINNHUB_BASE);
    url.searchParams.set("token", API_KEY);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return cached?.data as T ?? null;
    }

    const data = await res.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data as T;
  } catch {
    return cached?.data as T ?? null;
  }
}

// Economic calendar
interface FinnhubEconomicEvent {
  time: string;
  country: string;
  event: string;
  impact: string;
  actual: string;
  estimate: string;
  prev: string;
  unit: string;
  scale: string;
}

export async function getEconomicCalendar(from: string, to: string): Promise<EconomicEvent[]> {
  const data = await finnhubFetch<FinnhubEconomicEvent[]>(`/calendar/economic?from=${from}&to=${to}`);

  if (!data) {
    return getMockEconomicCalendar();
  }

  return data.map((event) => ({
    date: event.time.split(" ")[0] ?? event.time,
    time: event.time.split(" ")[1] ?? "00:00",
    currency: event.country,
    event: event.event,
    importance: event.impact as "low" | "medium" | "high",
    actual: event.actual,
    forecast: event.estimate,
    previous: event.prev,
  }));
}

// Mock economic calendar
function getMockEconomicCalendar(): EconomicEvent[] {
  const today = new Date().toISOString().split("T")[0];
  return [
    { date: today, time: "08:30", currency: "USD", event: "NFP (Non-Farm Payrolls)", importance: "high", actual: "210K", forecast: "195K", previous: "185K", impact: "positive" },
    { date: today, time: "14:00", currency: "USD", event: "FOMC Decision", importance: "high", actual: "5.50%", forecast: "5.50%", previous: "5.50%", impact: "neutral" },
    { date: today, time: "08:00", currency: "EUR", event: "ECB Rate Decision", importance: "high", actual: "4.00%", forecast: "4.00%", previous: "4.00%", impact: "neutral" },
    { date: today, time: "10:00", currency: "EUR", event: "Eurozone CPI", importance: "medium", actual: "2.1%", forecast: "2.2%", previous: "2.2%", impact: "positive" },
    { date: today, time: "09:30", currency: "GBP", event: "UK GDP", importance: "medium", actual: "0.3%", forecast: "0.2%", previous: "0.1%", impact: "positive" },
    { date: today, time: "07:30", currency: "JPY", event: "BOJ Policy", importance: "medium", actual: "-0.10%", forecast: "-0.10%", previous: "-0.10%", impact: "neutral" },
    { date: today, time: "13:30", currency: "USD", event: "CPI", importance: "high", actual: "3.2%", forecast: "3.3%", previous: "3.4%", impact: "positive" },
    { date: today, time: "15:30", currency: "USD", event: "Crude Oil Inventories", importance: "medium", actual: "-2.1M", forecast: "-1.5M", previous: "-0.8M", impact: "positive" },
  ];
}

// News sentiment
interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  source: string;
  summary: string;
  url: string;
}

export async function getMarketNews(category: string = "general", minId = 0): Promise<FinnhubNews[]> {
  const data = await finnhubFetch<FinnhubNews[]>(`/news?category=${category}&minId=${minId}`);
  return data ?? [];
}
