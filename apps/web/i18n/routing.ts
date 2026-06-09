import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: [
    "fr",
    "en-US",
    "en-UK",
    "ru",
    "it",
    "es",
    "ja",
    "nl",
    "de",
    "pl",
    "tr",
    "pt",
    "id",
    "ms",
    "th",
    "vi",
    "ko",
    "zh-CN",
    "zh-TW",
    "ar",
    "he",
  ] as const,
  defaultLocale: "fr",
  localePrefix: "always",
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];

export const RTL_LOCALES: Locale[] = ["ar", "he"];

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.includes(locale as Locale);
}

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  "en-US": "English (US)",
  "en-UK": "English (UK)",
  ru: "Русский",
  it: "Italiano",
  es: "Español",
  ja: "日本語",
  nl: "Nederlands",
  de: "Deutsch",
  pl: "Polski",
  tr: "Türkçe",
  pt: "Português",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  th: "ภาษาไทย",
  vi: "Tiếng Việt",
  ko: "한국어",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ar: "العربية",
  he: "עברית",
};

export const LOCALE_CURRENCY: Record<Locale, string> = {
  fr: "EUR",
  "en-US": "USD",
  "en-UK": "GBP",
  ru: "RUB",
  it: "EUR",
  es: "EUR",
  ja: "JPY",
  nl: "EUR",
  de: "EUR",
  pl: "PLN",
  tr: "TRY",
  pt: "BRL",
  id: "IDR",
  ms: "MYR",
  th: "THB",
  vi: "VND",
  ko: "KRW",
  "zh-CN": "CNY",
  "zh-TW": "TWD",
  ar: "AED",
  he: "ILS",
};

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
