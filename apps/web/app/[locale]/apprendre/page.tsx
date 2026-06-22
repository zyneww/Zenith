import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  BookOpen,
  Target,
  Newspaper,
  Activity,
  Globe,
} from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const metadata = { title: "Apprendre" };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Category = {
  slug: string;
  title: string;
  description: string;
  Icon: typeof TrendingUp;
  iconColor: string;
  iconBg: string;
};

const CATEGORIES: Category[] = [
  {
    slug: "trends",
    title: "Tendances",
    description:
      "Sujets brûlants, récits et rotations de capital qui dominent les flux récents.",
    Icon: TrendingUp,
    iconColor: "#d6b6f6",
    iconBg: "rgba(214,182,246,0.1)",
  },
  {
    slug: "beginners-tutorial",
    title: "Tutoriels débutants",
    description:
      "De zéro à votre premier trade : vocabulaire, wallets, ordres, custody, sans jargon.",
    Icon: BookOpen,
    iconColor: "#2a9d99",
    iconBg: "rgba(42,157,153,0.1)",
  },
  {
    slug: "strategies",
    title: "Stratégies",
    description:
      "Grid, DCA, momentum, hedging : frameworks complet pour bâtir un edge durable.",
    Icon: Target,
    iconColor: "#dd5b00",
    iconBg: "rgba(221,91,0,0.1)",
  },
  {
    slug: "market-news",
    title: "Actualités marché",
    description:
      "Décryptages des annonces et rapports qui déplacent réellement les prix.",
    Icon: Newspaper,
    iconColor: "#62aef0",
    iconBg: "rgba(98,174,240,0.1)",
  },
  {
    slug: "analysis",
    title: "Analyses",
    description:
      "Technique et fondamental fusionnés : S/R, on-chain, ordre flow, earning turns.",
    Icon: Activity,
    iconColor: "#ff64c8",
    iconBg: "rgba(255,100,200,0.1)",
  },
  {
    slug: "sentiment",
    title: "Sentiment & On-chain",
    description:
      "Funding rates, dominance, Peirce ratios, whale moves : la vérité on-chain.",
    Icon: Globe,
    iconColor: "#1aae39",
    iconBg: "rgba(26,174,57,0.1)",
  },
];

export default async function ApprendrePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="px-4 py-16 md:py-24">
      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center mb-20">
        <p className="mono-caps text-accent mb-4">APPRENDRE</p>
        <h1 className="heading-1 text-primary mb-6">Académie Zenith</h1>
        <p className="text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Le hub éducatif pour traders et investisseurs : tutoriels, stratégies,
          analyses et décryptages marché. Apprenez à votre rythme, en français,
          sans jargon inutile.
        </p>
      </section>

      {/* Category grid */}
      <section className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map(({ slug, title, description, Icon, iconColor, iconBg }) => (
            <Link key={slug} href={`/apprendre/category/${slug}`}>
              <div className="group bg-card border border-surface rounded-xl p-6 hover:border-hover transition-colors h-full">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: iconBg }}
                >
                  <Icon className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <h2 className="heading-3 text-primary mt-4">{title}</h2>
                <p className="text-secondary text-sm mt-2 leading-relaxed">
                  {description}
                </p>
                <ArrowRight className="w-4 h-4 text-accent mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA bar */}
      <section className="max-w-5xl mx-auto my-16">
        <div className="bg-accent-subtle border border-accent/20 rounded-xl p-8 md:p-10">
          <h2 className="heading-2 text-primary mb-3">Une question, une idée ?</h2>
          <p className="text-secondary text-sm md:text-base mb-6 max-w-xl leading-relaxed">
            Suggérez un sujet, un cours ou un décryptage. L&apos;académie se
            construit aussi avec vous.
          </p>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-accent text-sm font-mono uppercase tracking-wider hover:underline"
          >
            Contacter l&apos;équipe
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
