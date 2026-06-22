import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

const VALID_SLUGS = [
  "trends",
  "beginners-tutorial",
  "strategies",
  "market-news",
  "analysis",
  "sentiment",
] as const;

const CATEGORY_LABELS: Record<(typeof VALID_SLUGS)[number], string> = {
  trends: "Tendances",
  "beginners-tutorial": "Tutoriels débutants",
  strategies: "Stratégies",
  "market-news": "Actualités marché",
  analysis: "Analyses",
  sentiment: "Sentiment & On-chain",
};

const THUMB_GRADIENTS = [
  { from: "rgba(214,182,246,0.18)", to: "rgba(33,49,131,0.25)" },
  { from: "rgba(42,157,153,0.18)", to: "rgba(26,80,90,0.25)" },
  { from: "rgba(98,174,240,0.18)", to: "rgba(33,49,131,0.25)" },
  { from: "rgba(255,100,200,0.18)", to: "rgba(120,40,140,0.25)" },
  { from: "rgba(221,91,0,0.18)", to: "rgba(120,50,0,0.25)" },
  { from: "rgba(26,174,57,0.18)", to: "rgba(20,90,40,0.25)" },
  { from: "rgba(214,182,246,0.18)", to: "rgba(255,100,200,0.18)" },
  { from: "rgba(98,174,240,0.18)", to: "rgba(42,157,153,0.18)" },
];

const PLACEHOLDER_ARTICLES = [
  { read: 5, title: "Comprendre le funding rate en 5 minutes", excerpt: "Ce que le funding rate dit vraiment du sentiment de levier, et pourquoi il faut le croiser avec l&apos;open interest." },
  { read: 8, title: "DCA vs lump sum : ce que disent 10 ans de données", excerpt: "Comparaison empirique des deux approches sur BTC et ETH, avec impact du timing et des drawdowns." },
  { read: 6, title: "Lire un carnet d&apos;ordres sans se tromper", excerpt: "Spoofing, absorptions, murs : les patterns à reconnaître avant d&apos;agir sur un order flow." },
  { read: 12, title: "Construire un grid bot qui survit à la volatilité", excerpt: "Bornes, pas de grille, hedge : un framework complet pour bâtir un grid robuste." },
  { read: 4, title: "Wallets de custody : cold, hot, multi-sig", excerpt: "Choisir entre Ledger, Trezor, Fireblocks ou un multi-sig maison selon votre profil de risque." },
  { read: 7, title: "Lecture macro : CPI, NFP, FOMC en pratique", excerpt: "Comment anticiper la réaction du marché et éviter les whipsaws post-publication." },
  { read: 10, title: "On-chain pour débutants : UTXO, SOPR, MVRV", excerpt: "Les métriques on-chain qui comptent vraiment, et comment les lire sans se noyer." },
  { read: 9, title: "Risk management : la formule de Kelly adaptée", excerpt: "Position sizing, edge réel, drawdown max : calculer la taille idéale sans parier gros." },
];

export function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!VALID_SLUGS.includes(slug as (typeof VALID_SLUGS)[number])) {
    notFound();
  }
  const label = CATEGORY_LABELS[slug as (typeof VALID_SLUGS)[number]];

  return (
    <div className="px-4 py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-tertiary text-sm mb-8">
          <Link href="/apprendre" className="hover:text-accent transition-colors">
            Académie
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-secondary">{label}</span>
        </nav>

        {/* Title */}
        <h1 className="heading-1 text-primary mb-3">{label}</h1>
        <p className="text-secondary text-sm md:text-base mb-12 max-w-2xl leading-relaxed">
          Articles, tutoriels et décryptages sur la catégorie « {label} ».
          Contenu en cours de rédaction — rejoignez la communauté pour être
          prévenu des publications.
        </p>

        {/* Article grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLACEHOLDER_ARTICLES.map((article, idx) => {
            const grad = THUMB_GRADIENTS[idx % THUMB_GRADIENTS.length];
            return (
              <Link
                key={idx}
                href={`/apprendre/article/${slug}-${idx + 1}`}
              >
                <div className="group bg-card border border-surface rounded-xl p-6 hover:border-hover transition-colors h-full">
                  <div
                    className="aspect-[16/9] rounded-lg mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                    }}
                  />
                  <p className="mono-caps text-tertiary mb-2">
                    Bientôt · ~{article.read} min de lecture
                  </p>
                  <h3 className="font-bold text-lg text-primary leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-secondary text-sm mt-2 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Back link */}
        <div className="mt-16">
          <Link
            href="/apprendre"
            className="inline-flex items-center gap-2 text-accent text-sm font-mono uppercase tracking-wider hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Revenir à l&apos;académie
          </Link>
        </div>
      </div>
    </div>
  );
}
