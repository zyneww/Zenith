import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { Calculator, TrendingUp, TrendingDown, Percent, Layers } from "lucide-react";

export const metadata = { title: "Calculateur P&L" };

export default async function PnlPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<Calculator className="w-8 h-8 text-accent" />}
      eyebrow="OUTILS"
      title="Calculateur P&L"
      subtitle="Calculez vos profits et pertes avant de passer un ordre."
      features={[
        { title: "Long/Short", description: "Support complet des deux positions, marge, levier.", icon: <TrendingUp className="w-5 h-5 text-accent" /> },
        { title: "Frais", description: "Maker, taker, funding, retrait. Tous les frais inclus.", icon: <Percent className="w-5 h-5 text-accent" /> },
        { title: "Levier", description: "Jusqu'à 125x, liquidation price, marge requise.", icon: <TrendingDown className="w-5 h-5 text-accent" /> },
        { title: "Multi-positions", description: "Calculez un portfolio entier, FIFO/LIFO.", icon: <Layers className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
