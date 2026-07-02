import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: [
    "fr",
    "en",
    "ru",
    "es",
    "de",
  ] as const,
  defaultLocale: "fr",
  localePrefix: "always",
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];

export const RTL_LOCALES: Locale[] = [] as any;

export function isRTL(locale: string): boolean {
  return false;
}

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ru: "Русский",
  es: "Español",
  de: "Deutsch",
};

export const LOCALE_CURRENCY: Record<Locale, string> = {
  fr: "EUR",
  en: "USD",
  ru: "RUB",
  es: "EUR",
  de: "EUR",
};

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
