import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { BookOpen, Zap, KeyRound, Wifi, Server } from "lucide-react";

export default async function DocsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<BookOpen className="w-8 h-8 text-accent" />}
      eyebrow="RESSOURCES"
      title="Documentation"
      subtitle="Guides pas-à-pas, références API, tutoriels d'intégration."
      features={[
        { title: "Quickstart 5min", description: "Premiers appels API, setup, première requête réussie.", icon: <Zap className="w-5 h-5 text-accent" /> },
        { title: "Auth JWT", description: "Génération de clés, scopes, rotation, sécurité.", icon: <KeyRound className="w-5 h-5 text-accent" /> },
        { title: "WebSocket", description: "Abonnements, reconnexion, gestion des erreurs.", icon: <Wifi className="w-5 h-5 text-accent" /> },
        { title: "REST", description: "Endpoints, pagination, rate limits, exemples.", icon: <Server className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
