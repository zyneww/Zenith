"use client";

import { useState, useMemo } from "react";
import { RefreshCw, CalendarOff } from "lucide-react";
import type { CalendarEvent, CalendarType } from "@/lib/calendar/types";

type AvailableType = { value: CalendarType; label: string };

interface Props {
  type: CalendarType;
  data: CalendarEvent[];
  from: string;
  to: string;
  availableTypes: AvailableType[];
}

const ACCENT = "#4da6ff";

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  EU: "🇪🇺",
  JP: "🇯🇵",
  GB: "🇬🇧",
  DE: "🇩🇪",
  FR: "🇫🇷",
  CN: "🇨🇳",
  ES: "🇪🇸",
  CA: "🇨🇦",
  CO: "🇨🇴",
};

const COUNTRIES = ["US", "EU", "JP", "GB", "DE", "FR", "CN"];
const IMPORTANCES = [
  { value: "high", label: "Haute" },
  { value: "medium", label: "Moyenne" },
  { value: "low", label: "Faible" },
] as const;

export function CalendarClient({ type, data, from, to, availableTypes }: Props) {
  const [activeType, setActiveType] = useState<CalendarType>(type);
  const [fromState, setFromState] = useState(from);
  const [toState, setToState] = useState(to);
  const [countries, setCountries] = useState<string[]>([]);
  const [importances, setImportances] = useState<string[]>(["high", "medium", "low"]);
  const [rotating, setRotating] = useState(false);

  function changeType(next: CalendarType) {
    setActiveType(next);
    const url = new URL(window.location.href);
    url.searchParams.set("type", next);
    window.location.href = url.toString();
  }

  function applyFilters() {
    const url = new URL(window.location.href);
    url.searchParams.set("type", activeType);
    url.searchParams.set("from", fromState);
    url.searchParams.set("to", toState);
    window.location.href = url.toString();
  }

  function onRefresh() {
    setRotating(true);
    setTimeout(() => setRotating(false), 700);
  }

  function toggleCountry(c: string) {
    setCountries((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  function toggleImportance(v: string) {
    setImportances((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);
  }

  const filtered = useMemo(() => {
    if (activeType === "economic") {
      return (data as any[]).filter((e) => {
        if (countries.length && !countries.includes(e.countryCode)) return false;
        if (importances.length && !importances.includes(e.importance)) return false;
        return true;
      });
    }
    return data;
  }, [data, activeType, countries, importances]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Calendrier</h1>
          <p className="text-secondary">
            Événements économiques, résultats, dividendes, IPOs, splits et jours fériés.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-md border border-surface bg-card px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-raised transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${rotating ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {availableTypes.map((t) => {
          const active = t.value === activeType;
          return (
            <button
              key={t.value}
              onClick={() => changeType(t.value)}
              style={active ? { backgroundColor: ACCENT } : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                active
                  ? "text-on-accent border-transparent"
                  : "bg-card border-surface text-secondary hover:text-primary hover:border-hover"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-surface bg-card p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-tertiary uppercase tracking-wide">Du</span>
          <input
            type="date"
            value={fromState}
            onChange={(e) => setFromState(e.target.value)}
            className="rounded-sm bg-input border border-surface px-2 py-1 text-sm text-primary placeholder-secondary focus:border-accent"
            style={{ colorScheme: "dark" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-tertiary uppercase tracking-wide">Au</span>
          <input
            type="date"
            value={toState}
            onChange={(e) => setToState(e.target.value)}
            className="rounded-sm bg-input border border-surface px-2 py-1 text-sm text-primary placeholder-secondary focus:border-accent"
            style={{ colorScheme: "dark" }}
          />
        </div>

        {activeType === "economic" && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-tertiary uppercase tracking-wide mr-1">Pays</span>
              {COUNTRIES.map((c) => {
                const active = countries.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCountry(c)}
                    className={`rounded-full px-2 py-0.5 text-xs border transition-colors ${
                      active
                        ? "border-transparent text-on-accent"
                        : "bg-raised border-surface text-tertiary hover:text-primary"
                    }`}
                    style={active ? { backgroundColor: ACCENT } : undefined}
                    title={c}
                  >
                    <span className="mr-1">{COUNTRY_FLAGS[c] || "🏳️"}</span>
                    {c}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-tertiary uppercase tracking-wide mr-1">Impact</span>
              {IMPORTANCES.map((im) => {
                const active = importances.includes(im.value);
                return (
                  <button
                    key={im.value}
                    onClick={() => toggleImportance(im.value)}
                    className={`rounded-full px-2 py-0.5 text-xs border transition-colors ${
                      active
                        ? "border-transparent text-on-accent"
                        : "bg-raised border-surface text-tertiary hover:text-primary"
                    }`}
                    style={active ? { backgroundColor: ACCENT } : undefined}
                  >
                    {im.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <button
          onClick={applyFilters}
          className="ml-auto rounded-md px-3 py-1.5 text-sm font-medium text-on-accent"
          style={{ backgroundColor: ACCENT }}
        >
          Appliquer
        </button>
      </div>

      {/* Table */}
      <CalendarTable type={activeType} data={filtered} />

      <div className="text-xs text-tertiary">
        {filtered.length} événement{filtered.length > 1 ? "s" : ""} •{" "}
        {fromState} → {toState} • Source: cache/Finnhub/mock
      </div>
    </div>
  );
}

function CalendarTable({ type, data }: { type: CalendarType; data: CalendarEvent[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-lg border border-surface bg-card">
        <CalendarOff className="w-10 h-10 text-tertiary mb-3" />
        <p className="text-secondary">Aucun événement prévu sur cette période</p>
      </div>
    );
  }

  const headers = tableHeaders(type);
  const rows = data.map((row) => tableRow(type, row));

  return (
    <div className="overflow-x-auto rounded-lg border border-surface bg-card">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wide text-tertiary">
          <tr className="border-b border-surface">
            {headers.map((h, i) => (
              <th
                key={i}
                className={`px-3 py-2 text-left font-medium ${i === 0 ? "pl-4" : ""} ${i === headers.length - 1 ? "pr-4" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, ri) => (
            <tr
              key={ri}
              className="border-b border-surface last:border-b-0 hover:bg-raised transition-colors"
            >
              {cells.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-3 py-2.5 align-middle ${ci === 0 ? "pl-4" : ""} ${ci === cells.length - 1 ? "pr-4" : ""}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function tableHeaders(type: CalendarType): string[] {
  switch (type) {
    case "economic":
      return ["Heure", "Pays", "Événement", "Impact", "Actuel", "Prévu", "Précédent"];
    case "earnings":
      return ["Date", "Heure", "Symbole", "Entreprise", "Période", "BPA", "Revenu"];
    case "dividends":
      return ["Ex-date", "Symbole", "Entreprise", "Dividende", "Devise", "Fréquence"];
    case "ipos":
      return ["Date", "Symbole", "Entreprise", "Exchange", "Fourchette", "Actions", "Statut"];
    case "splits":
      return ["Date", "Symbole", "Entreprise", "Ratio"];
    case "holidays":
      return ["Date", "Nom", "Pays", "Exchange"];
  }
}

function importanceChip(imp: "high" | "medium" | "low") {
  if (imp === "high") {
    return <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-down bg-down-subtle">Haute</span>;
  }
  if (imp === "medium") {
    return <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-warning bg-warning-subtle">Moyenne</span>;
  }
  return <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-tertiary bg-raised">Faible</span>;
}

function flagCell(code: string) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden>{COUNTRY_FLAGS[code] || "🏳️"}</span>
      <span className="text-secondary text-xs">{code}</span>
    </span>
  );
}

function fmtNum(n: number | undefined | null): string {
  if (n === undefined || n === null) return "—";
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1e6).toFixed(1)}M`;
  return String(n);
}

function fmtValue(v: string | number | undefined): string {
  if (v === undefined || v === null || v === "") return "—";
  if (typeof v === "number") return fmtNum(v);
  return String(v);
}

function fmtMoney(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  return `$${n.toFixed(2)}`;
}

function statusChip(status: string) {
  const cls =
    status === "priced" ? "text-accent"
    : status === "filed" ? "text-warning"
    : "text-tertiary";
  return <span className={`text-xs font-medium ${cls}`}>{status}</span>;
}

function tableRow(type: CalendarType, row: CalendarEvent): React.ReactNode[] {
  switch (type) {
    case "economic": {
      const e = row as any;
      return [
        <span key="t" className="text-secondary tabular-nums">{e.time || "—"}</span>,
        flagCell(e.countryCode),
        <span key="e" className="text-primary">{e.event}</span>,
        importanceChip(e.importance),
        <span key="a" className="text-primary tabular-nums">{fmtValue(e.actual)}</span>,
        <span key="f" className="text-secondary tabular-nums">{fmtValue(e.forecast)}</span>,
        <span key="p" className="text-tertiary tabular-nums">{fmtValue(e.previous)}</span>,
      ];
    }
    case "earnings": {
      const e = row as any;
      return [
        <span key="d" className="text-secondary tabular-nums">{e.date}</span>,
        <span key="h" className="text-tertiary tabular-nums">{e.hour || "—"}</span>,
        <span key="s" className="font-mono font-bold text-primary">{e.symbol}</span>,
        <span key="n" className="text-secondary">{e.name}</span>,
        <span key="fp" className="text-tertiary text-xs">{e.fiscalPeriod}</span>,
        <span key="eps" className="tabular-nums">
          {e.epsActual !== undefined ? (
            <span className="text-primary">{e.epsActual.toFixed(2)}</span>
          ) : (
            <span className="text-secondary">—</span>
          )}
          <span className="text-tertiary"> / </span>
          <span className="text-secondary">{e.epsEstimate?.toFixed(2) ?? "—"}</span>
        </span>,
        <span key="rev" className="tabular-nums">
          {e.revenueActual !== undefined ? (
            <span className="text-primary">{fmtNum(e.revenueActual)}</span>
          ) : (
            <span className="text-secondary">—</span>
          )}
          <span className="text-tertiary"> / </span>
          <span className="text-secondary">{fmtNum(e.revenueEstimate)}</span>
        </span>,
      ];
    }
    case "dividends": {
      const e = row as any;
      return [
        <span key="d" className="text-secondary tabular-nums">{e.exDate}</span>,
        <span key="s" className="font-mono font-bold text-primary">{e.symbol}</span>,
        <span key="n" className="text-secondary">{e.name}</span>,
        <span key="div" className="text-up tabular-nums font-medium">{fmtMoney(e.dividend)}</span>,
        <span key="cur" className="text-tertiary">{e.currency || "USD"}</span>,
        <span key="fr" className="text-tertiary text-xs">{e.frequency}</span>,
      ];
    }
    case "ipos": {
      const e = row as any;
      const range = (e.priceRangeLow !== undefined && e.priceRangeHigh !== undefined)
        ? `$${e.priceRangeLow}–$${e.priceRangeHigh}`
        : "—";
      return [
        <span key="d" className="text-secondary tabular-nums">{e.date}</span>,
        <span key="s" className="font-mono font-bold text-primary">{e.symbol}</span>,
        <span key="n" className="text-secondary">{e.name}</span>,
        <span key="ex" className="text-tertiary text-xs">{e.exchange}</span>,
        <span key="r" className="text-secondary tabular-nums">{range}</span>,
        <span key="sh" className="text-tertiary tabular-nums">{e.shares ? fmtNum(e.shares) : "—"}</span>,
        statusChip(e.status),
      ];
    }
    case "splits": {
      const e = row as any;
      return [
        <span key="d" className="text-secondary tabular-nums">{e.date}</span>,
        <span key="s" className="font-mono font-bold text-primary">{e.symbol}</span>,
        <span key="n" className="text-secondary">{e.name}</span>,
        <span key="r" className="text-accent font-mono">{e.ratio}</span>,
      ];
    }
    case "holidays": {
      const e = row as any;
      return [
        <span key="d" className="text-secondary tabular-nums">{e.date}</span>,
        <span key="n" className="text-primary">{e.name}</span>,
        flagCell(e.countryCode),
        <span key="ex" className="text-tertiary text-xs">{e.exchange || "—"}</span>,
      ];
    }
  }
}
