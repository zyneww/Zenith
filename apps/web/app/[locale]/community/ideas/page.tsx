import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { Lightbulb, TrendingUp, TrendingDown, Eye, MessageCircle } from "lucide-react";

export default async function IdeasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<Lightbulb className="w-8 h-8 text-accent" />}
      eyebrow="COMMUNAUTÉ"
      title="Idées de trading"
      subtitle="Partagez vos analyses, recevez des votes de la communauté, suivez les traders les mieux notés."
      features={[
        { title: "Long/Short", description: "Position claire, timeframe, targets, stop-loss.", icon: <TrendingUp className="w-5 h-5 text-accent" /> },
        { title: "Visibilité", description: "Mise en avant des meilleures idées, top traders.", icon: <Eye className="w-5 h-5 text-accent" /> },
        { title: "Votes", description: "Système de réputation, anti-manipulation, badges.", icon: <TrendingDown className="w-5 h-5 text-accent" /> },
        { title: "Commentaires", description: "Discussion sous chaque idée, threading, mentions.", icon: <MessageCircle className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
