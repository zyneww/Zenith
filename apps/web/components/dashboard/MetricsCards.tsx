"use client";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Activity,
  DollarSign,
} from "lucide-react";
import { useFormatPrice } from "@/lib/context/CurrencyContext";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, changeType, icon }: MetricCardProps) {
  return (
    <div className="bg-card border border-surface rounded-lg p-5 hover:border-hover transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-secondary text-sm mb-1">{title}</p>
          <p className="text-2xl font-medium text-primary">{value}</p>
        </div>
        <div className="p-2 bg-canvas rounded-lg">{icon}</div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        {changeType === "positive" && (
          <TrendingUp className="w-4 h-4 text-up" />
        )}
        {changeType === "negative" && (
          <TrendingDown className="w-4 h-4 text-down" />
        )}
        <span
          className={`text-sm font-medium ${
            changeType === "positive"
              ? "text-up"
              : changeType === "negative"
              ? "text-down"
              : "text-secondary"
          }`}
        >
          {change}
        </span>
        <span className="text-tertiary text-sm ml-1">vs hier</span>
      </div>
    </div>
  );
}

export default function MetricsCards() {
  const formatPrice = useFormatPrice();

  const METRICS = [
    {
      title: "Valeur du Portfolio",
      value: formatPrice(124592.40),
      change: "+2.45%",
      changeType: "positive" as const,
      icon: <Wallet className="w-5 h-5 text-accent" />,
    },
    {
      title: "P&L Total",
      value: formatPrice(18234.12),
      change: "+17.1%",
      changeType: "positive" as const,
      icon: <DollarSign className="w-5 h-5 text-up" />,
    },
    {
      title: "Performance 24h",
      value: formatPrice(1245.80),
      change: "+1.02%",
      changeType: "positive" as const,
      icon: <Activity className="w-5 h-5 text-accent" />,
    },
    {
      title: "Actifs Détenus",
      value: "12",
      change: "0",
      changeType: "neutral" as const,
      icon: <PieChart className="w-5 h-5 text-warning" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {METRICS.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
