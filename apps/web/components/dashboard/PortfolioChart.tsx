"use client";

import { useEffect, useRef } from "react";
import { createChart, type IChartApi, LineSeries } from "lightweight-charts";

const CHART_COLORS = {
  bg: "#ffffff",
  text: "#615d59",
  grid: "rgba(0,0,0,0.06)",
  line: "#0075de",
};

export default function PortfolioChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: CHART_COLORS.bg },
        textColor: CHART_COLORS.text,
      },
      grid: {
        vertLines: { color: CHART_COLORS.grid },
        horzLines: { color: CHART_COLORS.grid },
      },
      rightPriceScale: {
        borderColor: CHART_COLORS.grid,
      },
      timeScale: {
        borderColor: CHART_COLORS.grid,
        timeVisible: true,
      },
      autoSize: true,
    });

    chartRef.current = chart;

    const lineSeries = chart.addSeries(LineSeries, {
      color: CHART_COLORS.line,
      lineWidth: 2,
      title: "Valeur du Portfolio",
    });

    const data = [];
    const now = new Date();
    let value = 100000;

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const time = date.toISOString().split("T")[0];

      const change = (Math.random() - 0.45) * 2000;
      value += change;

      data.push({ time: time, value: Math.round(value * 100) / 100 });
    }

    lineSeries.setData(data);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, []);

  return (
    <div className="bg-card border border-surface rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary font-semibold text-lg">Évolution du Portfolio</h3>
        <div className="flex gap-2">
          {["1J", "1S", "1M", "3M", "1A", "Tout"].map((period) => (
            <button
              key={period}
              aria-label={`Période ${period}`}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                period === "1M"
                  ? "bg-accent text-on-accent"
                  : "bg-canvas text-secondary hover:text-primary"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="h-[300px] w-full" />
    </div>
  );
}
