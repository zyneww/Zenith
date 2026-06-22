import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { Users, MessageSquare, ShieldCheck, ThumbsUp, Search } from "lucide-react";

export default async function SocialPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<Users className="w-8 h-8 text-accent" />}
      eyebrow="COMMUNAUTÉ"
      title="Forum communautaire"
      subtitle="Discussions, analyses partagées, support entre traders. Modération active, anti-spam."
      features={[
        { title: "Threads", description: "Discussions organisées par actif, sujet, stratégie.", icon: <MessageSquare className="w-5 h-5 text-accent" /> },
        { title: "Modération", description: "Équipe active, anti-spam ML, signalements rapides.", icon: <ShieldCheck className="w-5 h-5 text-accent" /> },
        { title: "Réactions", description: "Votes, badges, réputation basée sur la qualité.", icon: <ThumbsUp className="w-5 h-5 text-accent" /> },
        { title: "Recherche", description: "Full-text, filtres avancés, syntaxe technique.", icon: <Search className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
