"use client";

import { motion } from "motion/react";
import { Bell, TrendingUp, AlertTriangle } from "lucide-react";

interface Alert {
  id: string;
  type: "price" | "performance" | "risk";
  message: string;
  time: string;
  severity: "info" | "warning" | "success";
}

const RECENT_ALERTS: Alert[] = [
  {
    id: "1",
    type: "price",
    message: "BTC a atteint votre alerte à $65,000",
    time: "Il y a 2h",
    severity: "success",
  },
  {
    id: "2",
    type: "performance",
    message: "Votre portfolio a dépassé +20% ce mois-ci",
    time: "Il y a 5h",
    severity: "success",
  },
  {
    id: "3",
    type: "risk",
    message: "Volatilité élevée détectée sur SOL",
    time: "Il y a 1j",
    severity: "warning",
  },
];

function AlertIcon({ severity }: { severity: Alert["severity"] }) {
  switch (severity) {
    case "success":
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    default:
      return <Bell className="w-4 h-4 text-brand-cyan" />;
  }
}

export default function RecentAlerts() {
  return (
    <div className="bg-card border border-surface rounded-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary font-semibold text-lg">Alertes Récentes</h3>
        <span className="bg-brand-purple/20 text-brand-purple-light text-xs px-2 py-1 rounded-full">
          {RECENT_ALERTS.length} nouvelles
        </span>
      </div>
      <div className="space-y-3">
        {RECENT_ALERTS.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start gap-3 p-3 bg-canvas rounded-sm hover:bg-raised transition-colors cursor-pointer"
          >
            <div className="mt-0.5"><AlertIcon severity={alert.severity} /></div>
            <div className="flex-1">
              <p className="text-primary text-sm">{alert.message}</p>
              <p className="text-secondary text-xs mt-1">{alert.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
