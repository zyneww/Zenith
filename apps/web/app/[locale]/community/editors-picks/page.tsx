import { setRequestLocale } from "next-intl/server";
import PagePlaceholder from "@/components/ui/PagePlaceholder";
import { Bookmark, Calendar, Star, Award, Archive } from "lucide-react";

export default async function EditorsPicksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PagePlaceholder
      icon={<Bookmark className="w-8 h-8 text-accent" />}
      eyebrow="COMMUNAUTÉ"
      title="Sélection éditoriale"
      subtitle="Nos analyses favorites de la semaine, sélectionnées par l'équipe."
      features={[
        { title: "Daily", description: "Une analyse par jour, écrite par notre équipe.", icon: <Calendar className="w-5 h-5 text-accent" /> },
        { title: "Hebdo", description: "Récap des meilleurs trades et idées long/court.", icon: <Star className="w-5 h-5 text-accent" /> },
        { title: "Top traders", description: "Mise en avant des traders les plus suivis.", icon: <Award className="w-5 h-5 text-accent" /> },
        { title: "Archives", description: "Historique complet, recherche par actif ou date.", icon: <Archive className="w-5 h-5 text-accent" /> },
      ]}
      primaryCta={{ label: "Être notifié", href: "/help/contact" }}
      secondaryCta={{ label: "Voir la roadmap", href: "/help/roadmap" }}
    />
  );
}
