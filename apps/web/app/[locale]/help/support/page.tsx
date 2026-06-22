import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { Shield, BarChart3, Bell, CreditCard, Code, Smartphone, ArrowRight, Search } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Support",
  description: "Centre d'aide et documentation de Zenith.",
};

const CATEGORIES = [
  { icon: Shield, title: "Compte & sécurité", desc: "Mot de passe, 2FA, sessions, données.", href: "/help/faq" },
  { icon: BarChart3, title: "Marchés & données", desc: "Couverture, fréquence, source des prix.", href: "/help/faq" },
  { icon: Bell, title: "Alertes & notifications", desc: "Création, canaux, conditions combinées.", href: "/help/faq" },
  { icon: CreditCard, title: "Abonnement & facturation", desc: "Pro, annulation, reçus, remboursement.", href: "/help/faq" },
  { icon: Code, title: "API & intégrations", desc: "Webhooks, export, limites, auth.", href: "/help/faq" },
  { icon: Smartphone, title: "Plateformes", desc: "Web, PWA, mobile — statut et roadmap.", href: "/help/roadmap" },
];

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="bg-canvas text-primary min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4">
        <section className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="heading-1 mb-4">Centre d'aide</h1>
            <p className="text-secondary max-w-2xl mx-auto">
              Choisissez un thème ci-dessous, ou contactez-nous si vous êtes bloqué.
            </p>
          </div>

          <form action={`/${locale}/help/faq`} className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
              <input
                type="text"
                placeholder="Rechercher dans l'aide…"
                className="w-full bg-card border border-surface rounded-full pl-12 pr-4 py-3 text-primary placeholder-tertiary focus:border-accent outline-none transition-colors"
              />
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {CATEGORIES.map(({ icon: Icon, title, desc, href }) => (
              <Link
                key={title}
                href={`/${locale}${href}`}
                className="group bg-card border border-surface rounded-xl p-6 hover:border-hover transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-accent-subtle flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="heading-3 mb-2">{title}</h3>
                <p className="text-secondary text-sm mb-4">{desc}</p>
                <span className="inline-flex items-center gap-1 text-accent text-sm group-hover:gap-2 transition-all">
                  Voir plus <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>

          <div
            className="bg-accent-subtle border rounded-xl p-8 max-w-5xl mx-auto text-center"
            style={{ borderColor: "rgba(77, 166, 255, 0.2)" }}
          >
            <h2 className="heading-2 mb-3">Une question reste sans réponse ?</h2>
            <p className="text-secondary mb-6 max-w-xl mx-auto">
              Notre équipe répond sous 24h en semaine. Les tickets Pro sont traités en priorité.
            </p>
            <Link
              href={`/${locale}/help/contact`}
              className="bg-brand-blue text-on-accent rounded-full px-6 py-3 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider hover:bg-brand-blue-active transition-colors"
            >
              Nous contacter <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
