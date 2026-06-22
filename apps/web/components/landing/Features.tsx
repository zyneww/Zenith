"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import RealtimeTicker from "./Hero/RealtimeTicker";

export default function Features() {
  const t = useTranslations("features");
  const mockupItems = t.raw("block1.mockupItems") as string[];
  return (
    <section className="py-20 px-4 bg-card">
      <div className="max-w-6xl mx-auto space-y-32">
        {/* Feature 1: Command Palette */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div
            className="flex-1"
          >
            <p className="font-mono-caps text-secondary mb-2">
              {t("block1.badge")}
            </p>
            <h2 className="heading-2 text-3xl md:text-4xl font-medium text-primary mb-6 leading-tight">
              {t.rich("block1.title", { br: () => <br /> })}
            </h2>
            <p className="text-secondary text-sm mb-8">
              {t("block1.desc")}
            </p>

            <ul className="space-y-4 text-sm text-secondary">
              {(t.raw("block1.items") as string[]).map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="flex-1 w-full"
          >
            <div className="bg-card border border-surface rounded-sm p-4 max-w-md mx-auto relative">
              <div className="font-mono-caps text-secondary mb-2 px-2">
                {t("block1.mockupLabel")}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center p-2 rounded bg-canvas cursor-pointer">
                  <span className="text-sm text-primary">
                    {mockupItems[0]}
                  </span>
                  <div className="flex gap-1">
                    <kbd className="bg-card border border-surface px-1.5 rounded-sm text-xs text-secondary">
                      ⌘
                    </kbd>
                    <kbd className="bg-card border border-surface px-1.5 rounded-sm text-xs text-secondary">
                      K
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-raised cursor-pointer">
                  <span className="text-sm text-secondary">
                    {mockupItems[1]}
                  </span>
                  <div className="flex gap-1">
                    <kbd className="bg-card border border-surface px-1.5 rounded-sm text-xs text-secondary">
                      G
                    </kbd>
                    <kbd className="bg-card border border-surface px-1.5 rounded-sm text-xs text-secondary">
                      M
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-raised cursor-pointer">
                  <span className="text-sm text-secondary">
                    {mockupItems[2]}
                  </span>
                  <div className="flex gap-1">
                    <kbd className="bg-card border border-surface px-1.5 rounded-sm text-xs text-secondary">
                      G
                    </kbd>
                    <kbd className="bg-card border border-surface px-1.5 rounded-sm text-xs text-secondary">
                      D
                    </kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-raised cursor-pointer">
                  <span className="text-sm text-secondary">{mockupItems[3]}</span>
                  <div className="flex gap-1">
                    <kbd className="bg-card border border-surface px-1 rounded-sm text-xs text-secondary">
                      ↑
                    </kbd>
                    <kbd className="bg-card border border-surface px-1 rounded-sm text-xs text-secondary">
                      ↓
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Real-time Data */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div
            className="flex-1"
          >
            <p className="font-mono-caps text-secondary mb-2">
              {t("block2.badge")}
            </p>
            <h2 className="heading-2 text-3xl md:text-4xl font-medium text-primary mb-6 leading-tight">
              {t.rich("block2.title", { br: () => <br /> })}
            </h2>
            <p className="text-secondary text-sm mb-8">
              {t("block2.desc")}
            </p>

            <ul className="space-y-4 text-sm text-secondary">
              {(t.raw("block2.items") as string[]).map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="flex-1 w-full"
          >
            <RealtimeTicker />
          </div>
        </div>
      </div>
    </section>
  );
}
