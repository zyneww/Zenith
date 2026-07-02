"use client";

import { useMemo, useState, useRef } from "react";
import type { DepthData } from "@/lib/realtime/SocketContext";
import { useFormatPrice } from "@/lib/context/CurrencyContext";

interface DepthChartProps {
  depth: DepthData | null;
  currentPrice?: number;
}

interface Point {
  price: number;
  cumQty: number;
}

const VIEW_W = 800;
const VIEW_H = 300;
const PAD = { top: 20, right: 60, bottom: 30, left: 10 };

export default function DepthChart({ depth, currentPrice }: DepthChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number; price: number; cumQty: number; side: string } | null>(null);
  const formatPrice = useFormatPrice();

  const { bidPoints, askPoints, maxCum, minX, maxX, midPrice } = useMemo(() => {
    if (!depth || (!depth.bids.length && !depth.asks.length)) {
      return { bidPoints: [] as Point[], askPoints: [] as Point[], maxCum: 0, minX: 0, maxX: 0, midPrice: currentPrice ?? 0 };
    }

    const bids = depth.bids
      .map((b) => ({ price: parseFloat(b[0]), qty: parseFloat(b[1]) }))
      .filter((b) => b.qty > 0)
      .sort((a, b) => a.price - b.price);

    const asks = depth.asks
      .map((a) => ({ price: parseFloat(a[0]), qty: parseFloat(a[1]) }))
      .filter((a) => a.qty > 0)
      .sort((a, b) => a.price - b.price);

    const mid = currentPrice ?? (bids.length && asks.length ? (bids[bids.length - 1].price + asks[0].price) / 2 : 0);

    // Bids: cumulative from lowest price up to mid (left side)
    let cumBid = 0;
    const bidPts: Point[] = [];
    for (const b of bids) {
      cumBid += b.qty;
      if (b.price <= mid) {
        bidPts.push({ price: b.price, cumQty: cumBid });
      }
    }
    // Pad to mid price with max cum
    if (bidPts.length > 0 && bidPts[bidPts.length - 1].price < mid) {
      bidPts.push({ price: mid, cumQty: cumBid });
    }

    // Asks: cumulative from mid price up to highest (right side)
    let cumAsk = 0;
    const askPtsReversed: Point[] = [];
    for (let i = asks.length - 1; i >= 0; i--) {
      const a = asks[i];
      cumAsk += a.qty;
      if (a.price >= mid) {
        askPtsReversed.push({ price: a.price, cumQty: cumAsk });
      }
    }
    const askPts = askPtsReversed.reverse();
    if (askPts.length > 0 && askPts[0].price > mid) {
      askPts.unshift({ price: mid, cumQty: 0 });
    }

    const allCum = [...bidPts.map((p) => p.cumQty), ...askPts.map((p) => p.cumQty)];
    const maxC = allCum.length > 0 ? Math.max(...allCum) : 0;

    const minP = bidPts.length > 0 ? bidPts[0].price : mid;
    const maxP = askPts.length > 0 ? askPts[askPts.length - 1].price : mid;

    return { bidPoints: bidPts, askPoints: askPts, maxCum: maxC, minX: minP, maxX: maxP, midPrice: mid };
  }, [depth, currentPrice]);

  if (!depth || (bidPoints.length === 0 && askPoints.length === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center text-secondary text-xs">
        Profondeur indisponible - Données non disponibles
      </div>
    );
  }

  const chartW = VIEW_W - PAD.left - PAD.right;
  const chartH = VIEW_H - PAD.top - PAD.bottom;

  const xScale = (p: number) => PAD.left + ((p - minX) / (maxX - minX || 1)) * chartW;
  const yScale = (q: number) => VIEW_H - PAD.bottom - (q / (maxCum || 1)) * chartH;

  // Build step polygon for bids (left side)
  const bidPoly: string[] = [];
  if (bidPoints.length > 0) {
    bidPoly.push(`${xScale(bidPoints[0].price)},${yScale(0)}`);
    for (let i = 0; i < bidPoints.length; i++) {
      const p = bidPoints[i];
      const nextP = bidPoints[i + 1];
      bidPoly.push(`${xScale(p.price)},${yScale(p.cumQty)}`);
      if (nextP) {
        bidPoly.push(`${xScale(nextP.price)},${yScale(p.cumQty)}`);
      }
    }
    bidPoly.push(`${xScale(bidPoints[bidPoints.length - 1].price)},${yScale(0)}`);
  }

  // Build step polygon for asks (right side)
  const askPoly: string[] = [];
  if (askPoints.length > 0) {
    askPoly.push(`${xScale(askPoints[0].price)},${yScale(0)}`);
    for (let i = 0; i < askPoints.length; i++) {
      const p = askPoints[i];
      const nextP = askPoints[i + 1];
      askPoly.push(`${xScale(p.price)},${yScale(p.cumQty)}`);
      if (nextP) {
        askPoly.push(`${xScale(nextP.price)},${yScale(p.cumQty)}`);
      }
    }
    askPoly.push(`${xScale(askPoints[askPoints.length - 1].price)},${yScale(0)}`);
  }

  // Grid lines
  const yTicks = 5;
  const yGrid = Array.from({ length: yTicks + 1 }, (_, i) => (maxCum / yTicks) * i);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * VIEW_W;
    const price = minX + ((svgX - PAD.left) / chartW) * (maxX - minX);

    // Find nearest point
    let nearest: { price: number; cumQty: number; side: string } | null = null;
    let minDist = Infinity;

    for (const p of bidPoints) {
      const dist = Math.abs(p.price - price);
      if (dist < minDist) {
        minDist = dist;
        nearest = { price: p.price, cumQty: p.cumQty, side: "Bids" };
      }
    }
    for (const p of askPoints) {
      const dist = Math.abs(p.price - price);
      if (dist < minDist) {
        minDist = dist;
        nearest = { price: p.price, cumQty: p.cumQty, side: "Asks" };
      }
    }

    if (nearest) {
      setHover({
        x: e.clientX - rect.left + 12,
        y: e.clientY - rect.top - 12,
        price: nearest.price,
        cumQty: nearest.cumQty,
        side: nearest.side,
      });
    }
  };

  return (
    <div className="relative h-[300px] w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-full"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* Grid lines */}
        {yGrid.map((q, i) => (
          <line
            key={i}
            x1={PAD.left}
            y1={yScale(q)}
            x2={VIEW_W - PAD.right}
            y2={yScale(q)}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={1}
          />
        ))}

        {/* Y axis labels */}
        {yGrid.map((q, i) => (
          <text
            key={`yl-${i}`}
            x={VIEW_W - PAD.right + 4}
            y={yScale(q)}
            fill="#9b9a97"
            fontSize="10"
            alignmentBaseline="middle"
          >
            {q >= 1000 ? `${(q / 1000).toFixed(1)}K` : q.toFixed(1)}
          </text>
        ))}

        {/* X axis labels */}
        <text x={xScale(minX)} y={VIEW_H - 6} fill="#9b9a97" fontSize="10" textAnchor="start">
          {formatPrice(minX)}
        </text>
        <text x={xScale(maxX)} y={VIEW_H - 6} fill="#9b9a97" fontSize="10" textAnchor="end">
          {formatPrice(maxX)}
        </text>
        {currentPrice && (
          <text x={xScale(currentPrice)} y={VIEW_H - 6} fill="#4da6ff" fontSize="10" textAnchor="middle" fontWeight="bold">
            {formatPrice(currentPrice)}
          </text>
        )}

        {/* Bids area */}
        {bidPoly.length > 0 && (
          <polygon points={bidPoly.join(" ")} fill="rgba(77,171,154,0.25)" stroke="rgba(77,171,154,0.5)" strokeWidth={1} />
        )}

        {/* Asks area */}
        {askPoly.length > 0 && (
          <polygon points={askPoly.join(" ")} fill="rgba(255,115,105,0.25)" stroke="rgba(255,115,105,0.5)" strokeWidth={1} />
        )}

        {/* Current price line */}
        {currentPrice && (
          <>
            <line
              x1={xScale(currentPrice)}
              y1={PAD.top}
              x2={xScale(currentPrice)}
              y2={VIEW_H - PAD.bottom}
              stroke="#4da6ff"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <rect
              x={xScale(currentPrice) - 25}
              y={PAD.top - 14}
              width={50}
              height={16}
              rx={4}
              fill="#4da6ff"
            />
            <text
              x={xScale(currentPrice)}
              y={PAD.top - 3}
              fill="#fff"
              fontSize="9"
              textAnchor="middle"
              fontWeight="bold"
            >
              {formatPrice(currentPrice)}
            </text>
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hover && (
        <div
          className="absolute z-20 pointer-events-none bg-[#1a1a2e] border border-white/10 rounded px-2 py-1.5 text-[10px] text-white shadow-lg"
          style={{ left: Math.min(hover.x, (svgRef.current?.clientWidth ?? 400) - 140), top: Math.max(hover.y, 0) }}
        >
          <div className="flex justify-between gap-3">
            <span className="text-white/50">Prix:</span>
            <span className="tabular-nums">{formatPrice(hover.price)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-white/50">Cumul:</span>
            <span className="tabular-nums">{hover.cumQty.toFixed(4)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-white/50">Côté:</span>
            <span className={hover.side === "Bids" ? "text-[#4dab9a]" : "text-[#ff7369]"}>{hover.side}</span>
          </div>
        </div>
      )}
    </div>
  );
}
