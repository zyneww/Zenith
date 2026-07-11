import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing, isRTL } from "@/i18n/routing";
import { SocketProvider } from "@/lib/realtime/SocketContext";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { CommandPaletteProvider } from "@/lib/context/CommandPaletteContext";
import CommandPalette from "@/components/command-palette/CommandPalette";
import { CurrencyProvider } from "@/lib/context/CurrencyContext";
import { NewsDrawerProvider } from "@/lib/context/NewsDrawerContext";
import GlobalNewsDrawer from "@/components/home/GlobalNewsDrawer";
import { ClerkProvider } from "@clerk/nextjs";
import { SerwistProvider } from "@serwist/turbopack/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: {
      default: t("title"),
      template: "Zenith | %s",
    },
    description: t("description"),
    metadataBase: new URL("https://zenith.xyz"),
    applicationName: "Zenith",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Zenith",
    },
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: t("ogLocale"),
      url: "https://zenith.xyz",
      siteName: "Zenith",
      title: t("title"),
      description: t("description"),
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Zenith",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = isRTL(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`dark ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1a1d29" />
      </head>
      <body className="font-sans antialiased min-h-screen min-h-[100dvh] bg-canvas text-primary">
        <ClerkProvider>
        <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV === 'development'}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-accent focus:text-on-accent focus:px-4 focus:py-2 focus:rounded-sm font-mono-caps"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <CurrencyProvider>
              <SocketProvider>
                <CommandPaletteProvider>
                  <NewsDrawerProvider>
                    <main id="main-content">{children}</main>
                    <CommandPalette />
                    <GlobalNewsDrawer />
                  </NewsDrawerProvider>
                </CommandPaletteProvider>
              </SocketProvider>
            </CurrencyProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        </SerwistProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
