"use client";

interface MetricsPanelProps {
  metrics: { label: string; value: string }[];
}

export default function MetricsPanel({ metrics }: MetricsPanelProps) {
  if (metrics.length === 0) return null;
  return (
    <div className="bg-card border border-surface rounded-lg p-3">
      <h3 className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">Métriques</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {metrics.map((m, i) => (
          <div key={i}>
            <span className="text-secondary">{m.label}</span>
            <p className="text-primary font-medium tabular-nums">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
