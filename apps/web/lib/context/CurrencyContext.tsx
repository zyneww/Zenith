"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useLocale } from "next-intl";

export type Currency =
  | "USD" | "EUR" | "GBP" | "CHF" | "JPY" | "RUB" | "PLN" | "TRY"
  | "BRL" | "IDR" | "MYR" | "THB" | "VND" | "KRW" | "CNY" | "TWD"
  | "AED" | "SAR" | "EGP" | "ILS" | "MXN" | "ARS" | "BTC" | "ETH";

export const ALL_CURRENCIES: Currency[] = [
  "USD", "EUR", "GBP", "CHF", "JPY", "RUB", "PLN", "TRY",
  "BRL", "IDR", "MYR", "THB", "VND", "KRW", "CNY", "TWD",
  "AED", "SAR", "EGP", "ILS", "MXN", "ARS", "BTC", "ETH",
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$", EUR: "€", GBP: "£", CHF: "Fr", JPY: "¥", RUB: "₽", PLN: "zł", TRY: "₺",
  BRL: "R$", IDR: "Rp", MYR: "RM", THB: "฿", VND: "₫", KRW: "₩", CNY: "¥", TWD: "NT$",
  AED: "د.إ", SAR: "﷼", EGP: "E£", ILS: "₪", MXN: "Mex$", ARS: "AR$",
  BTC: "₿", ETH: "Ξ",
};

const FIAT_CURRENCIES = ALL_CURRENCIES.filter((c) => !["BTC", "ETH"].includes(c));
const CRYPTO_CURRENCIES: Currency[] = ["BTC", "ETH"];

interface Rates {
  base: "USD";
  rates: Record<Currency, number>;
  fetchedAt: number;
}

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Rates | null;
  isLoading: boolean;
  formatPrice: (amountUsd: number, opts?: Intl.NumberFormatOptions) => string;
  formatNumber: (n: number, opts?: Intl.NumberFormatOptions) => string;
  convertFromUsd: (usd: number) => number;
  isCryptoDisplay: boolean;
  fiats: typeof FIAT_CURRENCIES;
  cryptos: typeof CRYPTO_CURRENCIES;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "zenith-currency";
const CACHE_KEY = "zenith-rates-cache";
const CACHE_TTL = 60_000; // 60s

function defaultCurrencyForLocale(loc: string): Currency {
  const map: Record<string, Currency> = {
    fr: "EUR", "en-US": "USD", "en-UK": "GBP", ru: "RUB", it: "EUR", es: "EUR",
    ja: "JPY", nl: "EUR", de: "EUR", pl: "PLN", tr: "TRY", pt: "BRL", id: "IDR",
    ms: "MYR", th: "THB", vi: "VND", ko: "KRW", "zh-CN": "CNY", "zh-TW": "TWD",
    ar: "AED", he: "ILS",
  };
  return map[loc] ?? "USD";
}

async function fetchRates(): Promise<Rates> {
  // Try to read from cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as Rates;
      if (Date.now() - parsed.fetchedAt < CACHE_TTL) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // Fetch from our own /api/fx endpoint (proxied to CoinGecko, cached in Dragonfly)
  try {
    const res = await fetch("/api/fx/rates", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as Rates;
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* */ }
      return data;
    }
  } catch {
    // fall through to fallback
  }

  // Fallback: direct CoinGecko call (no key needed for simple price)
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,eur,gbp,chf,jpy,rub,pln,try,brl,idr,myr,thb,vnd,krw,cny,try,aed,sar,egp,ils,mxn,ars",
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = (await res.json()) as Record<string, Record<string, number>>;
      const usd = data.bitcoin?.usd ?? 0;
      const eth = data.ethereum?.usd ?? 0;
      const rates: Record<Currency, number> = {} as Record<Currency, number>;
      for (const fiat of FIAT_CURRENCIES) {
        rates[fiat] = (data.bitcoin as any)?.[fiat.toLowerCase()] ?? 0;
        if (!rates[fiat] && fiat === "TRY") rates[fiat] = (data.bitcoin as any)?.try ?? 0;
      }
      rates.USD = 1;
      rates.BTC = 1 / usd;
      rates.ETH = 1 / eth;
      const out: Rates = { base: "USD", rates, fetchedAt: Date.now() };
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(out)); } catch { /* */ }
      return out;
    }
  } catch {
    // fall through
  }

  // Final fallback: hardcoded approximate rates
  const fb: Record<Currency, number> = {
    USD: 1, EUR: 0.92, GBP: 0.79, CHF: 0.88, JPY: 149, RUB: 92, PLN: 4.0,
    TRY: 32, BRL: 5.0, IDR: 15700, MYR: 4.7, THB: 35, VND: 24500, KRW: 1330,
    CNY: 7.2, TWD: 32, AED: 3.67, SAR: 3.75, EGP: 49, ILS: 3.7, MXN: 17, ARS: 870,
    BTC: 1 / 63000, ETH: 1 / 3200,
  };
  return { base: "USD", rates: fb, fetchedAt: Date.now() };
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrencyForLocale(locale));
  const [rates, setRates] = useState<Rates | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Currency | null;
      if (stored && ALL_CURRENCIES.includes(stored)) {
        setCurrencyState(stored);
      } else {
        setCurrencyState(defaultCurrencyForLocale(locale));
      }
    } catch {
      // ignore
    }
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchRates().then((r) => {
      if (!cancelled) {
        setRates(r);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch { /* */ }
    window.dispatchEvent(new CustomEvent("zenith-currency-change", { detail: c }));
  }, []);

  const convertFromUsd = useCallback(
    (usd: number): number => {
      if (!rates) return usd;
      const rate = rates.rates[currency] ?? 1;
      return usd * rate;
    },
    [rates, currency]
  );

  const isCryptoDisplay = useMemo(
    () => currency === "BTC" || currency === "ETH",
    [currency]
  );

  const formatPrice = useCallback(
    (amountUsd: number, opts?: Intl.NumberFormatOptions) => {
      const converted = convertFromUsd(amountUsd);
      const fractionDigits = isCryptoDisplay
        ? currency === "BTC"
          ? amountUsd > 100
            ? 4
            : 6
          : amountUsd > 1000
          ? 2
          : 4
        : converted < 1
        ? 4
        : converted < 100
        ? 2
        : 0;
      try {
        return new Intl.NumberFormat(locale, {
          style: isCryptoDisplay ? "decimal" : "currency",
          currency: isCryptoDisplay ? undefined : currency,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
          ...opts,
        }).format(converted);
      } catch {
        return `${CURRENCY_SYMBOLS[currency]}${converted.toFixed(fractionDigits)}`;
      }
    },
    [convertFromUsd, currency, isCryptoDisplay, locale]
  );

  const formatNumber = useCallback(
    (n: number, opts?: Intl.NumberFormatOptions) => {
      try {
        return new Intl.NumberFormat(locale, opts).format(n);
      } catch {
        return String(n);
      }
    },
    [locale]
  );

  const value: CurrencyContextValue = {
    currency,
    setCurrency,
    rates,
    isLoading,
    formatPrice,
    formatNumber,
    convertFromUsd,
    isCryptoDisplay,
    fiats: FIAT_CURRENCIES,
    cryptos: CRYPTO_CURRENCIES,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}

export function useFormatPrice() {
  const { formatPrice } = useCurrency();
  return formatPrice;
}
