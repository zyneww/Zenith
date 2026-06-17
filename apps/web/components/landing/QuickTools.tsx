"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Flame,
  Trophy,
  TrendingDown,
  ArrowRightLeft,
  Droplets,
  Fuel,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";

const trendingItems = [
  {
    rank: 1,
    name: "Solana",
    symbol: "SOL",
    price: "$172.34",
    change: "+5.23%",
    icon: "S",
    iconBg: "bg-gradient-to-tr from-green-400 to-purple-500",
  },
  {
    rank: 2,
    name: "Shiba Inu",
    symbol: "SHIB",
    price: "$0.000021",
    change: "+3.45%",
    icon: "🐕",
    iconBg: "bg-orange-600",
  },
  {
    rank: 3,
    name: "Dogecoin",
    symbol: "DOGE",
    price: "$0.234000",
    change: "+4.12%",
    icon: "D",
    iconBg: "bg-yellow-500",
  },
];

export default function QuickTools() {
  const t = useTranslations("quickTools");
  const [activeTab, setActiveTab] = useState<"trending" | "gainers" | "losers">(
    "trending"
  );

  return (
    <section className="py-12 px-4 bg-canvas">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-mono-caps text-secondary mb-2">
            {t("badge")}
          </p>
          <h2 className="text-3xl md:text-4xl font-medium text-primary mb-2">
            {t("title")}
          </h2>
          <p className="text-secondary text-sm">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="md:col-span-8 flex flex-col gap-6">
            {/* Mouvements du jour */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-surface rounded-sm p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-medium text-primary">{t("sectionTitle")}</h3>
                  <p className="text-secondary text-xs">
                    {t("sectionDesc")}
                  </p>
                </div>
                <div className="flex bg-raised rounded-sm p-1 border border-surface">
                  {[
                    { key: "trending", label: t("tabs.trending"), icon: Flame },
                    { key: "gainers", label: t("tabs.gainers"), icon: Trophy },
                    { key: "losers", label: t("tabs.losers"), icon: TrendingDown },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() =>
                        setActiveTab(tab.key as "trending" | "gainers" | "losers")
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition ${
                        activeTab === tab.key
                          ? "bg-accent-subtle text-accent"
                          : "text-secondary hover:text-primary"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {trendingItems.map((item) => (
                  <div
                    key={item.symbol}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-secondary text-sm w-4">
                        {item.rank}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full ${item.iconBg} flex items-center justify-center text-[10px] font-bold text-primary`}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-primary">{item.name}</div>
                        <div className="text-xs text-secondary">
                          {item.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-sm text-primary">{item.price}</span>
                      <span className="bg-accent-subtle text-accent border border-accent/20 px-1.5 py-0.5 rounded-sm text-xs">
                        {item.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Convertisseur rapide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-surface rounded-sm p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-primary">{t("converterTitle")}</h3>
                <span className="font-mono-caps text-secondary">
                  {t("converterRatesLabel")}
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full bg-canvas border border-surface rounded-sm p-2 flex items-center">
                  <div className="font-mono-caps text-secondary mr-2 uppercase w-12 text-center">
                    {t("converterFrom")}
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    defaultValue="1"
                    aria-label={t("converterFrom")}
                    className="bg-transparent text-primary font-medium w-full focus:outline-none px-2"
                  />
                  <select aria-label={t("converterFrom") + " devise"} className="bg-transparent text-sm text-primary focus:outline-none border-l border-surface pl-2">
                    <option>BTC</option>
                    <option>ETH</option>
                  </select>
                </div>

                <button className="bg-raised p-2 rounded-sm border border-surface hover:bg-card" aria-label="Inverser les devises">
                  <ArrowRightLeft className="w-4 h-4 text-secondary" />
                </button>

                <div className="flex-1 w-full bg-canvas border border-surface rounded-sm p-2 flex items-center">
                  <div className="font-mono-caps text-secondary mr-2 uppercase w-12 text-center">
                    {t("converterTo")}
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    defaultValue="77,834.5"
                    readOnly
                    aria-label={t("converterTo")}
                    className="bg-transparent text-primary font-medium w-full focus:outline-none px-2"
                  />
                  <select aria-label={t("converterTo") + " devise"} className="bg-transparent text-sm text-primary focus:outline-none border-l border-surface pl-2">
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
              </div>
              <div className="text-[10px] text-secondary mt-3">
                1 BTC = <span className="font-medium text-primary">77,834.5</span>{" "}
                USD
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Fear & Greed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-surface rounded-sm p-6 relative flex flex-col items-center"
            >
              <div className="w-full flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-primary">{t("fearGreedTitle")}</h3>
                <span className="font-mono-caps text-secondary">
                  {t("fearGreedSub")}
                </span>
              </div>

              <div className="relative w-40 h-24 mt-4 overflow-hidden">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#26263a"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    pathLength="100"
                    className="gauge-path"
                  />
                  <defs>
                    <linearGradient
                      id="gaugeGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#c8f6f9" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-0 left-0 w-full text-center">
                  <div className="text-3xl font-medium text-primary">72</div>
                  <div className="font-mono-caps text-accent">
                    {t("fearGreedLevel")}
                  </div>
                </div>
              </div>
              <p className="text-xs text-secondary text-center mt-4">
                {t.rich("fearGreedDesc", { sentiment: t("fearGreedSentiment") })}
              </p>
            </motion.div>

            {/* Gas Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-surface rounded-sm p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium flex items-center gap-2 text-primary">
                  <Fuel className="w-4 h-4 text-[#f59e0b]" />
                  {t("gasTitle")}
                </h3>
                <span className="font-mono-caps text-secondary">
                  {t("gasSub")}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#bdbbff]" />
                    Ethereum
                  </div>
                  <div className="text-secondary flex gap-2">
                    <span>12</span>
                    <span>18</span>
                    <span className="text-[#f59e0b] font-medium flex items-center">
                      ⚡ 24
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ef2cc1]" />
                    Polygon
                  </div>
                  <div className="text-secondary flex gap-2">
                    <span>35</span>
                    <span>50</span>
                    <span className="text-[#f59e0b] font-medium flex items-center">
                      ⚡ 70
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Screener Callout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-[#c8f6f9]/30 rounded-sm p-6 relative overflow-hidden group hover:border-accent/60 transition"
            >
              <div className="w-10 h-10 bg-accent/20 rounded-sm flex items-center justify-center mb-4 text-accent">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">
                {t("screenerTitle")}
              </h3>
              <p className="text-sm text-secondary mb-4 line-clamp-2">
                {t("screenerDesc")}
              </p>
              <a
                href="#"
                className="text-accent text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t("screenerCta")}
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
