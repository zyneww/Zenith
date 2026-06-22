import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { BarChart3, TrendingUp, Clock, Bookmark, Download } from "lucide-react";

export const metadata = { title: "Charting" };

export default async function ChartingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<BarChart3 className="w-8 h-8 text-accent" />}
      eyebrow="RESSOURCES"
      title="Charting"
      subtitle="Documentation des charts. Lightweight Charts v5, indicateurs, multi-timeframes."
      features={[
        { title: "Indicateurs", description: "RSI, MACD, Bollinger, EMA, volume, 50+ disponibles.", icon: <TrendingUp className="w-5 h-5 text-accent" /> },
        { title: "Multi-TF", description: "1m à 1W, sync inter-charts, timeframes custom.", icon: <Clock className="w-5 h-5 text-accent" /> },
        { title: "Sauvegardes", description: "Layouts persistés cloud, multi-device, partageable.", icon: <Bookmark className="w-5 h-5 text-accent" /> },
        { title: "Export", description: "PNG, CSV, partage de vue, embed URL.", icon: <Download className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
