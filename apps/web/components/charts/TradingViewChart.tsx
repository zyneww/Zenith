"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData, CandlestickSeries, HistogramSeries, LineSeries } from "lightweight-charts";

export type ChartType = "candlestick" | "area";

interface ChartProps {
  data: any[];
  volumeData?: any[];
  height?: number;
  chartType?: ChartType;
}

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d", "1W"] as const;
export type Timeframe = typeof TIMEFRAMES[number];

export default function TradingViewChart({ data, volumeData, height = 400, chartType = "candlestick" }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#0b0e14" },
        textColor: "#787b86",
      },
      grid: {
        vertLines: { color: "#1a1e26" },
        horzLines: { color: "#1a1e26" },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "#555", width: 1, style: 3, labelBackgroundColor: "#2a2e39" },
        horzLine: { color: "#555", width: 1, style: 3, labelBackgroundColor: "#2a2e39" },
      },
      rightPriceScale: {
        borderColor: "#1a1e26",
        borderVisible: false,
      },
      timeScale: {
        borderColor: "#1a1e26",
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      height,
    });

    chartRef.current = chart;

    if (chartType === "area") {
      const lineSeries = chart.addSeries(LineSeries, {
        color: "#00e5ff",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        priceFormat: { type: "price", precision: 4, minMove: 0.0001 },
      });
      lineSeriesRef.current = lineSeries;
    }

    if (chartType === "candlestick") {
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });

      candlestickSeriesRef.current = candlestickSeries;

      if (data.length > 0) {
        candlestickSeries.setData(data);
        chart.timeScale().fitContent();
      }

      if (volumeData && volumeData.length > 0) {
        const volumeSeries = chart.addSeries(HistogramSeries, {
          color: "#26a69a",
          priceFormat: { type: "volume" },
          priceScaleId: "",
        });
        volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.75, bottom: 0 } });
        volumeSeries.setData(volumeData);
        volumeSeriesRef.current = volumeSeries;
      }
    }

    if (chartType === "area" && data.length > 0) {
      const lineSeries = lineSeriesRef.current;
      if (lineSeries) {
        lineSeries.setData(data);
        chart.timeScale().fitContent();
      }
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    if (chartContainerRef.current) resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, volumeData, height, chartType]);

  useEffect(() => {
    if (candlestickSeriesRef.current && data.length > 0) {
      candlestickSeriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
    if (lineSeriesRef.current && data.length > 0) {
      lineSeriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: "100%", height }}
      className="rounded-lg overflow-hidden border border-surface"
    />
  );
}

export function TimeframeSelector({ active, onChange }: { active: Timeframe; onChange: (tf: Timeframe) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={`px-2.5 py-1 rounded text-xs font-medium transition ${
            tf === active ? "bg-accent text-white" : "border border-surface text-secondary hover:text-primary hover:border-secondary"
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
