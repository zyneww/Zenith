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
      className={`relative rounded-sm p-8 border ${
        featured
          ? "border-[#ebebeb] bg-black text-white"
          : "border-[#ebebeb] bg-white"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-[#c8f6f9] text-black text-[10px] font-bold px-4 py-1 rounded-sm uppercase tracking-wider font-mono">
            Recommandé
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-sm flex items-center justify-center ${
            featured ? "bg-[#c8f6f9]/20" : "bg-[#f5f5f7]"
          }`}
        >
          <Icon className={`w-5 h-5 ${featured ? "text-[#c8f6f9]" : "text-[#959494]"}`} />
        </div>
        <div>
          <h3 className={`text-xl font-medium ${featured ? "text-white" : "text-black"}`}>{name}</h3>
          <p className={`text-sm ${featured ? "text-[#959494]" : "text-[#959494]"}`}>{description}</p>
        </div>
      </div>

      <div className="mb-6">
        <span className={`text-4xl font-medium ${featured ? "text-white" : "text-black"}`}>{price}</span>
        <span className={`${featured ? "text-[#959494]" : "text-[#959494]"} ml-1`}>{period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${featured ? "text-[#c8f6f9]" : "text-[#c8f6f9]"}`} />
            <span className={featured ? "text-[#959494]" : "text-[#959494]"}>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`block w-full text-center font-mono text-sm uppercase tracking-wider py-2.5 rounded-sm transition-colors ${
          featured
            ? "bg-white text-black hover:bg-[#f5f5f7]"
            : "bg-black text-white hover:bg-[#1a1a2e]"
        }`}
      >
        {cta}
      </Link>
    </motion.div>
  );
}
