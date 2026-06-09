"use client";

import { useTranslations } from "next-intl";
import { Stars, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function CTAFinal() {
  const t = useTranslations("cta");
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-cyan/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-[#131722] border border-[#1f2937] rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-cyan/5 via-transparent to-brand-purple/5" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />

          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-brand-cyan text-xs font-bold tracking-wider mb-4 flex justify-center items-center gap-2"
            >
              <Stars className="w-4 h-4" />
              {t("badge")}
            </motion.p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {t.rich("title", { br: () => <br /> })}
            </h2>
            <p className="text-gray-400 text-sm md:text-base mb-8 max-w-lg mx-auto">
              {t("subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
              <button className="bg-brand-purple text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#6833c9] transition-colors flex items-center gap-2 shadow-lg shadow-brand-purple/20">
                {t("primary")}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-transparent border border-gray-700 text-white font-medium px-8 py-3 rounded-lg hover:bg-white/5 transition-colors">
                {t("secondary")}
              </button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-gray-500">
              {(t.raw("features") as string[]).map((feature, i) => (
                <span key={i} className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-up" />
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
