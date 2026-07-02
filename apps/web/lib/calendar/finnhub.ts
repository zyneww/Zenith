import Redis from 'ioredis';
import {
  type CalendarType,
  type CalendarEvent,
  type EconomicEvent,
  type EarningsEvent,
  type DividendEvent,
  type IpoEvent,
  type SplitEvent,
} from './types';

// ponytail: one shared client, lazy init — avoids connecting during build
let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://:dragonfly_dev@localhost:6379', {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableReadyCheck: false,
    });
  }
  return redis;
}

const FINNHUB_TOKEN = process.env.FINNHUB_API_KEY || '';
const BASE = 'https://finnhub.io/api/v1';
const TTL = 300; // 5 min

function todayUTC(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function defaultRange(): { from: string; to: string } {
  return { from: todayUTC(0), to: todayUTC(7) };
}

function cacheKey(type: CalendarType, from: string, to: string): string {
  return `calendar:${type}:${from}:${to}`;
}

async function cached<T>(key: string): Promise<T | null> {
  try {
    const raw = await getRedis().get(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // cache miss is fine — fall through to fetch
  }
  return null;
}

async function setCached(key: string, data: unknown): Promise<void> {
  try {
    await getRedis().set(key, JSON.stringify(data), 'EX', TTL);
  } catch {
    // best-effort cache write
  }
}

async function finnhubGet(path: string, signal?: AbortSignal): Promise<any | null> {
  if (!FINNHUB_TOKEN) return null;
  const url = `${BASE}${path}&token=${FINNHUB_TOKEN}`;
  try {
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function mapEconomic(payload: any): EconomicEvent[] {
  const list = payload?.economicCalendar || [];
  return list.map((e: any): EconomicEvent => ({
    country: e.country || '',
    countryCode: e.countryCode || '',
    date: e.date || (e.time?.split(' ')[0] ?? ''),
    event: e.event || '',
    time: e.time || '',
    importance: (e.impact || e.importance || 'low').toLowerCase() as EconomicEvent['importance'],
    actual: e.actual ?? undefined,
    forecast: e.forecast ?? undefined,
    previous: e.prev ?? e.previous ?? undefined,
    source: 'finnhub',
  }));
}

function mapEarnings(payload: any): EarningsEvent[] {
  const list = payload?.earningsCalendar || [];
  return list.map((e: any): EarningsEvent => ({
    date: e.date || '',
    hour: e.hour ?? undefined,
    symbol: e.symbol || '',
    name: e.name || e.symbol || '',
    epsActual: e.epsActual ?? undefined,
    epsEstimate: e.epsEstimate ?? 0,
    revenueActual: e.revenueActual ?? undefined,
    revenueEstimate: e.revenueEstimate ?? 0,
    fiscalPeriod: e.fiscalPeriod || '',
    exchange: e.exchange || '',
  }));
}

function mapDividends(payload: any): DividendEvent[] {
  const list = Array.isArray(payload) ? payload : payload?.dividends || [];
  return list.map((e: any): DividendEvent => ({
    exDate: e.exDate || e.date || '',
    symbol: e.symbol || '',
    name: e.name || e.symbol || '',
    dividend: e.dividend ?? e.amount ?? 0,
    frequency: e.frequency || 'quarterly',
    amount: e.amount ?? undefined,
    currency: e.currency ?? 'USD',
  }));
}

function mapIpos(payload: any): IpoEvent[] {
  const list = payload?.ipoCalendar || [];
  return list.map((e: any): IpoEvent => ({
    date: e.date || '',
    symbol: e.symbol || '',
    name: e.name || e.symbol || '',
    exchange: e.exchange || '',
    priceRangeLow: e.priceRangeLow ?? undefined,
    priceRangeHigh: e.priceRangeHigh ?? undefined,
    shares: e.numberOfShares ?? undefined,
    status: e.status || 'expected',
  }));
}

function mapSplits(payload: any): SplitEvent[] {
  const list = Array.isArray(payload) ? payload : payload?.splits || [];
  return list.map((e: any): SplitEvent => ({
    date: e.date || '',
    symbol: e.symbol || '',
    name: e.name || e.symbol || '',
    ratio: e.ratio || '',
    optionable: e.optionable ?? undefined,
  }));
}

export async function getCalendarData(
  type: CalendarType,
  range: { from: string; to: string },
  signal?: AbortSignal
): Promise<CalendarEvent[] | null> {
  const { from, to } = range;
  const key = cacheKey(type, from, to);

  const hit = await cached<CalendarEvent[]>(key);
  if (hit) return hit;

  let data: CalendarEvent[] | null = null;

  switch (type) {
    case 'economic': {
      const p = await finnhubGet(`/calendar/economic?from=${from}&to=${to}`, signal);
      data = p ? mapEconomic(p) : null;
      break;
    }
    case 'earnings': {
      const p = await finnhubGet(`/calendar/earnings?from=${from}&to=${to}`, signal);
      data = p ? mapEarnings(p) : null;
      break;
    }
    case 'dividends': {
      const p = await finnhubGet(`/stock/dividend?from=${from}&to=${to}`, signal);
      data = p ? mapDividends(p) : null;
      break;
    }
    case 'ipos': {
      const p = await finnhubGet(`/calendar/ipo?from=${from}&to=${to}`, signal);
      data = p ? mapIpos(p) : null;
      break;
    }
    case 'splits': {
      const p = await finnhubGet(`/stock/split?from=${from}&to=${to}`, signal);
      data = p ? mapSplits(p) : null;
      break;
    }
    case 'holidays': {
      // ponytail: Finnhub has no holidays endpoint — caller falls back to mock
      data = null;
      break;
    }
  }

  if (data && data.length > 0) {
    await setCached(key, data);
  }

  return data;
}
