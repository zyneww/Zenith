"use client";

import { Check, X } from "lucide-react";

interface Plan {
  name: string;
  features: string[];
}

interface ComparisonTableProps {
  plans: Plan[];
}

const allFeatures = [
  { label: "Charts basiques", free: true, pro: true },
  { label: "Charts avancés (25+ indicateurs)", free: false, pro: true },
  { label: "Studies techniques (SMA, EMA, RSI, MACD)", free: false, pro: true },
  { label: "Actifs suivis", free: "3", pro: "Illimité" },
  { label: "Alertes email", free: "1/jour", pro: "Illimité" },
  { label: "Alertes SMS + Webhook", free: false, pro: true },
  { label: "Données temps réel", free: "24h", pro: "Historique illimité" },
  { label: "Dashboard", free: "Simple", pro: "Avancé" },
  { label: "Portfolios", free: "1", pro: "Illimité" },
  { label: "Export CSV", free: false, pro: true },
  { label: "Command palette", free: true, pro: true },
  { label: "Support", free: "Communautaire", pro: "Prioritaire" },
];

export default function ComparisonTable({ plans }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#ebebeb]">
            <th className="text-left py-4 px-4 font-mono-caps text-[#959494]">
              Fonctionnalité
            </th>
            {plans.map((plan) => (
              <th
                key={plan.name}
                className={`text-center py-4 px-4 font-medium ${
                  plan.name === "Pro" ? "text-black" : "text-black"
                }`}
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature, i) => (
            <tr
              key={feature.label}
              className={`border-b border-[#ebebeb]/50 ${
                i % 2 === 0 ? "bg-[#f5f5f7]/50" : ""
              }`}
            >
              <td className="py-3 px-4 text-[#959494]">{feature.label}</td>
              <td className="py-3 px-4 text-center">
                {typeof feature.free === "boolean" ? (
                  feature.free ? (
                    <Check className="w-4 h-4 text-[#c8f6f9] mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-[#959494] mx-auto" />
                  )
                ) : (
                  <span className="text-[#959494]">{feature.free}</span>
                )}
              </td>
              <td className="py-3 px-4 text-center">
                {typeof feature.pro === "boolean" ? (
                  feature.pro ? (
                    <Check className="w-4 h-4 text-[#c8f6f9] mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-[#959494] mx-auto" />
                  )
                ) : (
                  <span className="text-[#959494]">{feature.pro}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
