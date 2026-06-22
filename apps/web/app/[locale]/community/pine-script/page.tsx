import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { Code, Edit3, Store, Github, Webhook } from "lucide-react";

export default async function PineScriptPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<Code className="w-8 h-8 text-accent" />}
      eyebrow="COMMUNAUTÉ"
      title="Pine Script"
      subtitle="Indicateurs personnalisés. Marketplace d'indicateurs gratuits."
      features={[
        { title: "Editor", description: "IDE intégré, auto-complétion, debug, preview live.", icon: <Edit3 className="w-5 h-5 text-accent" /> },
        { title: "Marketplace", description: "Indicateurs gratuits et premium, ratings, reviews.", icon: <Store className="w-5 h-5 text-accent" /> },
        { title: "Open source", description: "Fork, contributions, versions, licence libre.", icon: <Github className="w-5 h-5 text-accent" /> },
        { title: "API", description: "Publiez vos indicateurs, monétisation, webhooks.", icon: <Webhook className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
