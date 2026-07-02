"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { tokens } from "@/lib/theme/bybit";
import { useFormatPrice } from "@/lib/context/CurrencyContext";
import { Maximize2, Download, Link, Calendar } from "lucide-react";

export type ChartPreset = "24h" | "7d" | "30d" | "90d" | "180d" | "1y" | "max";

interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

interface Props {
  assetSlug: string;
  assetType: string;
  currentPrice?: number;
}

const PRESETS: { value: ChartPreset; label: string }[] = [
  { value: "24h", label: "24H" },
  { value: "7d", label: "7J" },
  { value: "30d", label: "1M" },
  { value: "90d", label: "3M" },
  { value: "180d", label: "6M" },
  { value: "1y", label: "1A" },
  { value: "max", label: "MAX" },
];

export default function CoinGeckoChart({ assetSlug, assetType, currentPrice }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const initRan = useRef(false);
  const [data, setData] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState<ChartPreset>("24h");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const formatPrice = useFormatPrice();

  const fetchData = useCallback(async (preset: ChartPreset) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market/ohlcv/${assetSlug}?preset=${preset}&type=${assetType}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.points ?? []);
        return;
      }
      setData([]);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [assetSlug, assetType]);

  const fetchCustom = useCallback(async (from: string, to: string) => {
    const fromTs = Math.floor(new Date(from).getTime() / 1000);
    const toTs = Math.floor(new Date(to).getTime() / 1000);
    if (!fromTs || !toTs || fromTs >= toTs) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/market/ohlcv/${assetSlug}?from=${fromTs}&to=${toTs}&type=${assetType}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.points ?? []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [assetSlug, assetType]);

  useEffect(() => { fetchData("24h"); }, [fetchData]);

  const lastPrice = currentPrice ?? data[data.length - 1]?.c ?? 0;
  const firstPrice = data[0]?.c ?? lastPrice;
  const changePct = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
  const isUp = changePct >= 0;

  const chartColors = useMemo(() => ({
    green: tokens.color.accent.green,
    red: tokens.color.accent.red,
    text: tokens.color.text.secondary,
    grid: "rgba(255,255,255,0.03)",
  }), []);

  const color = isUp ? chartColors.green : chartColors.red;

  const areaData = useMemo(() => data.map((p: Candle) => ({ x: p.t * 1000, y: p.c })), [data]);

  const showChart = !loading && areaData.length > 0;

  // Init chart once when data first becomes available
  useEffect(() => {
    if (!showChart || !chartRef.current || initRan.current) return;

    let destroyed = false;
    (async () => {
      const ApexCharts = (await import("apexcharts")).default;
      if (destroyed || !chartRef.current) return;

      const options: any = {
        series: [{ name: "Prix", data: areaData }],
        chart: {
          type: "area",
          height: 640,
          toolbar: { show: false },
          zoom: { enabled: true, type: "x" as const },
          foreColor: chartColors.text,
          fontFamily: "Inter, sans-serif",
        },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2, colors: [color] },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.35,
            opacityTo: 0.05,
            stops: [0, 100],
            colorStops: [
              { offset: 0, color, opacity: 0.35 },
              { offset: 100, color, opacity: 0.05 },
            ],
          },
        },
        grid: {
          borderColor: chartColors.grid,
          strokeDashArray: 4,
          xaxis: { lines: { show: true } },
          yaxis: { lines: { show: true } },
        },
        xaxis: {
          type: "datetime",
          labels: {
            datetimeUTC: false,
            format: "dd MMM HH:mm",
            style: { colors: chartColors.text, fontSize: "10px" },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
          crosshairs: { show: true },
        },
        yaxis: {
          labels: {
            formatter: (val: number) => formatPrice(val),
            style: { colors: chartColors.text, fontSize: "11px" },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        tooltip: {
          theme: "dark",
          x: { format: "dd MMM yyyy HH:mm" },
          y: { formatter: (val: number) => formatPrice(val) },
        },
        annotations: currentPrice ? {
          points: [{
            x: new Date().getTime(),
            y: currentPrice,
            marker: { size: 5, fillColor: color, strokeColor: "#fff", strokeWidth: 2 },
            label: {
              borderColor: color,
              style: { color: "#fff", background: color },
              text: formatPrice(currentPrice),
            },
          }],
        } : undefined,
      };

      const chart = new ApexCharts(chartRef.current, options);
      await chart.render();
      chartInstanceRef.current = chart;
      initRan.current = true;
    })();

    return () => {
      destroyed = true;
      if (chartInstanceRef.current) {
        try { chartInstanceRef.current.destroy(); } catch {}
        chartInstanceRef.current = null;
      }
      initRan.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChart]);

  // Update chart series and options without destroying
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart || !showChart) return;
    chart.updateSeries([{ data: areaData }]);
    chart.updateOptions({
      colors: [color],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.05,
          stops: [0, 100],
          colorStops: [
            { offset: 0, color, opacity: 0.35 },
            { offset: 100, color, opacity: 0.05 },
          ],
        },
      },
      annotations: currentPrice ? {
        points: [{
          x: new Date().getTime(),
          y: currentPrice,
          marker: { size: 5, fillColor: color, strokeColor: "#fff", strokeWidth: 2 },
          label: {
            borderColor: color,
            style: { color: "#fff", background: color },
            text: formatPrice(currentPrice),
          },
        }],
      } : undefined,
    });
  }, [areaData, color, currentPrice, showChart, formatPrice]);

  const exportChart = useCallback(async (format: "png" | "svg" | "jpeg") => {
    if (!chartInstanceRef.current) return;
    try {
      const dataUri = await chartInstanceRef.current.dataURI();
      if (format === "svg") {
        const blob = new Blob([dataUri], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${assetSlug}-chart.svg`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#0B0E11";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const mime = format === "jpeg" ? "image/jpeg" : "image/png";
        const ext = format === "jpeg" ? "jpg" : "png";
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${assetSlug}-chart.${ext}`;
          a.click();
          URL.revokeObjectURL(url);
        }, mime, 0.92);
      };
      img.src = dataUri;
    } catch {}
  }, [assetSlug]);

  const copyLink = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("range", activePreset);
    const text = url.toString();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
    }
  }, [activePreset]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    chartRef.current?.requestFullscreen();
  }, []);

  const handlePresetClick = useCallback((preset: ChartPreset) => {
    setActivePreset(preset);
    setShowCustom(false);
    fetchData(preset);
  }, [fetchData]);

  const handleCustomApply = useCallback(() => {
    if (customFrom && customTo) fetchCustom(customFrom, customTo);
  }, [customFrom, customTo, fetchCustom]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="chart-container" style={{ backgroundColor: tokens.color.bg.dark }}>
      {/* Range picker bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 flex-wrap" style={{ borderBottom: `1px solid ${tokens.color.border.default}` }}>
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePresetClick(p.value)}
            className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition"
            style={{
              backgroundColor: activePreset === p.value && !showCustom ? tokens.color.accent.primary : tokens.color.bg.raised,
              color: activePreset === p.value && !showCustom ? "#000" : tokens.color.text.secondary,
            }}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom((v) => !v)}
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition"
          style={{
            backgroundColor: showCustom ? tokens.color.accent.primary : tokens.color.bg.raised,
            color: showCustom ? "#000" : tokens.color.text.secondary,
          }}
        >
          <Calendar className="w-3 h-3" />
          Perso
        </button>

        {showCustom && (
          <div className="flex items-center gap-1.5 ml-1">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded px-2 py-1 text-[10px] font-mono focus:outline-none"
              style={{ backgroundColor: tokens.color.bg.raised, border: `1px solid ${tokens.color.border.default}`, color: tokens.color.text.primary }} />
            <span className="text-[10px]" style={{ color: tokens.color.text.muted }}>→</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
              className="rounded px-2 py-1 text-[10px] font-mono focus:outline-none"
              style={{ backgroundColor: tokens.color.bg.raised, border: `1px solid ${tokens.color.border.default}`, color: tokens.color.text.primary }} />
            <button onClick={handleCustomApply}
              className="px-2 py-1 text-[10px] font-bold rounded"
              style={{ backgroundColor: tokens.color.accent.primary, color: "#000" }}>
              OK
            </button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs font-bold tabular-nums" style={{ color }}>{formatPrice(lastPrice)}</span>
          <span className={`text-[10px] font-bold ${isUp ? "text-up" : "text-down"}`}>
            {changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center" style={{ height: 640 }}>
          <div className="animate-pulse w-4 h-4 rounded-full" style={{ backgroundColor: tokens.color.accent.primary }} />
        </div>
      )}

      {/* No data state */}
      {!loading && areaData.length === 0 && (
        <div className="flex items-center justify-center" style={{ height: 640 }}>
          <span className="text-xs" style={{ color: tokens.color.text.muted }}>Aucune donnée disponible</span>
        </div>
      )}

      {/* Chart — only rendered when data ready */}
      {showChart && <div ref={chartRef} className="w-full" style={{ height: 640 }} />}

      {/* Toolbar */}
      <div className="flex items-center justify-end gap-1 px-3 py-1.5" style={{ borderTop: `1px solid ${tokens.color.border.default}`, backgroundColor: tokens.color.bg.panel }}>
        <div className="relative" ref={exportRef}>
          <button onClick={() => setExportOpen((v) => !v)} className="p-1.5 rounded transition" style={{ color: tokens.color.text.muted }} title="Exporter">
            <Download className="w-3.5 h-3.5" />
          </button>
          {exportOpen && (
            <div className="absolute bottom-full right-0 mb-1 z-20">
              <div className="flex flex-col gap-0.5 p-1 rounded shadow-lg" style={{ backgroundColor: tokens.color.bg.card, border: `1px solid ${tokens.color.border.default}` }}>
                {(["png", "svg", "jpeg"] as const).map((fmt) => (
                  <button key={fmt} onClick={() => { exportChart(fmt); setExportOpen(false); }}
                    className="px-2.5 py-1 text-[10px] font-bold uppercase text-left rounded transition hover:bg-raised"
                    style={{ color: tokens.color.text.secondary }}>
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={copyLink} className="p-1.5 rounded transition" style={{ color: tokens.color.text.muted }} title="Copier le lien">
          <Link className="w-3.5 h-3.5" />
        </button>

        <button onClick={toggleFullscreen} className="p-1.5 rounded transition" style={{ color: tokens.color.text.muted }} title="Plein écran">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
