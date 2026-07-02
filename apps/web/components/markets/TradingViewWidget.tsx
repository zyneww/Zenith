"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView: any;
  }
}

let scriptLoading = false;
const pendingCallbacks: Array<() => void> = [];

function loadTVScript(cb: () => void) {
  if (typeof window.TradingView !== "undefined") { cb(); return; }
  pendingCallbacks.push(cb);
  if (scriptLoading) return;
  scriptLoading = true;
  const s = document.createElement("script");
  s.src = "https://s3.tradingview.com/tv.js";
  s.async = true;
  s.onload = () => {
    scriptLoading = false;
    const cbs = pendingCallbacks.slice();
    pendingCallbacks.length = 0;
    cbs.forEach((fn) => fn());
  };
  s.onerror = () => {
    scriptLoading = false;
    pendingCallbacks.length = 0;
  };
  document.body.appendChild(s);
}

interface TVWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: string;
  height?: number;
}

export default function TradingViewWidget({
  symbol = "BINANCE:BTCUSDT",
  interval = "60",
  theme = "dark",
  height = 400,
}: TVWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (widgetRef.current) {
      try { widgetRef.current.remove(); } catch {}
      widgetRef.current = null;
    }
    container.innerHTML = "";

    const loadingEl = document.createElement("div");
    loadingEl.style.cssText = "display:flex;align-items:center;justify-content:center;height:100%;font-size:12px;color:#666;";
    loadingEl.textContent = "Chargement du graphique…";
    container.appendChild(loadingEl);

    loadTVScript(() => {
      if (!containerRef.current) return;
      if (loadingEl.parentNode) loadingEl.remove();

      const id = `tv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const wrapper = document.createElement("div");
      wrapper.id = id;
      wrapper.style.width = "100%";
      wrapper.style.height = "100%";
      containerRef.current.appendChild(wrapper);

      widgetRef.current = new window.TradingView.widget({
        container_id: id,
        autosize: true,
        symbol,
        interval,
        theme,
        style: "1",
        locale: "fr",
        toolbar_bg: "#1a1a1a",
        hide_top_toolbar: false,
        hide_legend: false,
        allow_symbol_change: false,
        save_image: false,
        studies: [],
        disabled_features: [
          "use_localstorage_for_settings",
          "header_symbol_search",
          "save_chart_properties",
        ],
        enabled_features: [
          "left_toolbar",
          "header_widget",
          "header_indicators",
          "header_fullscreen_button",
          "header_screenshot",
          "header_compare",
          "header_settings",
        ],
        backgroundColor: "#1a1a1a",
        gridColor: "rgba(255,255,255,0.03)",
        overrides: {
          "paneProperties.background": "#1a1a1a",
          "paneProperties.vertGridProperties.color": "rgba(255,255,255,0.03)",
          "paneProperties.horzGridProperties.color": "rgba(255,255,255,0.03)",
          "mainSeriesProperties.candleStyle.upColor": "#4dab9a",
          "mainSeriesProperties.candleStyle.downColor": "#ff7369",
          "mainSeriesProperties.candleStyle.borderUpColor": "#4dab9a",
          "mainSeriesProperties.candleStyle.borderDownColor": "#ff7369",
          "mainSeriesProperties.candleStyle.wickUpColor": "#4dab9a",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ff7369",
        },
      });
    });

    return () => {
      if (widgetRef.current) {
        try { widgetRef.current.remove(); } catch {}
        widgetRef.current = null;
      }
      if (container) container.innerHTML = "";
    };
  }, [symbol, interval, theme]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height }}
      className="rounded-lg overflow-hidden border border-surface"
    />
  );
}
