"use client";

import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export default function Features() {
  const t = useTranslations("features");
  const mockupItems = t.raw("block1.mockupItems") as string[];
  return (
    <section className="py-20 px-4 bg-white">
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
            <p className="font-mono-caps text-secondary mb-2">
              {t("block1.badge")}
            </p>
            <h2 className="text-3xl md:text-4xl font-medium text-primary mb-6 leading-tight">
              {t.rich("block1.title", { br: () => <br /> })}
            </h2>
            <p className="text-secondary text-sm mb-8">
              {t("block1.desc")}
            </p>

            <ul className="space-y-4 text-sm text-secondary">
              {(t.raw("block1.items") as string[]).map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#fc4c02] shrink-0" />
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
            <div className="bg-white border border-[#ebebeb] rounded-sm p-4 max-w-md mx-auto relative">
              <div className="font-mono-caps text-secondary mb-2 px-2">
                {t("block1.mockupLabel")}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center p-2 rounded bg-[#f5f5f7] cursor-pointer">
                  <span className="text-sm text-primary">
                    {mockupItems[0]}
                  </span>
                  <div className="flex gap-1">
                    <kbd className="bg-white border border-[#ebebeb] px-1.5 rounded-sm text-xs text-secondary">
                      ⌘
                    </kbd>
                    <kbd className="bg-white border border-[#ebebeb] px-1.5 rounded-sm text-xs text-secondary">
                      K
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-[#f5f5f7]/50 cursor-pointer">
                  <span className="text-sm text-secondary">
                    {mockupItems[1]}
                  </span>
                  <div className="flex gap-1">
                    <kbd className="bg-white border border-[#ebebeb] px-1.5 rounded-sm text-xs text-secondary">
                      G
                    </kbd>
                    <kbd className="bg-white border border-[#ebebeb] px-1.5 rounded-sm text-xs text-secondary">
                      M
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-[#f5f5f7]/50 cursor-pointer">
                  <span className="text-sm text-secondary">
                    {mockupItems[2]}
                  </span>
                  <div className="flex gap-1">
                    <kbd className="bg-white border border-[#ebebeb] px-1.5 rounded-sm text-xs text-secondary">
                      G
                    </kbd>
                    <kbd className="bg-white border border-[#ebebeb] px-1.5 rounded-sm text-xs text-secondary">
                      D
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-[#f5f5f7]/50 cursor-pointer">
                  <span className="text-sm text-secondary">{mockupItems[3]}</span>
                  <div className="flex gap-1">
                    <kbd className="bg-white border border-[#ebebeb] px-1 rounded-sm text-xs text-secondary">
                      ↑
                    </kbd>
                    <kbd className="bg-white border border-[#ebebeb] px-1 rounded-sm text-xs text-secondary">
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
            <p className="font-mono-caps text-secondary mb-2">
              {t("block2.badge")}
            </p>
            <h2 className="text-3xl md:text-4xl font-medium text-primary mb-6 leading-tight">
              {t.rich("block2.title", { br: () => <br /> })}
            </h2>
            <p className="text-secondary text-sm mb-8">
              {t("block2.desc")}
            </p>

            <ul className="space-y-4 text-sm text-secondary">
              {(t.raw("block2.items") as string[]).map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#ef2cc1] shrink-0" />
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
            <div className="bg-white border border-[#ebebeb] rounded-sm p-5 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4 border-b border-[#ebebeb] pb-2">
                <span className="font-mono-caps text-secondary">
                  {t("block2.mockupLabel")}
                </span>
                <span className="bg-accent text-inverse text-[10px] px-2 py-0.5 rounded-sm flex items-center gap-1 font-mono uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="font-mono text-xs space-y-2 text-secondary">
                {[
                  { time: "23:45:12", sym: "BTCUSDT", side: "SELL", price: "$74,155.25" },
                  { time: "23:45:12", sym: "ETHUSDT", side: "BUY", price: "$2,319.52" },
                  { time: "23:45:11", sym: "SOLUSDT", side: "BUY", price: "$86.84" },
                  { time: "23:45:11", sym: "BTCUSDT", side: "BUY", price: "$74,156.10" },
                  { time: "23:45:10", sym: "ETHUSDT", side: "SELL", price: "$2,319.48" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{row.time}</span>
                    <span className="text-primary w-16">{row.sym}</span>
                    <span className={`flex items-center gap-1 w-12 ${row.side === "BUY" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {row.side === "BUY" ? "↑" : "↓"} {row.side}
                    </span>
                    <span className="text-right w-20 text-primary">{row.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-[#ebebeb] text-[10px] text-[#f59e0b] flex items-center gap-1">
                ⚡ {t("block2.mockupSummary")}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
