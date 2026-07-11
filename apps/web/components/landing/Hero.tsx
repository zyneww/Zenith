"use client";

import { useState } from "react";
import { Search, TrendingUp, BarChart3, Globe } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import HeroVisual from "./HeroVisual";

const SUGGESTIONS = [
  { label: "Bitcoin", icon: "₿" },
  { label: "EUR/USD", icon: "€" },
  { label: "Or", icon: "🥇" },
  { label: "S&P 500", icon: "📈" },
];

export default function Hero() {
  const [query, setQuery] = useState("");

  return (
    <section className="relative min-h-[calc(100svh-80px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-canvas">
      <HeroVisual />
      {/* Soft ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-rausch/[0.06] rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-brand-blue/[0.05] rounded-full blur-[100px] opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-raised text-secondary text-xs font-medium tracking-wide mb-6">
            <TrendingUp className="w-3.5 h-3.5" />
            Données temps réel sur 250+ actifs
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
          className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-primary tracking-tight leading-[1.1] mb-5"
        >
          L&apos;intelligence des marchés,
          <br className="hidden sm:block" />
          <span className="text-rausch"> enfin claire.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-lg text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Crypto, forex, matières premières, indices et actions. Toute la donnée
          dont les traders et investisseurs ont besoin, dans une expérience
          pensée pour décider vite.
        </motion.p>

        {/* Search pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row items-stretch bg-card border border-surface rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden hover:shadow-[0_1px_1px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <div className="flex-1 flex items-center gap-3 px-6 py-4 border-b sm:border-b-0 sm:border-r border-surface">
              <Search className="w-5 h-5 text-secondary flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un actif, un marché, une catégorie..."
                className="w-full bg-transparent text-primary placeholder:text-tertiary outline-none text-sm"
              />
            </div>
            <div className="hidden sm:flex items-center gap-3 px-6 py-4 border-r border-surface min-w-[180px]">
              <BarChart3 className="w-5 h-5 text-secondary flex-shrink-0" />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider text-tertiary font-semibold">Marché</p>
                <p className="text-sm text-primary">Tous les marchés</p>
              </div>
            </div>
            <Link
              href={query ? `/markets/${query.toLowerCase()}` : "/markets"}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-rausch text-white font-medium text-sm hover:bg-rausch-active transition-colors"
            >
              <Search className="w-4 h-4" />
              Explorer
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs text-tertiary">Suggestions :</span>
            {SUGGESTIONS.map((s) => (
              <Link
                key={s.label}
                href={`/markets/${s.label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-raised text-secondary hover:text-primary hover:border-hover border border-transparent transition-colors"
              >
                <span>{s.icon}</span>
                {s.label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Trust micro-row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-tertiary"
        >
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            Cours temps réel
          </span>
          <span>•</span>
          <span>Charts TradingView</span>
          <span>•</span>
          <span>Alertes personnalisées</span>
          <span>•</span>
          <span>Gratuit, sans carte</span>
        </motion.div>
      </div>
    </section>
  );
}
