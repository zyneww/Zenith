import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { GitBranch, Grid3x3, Flame, History, Download } from "lucide-react";

export const metadata = { title: "Corrélations" };

export default async function CorrelationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<GitBranch className="w-8 h-8 text-accent" />}
      eyebrow="OUTILS"
      title="Corrélation"
      subtitle="Analysez les corrélations entre actifs pour diversifier votre portfolio."
      features={[
        { title: "Matrix", description: "Matrice N×N, coefficients de Pearson, color-coded.", icon: <Grid3x3 className="w-5 h-5 text-accent" /> },
        { title: "Heatmap", description: "Visualisation rapide, paires les plus corrélées.", icon: <Flame className="w-5 h-5 text-accent" /> },
        { title: "Historique", description: "Évolution de la corrélation sur 30/90/365 jours.", icon: <History className="w-5 h-5 text-accent" /> },
        { title: "Export", description: "CSV, PNG, intégration portfolio, API.", icon: <Download className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
