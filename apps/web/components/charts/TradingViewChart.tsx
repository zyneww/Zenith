"use client";

import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData, CandlestickSeries, HistogramSeries } from "lightweight-charts";

interface ChartProps {
  data: any[];
  volumeData?: any[];
  height?: number;
}

export default function TradingViewChart({ data, volumeData, height = 400 }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#131722" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#1f2937",
      },
      timeScale: {
        borderColor: "#1f2937",
      },
      height,
    });

    chartRef.current = chart;

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
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "",
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      });
      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, volumeData, height]);

  useEffect(() => {
    if (candlestickSeriesRef.current && data.length > 0) {
      candlestickSeriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div 
      ref={chartContainerRef} 
      style={{ width: "100%", height }}
      className="rounded-lg overflow-hidden border border-[#1f2937]"
    />
  );
}
