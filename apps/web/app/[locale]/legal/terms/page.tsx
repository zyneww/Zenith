import { setRequestLocale } from "next-intl/server";
import LegalPage, { LegalSection } from "@/components/ui/LegalPage";
import { FileText } from "lucide-react";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sections: LegalSection[] = [
    {
      title: "Objet et acceptation",
      paragraphs: [
        "Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de la plateforme Zenith, éditée par Zenith SAS, société par actions simplifiée immatriculée au RCS de Paris sous le numéro 902 345 678, dont le siège social est situé 42 rue de la Bourse, 75002 Paris.",
        "En accédant à Zenith, en créant un compte ou en utilisant l'un quelconque de nos services, vous reconnaissez avoir lu, compris et accepté sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, nous vous invitons à ne pas utiliser la plateforme.",
        "Zenith se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur dès leur publication. L'utilisation continue de la plateforme après publication vaut acceptation des modifications.",
      ],
    },
    {
      title: "Description du service",
      paragraphs: [
        "Zenith est une plateforme d'intelligence financière destinée aux traders et investisseurs particuliers et professionnels. Elle agrège en temps réel des données de marché issues de providers tiers (Binance, CoinGecko, Finnhub, TwelveData) et les restitue sous forme de graphiques, heatmaps, alertes, analyses et outils d'aide à la décision.",
        "Le service inclut, selon le plan souscrit : un accès aux marchés crypto, forex, commodities et indices ; des outils de calcul (P&L, position, convertisseur) ; un système d'alertes multi-canal ; un portfolio tracker ; une API REST et WebSocket ; ainsi qu'un accès optionnel à des contenus éducatifs et communautaires.",
        "Zenith est un outil d'information et d'analyse. La plateforme ne fournit aucun conseil en investissement, aucune recommandation d'achat ou de vente, et n'exécute aucun ordre sur les marchés. Les décisions de trading relèvent de l'entière responsabilité de l'utilisateur.",
      ],
    },
    {
      title: "Obligations de l'utilisateur",
      paragraphs: [
        "L'utilisateur s'engage à fournir des informations exactes, complètes et à jour lors de son inscription, et à les maintenir à jour. Toute fausse déclaration peut entraîner la suspension immédiate du compte.",
        "L'utilisateur est seul responsable de la confidentialité de ses identifiants de connexion. Toute activité réalisée depuis son compte est réputée effectuée par lui. En cas de suspicion d'utilisation frauduleuse, il doit en informer Zenith dans les plus brefs délais.",
        "L'utilisateur s'engage à ne pas utiliser la plateforme à des fins illicites, contraires à l'ordre public ou aux bonnes mœurs, et à ne pas tenter de porter atteinte à son intégrité (reverse engineering, attaques, scraping abusif, etc.). Le respect des conditions des providers de données tiers est également requis.",
      ],
    },
    {
      title: "Propriété intellectuelle",
      paragraphs: [
        "L'ensemble des éléments de la plateforme Zenith — code source, design, bases de données, contenus, marques, logos, charts, indicateurs — est protégé par les lois en vigueur sur la propriété intellectuelle et demeure la propriété exclusive de Zenith SAS ou de ses partenaires.",
        "Toute reproduction, représentation, modification, distribution ou exploitation, totale ou partielle, des contenus présents sur Zenith sans autorisation écrite préalable est strictement interdite et constituerait une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.",
        "Les données de marché redistribuées via l'API restent soumises aux conditions de leurs providers respectifs. Une licence d'utilisation est concédée à l'utilisateur, personnelle, non-exclusive et non-transférable, pour la durée de son abonnement.",
      ],
    },
    {
      title: "Limitation de responsabilité",
      paragraphs: [
        "Zenith s'efforce de fournir des données exactes et à jour, mais ne garantit pas l'exactitude, l'exhaustivité ou la ponctualité des informations diffusées. Les données de marché peuvent contenir des erreurs, des retards ou des interruptions sans que cela n'engage la responsabilité de Zenith.",
        "En aucun cas Zenith ne pourra être tenu responsable des pertes financières, directes ou indirectes, résultant de l'utilisation de la plateforme, d'une décision d'investissement prise sur la base des informations affichées, ou d'une indisponibilité temporaire du service.",
        "La responsabilité totale de Zenith, toutes causes confondues, est limitée au montant des sommes effectivement versées par l'utilisateur au titre de son abonnement au cours des douze (12) derniers mois. Cette limitation ne s'applique pas en cas de faute lourde ou de dol.",
      ],
    },
  ];
  return (
    <LegalPage
      icon={<FileText className="w-8 h-8 text-accent" />}
      eyebrow="LÉGAL"
      title="Conditions Générales d'Utilisation"
      subtitle="Les règles qui encadrent l'utilisation de Zenith. À lire avant d'utiliser nos services."
      lastUpdated="1er juin 2026"
      sections={sections}
    />
  );
}
