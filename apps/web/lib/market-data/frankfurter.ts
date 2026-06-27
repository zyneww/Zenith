const BASE = "https://api.frankfurter.dev";

export interface FXRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

const FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.93, GBP: 0.79, JPY: 160.5, CHF: 0.89, CAD: 1.37, AUD: 1.53, CNY: 7.25, MXN: 18.5, SEK: 10.45, NOK: 10.65, NZD: 1.64, INR: 83.5, BRL: 5.45, KRW: 1380, SGD: 1.35 },
  EUR: { USD: 1.08, GBP: 0.85, JPY: 172.5, CHF: 0.96, CAD: 1.48, AUD: 1.65, CNY: 7.80, MXN: 19.9, SEK: 11.23, NOK: 11.45, NZD: 1.76, INR: 89.8, BRL: 5.86, KRW: 1484, SGD: 1.45 },
};

export async function fetchFXRates(base = "USD"): Promise<FXRates> {
  try {
    const res = await fetch(`${BASE}/latest?base=${base}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
    return await res.json();
  } catch {
    const rates = FALLBACK_RATES[base] || FALLBACK_RATES.USD;
    return { base, date: new Date().toISOString().split("T")[0], rates };
  }
}

export async function fetchFXHistory(from: string, to: string, days = 30): Promise<Record<string, Record<string, number>>> {
  const today = new Date();
  const start = new Date(today.getTime() - days * 86400000).toISOString().split("T")[0];
  const end = today.toISOString().split("T")[0];
  const res = await fetch(`${BASE}/${start}..${end}?base=${from}&to=${to}`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Frankfurter history ${res.status}`);
  const json = await res.json();
  return json.rates;
}
