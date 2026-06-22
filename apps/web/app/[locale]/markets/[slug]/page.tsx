import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import AssetDetailClient from "./AssetDetailClient";
import { getAsset, getAllSlugs } from "@/lib/assets/registry";

interface AssetPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export const revalidate = 60;

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT || 3000}`;
}

type PricePayload = {
  asset?: { id: string; symbol: string; name: string; type: string; image: string | null; finnhubSymbol: string | null };
  price?: { current: number; change24h: number; change1h: number; change7d: number; high24h: number; low24h: number; marketCap: number; volume24h: number };
  lastUpdated?: string;
} | null;

type OhlcvPayload = {
  slug: string;
  type: string;
  range: string;
  points: { t: number; o: number; h: number; l: number; c: number; v?: number }[];
} | null;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default async function AssetPage({ params }: AssetPageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);

  const asset = getAsset(slug);
  if (!asset) notFound();

  const base = getBaseUrl();
  const [priceData, ohlcvData] = await Promise.all([
    fetchJson<PricePayload>(`${base}/api/market/asset/${asset.slug}?type=${asset.type}`),
    fetchJson<OhlcvPayload>(`${base}/api/market/ohlcv/${asset.slug}?range=1h&type=${asset.type}`),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-canvas text-primary">
        <AssetDetailClient asset={asset} priceData={priceData} ohlcv={ohlcvData} />
      </main>
      <Footer />
    </>
  );
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}
