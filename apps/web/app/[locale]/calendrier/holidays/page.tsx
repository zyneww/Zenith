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
      <h1 className="text-2xl font-semibold text-[#e3e2e0] mb-1">Fermetures des marchés</h1>
      <p className="text-zinc-400 text-sm mb-6">Jours fériés par pays</p>

      <select value={country} onChange={e => setCountry(e.target.value)}
        className="mb-6 px-3 py-1.5 bg-[#252525] border border-[#333] rounded-lg text-[12px] text-zinc-300">
        <option value="all">Tous les pays</option>
        <option value="US">États-Unis</option>
        <option value="FR">France</option>
        <option value="UK">Royaume-Uni</option>
        <option value="JP">Japon</option>
        <option value="CN">Chine</option>
      </select>

      <div className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#333]">
              <th className="py-3 px-4 text-[11px] text-zinc-400 uppercase tracking-wider text-left">Date</th>
              <th className="py-3 px-4 text-[11px] text-zinc-400 uppercase tracking-wider text-left">Nom</th>
              <th className="py-3 px-4 text-[11px] text-zinc-400 uppercase tracking-wider text-left">Marché</th>
              {country === "all" && <th className="py-3 px-4 text-[11px] text-zinc-400 uppercase tracking-wider text-left">Pays</th>}
            </tr>
          </thead>
          <tbody>
            {holidays.map((h, i) => (
              <tr key={i} className="border-b border-[#222] hover:bg-[#2a2a2a]">
                <td className="py-2.5 px-4 text-zinc-300 font-mono">{h.date}</td>
                <td className="py-2.5 px-4 text-[#e3e2e0]">{h.name}</td>
                <td className="py-2.5 px-4 text-zinc-400">{h.market}</td>
                {country === "all" && <td className="py-2.5 px-4 text-zinc-400">{h.country}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
