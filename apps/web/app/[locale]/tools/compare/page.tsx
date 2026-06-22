import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { BarChart4, Columns, LineChart, TrendingUp, Download } from "lucide-react";

export default async function ComparePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<BarChart4 className="w-8 h-8 text-accent" />}
      eyebrow="OUTILS"
      title="Comparateur"
      subtitle="Comparez plusieurs actifs côte à côte : prix, performance, métriques."
      features={[
        { title: "Side-by-side", description: "Jusqu'à 6 actifs simultanés, normalisés à 100.", icon: <Columns className="w-5 h-5 text-accent" /> },
        { title: "Chart overlay", description: "Superposition des graphiques, échelles ajustables.", icon: <LineChart className="w-5 h-5 text-accent" /> },
        { title: "Metrics", description: "Volatilité, Sharpe, drawdown, beta, corrélation.", icon: <TrendingUp className="w-5 h-5 text-accent" /> },
        { title: "Export", description: "PNG, CSV, partage de comparaison, embed.", icon: <Download className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
