import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { MessageCircle, Twitter, MessageSquare, Send, MessagesSquare, ShieldCheck } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Communauté",
  description: "Rejoignez la communauté Zenith.",
};

const CHANNELS = [
  {
    icon: MessageCircle,
    title: "Discord",
    desc: "Notre canal principal. Échanges temps réel, alertes, support.",
    href: "https://discord.gg/zenith",
    color: "sticker-purple",
  },
  {
    icon: Twitter,
    title: "X / Twitter",
    desc: "News, threads d'analyse, annonces.",
    href: "https://twitter.com/zenithxyz",
    color: "sticker-sky",
  },
  {
    icon: MessageSquare,
    title: "Reddit",
    desc: "Analyses longues, faq communautaires, débats.",
    href: "https://reddit.com/r/zenith",
    color: "sticker-teal",
  },
  {
    icon: Send,
    title: "Telegram",
    desc: "Alertes rapides, mini-signaux, news push.",
    href: "https://t.me/zenithxyz",
    color: "sticker-pink",
  },
];

const RULES = [
  "Reste respectueux. Pas d'insultes, sexisme, racisme.",
  "Pas de manipulation ou de pump-and-dump signalé.",
  "Sources exigées pour les analyses confidentielles.",
  "No spam, no shilling, no DM non-sollicités.",
  "Pas de conseils financiers en votre nom propre — DYOR.",
  "Les modos décident. Bans irrévocables.",
];

export default async function CommunityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="bg-canvas text-primary min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4">
        <section className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="heading-1 mb-4">Communauté Zenith</h1>
            <p className="text-secondary max-w-2xl mx-auto">
              Rejoins des milliers de traders. Partage des analyses, des stratégies, des alertes.
            </p>
          </div>

          {/* Section 1: Canaux sociaux */}
          <div className="mb-16">
            <h2 className="heading-2 mb-6">Canaux sociaux</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CHANNELS.map(({ icon: Icon, title, desc, href, color }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card border border-surface rounded-xl p-5 hover:border-hover transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                    style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                  >
                    <Icon className={`w-6 h-6 text-${color}`} />
                  </div>
                  <h3 className="title mb-1">{title}</h3>
                  <p className="text-secondary text-xs mb-3 leading-relaxed">{desc}</p>
                  <span className="text-accent text-sm">Rejoindre →</span>
                </a>
              ))}
            </div>
          </div>

          {/* Section 2: Forum beta */}
          <div className="mb-16">
            <h2 className="heading-2 mb-6">Forum Zenith (beta)</h2>
            <div className="bg-card border border-surface rounded-xl p-8 text-center">
              <MessagesSquare className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="heading-3 mb-3">Le forum Zenith arrive bientôt</h3>
              <p className="text-secondary mx-auto max-w-md">
                Discourse embedded, auth Clerk, posts temps réel, tags par actifs et stratégies. Inscription à la beta via Discord.
              </p>
              <a
                href="https://discord.gg/zenith"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-6 bg-brand-blue text-on-accent rounded-full px-6 py-3 hover:bg-brand-blue-active transition-colors font-mono text-sm uppercase tracking-wider"
              >
                S'inscrire à la beta
              </a>
            </div>
          </div>

          {/* Section 3: Règles */}
          <div>
            <h2 className="heading-2 mb-6">Règles de la communauté</h2>
            <div className="bg-card border border-surface rounded-xl p-6">
              <ul className="space-y-3">
                {RULES.map((rule) => (
                  <li key={rule} className="flex items-start gap-3 text-sm text-secondary">
                    <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
