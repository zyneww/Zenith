"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { EconomicEvent } from "@/lib/market-data/types";

function getImportanceColor(importance: string): string {
  switch (importance) {
    case "high":
      return "text-red-400 bg-red-400/10";
    case "medium":
      return "text-yellow-400 bg-yellow-400/10";
    default:
      return "text-green-400 bg-green-400/10";
  }
}

function getImportanceLabel(t: any, importance: string): string {
  switch (importance) {
    case "high":
      return t("calendar.importance.high");
    case "medium":
      return t("calendar.importance.medium");
    default:
      return t("calendar.importance.low");
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function CalendarClient() {
  const t = useTranslations("markets");
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        const res = await fetch(`/api/calendar/economic?from=${today}&to=${nextWeek}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching calendar:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesImportance = filter === "all" || event.importance === filter;
    const matchesCurrency =
      currencyFilter === "all" || event.currency === currencyFilter;
    return matchesImportance && matchesCurrency;
  });

  const currencies = [...new Set(events.map((e) => e.currency))].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#00e5ff]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Importance Filter */}
        <div className="flex gap-2">
          {(["all", "high", "medium", "low"] as const).map((imp) => (
            <button
              key={imp}
              onClick={() => setFilter(imp)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === imp
                  ? "bg-[#00e5ff] text-[#0b0e14]"
                  : "bg-[#131722] text-gray-400 hover:text-white"
              }`}
            >
              {imp === "all"
                ? t("calendar.filter.all")
                : getImportanceLabel(t, imp)}
            </button>
          ))}
        </div>

        {/* Currency Filter */}
        <select
          value={currencyFilter}
          onChange={(e) => setCurrencyFilter(e.target.value)}
          className="bg-[#131722] text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-800 focus:border-[#00e5ff] focus:outline-none"
        >
          <option value="all">{t("calendar.filter.allCurrencies")}</option>
          {currencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </div>

      {/* Events Table */}
      <div className="bg-[#131722] rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                  {t("calendar.table.date")}
                </th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                  {t("calendar.table.time")}
                </th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                  {t("calendar.table.currency")}
                </th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">
                  {t("calendar.table.event")}
                </th>
                <th className="text-center text-gray-400 text-sm font-medium px-4 py-3">
                  {t("calendar.table.importance")}
                </th>
                <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">
                  {t("calendar.table.actual")}
                </th>
                <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">
                  {t("calendar.table.forecast")}
                </th>
                <th className="text-right text-gray-400 text-sm font-medium px-4 py-3">
                  {t("calendar.table.previous")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center text-gray-500 py-12"
                  >
                    {t("calendar.noEvents")}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-800/50 hover:bg-[#1a1f2e] transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-300 text-sm">
                      {formatDate(event.date)}
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm font-mono">
                      {event.time}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#1a1f2e] text-gray-300">
                        {event.currency}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white text-sm font-medium">
                      {event.event}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getImportanceColor(
                          event.importance
                        )}`}
                      >
                        {getImportanceLabel(t, event.importance)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white text-sm font-medium">
                      {event.actual || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 text-sm">
                      {event.forecast || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 text-sm">
                      {event.previous || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#131722] rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm mb-1">{t("calendar.stats.total")}</div>
          <div className="text-2xl font-bold text-white">{events.length}</div>
        </div>
        <div className="bg-[#131722] rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm mb-1">{t("calendar.stats.high")}</div>
          <div className="text-2xl font-bold text-red-400">
            {events.filter((e) => e.importance === "high").length}
          </div>
        </div>
        <div className="bg-[#131722] rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm mb-1">{t("calendar.stats.medium")}</div>
          <div className="text-2xl font-bold text-yellow-400">
            {events.filter((e) => e.importance === "medium").length}
          </div>
        </div>
        <div className="bg-[#131722] rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-sm mb-1">{t("calendar.stats.low")}</div>
          <div className="text-2xl font-bold text-green-400">
            {events.filter((e) => e.importance === "low").length}
          </div>
        </div>
      </div>
    </div>
  );
}
