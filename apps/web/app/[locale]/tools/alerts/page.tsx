import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { Bell, MessageSquare, Filter, History, Code } from "lucide-react";

export default async function AlertsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<Bell className="w-8 h-8 text-accent" />}
      eyebrow="OUTILS"
      title="Alertes"
      subtitle="Notifications push, email, Discord. Seuils, conditions combinées, déclencheurs complexes."
      features={[
        { title: "Multi-canal", description: "Push, email, Discord, Telegram, webhook custom.", icon: <MessageSquare className="w-5 h-5 text-accent" /> },
        { title: "Conditions", description: "Prix, % variation, volume, indicateurs, AND/OR.", icon: <Filter className="w-5 h-5 text-accent" /> },
        { title: "Historique", description: "Tous vos déclenchements, audit, replay.", icon: <History className="w-5 h-5 text-accent" /> },
        { title: "API", description: "Créez et gérez vos alertes programmatiquement.", icon: <Code className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
