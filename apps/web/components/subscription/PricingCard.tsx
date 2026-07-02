"use client";

import { Check, Zap, Crown, type LucideIcon } from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, LucideIcon> = {
  Zap,
  Crown,
};

interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  period: string;
  iconName: string;
  featured: boolean;
  features: string[];
  cta: string;
  href: string;
}

export default function PricingCard({
  name,
  description,
  price,
  period,
  iconName,
  featured,
  features,
  cta,
  href,
}: PricingCardProps) {
  const Icon = iconMap[iconName] || Zap;

  return (
    <div
      className={`relative rounded-sm p-8 border ${
        featured
          ? "border-accent bg-raised"
          : "border-surface bg-card"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-accent-solid text-on-accent text-[10px] font-bold px-4 py-1 rounded-sm uppercase tracking-wider font-mono">
            Recommandé
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-sm flex items-center justify-center ${
            featured ? "bg-accent-subtle" : "bg-raised"
          }`}
        >
          <Icon className={`w-5 h-5 ${featured ? "text-accent" : "text-tertiary"}`} />
        </div>
        <div>
          <h3 className="text-xl font-medium text-primary">{name}</h3>
          <p className="text-sm text-secondary">{description}</p>
        </div>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-medium text-primary">{price}</span>
        <span className="text-secondary ml-1">{period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />
            <span className="text-secondary">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`block w-full text-center font-mono text-sm uppercase tracking-wider py-2.5 rounded-sm transition-colors ${
          featured
            ? "bg-card text-primary hover:bg-raised"
            : "bg-raised text-primary hover:bg-card"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
