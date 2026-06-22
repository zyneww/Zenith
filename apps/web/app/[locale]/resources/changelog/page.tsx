import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { Sparkles, Calendar } from "lucide-react";

export const metadata = { title: "Journal des modifications" };

export default async function ChangelogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<Sparkles className="w-8 h-8 text-accent" />}
      eyebrow="RESSOURCES"
      title="Changelog"
      subtitle="Toutes les évolutions Zenith. Hebdomadaire, transparent, avec commits liés."
      features={[
        { title: "Mai 2026", description: "Lightweight Charts v5, 50 nouveaux actifs, watchlist multi-portefeuilles.", icon: <Calendar className="w-5 h-5 text-accent" /> },
        { title: "Avril 2026", description: "Screener avancé, alertes Discord, performance API -40%.", icon: <Calendar className="w-5 h-5 text-accent" /> },
        { title: "Mars 2026", description: "Heatmap marché, calculateur P&L, support EUR complet.", icon: <Calendar className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
