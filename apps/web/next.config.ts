import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";
import { withSerwist } from "@serwist/turbopack";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
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
        hostname: "*.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "**.tradingview.com",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
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
      { source: "/:locale/news", destination: "/:locale/apprendre", permanent: true },
      { source: "/news/economic-calendar", destination: "/calendrier", permanent: true },
      { source: "/news/crypto", destination: "/apprendre/category/market-news", permanent: true },
      { source: "/news/forex", destination: "/apprendre/category/market-news", permanent: true },
      { source: "/news/markets", destination: "/apprendre/category/market-news", permanent: true },
      { source: "/news/flow", destination: "/apprendre/category/market-news", permanent: true },
      { source: "/news/technical-analysis", destination: "/apprendre/category/analysis", permanent: true },
      { source: "/news/fundamental-analysis", destination: "/apprendre/category/analysis", permanent: true },
      { source: "/news/sentiment", destination: "/apprendre/category/sentiment", permanent: true },
      { source: "/news", destination: "/apprendre", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
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
