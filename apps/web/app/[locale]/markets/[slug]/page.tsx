import { ArrowLeft, Star, TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import TradingViewChart from "@/components/charts/TradingViewChart";
import Header from "@/components/landing/Header";
import { setRequestLocale } from "next-intl/server";

interface AssetPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

const ASSET_DATA: Record<string, { name: string; symbol: string; price: number; change24h: number; marketCap: string; volume: string; high24h: number; low24h: number }> = {
  bitcoin: { name: "Bitcoin", symbol: "BTC", price: 64330.91, change24h: 2.45, marketCap: "$1.54T", volume: "$52.90B", high24h: 65200, low24h: 63100 },
  ethereum: { name: "Ethereum", symbol: "ETH", price: 1788.33, change24h: -0.08, marketCap: "$418.00B", volume: "$24.30B", high24h: 1820, low24h: 1750 },
  solana: { name: "Solana", symbol: "SOL", price: 172.34, change24h: 5.23, marketCap: "$79.00B", volume: "$3.80B", high24h: 178, low24h: 165 },
};

function generateMockOHLCV() {
  const data = [];
  const now = Date.now();
  let basePrice = 64330;
  
  for (let i = 100; i > 0; i--) {
    const time = Math.floor((now - i * 3600000) / 1000);
    const volatility = basePrice * 0.015;
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const high = open + Math.random() * volatility * 0.3;
    const low = open - Math.random() * volatility * 0.3;
    const close = low + Math.random() * (high - low);
    
    data.push({ time, open, high, low, close });
    basePrice = close;
  }
  
  return data;
}

function generateVolumeData(ohlcvData: any[]) {
  return ohlcvData.map(d => ({
    time: d.time,
    value: Math.floor(Math.random() * 50000 + 10000),
    color: d.close >= d.open ? "#22c55e" : "#ef4444",
  }));
}

export default async function AssetPage({ params }: AssetPageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const asset = ASSET_DATA[slug.toLowerCase()];
  
  if (!asset) {
    notFound();
  }
  
  const ohlcvData = generateMockOHLCV();
  const volumeData = generateVolumeData(ohlcvData);
  const isPositive = asset.change24h >= 0;
  
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0e14] text-white">
      {/* Header */}
      <div className="border-b border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/markets" className="text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-cyan to-brand-purple flex items-center justify-center text-sm font-bold">
              {asset.symbol[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold">{asset.name}</h1>
              <span className="text-sm text-gray-500">{asset.symbol}</span>
            </div>
            <button className="ml-auto text-gray-500 hover:text-yellow-500 transition" aria-label="Ajouter aux favoris">
              <Star className="w-5 h-5" />
            </button>
          </div>
          
          {/* Price row */}
          <div className="flex items-end gap-4">
            <span className="text-3xl font-bold">${asset.price.toLocaleString()}</span>
            <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-up" : "text-down"}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPositive ? "+" : ""}{asset.change24h}%
            </span>
            <span className="text-sm text-gray-500">24h</span>
          </div>
        </div>
      </div>
      
      {/* Stats bar */}
      <div className="border-b border-[#1f2937] bg-[#0d1017]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-8 text-sm">
          <div>
            <span className="text-gray-500 block text-xs">Market Cap</span>
            <span className="font-medium">{asset.marketCap}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Volume 24h</span>
            <span className="font-medium">{asset.volume}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">High 24h</span>
            <span className="font-medium">${asset.high24h.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Low 24h</span>
            <span className="font-medium">${asset.low24h.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart */}
          <div className="lg:col-span-3">
            <div className="bg-[#131722] border border-[#1f2937] rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand-cyan" />
                  Chart
                </h2>
                <div className="flex gap-2">
                  {["1m", "5m", "15m", "1h", "4h", "1d", "1w"].map((tf) => (
                    <button
                      key={tf}
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        tf === "1h"
                          ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan"
                          : "border border-gray-700 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <TradingViewChart data={ohlcvData} volumeData={volumeData} height={500} />
            </div>
            
            {/* Order Book mock */}
            <div className="mt-6 bg-[#131722] border border-[#1f2937] rounded-xl p-4">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-cyan" />
                Order Book
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-up font-bold mb-2">BIDS</h4>
                  <div className="space-y-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-up">${(asset.price - (i + 1) * 10).toFixed(2)}</span>
                        <span className="text-gray-400">{(Math.random() * 2).toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs text-down font-bold mb-2">ASKS</h4>
                  <div className="space-y-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-down">${(asset.price + (i + 1) * 10).toFixed(2)}</span>
                        <span className="text-gray-400">{(Math.random() * 2).toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-[#131722] border border-[#1f2937] rounded-xl p-4">
              <h3 className="text-sm font-bold mb-3">About {asset.name}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {asset.name} is a decentralized digital currency that can be transferred between users on a peer-to-peer network without intermediaries.
              </p>
            </div>
            
            <div className="bg-[#131722] border border-[#1f2937] rounded-xl p-4">
              <h3 className="text-sm font-bold mb-3">Key Metrics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Circulating Supply</span>
                  <span>19.5M {asset.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Supply</span>
                  <span>21M {asset.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Supply</span>
                  <span>21M {asset.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">All Time High</span>
                  <span className="text-up">$73,750</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">All Time Low</span>
                  <span className="text-down">$67.81</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}

export function generateStaticParams() {
  return [
    { slug: "bitcoin" },
    { slug: "ethereum" },
    { slug: "solana" },
  ];
}
