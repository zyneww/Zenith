import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { Crosshair, ShieldAlert, Percent, Target, Scale } from "lucide-react";

export default async function PositionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<Crosshair className="w-8 h-8 text-accent" />}
      eyebrow="OUTILS"
      title="Calculateur de position"
      subtitle="Déterminez la taille optimale de votre position selon votre risque."
      features={[
        { title: "Stop-loss", description: "Calcul auto du stop selon ATR ou distance fixe.", icon: <ShieldAlert className="w-5 h-5 text-accent" /> },
        { title: "Risque %", description: "1-5% du capital par trade, conforme money management.", icon: <Percent className="w-5 h-5 text-accent" /> },
        { title: "Take-profit", description: "TP1, TP2, TP3, sortie partielle, R-multiples.", icon: <Target className="w-5 h-5 text-accent" /> },
        { title: "R:R ratio", description: "Risk/Reward live, alertes si < 2:1.", icon: <Scale className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
