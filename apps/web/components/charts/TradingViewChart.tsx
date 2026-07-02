"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickSeries, HistogramSeries, LineSeries, LineData, CrosshairMode } from "lightweight-charts";
import { useFormatPrice } from "@/lib/context/CurrencyContext";

export type ChartType = "candlestick" | "area";

export interface MASeries {
  period: number;
  data: { value: number; time: number }[];
  color: string;
}

interface ChartProps {
  data: any[];
  volumeData?: any[];
  maLines?: MASeries[];
  volumeMaData?: { value: number; time: number }[];
  height?: number;
  chartType?: ChartType;
}

export const TIMEFRAMES = ["1s", "1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1M"] as const;
export type Timeframe = typeof TIMEFRAMES[number];

function useChartColors() {
  return useMemo(() => ({
    background: "transparent",
    text: "#9b9a97",
    grid: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.06)",
    crosshair: "#555",
    up: "#4dab9a",
    down: "#ff7369",
    volumeUp: "rgba(77,171,154,0.3)",
    volumeDown: "rgba(255,115,105,0.3)",
    volumeMa: "rgba(77,166,255,0.4)",
    ma: "#4da6ff",
  }), []);
}

const MA_COLORS = ["#4da6ff", "#f59e0b", "#10b981", "#8b5cf6"];

