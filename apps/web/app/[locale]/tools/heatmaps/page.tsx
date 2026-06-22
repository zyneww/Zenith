import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { Grid3x3, Layers, Filter, Calendar, MousePointerClick } from "lucide-react";

export const metadata = { title: "Heatmaps" };

export default async function HeatmapsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<Grid3x3 className="w-8 h-8 text-accent" />}
      eyebrow="OUTILS"
      title="Heatmap"
      subtitle="Vue d'ensemble des marchés par capitalisation et performance 24h."
      features={[
        { title: "Treemap", description: "Top 500 cryptos, taille = market cap, couleur = %24h.", icon: <Grid3x3 className="w-5 h-5 text-accent" /> },
        { title: "Sector filter", description: "DeFi, L1, L2, gaming, AI, memecoins, stablecoins.", icon: <Filter className="w-5 h-5 text-accent" /> },
        { title: "Time range", description: "1h, 24h, 7j, 30j, YTD, custom range.", icon: <Calendar className="w-5 h-5 text-accent" /> },
        { title: "Click-to-detail", description: "Drill-down sur n'importe quel actif, modal complet.", icon: <MousePointerClick className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
