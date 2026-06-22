import { setRequestLocale } from "next-intl/server";
import LegalPage, { LegalSection } from "@/components/ui/LegalPage";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Confidentialité" };

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sections: LegalSection[] = [
    {
      title: "Données collectées",
      paragraphs: [
        "Zenith collecte uniquement les données nécessaires à la fourniture et à l'amélioration de ses services. Les données se répartissent en trois catégories : les données d'identification (email, nom d'utilisateur, mot de passe hashé), les données d'usage (pages consultées, fonctionnalités utilisées, fréquence de connexion, adresse IP, type d'appareil et de navigateur), et les données de paiement (gérées exclusivement par notre processor Stripe, conforme PCI-DSS).",
        "Lors de votre inscription, vous fournissez votre adresse email et un mot de passe. Les données de paiement (carte bancaire, IBAN) ne transitent jamais par nos serveurs : elles sont collectées et stockées par Stripe selon leurs propres conditions. Nous ne conservons que les références opaques de transaction (customer ID, subscription ID).",
        "Aucune donnée sensible au sens du RGPD (origine raciale, opinions politiques, santé, orientation sexuelle, données biométriques) n'est collectée. Aucune décision automatisée produisant des effets juridiques sur l'utilisateur n'est mise en œuvre.",
      ],
    },
    {
      title: "Base légale et finalités",
      paragraphs: [
        "Conformément à l'article 6 du RGPD, les traitements de données personnelles réalisés par Zenith reposent sur les bases légales suivantes : l'exécution du contrat (gestion de votre compte, fourniture du service, facturation), le consentement (newsletters, cookies non essentiels, communications marketing), l'intérêt légitime (amélioration du service, sécurité, prévention de la fraude), et le respect d'obligations légales (conservation comptable, réponse à des réquisitions).",
        "Les finalités principales sont : l'authentification et la gestion de votre compte utilisateur ; la fourniture des fonctionnalités de la plateforme (charts, alertes, portfolio) ; la facturation et le suivi des abonnements ; le support client ; l'envoi de communications relatives au service (maintenance, incidents) ; l'amélioration continue du produit via des analytics agrégés.",
        "Les données ne sont jamais vendues, louées ou cédées à des tiers à des fins commerciales. Les partenaires providers de données (Binance, CoinGecko, etc.) ne reçoivent aucune information personnelle permettant de vous identifier.",
      ],
    },
    {
      title: "Durée de conservation",
      paragraphs: [
        "Les données de compte sont conservées tant que votre compte est actif. À la suppression du compte, elles sont effacées sous 30 jours, sauf obligations légales contraires (factures conservées 10 ans conformément au Code de commerce, article L.123-22).",
        "Les logs de connexion et les données d'usage sont conservés 12 mois glissants à des fins de sécurité, de détection des anomalies et d'amélioration du service. Passé ce délai, ils sont anonymisés ou supprimés.",
        "Les données de paiement sont conservées par Stripe selon leurs propres règles de conservation. Zenith ne stocke que les références de transaction nécessaires à la gestion de l'abonnement (durée de vie de l'abonnement + 10 ans pour les obligations comptables).",
      ],
    },
    {
      title: "Vos droits (RGPD)",
      paragraphs: [
        "Conformément au Règlement Général sur la Protection des Données, vous disposez à tout moment d'un droit d'accès, de rectification, d'effacement, de limitation du traitement, de portabilité et d'opposition concernant vos données personnelles. Vous pouvez également retirer votre consentement à tout moment, sans que ce retrait n'affecte la licéité des traitements effectués antérieurement.",
        "Pour exercer ces droits, contactez notre Délégué à la Protection des Données (DPO) à l'adresse dpo@zenith.xyz. Une réponse vous sera apportée dans un délai d'un mois à compter de la réception de la demande, conformément à l'article 12.3 du RGPD. En cas de réponse insatisfaisante, vous avez le droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés, 3 place de Fontenoy, 75007 Paris).",
        "Vous pouvez à tout moment exporter l'intégralité de vos données depuis votre espace personnel (section « Mes données »). L'export est fourni au format JSON lisible et inclut toutes les informations que nous détenons sur vous.",
      ],
    },
    {
      title: "Contact DPO",
      paragraphs: [
        "Notre Délégué à la Protection des Données est joignable à l'adresse dpo@zenith.xyz ou par courrier à l'adresse suivante : Zenith SAS — DPO, 42 rue de la Bourse, 75002 Paris. Pour toute question relative à la protection de vos données, n'hésitez pas à le contacter en priorité.",
        "Pour les demandes impliquant une vérification d'identité (accès, rectification, suppression), nous nous réservons le droit de demander un justificatif d'identité conformément à l'article 12.6 du RGPD, afin de prévenir toute divulgation non autorisée de vos données à un tiers.",
        "Zenith s'engage à notifier la CNIL et les utilisateurs concernés de toute violation de données à caractère personnel dans les meilleurs délais, conformément aux articles 33 et 34 du RGPD, et au plus tard 72 heures après la découverte de l'incident.",
      ],
    },
  ];
  return (
    <LegalPage
      icon={<ShieldCheck className="w-8 h-8 text-accent" />}
      eyebrow="LÉGAL"
      title="Politique de confidentialité"
      subtitle="Comment nous collectons, utilisons et protégeons vos données personnelles. Conforme RGPD."
      lastUpdated="1er juin 2026"
      sections={sections}
    />
  );
}
