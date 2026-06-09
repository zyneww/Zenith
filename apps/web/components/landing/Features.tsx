"use client";

import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export default function Features() {
  const t = useTranslations("features");
  const mockupItems = t.raw("block1.mockupItems") as string[];
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-32">
        {/* Feature 1: Command Palette */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <p className="text-brand-cyan text-xs font-bold tracking-wider mb-2 uppercase">
              {t("block1.badge")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {t.rich("block1.title", { br: () => <br /> })}
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              {t("block1.desc")}
            </p>

            <ul className="space-y-4 text-sm text-gray-300">
              {(t.raw("block1.items") as string[]).map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-cyan shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full"
          >
            <div className="bg-[#11131a] border border-gray-800 rounded-xl p-4 shadow-2xl max-w-md mx-auto relative">
              <div className="text-[10px] text-gray-500 mb-2 px-2 uppercase font-semibold">
                {t("block1.mockupLabel")}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center p-2 rounded bg-gray-800/50 cursor-pointer">
                  <span className="text-sm text-gray-200">
                    {mockupItems[0]}
                  </span>
                  <div className="flex gap-1">
                    <kbd className="bg-gray-800 border border-gray-700 px-1.5 rounded text-xs text-gray-400">
                      ⌘
                    </kbd>
                    <kbd className="bg-gray-800 border border-gray-700 px-1.5 rounded text-xs text-gray-400">
                      K
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-gray-800/30 cursor-pointer">
                  <span className="text-sm text-gray-400">
                    {mockupItems[1]}
                  </span>
                  <div className="flex gap-1">
                    <kbd className="bg-gray-800 border border-gray-700 px-1.5 rounded text-xs text-gray-500">
                      G
                    </kbd>
                    <kbd className="bg-gray-800 border border-gray-700 px-1.5 rounded text-xs text-gray-500">
                      M
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-gray-800/30 cursor-pointer">
                  <span className="text-sm text-gray-400">
                    {mockupItems[2]}
                  </span>
                  <div className="flex gap-1">
                    <kbd className="bg-gray-800 border border-gray-700 px-1.5 rounded text-xs text-gray-500">
                      G
                    </kbd>
                    <kbd className="bg-gray-800 border border-gray-700 px-1.5 rounded text-xs text-gray-500">
                      D
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-gray-800/30 cursor-pointer">
                  <span className="text-sm text-gray-400">{mockupItems[3]}</span>
                  <div className="flex gap-1">
                    <kbd className="bg-gray-800 border border-gray-700 px-1 rounded text-xs text-gray-500">
                      ↑
                    </kbd>
                    <kbd className="bg-gray-800 border border-gray-700 px-1 rounded text-xs text-gray-500">
                      ↓
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature 2: Real-time Data */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <p className="text-brand-cyan text-xs font-bold tracking-wider mb-2 uppercase">
              {t("block2.badge")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {t.rich("block2.title", { br: () => <br /> })}
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              {t("block2.desc")}
            </p>

            <ul className="space-y-4 text-sm text-gray-300">
              {(t.raw("block2.items") as string[]).map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-cyan shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full"
          >
            <div className="bg-[#131722] border border-[#1f2937] rounded-xl p-5 shadow-2xl max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                <span className="text-xs text-gray-500 uppercase font-semibold">
                  {t("block2.mockupLabel")}
                </span>
                <span className="bg-up/20 text-up text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-up animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="font-mono text-xs space-y-2 text-gray-400">
                {[
                  { time: "23:45:12", sym: "BTCUSDT", side: "SELL", price: "$74,155.25" },
                  { time: "23:45:12", sym: "ETHUSDT", side: "BUY", price: "$2,319.52" },
                  { time: "23:45:11", sym: "SOLUSDT", side: "BUY", price: "$86.84" },
                  { time: "23:45:11", sym: "BTCUSDT", side: "BUY", price: "$74,156.10" },
                  { time: "23:45:10", sym: "ETHUSDT", side: "SELL", price: "$2,319.48" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{row.time}</span>
                    <span className="text-white w-16">{row.sym}</span>
                    <span className={`flex items-center gap-1 w-12 ${row.side === "BUY" ? "text-up" : "text-down"}`}>
                      {row.side === "BUY" ? "↑" : "↓"} {row.side}
                    </span>
                    <span className="text-right w-20 text-white">{row.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-800 text-[10px] text-warn flex items-center gap-1">
                ⚡ {t("block2.mockupSummary")}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
