import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { Activity, Wifi, Database, LineChart, CandlestickChart } from "lucide-react";

export default async function StatusPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<Activity className="w-8 h-8 text-accent" />}
      eyebrow="RESSOURCES"
      title="État du système"
      subtitle="Disponibilité en temps réel des services Zenith. Uptime 99.97% sur 90 jours."
      features={[
        { title: "Binance WebSocket", description: "Flux crypto temps réel, latence < 50ms.", icon: <Wifi className="w-5 h-5 text-accent" /> },
        { title: "CoinGecko", description: "Données fondamentales crypto, market cap, supply.", icon: <Database className="w-5 h-5 text-accent" /> },
        { title: "Finnhub", description: "Forex, indices, actions US, news financières.", icon: <LineChart className="w-5 h-5 text-accent" /> },
        { title: "TwelveData", description: "Commodités, ETF, historique long-terme.", icon: <CandlestickChart className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
