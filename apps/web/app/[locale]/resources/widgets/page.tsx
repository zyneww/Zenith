import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { Code2, Tag, Activity, ArrowRightLeft, Grid3x3 } from "lucide-react";

export default async function WidgetsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<Code2 className="w-8 h-8 text-accent" />}
      eyebrow="RESSOURCES"
      title="Widgets"
      subtitle="Composants intégrables pour votre site ou blog. Prix live, sparklines, convertisseurs."
      features={[
        { title: "Prix ticker", description: "Bandeau de prix live, customizable, multi-actifs.", icon: <Tag className="w-5 h-5 text-accent" /> },
        { title: "Sparkline", description: "Mini-graphique 7j, léger, sans tracking.", icon: <Activity className="w-5 h-5 text-accent" /> },
        { title: "Convertisseur", description: "Widget de conversion crypto ↔ fiat, taux live.", icon: <ArrowRightLeft className="w-5 h-5 text-accent" /> },
        { title: "Heatmap", description: "Carte thermique du marché en iframe embed.", icon: <Grid3x3 className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
