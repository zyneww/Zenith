"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import LocaleCurrencySwitcher from "@/components/ui/LocaleCurrencySwitcher";

const PRODUCT_LINKS = [
  { key: "markets", href: "/markets" },
  { key: "screener", href: "/markets" },
  { key: "portfolio", href: "/portfolio" },
] as const;

const COMMUNITY_LINKS = [
  { key: "forum", href: "/community/social" },
  { key: "ideas", href: "/community/ideas" },
  { key: "indicators", href: "/community/education" },
  { key: "education", href: "/community/education" },
  { key: "contact", href: "/help/contact" },
] as const;

const RESOURCES_LINKS = [
  { key: "api", href: "/resources/api" },
  { key: "status", href: "/resources/status" },
] as const;

const LEGAL_LINKS = [
  { key: "terms", href: "/legal/terms" },
  { key: "privacy", href: "/legal/privacy" },
  { key: "cookies", href: "/legal/cookies" },
  { key: "accessibility", href: "/legal/accessibility" },
] as const;

const SOCIAL_LINKS = [
  { name: "Twitter", href: "https://twitter.com", icon: "M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" },
  { name: "Discord", href: "https://discord.com", icon: "M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" },
  { name: "GitHub", href: "https://github.com", icon: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
] as const;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-primary font-semibold text-[11px] uppercase tracking-[0.12em] mb-5">
      {children}
    </h4>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-secondary hover:text-primary transition-colors relative inline-block group"
      >
        <span className="relative">
          {children}
          <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-black group-hover:w-full transition-all duration-300" />
        </span>
      </Link>
    </li>
  );
}

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <>
      {/* Wordmark banner */}
      <div className="bg-canvas py-16 overflow-hidden">
        <div className="text-center">
          <span 
            className="text-[clamp(3rem,15vw,8rem)] font-medium text-secondary leading-none tracking-tight select-none"
            aria-hidden="true"
          >
            zenith.xyz
          </span>
        </div>
      </div>

      <footer className="relative border-t border-surface bg-canvas pt-20 pb-8 overflow-hidden">
        {/* Top hairline */}
        <div className="absolute top-0 left-0 right-0 h-px bg-surface" />

        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Top: Brand + columns */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12 mb-16">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-2">
              <Link href="/" className="inline-block mb-5 group">
                <Image
                  src="/logo2.svg"
                  alt="Zenith"
                  width={140}
                  height={40}
                  loading="lazy"
                  className="h-28 w-auto max-w-full transition-transform group-hover:scale-105"
                />
              </Link>
              <p className="text-sm text-secondary leading-relaxed mb-8 max-w-xs">
                {t("tagline")}
              </p>
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3 text-xs text-secondary">
                  <span className="font-mono-caps">{t("language")}</span>
                  <LocaleCurrencySwitcher mode="language" position="up" />
                </div>
                <div className="flex items-center gap-3 text-xs text-secondary">
                  <span className="font-mono-caps">{t("currency")}</span>
                  <LocaleCurrencySwitcher mode="currency" position="up" />
                </div>
              </div>
              <div className="flex gap-2">
                {SOCIAL_LINKS.map((link) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    className="w-9 h-9 rounded-sm bg-raised border border-surface flex items-center justify-center text-secondary hover:text-primary hover:border-primary transition-colors"
                    aria-label={link.name}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d={link.icon} />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div className="col-span-1">
              <SectionTitle>{t("sections.product")}</SectionTitle>
              <ul className="space-y-3">
                {PRODUCT_LINKS.map((l) => (
                  <FooterLink key={l.key} href={l.href}>{t(`product.${l.key}`)}</FooterLink>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div className="col-span-1">
              <SectionTitle>{t("sections.community")}</SectionTitle>
              <ul className="space-y-3">
                {COMMUNITY_LINKS.map((l) => (
                  <FooterLink key={l.key} href={l.href}>{t(`community.${l.key}`)}</FooterLink>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="col-span-1">
              <SectionTitle>{t("sections.resources")}</SectionTitle>
              <ul className="space-y-3">
                {RESOURCES_LINKS.map((l) => (
                  <FooterLink key={l.key} href={l.href}>{t(`resources.${l.key}`)}</FooterLink>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="col-span-1">
              <SectionTitle>{t("sections.legal")}</SectionTitle>
              <ul className="space-y-3">
                {LEGAL_LINKS.map((l) => (
                  <FooterLink key={l.key} href={l.href}>{t(`legal.${l.key}`)}</FooterLink>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-surface pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-secondary">
              <p>{t("copyright")}</p>
              <p className="italic">{t("dataAttribution")}</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
