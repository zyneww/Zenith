"use client";

import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Activity,
  DollarSign,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  delay: number;
}

function MetricCard({ title, value, change, changeType, icon, delay }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card border border-surface rounded-sm p-5 hover:border-[#26263a] transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-secondary text-sm mb-1">{title}</p>
          <p className="text-2xl font-medium text-primary">{value}</p>
        </div>
        <div className="p-2 bg-[#1f2937] rounded-sm">{icon}</div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        {changeType === "positive" && (
          <TrendingUp className="w-4 h-4 text-green-500" />
        )}
        {changeType === "negative" && (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        <span
          className={`text-sm font-medium ${
            changeType === "positive"
              ? "text-green-500"
              : changeType === "negative"
              ? "text-red-500"
              : "text-secondary"
          }`}
        >
          {change}
        </span>
        <span className="text-secondary text-sm ml-1">vs hier</span>
      </div>
    </motion.div>
  );
}

const METRICS = [
  {
    title: "Valeur du Portfolio",
    value: "$124,592.40",
    change: "+2.45%",
    changeType: "positive" as const,
    icon: <Wallet className="w-5 h-5 text-brand-cyan" />,
  },
  {
    title: "P&L Total",
    value: "+$18,234.12",
    change: "+17.1%",
    changeType: "positive" as const,
    icon: <DollarSign className="w-5 h-5 text-green-500" />,
  },
  {
    title: "Performance 24h",
    value: "+$1,245.80",
    change: "+1.02%",
    changeType: "positive" as const,
    icon: <Activity className="w-5 h-5 text-brand-purple-light" />,
  },
  {
    title: "Actifs Détenus",
    value: "12",
    change: "0",
    changeType: "neutral" as const,
    icon: <PieChart className="w-5 h-5 text-yellow-500" />,
  },
];

export default function MetricsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {METRICS.map((metric, index) => (
        <MetricCard key={metric.title} {...metric} delay={index * 0.1} />
      ))}
    </div>
  );
}
