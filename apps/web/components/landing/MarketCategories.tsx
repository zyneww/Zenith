"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Bitcoin, DollarSign, Package, Landmark, Activity, Zap } from "lucide-react";

const CATEGORIES = [
  {
    id: "crypto",
    title: "Crypto",
    description: "Bitcoin, Ethereum, Solana et 200+ altcoins avec données live.",
    href: "/markets/cryptocurrencies",
    icon: Bitcoin,
    gradient: "from-orange-500/20 to-amber-500/5",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "forex",
    title: "Forex",
    description: "Paires de devises majeures, mineures et exotiques.",
    href: "/markets/forex",
    icon: DollarSign,
    gradient: "from-emerald-500/20 to-teal-500/5",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "commodities",
    title: "Matières premières",
    description: "Or, pétrole, gaz naturel, blé et autres matières premières.",
    href: "/markets/commodities",
    icon: Package,
    gradient: "from-yellow-500/20 to-amber-500/5",
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
  },
  {
    id: "indices",
    title: "Indices",
    description: "S&P 500, NASDAQ, CAC 40, DAX et indices mondiaux.",
    href: "/markets/indices",
    icon: Landmark,
    gradient: "from-blue-500/20 to-indigo-500/5",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "stocks",
    title: "Actions",
    description: "Actions américaines, européennes et internationales.",
    href: "/markets/stocks",
    icon: Activity,
    gradient: "from-rausch/20 to-pink-500/5",
    iconColor: "text-rausch",
    bgColor: "bg-rausch/10",
  },
  {
    id: "futures",
    title: "Futures",
    description: "Contrats à terme sur crypto, indices et matières premières.",
    href: "/markets/futures",
    icon: Zap,
    gradient: "from-violet-500/20 to-purple-500/5",
    iconColor: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function MarketCategories() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-canvas">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight mb-3">
            Explorer les marchés
          </h2>
          <p className="text-secondary text-base max-w-2xl">
            Des données centralisées pour tous les types d&apos;actifs. Passez d&apos;un marché à l&apos;autre en un clic.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div key={cat.id} variants={item}>
                <Link
                  href={cat.href}
                  className="group block relative overflow-hidden rounded-2xl border border-surface bg-card p-6 h-full shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_1px_1px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)] hover:border-hover transition-all"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl ${cat.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${cat.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-1">{cat.title}</h3>
                    <p className="text-sm text-secondary leading-relaxed">{cat.description}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