export default function CandleChart({ data, volumeData, maLines, volumeMaData, height = 400, chartType = "candlestick" }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const formatPriceRef = useRef(useFormatPrice());
  const formatPrice = useFormatPrice();
  useEffect(() => { formatPriceRef.current = formatPrice; }, [formatPrice]);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const maSeriesRefs = useRef<Map<number, ISeriesApi<"Line">>>(new Map());
  const volumeMaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const colors = useChartColors();

  const setupChart = useCallback(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: colors.crosshair, width: 1, style: 3, labelBackgroundColor: "#2a2a2a" },
        horzLine: { color: colors.crosshair, width: 1, style: 3, labelBackgroundColor: "#2a2a2a" },
      },
      rightPriceScale: { borderColor: colors.border, borderVisible: false },
      timeScale: {
        borderColor: colors.border,
        borderVisible: false,
        timeVisible: true,
        secondsVisible: true,
      },
      height,
    });
    chartRef.current = chart;

    if (chartType === "candlestick") {
      const cs = chart.addSeries(CandlestickSeries, {
        upColor: colors.up,
        downColor: colors.down,
        borderUpColor: colors.up,
        borderDownColor: colors.down,
        wickUpColor: colors.up,
        wickDownColor: colors.down,
      });
      candlestickSeriesRef.current = cs;

      if (data.length > 0) {
        cs.setData(data);
        chart.timeScale().fitContent();
      }

      if (volumeData && volumeData.length > 0) {
        const vs = chart.addSeries(HistogramSeries, {
          color: colors.volumeUp,
          priceFormat: { type: "volume" },
          priceScaleId: "",
        });
        vs.priceScale().applyOptions({ scaleMargins: { top: 0.75, bottom: 0 } });
        vs.setData(volumeData);
        volumeSeriesRef.current = vs;
      }

      if (volumeMaData && volumeMaData.length > 0) {
        const vms = chart.addSeries(LineSeries, {
          color: colors.volumeMa,
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          priceScaleId: "",
        });
        vms.priceScale().applyOptions({ scaleMargins: { top: 0.75, bottom: 0 } });
        vms.setData(volumeMaData as any);
        volumeMaSeriesRef.current = vms;
      }
    }

    if (chartType === "area" && data.length > 0) {
      const ls = chart.addSeries(LineSeries, {
        color: colors.ma,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        priceFormat: { type: "price", precision: 4, minMove: 0.0001 },
      });
      lineSeriesRef.current = ls;
      ls.setData(data);
      chart.timeScale().fitContent();
    }

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) chart.applyOptions({ width: e.contentRect.width });
    });
    ro.observe(chartContainerRef.current);

    chartContainerRef.current.style.position = "relative";

    return () => { ro.disconnect(); chart.remove(); };
  }, []);

  useEffect(() => {
    const cleanup = setupChart();
    const chart = chartRef.current;

    if (chart && candlestickSeriesRef.current) {
      chart.subscribeCrosshairMove((param) => {
        const tooltip = tooltipRef.current;
        if (!tooltip) return;
        if (!param.time || !param.point || !chart) {
          tooltip.style.display = "none";
          return;
        }
        const data = param.seriesData.get(candlestickSeriesRef.current!) as any;
        if (!data) {
          tooltip.style.display = "none";
          return;
        }
        const d = data;
        tooltip.style.display = "block";
        const fmt = formatPriceRef.current;
        const o = d.open !== undefined ? fmt(d.open) : "—";
        const h = d.high !== undefined ? fmt(d.high) : "—";
        const l = d.low !== undefined ? fmt(d.low) : "—";
        const c = d.close !== undefined ? fmt(d.close) : "—";
        const t = param.time;
        const timeStr = typeof t === "number"
          ? new Date(t * 1000).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
          : String(t);
        tooltip.innerHTML = `
          <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 8px;font-size:11px;font-family:monospace;background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);padding:6px 10px;border-radius:6px;white-space:nowrap">
            <span style="color:#9b9a97">O:</span><span style="color:#e4e4e7;text-align:right">${o}</span>
            <span style="color:#9b9a97">H:</span><span style="color:#e4e4e7;text-align:right">${h}</span>
            <span style="color:#9b9a97">L:</span><span style="color:#e4e4e7;text-align:right">${l}</span>
            <span style="color:#9b9a97">C:</span><span style="color:#e4e4e7;text-align:right">${c}</span>
            <span style="color:#9b9a97">V:</span><span style="color:#e4e4e7;text-align:right">${d.volume !== undefined ? (d.volume as number).toLocaleString("fr-FR", { notation: "compact", compactDisplay: "short" }) : "—"}</span>
            <span style="color:#6b7280;grid-column:span 2;text-align:center;font-size:10px;border-top:1px solid rgba(255,255,255,0.06);padding-top:2px">${timeStr}</span>
          </div>
        `;
        const point = param.point;
        tooltip.style.left = Math.min(point.x, chartContainerRef.current!.clientWidth - 180) + "px";
        tooltip.style.top = Math.max(0, point.y - 120) + "px";
      });
    }

    return () => { cleanup?.(); };
  }, [data.length === 0, setupChart]);

  useEffect(() => {
    if (candlestickSeriesRef.current && data.length > 0) {
      candlestickSeriesRef.current.setData(data as any);
      chartRef.current?.timeScale().fitContent();
    }
    if (lineSeriesRef.current && data.length > 0) {
      lineSeriesRef.current.setData(data as any);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  useEffect(() => {
    if (volumeSeriesRef.current && volumeData && volumeData.length > 0) {
      volumeSeriesRef.current.setData(volumeData as any);
    }
  }, [volumeData]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    maSeriesRefs.current.forEach((s) => {
      if (s) chart.removeSeries(s);
    });
    maSeriesRefs.current.clear();

    if (!maLines || !maLines.length) return;
    for (const ma of maLines) {
      if (ma.data.length < 2) continue;
      const s = chart.addSeries(LineSeries, {
        color: ma.color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        title: `MA${ma.period}`,
      });
      s.setData(ma.data as any);
      maSeriesRefs.current.set(ma.period, s);
    }

    return () => maSeriesRefs.current.clear();
  }, [maLines]);

  useEffect(() => {
    if (volumeMaSeriesRef.current && volumeMaData && volumeMaData.length > 0) {
      volumeMaSeriesRef.current.setData(volumeMaData as any);
    }
  }, [volumeMaData]);

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height }} className="relative rounded-lg overflow-hidden border border-surface">
      {maLines && maLines.length > 0 && (
        <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-2 bg-canvas/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono pointer-events-none">
          {maLines.map((ma) => {
            const lastVal = ma.data[ma.data.length - 1]?.value;
            return (
              <span key={ma.period} style={{ color: ma.color }}>
                MA({ma.period}): {lastVal !== undefined ? lastVal.toFixed(2) : "—"}
              </span>
            );
          })}
        </div>
      )}
      <div ref={tooltipRef} className="pointer-events-none z-50" style={{ display: "none", position: "absolute" }} />
    </div>
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
