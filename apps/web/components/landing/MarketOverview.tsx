"use client";

import { useMemo } from "react";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRealtimePrice } from "@/lib/hooks/useRealtimePrice";
import { useTranslations } from "next-intl";

interface MarketItem {
  name: string;
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
  sparklinePath: string;
}

interface MarketCategory {
  title: string;
  slug: string;
  items: MarketItem[];
}

const INDICES: MarketCategory = {
  title: "Indices majeurs",
  slug: "indices",
  items: [
    { name: "S&P 500", symbol: "SPX", price: "5,987.42", change: "+0.45%", isPositive: true, sparklinePath: "M0,25 L10,20 L20,22 L30,15 L40,18 L50,10 L60,14 L70,8 L80,12 L90,5 L100,10" },
    { name: "Nasdaq 100", symbol: "NDX", price: "21,234.67", change: "+0.72%", isPositive: true, sparklinePath: "M0,20 L10,18 L20,15 L30,20 L40,12 L50,16 L60,8 L70,14 L80,6 L90,12 L100,5" },
    { name: "DAX 40", symbol: "DAX", price: "20,456.89", change: "-0.12%", isPositive: false, sparklinePath: "M0,10 L10,14 L20,12 L30,18 L40,15 L50,20 L60,16 L70,22 L80,18 L90,25 L100,20" },
    { name: "FTSE 100", symbol: "FTSE", price: "8,234.56", change: "+0.23%", isPositive: true, sparklinePath: "M0,22 L10,18 L20,20 L30,15 L40,17 L50,12 L60,14 L70,10 L80,12 L90,8 L100,10" },
  ],
};

const COMMODITIES: MarketCategory = {
  title: "Commodities",
  slug: "commodities",
  items: [
    { name: "Gold", symbol: "XAU", price: "$2,654.30", change: "+0.85%", isPositive: true, sparklinePath: "M0,20 L10,18 L20,15 L30,12 L40,16 L50,10 L60,14 L70,8 L80,12 L90,6 L100,10" },
    { name: "Crude Oil", symbol: "WTI", price: "$78.45", change: "-1.20%", isPositive: false, sparklinePath: "M0,10 L10,14 L20,18 L30,15 L40,20 L50,16 L60,22 L70,18 L80,24 L90,20 L100,25" },
    { name: "US Dollar Index", symbol: "DXY", price: "103.24", change: "+0.15%", isPositive: true, sparklinePath: "M0,18 L10,16 L20,14 L30,17 L40,12 L50,15 L60,10 L70,13 L80,8 L90,11 L100,7" },
    { name: "Natural Gas", symbol: "NG", price: "$3.42", change: "+2.10%", isPositive: true, sparklinePath: "M0,25 L10,22 L20,18 L30,20 L40,15 L50,12 L60,16 L70,10 L80,14 L90,8 L100,12" },
  ],
};

const FOREX: MarketCategory = {
  title: "Forex",
  slug: "forex",
  items: [
    { name: "EUR/USD", symbol: "EURUSD", price: "1.0845", change: "+0.08%", isPositive: true, sparklinePath: "M0,20 L10,18 L20,16 L30,19 L40,14 L50,17 L60,12 L70,15 L80,10 L90,13 L100,9" },
    { name: "GBP/USD", symbol: "GBPUSD", price: "1.2742", change: "+0.15%", isPositive: true, sparklinePath: "M0,18 L10,16 L20,14 L30,17 L40,12 L50,15 L60,10 L70,13 L80,8 L90,11 L100,7" },
    { name: "USD/JPY", symbol: "USDJPY", price: "149.82", change: "-0.22%", isPositive: false, sparklinePath: "M0,10 L10,14 L20,12 L30,16 L40,18 L50,15 L60,20 L70,17 L80,22 L90,19 L100,24" },
    { name: "USD/CAD", symbol: "USDCAD", price: "1.3520", change: "+0.05%", isPositive: true, sparklinePath: "M0,15 L10,13 L20,16 L30,11 L40,14 L50,9 L60,12 L70,7 L80,10 L90,5 L100,8" },
  ],
};

const CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL", "BNB"];

const CRYPTO_STATIC = [
  { name: "Bitcoin", symbol: "BTC", basePrice: 64330.91, sparklinePath: "M0,20 Q10,10 20,25 T40,15 T60,20 T80,5 T100,10" },
  { name: "Ethereum", symbol: "ETH", basePrice: 1788.33, sparklinePath: "M0,15 Q10,25 20,10 T40,20 T60,10 T80,15 T100,5" },
  { name: "Solana", symbol: "SOL", basePrice: 172.34, sparklinePath: "M0,25 Q15,20 25,10 T50,15 T75,5 T100,0" },
  { name: "BNB", symbol: "BNB", basePrice: 605.20, sparklinePath: "M0,15 Q10,10 20,20 T40,15 T60,25 T80,10 T100,15" },
];

function formatCryptoPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

function CryptoCard() {
  const t = useTranslations("marketOverview");
  const { prices } = useRealtimePrice(CRYPTO_SYMBOLS);

  const items = useMemo(() => {
    return CRYPTO_STATIC.map((asset) => {
      const live = prices[asset.symbol];
      const displayPrice = live ? formatCryptoPrice(live.price) : formatCryptoPrice(asset.basePrice);
      const change = live ? (live.price > asset.basePrice ? "+" : "") + ((live.price - asset.basePrice) / asset.basePrice * 100).toFixed(2) + "%" : "+2.45%";
      const isPositive = !change.startsWith("-");
      return {
        name: asset.name,
        symbol: asset.symbol,
        price: displayPrice,
        change,
        isPositive,
        sparklinePath: asset.sparklinePath,
      };
    });
  }, [prices]);

  return <MarketCard title={t("cardCrypto")} slug="crypto" items={items} />;
}

function MarketCard({ title, slug, items }: { title: string; slug: string; items: MarketItem[] }) {
  const t = useTranslations("marketOverview");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-dark-card/50 backdrop-blur-sm border border-dark-border rounded-xl p-5 hover:border-gray-700 transition-all group"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <Link
          href={`/markets?category=${slug}`}
          className="text-xs text-gray-500 hover:text-brand-cyan transition-colors flex items-center gap-1"
        >
          {t("seeAll")}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 w-8">{item.symbol}</span>
              <span className="text-sm text-gray-300">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-14 h-5" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d={item.sparklinePath}
                  fill="none"
                  stroke={item.isPositive ? "#22c55e" : "#ef4444"}
                  strokeWidth="1.5"
                />
              </svg>
              <div className="text-right w-24">
                <div className="text-sm font-medium text-white">{item.price}</div>
                <div className={`text-xs flex items-center gap-0.5 justify-end ${item.isPositive ? "text-up" : "text-down"}`}>
                  {item.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {item.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function MarketOverview() {
  const t = useTranslations("marketOverview");
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-cyan/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-brand-cyan text-xs font-bold tracking-wider mb-2 uppercase">
            {t("badge")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {t("title")}
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MarketCard title={t("cardIndices")} slug="indices" items={INDICES.items} />
          <CryptoCard />
          <MarketCard title={t("cardCommodities")} slug="commodities" items={COMMODITIES.items} />
          <MarketCard title={t("cardForex")} slug="forex" items={FOREX.items} />
        </div>
      </div>
    </section>
  );
}
