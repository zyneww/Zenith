import { setRequestLocale } from "next-intl/server";
import LegalPage, { LegalSection } from "@/components/ui/LegalPage";
import { Cookie } from "lucide-react";

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sections: LegalSection[] = [
    {
      title: "Qu'est-ce qu'un cookie",
      paragraphs: [
        "Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette) lorsque vous visitez un site web. Il permet au site de mémoriser vos actions et préférences (identifiant de session, langue, paramètres d'affichage) pendant une durée déterminée, afin d'améliorer votre expérience de navigation.",
        "Les cookies ne permettent pas de vous identifier personnellement en tant que tel, sauf si vous avez créé un compte et êtes authentifié. Dans ce cas, ils sont associés à votre session utilisateur et permettent de vous reconnaître entre deux visites.",
        "Conformément à la directive ePrivacy (2002/58/CE) et aux recommandations de la CNIL, Zenith vous informe de manière transparente sur l'utilisation des cookies et vous offre la possibilité de les accepter, de les refuser ou de les paramétrer selon vos préférences.",
      ],
    },
    {
      title: "Cookies essentiels",
      paragraphs: [
        "Les cookies essentiels sont strictement nécessaires au fonctionnement de la plateforme. Ils permettent notamment de vous authentifier, de mémoriser votre session, de sécuriser votre compte (protection CSRF, jetons anti-falsification) et d'assurer la stabilité du service. Sans ces cookies, certaines fonctionnalités ne seraient pas accessibles.",
        "Ces cookies ne collectent aucune information à des fins marketing ou analytiques. Ils sont déposés dès votre arrivée sur le site, sans nécessiter de consentement préalable, conformément à l'article 82 de la loi Informatique et Libertés et aux lignes directrices de la CNIL.",
        "Liste des cookies essentiels utilisés : znt_session (session, durée : session), znt_csrf (anti-CSRF, durée : session), znt_locale (préférence de langue, durée : 1 an), znt_consent (mémorisation de vos choix cookies, durée : 1 an).",
      ],
    },
    {
      title: "Cookies analytiques",
      paragraphs: [
        "Les cookies analytiques nous permettent de mesurer l'audience de la plateforme, d'identifier les pages les plus consultées, de comprendre comment les utilisateurs interagissent avec le service et de détecter d'éventuels problèmes d'ergonomie. Ces informations sont agrégées et anonymisées.",
        "Nous utilisons Plausible Analytics, une solution privacy-first qui ne dépose aucun cookie, ne collecte aucune donnée personnelle et n'effectue aucun tracking inter-sites. Plausible est conforme au RGPD sans nécessiter de bannière de consentement. Les seules données collectées sont : la page consultée, le referrer (anonymisé), le pays (via l'IP, jamais stockée), le type d'appareil et le navigateur.",
        "Si vous souhaitez désactiver entièrement les analytics, vous pouvez utiliser une extension de type uBlock Origin, NoScript ou Privacy Badger. Les cookies analytiques ne sont jamais activés avant que vous ayez donné votre consentement explicite via le bandeau cookies.",
      ],
    },
    {
      title: "Cookies marketing",
      paragraphs: [
        "Zenith n'utilise aucun cookie marketing. Nous ne diffusons aucune publicité ciblée, nous n'intégrons aucun pixel de tracking publicitaire (Facebook, Google Ads, TikTok, etc.) et nous ne partageons aucune donnée avec des régies publicitaires ou des data brokers.",
        "Cette approche est un choix délibéré : Zenith est un service premium financé par ses abonnés, et non par la publicité. Nous considérons que la vente d'attention ou de données personnelles est incompatible avec notre mission d'aider les utilisateurs à prendre de meilleures décisions financières.",
        "Si à l'avenir nous devions utiliser des cookies marketing (par exemple pour mesurer la performance d'une campagne d'acquisition), nous vous en informerions au préalable, recueillerions votre consentement explicite via le bandeau cookies, et vous offrions la possibilité de les refuser sans impact sur l'accès au service.",
      ],
    },
    {
      title: "Gestion de vos préférences",
      paragraphs: [
        "Lors de votre première visite, un bandeau vous permet d'accepter ou de refuser les cookies non essentiels. Votre choix est mémorisé pendant 12 mois. Vous pouvez modifier vos préférences à tout moment depuis le pied de page du site, en cliquant sur « Gérer mes cookies ».",
        "Vous pouvez également configurer votre navigateur pour bloquer les cookies ou être alerté avant leur dépôt. Consultez l'aide de votre navigateur pour connaître la procédure : Chrome, Firefox, Safari, Edge. La désactivation des cookies essentiels peut empêcher le bon fonctionnement de la plateforme.",
        "Pour toute question relative à notre utilisation des cookies, contactez-nous à l'adresse cookies@zenith.xyz. Nous nous engageons à vous répondre sous 72 heures ouvrées et à traiter votre demande dans le respect du RGPD et de vos droits.",
      ],
    },
  ];
  return (
    <LegalPage
      icon={<Cookie className="w-8 h-8 text-accent" />}
      eyebrow="LÉGAL"
      title="Politique des cookies"
      subtitle="Comment et pourquoi nous utilisons des cookies sur Zenith. Vous gardez le contrôle."
      lastUpdated="1er juin 2026"
      sections={sections}
    />
  );
}
