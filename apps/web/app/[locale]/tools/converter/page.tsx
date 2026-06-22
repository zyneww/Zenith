import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { ArrowRightLeft, Zap, History, Star, Globe } from "lucide-react";

export const metadata = { title: "Convertisseur" };

export default async function ConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<ArrowRightLeft className="w-8 h-8 text-accent" />}
      eyebrow="OUTILS"
      title="Convertisseur"
      subtitle="Convertissez entre 500+ cryptos et toutes les devises fiat."
      features={[
        { title: "Live rates", description: "Taux mid-market Binance/CoinGecko, MAJ sub-seconde.", icon: <Zap className="w-5 h-5 text-accent" /> },
        { title: "Historique", description: "30 jours de cours, graphique intégré, export.", icon: <History className="w-5 h-5 text-accent" /> },
        { title: "Favoris", description: "Sauvegardez vos paires, accès rapide, partage.", icon: <Star className="w-5 h-5 text-accent" /> },
        { title: "Multi-devises", description: "USD, EUR, GBP, JPY, CHF, +30 devises fiat.", icon: <Globe className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
