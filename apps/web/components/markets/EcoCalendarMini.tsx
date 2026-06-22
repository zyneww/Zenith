"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ArrowUpRight, AlertTriangle } from "lucide-react";
import { EconomicEvent } from "@/lib/market-data/types";

function ImportanceBadge({ importance }: { importance: "low" | "medium" | "high" }) {
  const colors = {
    high: "bg-down-subtle text-down",
    medium: "bg-warning-subtle text-warning",
    low: "bg-accent-subtle text-accent",
  };
  const labels = { high: "Élevée", medium: "Moyenne", low: "Faible" };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${colors[importance]}`}>
      {labels[importance]}
    </span>
  );
}

export default function EcoCalendarMini() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/calendar/economic", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const data: EconomicEvent[] = await res.json();
        setEvents(data.slice(0, 5));
      } catch {
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card border border-surface rounded-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <h3 className="font-medium text-sm text-primary">Calendrier économique</h3>
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-raised rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-card border border-surface rounded-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <h3 className="font-medium text-sm text-primary">Calendrier économique</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 py-4 text-secondary text-xs">
          <AlertTriangle className="w-3 h-3" />
          <span>Aucun événement à venir</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-surface rounded-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent" />
          <h3 className="font-medium text-sm text-primary">Calendrier économique</h3>
        </div>
        <Link
          href="/markets/economic-calendar"
          className="text-xs text-accent hover:text-accent/80 transition-colors font-medium flex items-center gap-1"
        >
          Voir tout
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-1">
        {events.map((event, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-2 px-2 -mx-2 rounded-sm hover:bg-raised/50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="text-xs text-secondary font-mono tabular-nums whitespace-nowrap">
                {event.time || event.date?.slice(5, 10)}
              </div>
              <span className="text-xs text-primary truncate">{event.event}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-secondary font-medium uppercase">
                {event.currency}
              </span>
              <ImportanceBadge importance={event.importance} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
