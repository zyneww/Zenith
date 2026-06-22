import { setRequestLocale } from "next-intl/server";
import LegalPage, { LegalSection } from "@/components/ui/LegalPage";
import { Eye } from "lucide-react";

export default async function AccessibilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sections: LegalSection[] = [
    {
      title: "Notre engagement",
      paragraphs: [
        "Zenith s'engage à rendre sa plateforme accessible à tous, quelles que soient les capacités de chacun. L'accessibilité numérique est un droit fondamental, et nous considérons qu'une plateforme financière moderne se doit d'être utilisable par le plus grand nombre — y compris les personnes en situation de handicap visuel, auditif, moteur ou cognitif.",
        "Cet engagement s'inscrit dans le cadre du Référentiel Général d'Amélioration de l'Accessibilité (RGAA) et des Web Content Accessibility Guidelines (WCAG) 2.1 niveau AA, normes internationales de référence édictées par le W3C. Nous travaillons continuellement à améliorer l'accessibilité de chaque nouvelle fonctionnalité.",
        "Pour mener à bien cette mission, Zenith mobilise des ressources dédiées : tests utilisateurs avec des personnes en situation de handicap, audits automatisés et manuels à chaque release, formation des équipes produit et ingénierie, et budget annuel dédié aux correctifs d'accessibilité.",
      ],
    },
    {
      title: "Standards WCAG 2.1 AA",
      paragraphs: [
        "Zenith vise la conformité au niveau AA des WCAG 2.1, qui structurent l'accessibilité autour de quatre principes fondamentaux : Perceptible (les informations doivent être présentées de manière à être perçues par tous), Opérable (l'interface et la navigation doivent être utilisables par tous), Compréhensible (les informations et le fonctionnement doivent être compréhensibles), et Robuste (le contenu doit être compatible avec les technologies d'assistance actuelles et futures).",
        "Concrètement, cela signifie : un contraste de texte minimum de 4.5:1 pour le corps et 3:1 pour les textes larges ; la possibilité de naviguer entièrement au clavier ; des alternatives textuelles pour toutes les images porteuses d'information ; des sous-titres pour les contenus vidéo ; une structure sémantique claire (titres, landmarks, rôles ARIA) ; des messages d'erreur explicites et des formulaires avec labels associés.",
        "Nous publions chaque année un audit d'accessibilité détaillé, incluant le taux de conformité, les non-conformités identifiées, et le plan d'action associé. Le dernier audit fait état d'un taux de conformité de 87%, en progression constante depuis 2024.",
      ],
    },
    {
      title: "Fonctionnalités d'accessibilité",
      paragraphs: [
        "Zenith propose plusieurs fonctionnalités d'accessibilité natives : un mode haut contraste activable depuis le pied de page (rapport de contraste 7:1) ; un mode daltonien avec 3 profils (protanopie, deutéranopie, tritanopie) ; un mode de réduction des animations pour les personnes sensibles au mouvement ; une taille de police ajustable (100%, 125%, 150%) avec reflow complet sur mobile.",
        "La plateforme est entièrement navigable au clavier. Les éléments interactifs (boutons, liens, champs) reçoivent un focus visible clairement identifiable, l'ordre de tabulation est logique, et des raccourcis clavier sont disponibles (par exemple, Échap pour fermer une modale, Tab pour naviguer, Entrée pour valider).",
        "Tous les graphiques financiers (charts Lightweight Charts) sont accompagnés d'une version tabulaire alternative accessible aux lecteurs d'écran. Les alertes de prix sont annoncées via les technologies d'assistance (ARIA live regions) et peuvent être doublées d'une vibration haptique sur mobile.",
      ],
    },
    {
      title: "Limitations connues",
      paragraphs: [
        "Malgré nos efforts, certaines limitations persistent. Les heatmaps de marché, par nature très visuelles, ne disposent pas encore d'une alternative textuelle complète : seule la liste des actifs avec leur performance est annoncée, sans hiérarchie spatiale. Une refonte est planifiée pour le troisième trimestre 2026.",
        "Le screener avancé, qui repose sur de nombreux champs de filtre dynamiques, peut s'avérer complexe à utiliser avec un lecteur d'écran. Une refonte UX avec accompagnement renforcé est en cours. En attendant, les utilisateurs peuvent contacter notre support pour un accompagnement personnalisé.",
        "Les contenus tiers intégrés (widgets, vidéos, charts Pine Script publiés par la communauté) échappent à notre contrôle. Nous travaillons avec les contributeurs pour qu'ils respectent nos guidelines d'accessibilité, mais nous ne pouvons pas garantir la conformité de l'intégralité du contenu utilisateur.",
      ],
    },
    {
      title: "Contact pour signaler un problème",
      paragraphs: [
        "Si vous rencontrez un obstacle à l'accessibilité sur Zenith, nous vous invitons à nous le signaler à l'adresse accessibilite@zenith.xyz ou via le formulaire de contact dédié. Notre équipe accessibilité s'engage à vous répondre sous 5 jours ouvrés et à traiter les incidents critiques sous 48 heures.",
        "Pour faciliter le traitement de votre signalement, merci de préciser : la page ou la fonctionnalité concernée, le navigateur et la technologie d'assistance utilisée, la nature exacte du problème (impossible à atteindre, à comprendre, à utiliser), et si possible une capture d'écran ou un enregistrement vidéo.",
        "Si notre réponse ne vous satisfait pas, vous pouvez saisir le Défenseur des droits (autorité administrative indépendante chargée de veiller au respect des droits et libertés fondamentaux) via son site internet defendedredroits.fr ou par courrier libre au 7 rue Saint-Florentin, 75409 Paris Cedex 08.",
      ],
    },
  ];
  return (
    <LegalPage
      icon={<Eye className="w-8 h-8 text-accent" />}
      eyebrow="LÉGAL"
      title="Accessibilité"
      subtitle="Notre engagement pour une plateforme accessible à tous. Conforme WCAG 2.1 AA."
      lastUpdated="1er juin 2026"
      sections={sections}
    />
  );
}
