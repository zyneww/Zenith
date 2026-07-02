"use client";

import { useEffect, useState } from "react";

interface Props {
  type: string;
  title: string;
  endpoint: string;
}

export default function CalendarSubClient({ type, title, endpoint }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("all");
  const [industry, setIndustry] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (country !== "all") params.set("country", country);
    if (industry !== "all") params.set("industry", industry);
    fetch(`${endpoint}?${params}`).then(r => r.json()).then((json) => {
      const items = json[type] || json.data || (Array.isArray(json) ? json : []);
      setData(Array.isArray(items) ? items : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [type, endpoint, country, industry]);

  const columns = type === "earnings"
    ? [{ k: "symbol", l: "Symbole" }, { k: "date", l: "Date", f: (r: any) => new Date(r.date || r.reportDate).toLocaleDateString("fr") }, { k: "epsActual", l: "EPS" }, { k: "epsEstimate", l: "Estimation" }, { k: "industry", l: "Industrie" }]
    : type === "ipos"
    ? [{ k: "name", l: "Nom" }, { k: "symbol", l: "Symbole" }, { k: "date", l: "Date", f: (r: any) => new Date(r.date || r.expectedDate).toLocaleDateString("fr") }, { k: "exchange", l: "Exchange" }, { k: "country", l: "Pays" }]
    : type === "dividends"
    ? [{ k: "symbol", l: "Symbole" }, { k: "date", l: "Date", f: (r: any) => new Date(r.date || r.paymentDate).toLocaleDateString("fr") }, { k: "amount", l: "Montant", f: (r: any) => `$${r.amount}` }]
    : type === "splits"
    ? [{ k: "symbol", l: "Symbole" }, { k: "date", l: "Date", f: (r: any) => new Date(r.date || r.executionDate).toLocaleDateString("fr") }, { k: "fromFactor", l: "Ratio", f: (r: any) => `${r.fromFactor || r.splitRatio || "?"}:1` }]
    : [{ k: "symbol", l: "Symbole" }, { k: "date", l: "Date" }];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary mb-1">{title}</h1>
      <p className="text-secondary text-sm mb-6">Calendrier {title.toLowerCase()} via Finnhub</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <select value={country} onChange={e => setCountry(e.target.value)}
          className="px-3 py-1.5 bg-card border border-default rounded-lg text-[12px] text-primary">
          <option value="all">Tous les pays</option>
          <option value="US">États-Unis</option>
          <option value="FR">France</option>
          <option value="DE">Allemagne</option>
          <option value="UK">Royaume-Uni</option>
        </select>
        <select value={industry} onChange={e => setIndustry(e.target.value)}
          className="px-3 py-1.5 bg-card border border-default rounded-lg text-[12px] text-primary">
          <option value="all">Toutes les industries</option>
          <option value="Technology">Technologie</option>
          <option value="Finance">Finance</option>
          <option value="Healthcare">Santé</option>
          <option value="Energy">Énergie</option>
        </select>
      </div>

      {loading ? <p className="text-tertiary">Chargement...</p> : (
        <div className="bg-canvas rounded-xl border border-default overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-default">
                {columns.map((col, i) => (
                  <th key={i} className="py-3 px-4 text-[11px] text-secondary uppercase tracking-wider text-left">{col.l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, i: number) => (
                <tr key={i} className="border-b border-default hover:bg-raised">
                  {columns.map((col, j) => (
                    <td key={j} className="py-2.5 px-4 text-primary">
                      {col.f ? col.f(row) : row[col.k] != null ? String(row[col.k]) : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
