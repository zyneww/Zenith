import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";
import { withSerwist } from "@serwist/turbopack";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
  turbopack: {
    root: path.resolve(process.cwd(), "../.."),
  },
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d8j0ntlcm91z4.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
      },
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
      },
      {
        protocol: "https",
        hostname: "s3.tradingview.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  async redirects() {
    return [
      { source: "/:locale/news/economic-calendar", destination: "/:locale/calendrier", permanent: true },
      { source: "/:locale/news/crypto", destination: "/:locale/apprendre/category/market-news", permanent: true },
      { source: "/:locale/news/forex", destination: "/:locale/apprendre/category/market-news", permanent: true },
      { source: "/:locale/news/markets", destination: "/:locale/apprendre/category/market-news", permanent: true },
      { source: "/:locale/news/flow", destination: "/:locale/apprendre/category/market-news", permanent: true },
      { source: "/:locale/news/technical-analysis", destination: "/:locale/apprendre/category/analysis", permanent: true },
      { source: "/:locale/news/fundamental-analysis", destination: "/:locale/apprendre/category/analysis", permanent: true },
      { source: "/:locale/news/sentiment", destination: "/:locale/apprendre/category/sentiment", permanent: true },
      { source: "/news/economic-calendar", destination: "/calendrier", permanent: true },
      { source: "/news/crypto", destination: "/apprendre/category/market-news", permanent: true },
      { source: "/news/forex", destination: "/apprendre/category/market-news", permanent: true },
      { source: "/news/markets", destination: "/apprendre/category/market-news", permanent: true },
      { source: "/news/flow", destination: "/apprendre/category/market-news", permanent: true },
      { source: "/news/technical-analysis", destination: "/apprendre/category/analysis", permanent: true },
      { source: "/news/fundamental-analysis", destination: "/apprendre/category/analysis", permanent: true },
      { source: "/news/sentiment", destination: "/apprendre/category/sentiment", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://s3.tradingview.com https://*.tradingview.com https://*.clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.tradingview.com wss://*.tradingview.com https://*.zenith.xyz ws://localhost:3001 wss://*.zenith.xyz https://api.coingecko.com https://v6.exchangerate-api.com; frame-src 'self' https://*.clerk.com https://*.tradingview.com; worker-src 'self' blob:; manifest-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, must-revalidate",
          },
        ],
      },
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withSerwist(withNextIntl(nextConfig));
