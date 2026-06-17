"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check, Globe, Coins } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, LOCALE_LABELS, LOCALE_CURRENCY, type Locale } from "@/i18n/routing";
import { useCurrency, ALL_CURRENCIES, CURRENCY_SYMBOLS, type Currency } from "@/lib/context/CurrencyContext";

type Mode = "language" | "currency";

type Position = "up" | "down";

interface LocaleCurrencySwitcherProps {
  mode?: Mode;
  compact?: boolean;
  iconOnly?: boolean;
  position?: Position;
}

export default function LocaleCurrencySwitcher({
  mode: initialMode = "language",
  compact = false,
  iconOnly = false,
  position = "down",
}: LocaleCurrencySwitcherProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(initialMode);
  const ref = useRef<HTMLDivElement>(null);

  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectLocale = (locale: Locale) => {
    setOpen(false);
    router.replace(pathname, { locale });
  };

  const selectCurrency = (c: Currency) => {
    setCurrency(c);
    setOpen(false);
  };

  const dropdownPositionClass =
    position === "up"
      ? "right-0 bottom-full mb-2"
      : "right-0 top-full mt-2";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors"
        type="button"
        aria-label={mode === "language" ? "Change language" : "Change currency"}
      >
        {mode === "language" ? (
          iconOnly ? (
            <Globe className="w-4 h-4" />
          ) : (
            <span>{LOCALE_LABELS[currentLocale as Locale] ?? currentLocale}</span>
          )
        ) : (
          <>
            <Coins className="w-3.5 h-3.5" />
            <span>{CURRENCY_SYMBOLS[currency]} {currency}</span>
          </>
        )}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: position === "up" ? 8 : -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: position === "up" ? 8 : -8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`absolute ${dropdownPositionClass} w-56 bg-card border border-surface rounded-sm shadow-2xl z-50 overflow-hidden`}
            >
              {/* Mode tabs (if both modes allowed) */}
              {initialMode === "language" && false && (
                <div className="flex border-b border-surface">
                  <button
                    onClick={() => setMode("language")}
                    className={`flex-1 px-3 py-2 text-xs ${mode === "language" ? "text-primary bg-raised" : "text-secondary"}`}
                  >
                    Langue
                  </button>
                  <button
                    onClick={() => setMode("currency")}
                    className={`flex-1 px-3 py-2 text-xs ${mode === "currency" ? "text-primary bg-raised" : "text-secondary"}`}
                  >
                    Devise
                  </button>
                </div>
              )}

              <div className="max-h-80 overflow-y-auto py-1">
                {mode === "language"
                  ? routing.locales.map((locale) => (
                      <button
                        key={locale}
                        onClick={() => selectLocale(locale as Locale)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                          currentLocale === locale
                            ? "text-primary bg-raised"
                            : "text-primary hover:bg-raised hover:text-primary"
                        }`}
                        type="button"
                      >
                        <span>{LOCALE_LABELS[locale as Locale] ?? locale}</span>
                        {currentLocale === locale && <Check className="w-4 h-4 text-brand-cyan" />}
                      </button>
                    ))
                  : ALL_CURRENCIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => selectCurrency(c as Currency)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                          currency === c
                            ? "text-primary bg-raised"
                            : "text-primary hover:bg-raised hover:text-primary"
                        }`}
                        type="button"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-secondary w-5 text-xs">{CURRENCY_SYMBOLS[c]}</span>
                          <span className="font-mono text-xs">{c}</span>
                        </span>
                        {currency === c && <Check className="w-4 h-4 text-brand-cyan" />}
                      </button>
                    ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
