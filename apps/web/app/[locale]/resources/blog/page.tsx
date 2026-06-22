import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { FileText, TrendingUp, BookOpen, Newspaper, Code } from "lucide-react";

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<FileText className="w-8 h-8 text-accent" />}
      eyebrow="RESSOURCES"
      title="Blog"
      subtitle="Analyses approfondies, tutoriels avancés, et news de Zenith."
      features={[
        { title: "Analyses", description: "Décryptages techniques et fondamentaux, hebdomadaires.", icon: <TrendingUp className="w-5 h-5 text-accent" /> },
        { title: "Tutoriels", description: "Guides avancés Pine Script, API, automatisation.", icon: <BookOpen className="w-5 h-5 text-accent" /> },
        { title: "News", description: "Annonces produit, partenariats, événements.", icon: <Newspaper className="w-5 h-5 text-accent" /> },
        { title: "API", description: "Deep-dives techniques, best practices, changelog.", icon: <Code className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
