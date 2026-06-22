"use client";

import { useTranslations } from "next-intl";
import { Stars, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CTAFinal() {
  const t = useTranslations("cta");
  return (
    <section className="py-24 px-4 bg-card relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div
          className="bg-canvas text-primary rounded-xl p-8 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden"
        >
          {/* Top hairline */}
          <div className="absolute top-0 left-0 right-0 h-px bg-surface" />

          <div className="relative z-10">
            <p
              className="font-mono-caps text-secondary mb-4 flex justify-center items-center gap-2"
            >
              <Stars className="w-4 h-4" />
              {t("badge")}
            </p>
            <h2 className="heading-1 text-4xl md:text-5xl font-medium text-primary mb-4 leading-tight">
              {t.rich("title", { br: () => <br /> })}
            </h2>
            <p className="text-secondary text-sm md:text-base mb-8 max-w-lg mx-auto">
              {t("subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
              <button className="bg-brand-blue text-on-accent font-mono text-sm uppercase tracking-wider px-8 py-2.5 rounded-full hover:bg-raised transition-colors flex items-center gap-2">
                {t("primary")}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-transparent border border-surface text-primary font-mono text-sm uppercase tracking-wider px-8 py-2.5 rounded-full hover:bg-raised transition-colors">
                {t("secondary")}
              </button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-secondary">
              {(t.raw("features") as string[]).map((feature, i) => (
                <span key={i} className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-accent" />
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
