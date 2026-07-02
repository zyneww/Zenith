"use client";

import { useEffect, useState } from "react";

const CCY = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY", "MXN", "SEK"];

export default function ForexPage() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");

  useEffect(() => {
    fetch("/api/market/fx/rates?base=USD").then(r => r.json()).then(d => {
      setRates(d.rates);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const usdRate = from === "USD" ? 1 : (rates[from] ? 1 / rates[from] : 1);
  const toRate = to === "USD" ? 1 : (rates[to] || 1);
  const converted = parseFloat(amount || "0") * (toRate * usdRate);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary mb-1">Forex</h1>
      <p className="text-secondary text-sm mb-6">Taux de change temps réel — BCE / Frankfurter</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-canvas rounded-xl border border-default overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-default">
                <th className="py-3 px-4 text-[11px] text-secondary uppercase tracking-wider text-left">Paire</th>
                {CCY.slice(1).map(c => <th key={c} className="py-3 px-3 text-[11px] text-secondary uppercase tracking-wider text-right">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {CCY.map(base => (
                <tr key={base} className="border-b border-default hover:bg-raised">
                  <td className="py-2.5 px-4 font-medium text-primary">{base}</td>
                  {CCY.filter(c => c !== base).map(c => {
                    const rate = base === "USD" ? rates[c] : c === "USD" ? (rates[base] ? 1 / rates[base] : 0) : (rates[c] && rates[base] ? rates[c] / rates[base] : 0);
                    return <td key={c} className="py-2.5 px-3 text-right font-mono text-primary">{rate ? rate.toFixed(4) : "-"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-card rounded-xl border border-default p-6">
          <h3 className="text-sm font-medium text-primary mb-4">Convertisseur</h3>
          <div className="space-y-3">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-canvas border border-default rounded-lg text-primary" />
            <div className="flex gap-2">
              <select value={from} onChange={e => setFrom(e.target.value)}
                className="flex-1 px-3 py-2 bg-canvas border border-default rounded-lg text-primary text-sm">
                {CCY.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-tertiary self-center">→</span>
              <select value={to} onChange={e => setTo(e.target.value)}
                className="flex-1 px-3 py-2 bg-canvas border border-default rounded-lg text-primary text-sm">
                {CCY.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="text-center py-4">
              <span className="text-2xl font-semibold text-accent">{converted.toFixed(4)}</span>
              <span className="text-secondary ml-2">{to}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
