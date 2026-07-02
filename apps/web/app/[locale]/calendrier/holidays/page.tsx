"use client";

import { useEffect, useState } from "react";

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [country, setCountry] = useState("all");

  useEffect(() => {
    const params = country !== "all" ? `?country=${country}` : "";
    fetch(`/api/calendar/holidays${params}`).then(r => r.json()).then(d => {
      setHolidays(d.holidays || []);
    });
  }, [country]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary mb-1">Fermetures des marchés</h1>
      <p className="text-secondary text-sm mb-6">Jours fériés par pays</p>

      <select value={country} onChange={e => setCountry(e.target.value)}
        className="mb-6 px-3 py-1.5 bg-card border border-default rounded-lg text-[12px] text-primary">
        <option value="all">Tous les pays</option>
        <option value="US">États-Unis</option>
        <option value="FR">France</option>
        <option value="UK">Royaume-Uni</option>
        <option value="JP">Japon</option>
        <option value="CN">Chine</option>
      </select>

      <div className="bg-canvas rounded-xl border border-default overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-default">
              <th className="py-3 px-4 text-[11px] text-secondary uppercase tracking-wider text-left">Date</th>
              <th className="py-3 px-4 text-[11px] text-secondary uppercase tracking-wider text-left">Nom</th>
              <th className="py-3 px-4 text-[11px] text-secondary uppercase tracking-wider text-left">Marché</th>
              {country === "all" && <th className="py-3 px-4 text-[11px] text-secondary uppercase tracking-wider text-left">Pays</th>}
            </tr>
          </thead>
          <tbody>
            {holidays.map((h, i) => (
              <tr key={i} className="border-b border-default hover:bg-raised">
                <td className="py-2.5 px-4 text-primary font-mono">{h.date}</td>
                <td className="py-2.5 px-4 text-primary">{h.name}</td>
                <td className="py-2.5 px-4 text-secondary">{h.market}</td>
                {country === "all" && <td className="py-2.5 px-4 text-secondary">{h.country}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
