"use client";

import { Check, Zap, Crown, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-2xl p-8 border ${
        featured
          ? "border-brand-purple/50 bg-gradient-to-b from-brand-purple/10 to-transparent"
          : "border-gray-700/50 bg-[#131722]/50"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-brand-purple text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
            Recommandé
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            featured ? "bg-brand-purple/20" : "bg-gray-700/30"
          }`}
        >
          <Icon className={`w-5 h-5 ${featured ? "text-brand-purple-light" : "text-gray-400"}`} />
        </div>
        <div>
          <h3 className="text-xl font-bold">{name}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-gray-500 ml-1">{period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`block w-full text-center font-semibold py-3 rounded-lg transition-colors ${
          featured
            ? "bg-brand-purple text-white hover:bg-[#6833c9] shadow-glow-purple"
            : "bg-white/5 border border-gray-600 text-white hover:bg-white/10"
        }`}
      >
        {cta}
      </Link>
    </motion.div>
  );
}
