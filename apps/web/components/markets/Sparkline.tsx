"use client";

import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

export default function Sparkline({
  data,
  width = 120,
  height = 36,
  className = "",
}: SparklineProps) {
  const isUp = data.length > 0 && data[data.length - 1] >= data[0];

  const path = useMemo(() => {
    if (data.length < 2) return "";
    const len = data.length;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const xScale = width / (len - 1);

    return data
      .map((v, i) => {
        const x = i * xScale;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data, width, height]);

  if (data.length < 2) return <div className={`${className}`} style={{ width, height }} />;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`inline-block ${isUp ? "text-up" : "text-down"} ${className}`}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
