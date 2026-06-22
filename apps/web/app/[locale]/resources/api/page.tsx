import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { Code, Server, KeyRound, FlaskConical, Globe } from "lucide-react";

export const metadata = { title: "API" };

export default async function ApiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<Code className="w-8 h-8 text-accent" />}
      eyebrow="RESSOURCES"
      title="API Zenith"
      subtitle="Endpoints REST et WebSocket pour vos applications. Documentation interactive, rate limits clairs, sandbox gratuit."
      features={[
        { title: "REST endpoints", description: "Prix, historique, métriques, fondamental sur 5000+ actifs.", icon: <Server className="w-5 h-5 text-accent" /> },
        { title: "WebSocket streams", description: "Flux temps réel tick-by-tick, order book, trades.", icon: <Globe className="w-5 h-5 text-accent" /> },
        { title: "Authentication JWT", description: "Clés API, OAuth2, webhooks signés HMAC-SHA256.", icon: <KeyRound className="w-5 h-5 text-accent" /> },
        { title: "Sandbox gratuit", description: "Environnement de test avec données simulées, aucune limite.", icon: <FlaskConical className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
