"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, Check, ChevronRight, Globe, Coins } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, LOCALE_LABELS, type Locale } from "@/i18n/routing";
import { useCurrency, ALL_CURRENCIES, CURRENCY_SYMBOLS, type Currency } from "@/lib/context/CurrencyContext";

type Panel = "main" | "languages" | "currencies";

export default function SettingsDropdown() {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>("main");
  const ref = useRef<HTMLDivElement>(null);

  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setPanel("main");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectLocale = (locale: Locale) => {
    setOpen(false);
    setPanel("main");
    router.replace(pathname, { locale });
  };

  const selectCurrency = (c: Currency) => {
    setCurrency(c);
    setPanel("main");
  };

  const close = () => {
    setOpen(false);
    setPanel("main");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-secondary hover:text-primary transition-colors p-2 rounded-md hover:bg-raised"
        aria-label="Réglages"
        aria-expanded={open}
        type="button"
      >
        <Settings className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={close} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 w-[200px] bg-card border border-surface rounded-md z-50 overflow-hidden shadow-level-1"
            >
              {panel === "main" && (
                <div className="py-1">
                  {/* Language */}
                  <button
                    onClick={() => setPanel("languages")}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-primary hover:bg-raised transition-colors"
                    type="button"
                  >
                    <span className="text-secondary">Language</span>
                    <span className="flex items-center gap-1 text-tertiary">
                      {LOCALE_LABELS[currentLocale as Locale] ?? currentLocale}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </button>

                  <div className="border-t border-surface mx-3" />

                  {/* Currency */}
                  <button
                    onClick={() => setPanel("currencies")}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-primary hover:bg-raised transition-colors"
                    type="button"
                  >
                    <span className="text-secondary">Currency</span>
                    <span className="flex items-center gap-1 text-tertiary">
                      {CURRENCY_SYMBOLS[currency]} {currency}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </button>

                </div>
              )}

              {panel === "languages" && (
                <div className="py-1 max-h-64 overflow-y-auto">
                  {routing.locales.map((locale) => (
                    <button
                      key={locale}
                      onClick={() => selectLocale(locale as Locale)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-primary hover:bg-raised transition-colors"
                      type="button"
                    >
                      <span>{LOCALE_LABELS[locale as Locale] ?? locale}</span>
                      {currentLocale === locale && <Check className="w-4 h-4 text-pro" />}
                    </button>
                  ))}
                </div>
              )}

              {panel === "currencies" && (
                <div className="py-1 max-h-64 overflow-y-auto">
                  {ALL_CURRENCIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => selectCurrency(c as Currency)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-primary hover:bg-raised transition-colors"
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-tertiary w-5 text-xs">{CURRENCY_SYMBOLS[c]}</span>
                        <span className="font-mono text-xs">{c}</span>
                      </span>
                      {currency === c && <Check className="w-4 h-4 text-pro" />}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
