import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { Zap, Bell, LineChart, CalendarDays, GraduationCap, Check } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Pourquoi Zenith — Zenith",
  description: "Ce qui différencie Zenith des autres plateformes de trading.",
};

const FEATURES = [
  { icon: Zap, title: "Données temps réel un-pour-un", desc: "Pas de cache stale. WebSocket Binance direct, CoinGecko et TwelveData en temps réel. Sub-seconde latence." },
  { icon: Bell, title: "Alertes qui font sens", desc: "Multi-canal (push, email, Discord, in-app), conditions combinées (seuil + pente + temps), pas juste des guillemets sans contexte." },
  { icon: LineChart, title: "Charts pro, pas gadgets", desc: "Lightweight Charts v5 de TradingView. S/R, indicateurs usuels, multi-timeframes. Pas de chat-bubble inutiles." },
  { icon: CalendarDays, title: "Calendrier intégré", desc: "Économique, earnings, dividendes, IPOs, splits, jours fériés. 6 calendriers fusionnés, filtres intelligents." },
  { icon: GraduationCap, title: "Académie, pas du marketing", desc: "Tendances, tutos débutants, stratégies, analyses on-chain : contenu pédagogique gratuit, sans paywalls interstitiels." },
  { icon: Check, title: "Pricing honnête", desc: "Plan Free généreux. Pro $9.99/mois, pas de tiers trompe-l'œil. Annulation immédiate, pas de dark patterns." },
];

const COMPARISON_ROWS: { feature: string; free: string; pro: string; tv: string; bybit: string }[] = [
  { feature: "Prix temps réel", free: "✓", pro: "✓", tv: "✓", bybit: "Crypto uniquement" },
  { feature: "Alertes prix", free: "Basiques", pro: "Multi-canal + conditions", tv: "Multi-canal", bybit: "Basiques" },
  { feature: "Multi-actifs (crypto+forex+indices)", free: "✓", pro: "✓", tv: "✓", bybit: "✕" },
  { feature: "Calendrier 6 types", free: "✓", pro: "✓", tv: "Partiel", bybit: "✕" },
  { feature: "Export de données", free: "✕", pro: "CSV + API", tv: "Payant", bybit: "✕" },
  { feature: "Prix mensuel", free: "Gratuit", pro: "$9.99", tv: "$14.95", bybit: "Gratuit" },
];

export default async function WhyZenithPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="bg-canvas text-primary min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4">
        <section className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="eyebrow text-accent mb-3">DIFFÉRENCIATION</p>
            <h1 className="heading-1 mb-4">Pourquoi Zenith</h1>
            <p className="text-secondary max-w-2xl mx-auto">
              Six raisons concrètes qui font de Zenith une plateforme différente. Pas de marketing creux — juste ce que l'on construit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-surface rounded-xl p-6">
                <div className="w-12 h-12 rounded-lg bg-accent-subtle flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="heading-3 mb-2">{title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mb-20">
            <h2 className="heading-2 mb-6 text-center">Comparatif</h2>
            <div className="bg-card border border-surface rounded-xl p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface">
                    <th className="text-left py-3 pr-4 text-secondary font-semibold">Feature</th>
                    <th className="text-center py-3 px-3 text-accent font-semibold">Zenith Free</th>
                    <th className="text-center py-3 px-3 text-accent font-semibold bg-accent-subtle rounded-md">Zenith Pro</th>
                    <th className="text-center py-3 px-3 text-tertiary font-semibold">TradingView Essential</th>
                    <th className="text-center py-3 px-3 text-tertiary font-semibold">Bybit</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="border-b border-surface last:border-0">
                      <td className="py-3 pr-4 text-primary font-semibold">{row.feature}</td>
                      <td className="text-center py-3 px-3 text-accent">{row.free}</td>
                      <td className="text-center py-3 px-3 text-accent bg-accent-subtle">{row.pro}</td>
                      <td className="text-center py-3 px-3 text-tertiary">{row.tv}</td>
                      <td className="text-center py-3 px-3 text-tertiary">{row.bybit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center">
            <Link
              href={`/${locale}/sign-up`}
              className="bg-brand-blue text-on-accent rounded-full px-6 py-3 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider hover:bg-brand-blue-active transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
