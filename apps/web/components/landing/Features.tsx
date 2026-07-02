"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { CheckCircle2, ArrowRightLeft, Activity, Globe, PieChart } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import RealtimeTicker from "./Hero/RealtimeTicker";
import { useFormatPrice, useCurrency, CURRENCY_SYMBOLS, type Currency } from "@/lib/context/CurrencyContext";

interface GlobalData {
  data?: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
  };
}

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
}

function fmtPct(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function formatCrypto(p: number, locale: string): string {
  if (!isFinite(p)) return "—";
  if (p >= 1) return p.toLocaleString(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  if (p >= 0.01) return p.toLocaleString(locale, { maximumFractionDigits: 4 });
  return p.toLocaleString(locale, { maximumFractionDigits: 8 });
}

const CRYPTO_OPTIONS = ["BTC", "ETH", "SOL", "BNB", "XRP"];
const FIAT_OPTIONS = ["USD", "EUR"];

export default function Features() {
  const t = useTranslations("features");
  const locale = useLocale();
  const formatPrice = useFormatPrice();
  const { convertFromUsd, formatNumber, currency, rates } = useCurrency();
  const mockupItems = t.raw("block1.mockupItems") as string[];

  const [global, setGlobal] = useState<GlobalData | null>(null);
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [fromAmount, setFromAmount] = useState("1");
  const [fromSymbol, setFromSymbol] = useState("BTC");
  const [toSymbol, setToSymbol] = useState("USD");

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/market/global", { signal: ctrl.signal, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: GlobalData | null) => d && setGlobal(d))
      .catch(() => {});
    fetch("/api/market/top-cryptos?limit=10", { signal: ctrl.signal, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Crypto[]) => setCryptos(Array.isArray(data) ? data : []))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const g = global?.data;

  const fmtCap = useCallback((n: number) => {
    const converted = convertFromUsd(n);
    const compact = formatNumber(converted, { notation: "compact", compactDisplay: "short", maximumFractionDigits: 2 });
    return `${CURRENCY_SYMBOLS[currency]}${compact}`;
  }, [convertFromUsd, formatNumber, currency]);

  const fiatRates = useMemo(() => {
    const m: Record<string, number> = { USD: 1 };
    if (rates) {
      for (const fiat of FIAT_OPTIONS) {
        if (fiat !== "USD") m[fiat] = rates.rates[fiat as Currency] ?? 1;
      }
    }
    return m;
  }, [rates]);

  const priceMap = useMemo(() => {
    const m: Record<string, number> = { ...fiatRates };
    for (const c of cryptos) {
      const sym = c.symbol?.toUpperCase();
      if (sym && c.current_price > 0) m[sym] = c.current_price;
    }
    return m;
  }, [cryptos, fiatRates]);

  const toAmount = useMemo(() => {
    const n = parseFloat(fromAmount);
    if (!isFinite(n)) return 0;
    const fromUsd = fiatRates[fromSymbol] !== undefined ? fiatRates[fromSymbol] : priceMap[fromSymbol] ?? 0;
    const toUsd = fiatRates[toSymbol] !== undefined ? fiatRates[toSymbol] : priceMap[toSymbol] ?? 0;
    if (!toUsd) return 0;
    return (n * fromUsd) / toUsd;
  }, [fromAmount, fromSymbol, toSymbol, priceMap, fiatRates]);

  const usdValue = useMemo(() => {
    const n = parseFloat(fromAmount);
    if (!isFinite(n)) return 0;
    return n * (fiatRates[fromSymbol] !== undefined ? fiatRates[fromSymbol] : priceMap[fromSymbol] ?? 0);
  }, [fromAmount, fromSymbol, priceMap, fiatRates]);

  const swap = useCallback(() => {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
  }, [fromSymbol, toSymbol]);

  const commandItems = useMemo(() => {
    const routes = ["/markets", "/markets", "/dashboard", "/markets"];
    return (mockupItems ?? []).slice(0, 4).map((label, i) => ({
      label,
      href: routes[i] ?? "/markets",
      shortcut: i === 0 ? ["⌘", "K"] : i === 1 ? ["G", "M"] : i === 2 ? ["G", "D"] : ["↑", "↓"],
    }));
  }, [mockupItems]);

  return (
    <section className="py-20 px-4 bg-card">
      <div className="max-w-6xl mx-auto space-y-32">
        {/* Feature 1: Command Palette */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <p className="font-mono-caps text-secondary mb-2">{t("block1.badge")}</p>
            <h2 className="heading-2 text-3xl md:text-4xl font-medium text-primary mb-6 leading-tight">
              {t.rich("block1.title", { br: () => <br /> })}
            </h2>
            <p className="text-secondary text-sm mb-8">{t("block1.desc")}</p>

            <ul className="space-y-4 text-sm text-secondary">
              {(t.raw("block1.items") as string[]).map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 w-full">
            <div className="bg-card border border-surface rounded-sm p-4 max-w-md mx-auto relative">
              <div className="font-mono-caps text-secondary mb-2 px-2">{t("block1.mockupLabel")}</div>
              <div className="space-y-1">
                {commandItems.map((item, i) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex justify-between items-center p-2 rounded cursor-pointer ${
                      i === 0 ? "bg-canvas" : "hover:bg-raised"
                    } transition-colors`}
                  >
                    <span className={`text-sm ${i === 0 ? "text-primary" : "text-secondary"}`}>{item.label}</span>
                    <div className="flex gap-1">
                      {item.shortcut.map((k) => (
                        <kbd key={k} className="bg-card border border-surface px-1.5 rounded-sm text-xs text-secondary min-w-[18px] text-center">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Real-time Data */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="flex-1">
            <p className="font-mono-caps text-secondary mb-2">{t("block2.badge")}</p>
            <h2 className="heading-2 text-3xl md:text-4xl font-medium text-primary mb-6 leading-tight">
              {t.rich("block2.title", { br: () => <br /> })}
            </h2>
            <p className="text-secondary text-sm mb-8">{t("block2.desc")}</p>

            <ul className="space-y-4 text-sm text-secondary">
              {(t.raw("block2.items") as string[]).map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 w-full">
            <div className="bg-card border border-surface rounded-sm p-5 w-full max-w-md mx-auto space-y-5">
              {/* Live Market Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-canvas border border-surface rounded-sm p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-secondary mb-1">
                    <Globe className="w-3 h-3" /> Cap
                  </div>
                  <div className="text-sm font-semibold text-primary">{g ? fmtCap(g.total_market_cap.usd) : "—"}</div>
                  <div className={`text-[10px] ${g && g.market_cap_change_percentage_24h_usd >= 0 ? "text-up" : "text-down"}`}>
                    {g ? fmtPct(g.market_cap_change_percentage_24h_usd) : "—"}
                  </div>
                </div>
                <div className="bg-canvas border border-surface rounded-sm p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-secondary mb-1">
                    <Activity className="w-3 h-3" /> Vol 24h
                  </div>
                  <div className="text-sm font-semibold text-primary">{g ? fmtCap(g.total_volume.usd) : "—"}</div>
                  <div className="text-[10px] text-tertiary">global</div>
                </div>
                <div className="bg-canvas border border-surface rounded-sm p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-secondary mb-1">
                    <PieChart className="w-3 h-3" /> BTC Dom
                  </div>
                  <div className="text-sm font-semibold text-primary">{g ? `${(g.market_cap_percentage.btc ?? 0).toFixed(1)}%` : "—"}</div>
                  <div className="text-[10px] text-tertiary"> dominance</div>
                </div>
              </div>

              {/* Ticker */}
              <RealtimeTicker />

              {/* Quick Converter */}
              <div className="bg-canvas border border-surface rounded-sm p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-primary flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-accent" />
                    Quick Converter
                  </h4>
                  <span className="font-mono-caps text-[10px] text-secondary">LIVE RATES</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-card border border-surface rounded-sm px-2 py-1.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      aria-label="Amount"
                      className="bg-transparent text-sm text-primary w-full focus:outline-none"
                    />
                    <select
                      value={fromSymbol}
                      onChange={(e) => setFromSymbol(e.target.value)}
                      aria-label="From"
                      className="bg-transparent text-xs text-primary focus:outline-none border-l border-surface pl-2 uppercase"
                    >
                      {[...CRYPTO_OPTIONS, ...FIAT_OPTIONS].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={swap}
                      aria-label="Swap"
                      className="p-1 rounded-sm bg-card border border-surface hover:bg-raised transition"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-secondary" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-card border border-surface rounded-sm px-2 py-1.5">
                    <input
                      type="text"
                      readOnly
                      value={toAmount ? (FIAT_OPTIONS.includes(toSymbol) ? formatPrice(usdValue) : formatCrypto(toAmount, locale)) : "—"}
                      aria-label="Converted amount"
                      className="bg-transparent text-sm text-primary w-full focus:outline-none"
                    />
                    <select
                      value={toSymbol}
                      onChange={(e) => setToSymbol(e.target.value)}
                      aria-label="To"
                      className="bg-transparent text-xs text-primary focus:outline-none border-l border-surface pl-2 uppercase"
                    >
                      {[...CRYPTO_OPTIONS, ...FIAT_OPTIONS].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="text-[10px] text-tertiary mt-2 font-mono-caps">
                  1 {fromSymbol} ={" "}
                  <span className="text-primary">
                    {priceMap[fromSymbol] ? formatPrice(priceMap[fromSymbol]) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
