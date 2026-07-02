import { NextResponse } from "next/server";

export const revalidate = 60;

const FIAT_CURRENCIES = [
  "USD", "EUR", "GBP", "CHF", "JPY", "RUB", "PLN", "TRY",
  "BRL", "IDR", "MYR", "THB", "VND", "KRW", "CNY", "TWD",
  "AED", "SAR", "EGP", "ILS", "MXN", "ARS",
] as const;

const COINGECKO_IDS: Record<string, string> = {
  USD: "usd", EUR: "eur", GBP: "gbp", CHF: "chf", JPY: "jpy", RUB: "rub",
  PLN: "pln", TRY: "try", BRL: "brl", IDR: "idr", MYR: "myr", THB: "thb",
  VND: "vnd", KRW: "krw", CNY: "cny", TWD: "twd", AED: "aed", SAR: "sar",
  EGP: "egp", ILS: "ils", MXN: "mxn", ARS: "ars",
};

let cache: { data: unknown; fetchedAt: number } | null = null;
const CACHE_TTL = 60_000; // 60s

async function fetchFromCoinGecko(): Promise<Record<string, number>> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=${Object.values(COINGECKO_IDS).join(",")}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`CoinGecko returned ${res.status}`);
  return (await res.json()) as Record<string, number>;
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
    });
  }

  try {
    const cg = await fetchFromCoinGecko();
    const btc = (cg as any).bitcoin;
    const eth = (cg as any).ethereum;
    if (!btc || !eth) throw new Error("Malformed CoinGecko response");
    const btcUsd = btc.usd;
    const ethUsd = eth.usd;
    const rates: Record<string, number> = { USD: 1 };
    for (const fiat of FIAT_CURRENCIES) {
      const v = btc[COINGECKO_IDS[fiat]];
      if (typeof v === "number" && v > 0) {
        rates[fiat] = btcUsd / v;
      }
    }
    rates.BTC = 1 / btcUsd;
    rates.ETH = 1 / ethUsd;
    const data = { base: "USD", rates, fetchedAt: now };
    cache = { data, fetchedAt: now };
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
    });
  } catch (err) {
    // Fallback to hardcoded rates
    const fallback = {
      USD: 1, EUR: 0.92, GBP: 0.79, CHF: 0.88, JPY: 149, RUB: 92, PLN: 4.0,
      TRY: 32, BRL: 5.0, IDR: 15700, MYR: 4.7, THB: 35, VND: 24500, KRW: 1330,
      CNY: 7.2, TWD: 32, AED: 3.67, SAR: 3.75, EGP: 49, ILS: 3.7, MXN: 17, ARS: 870,
      BTC: 1 / 63000, ETH: 1 / 3200,
    };
    return NextResponse.json(
      { base: "USD", rates: fallback, fetchedAt: now, fallback: true },
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=30" },
      }
    );
  }
}
