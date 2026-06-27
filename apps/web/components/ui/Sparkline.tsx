"use client";

interface Props {
  data: { value: number }[];
  width?: number;
  height?: number;
  colorUp?: string;
  colorDown?: string;
  trend?: "up" | "down" | "neutral";
}

export default function Sparkline({ data, width = 80, height = 30, colorUp = "#4dab9a", colorDown = "#ff7369", trend }: Props) {
  if (!data.length) return <svg width={width} height={height} />;

  const values = data.map((d) => d.value);
  const isUp = trend || (values[values.length - 1] >= values[0] ? "up" : "down");
  const color = isUp === "up" ? colorUp : colorDown;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - ((v - min) / range) * height}`).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} />
    </svg>
  );
}
