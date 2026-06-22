import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Apprendre — ${slug}` };
}

export function generateStaticParams() {
  // Placeholder: surface a few static slugs so static export can succeed.
  // Real articles will be added later; this keeps the route buildable.
  const baseSlugs = [
    "trends",
    "beginners-tutorial",
    "strategies",
    "market-news",
    "analysis",
    "sentiment",
  ];
  return baseSlugs.flatMap((cat) =>
    Array.from({ length: 8 }, (_, i) => ({ slug: `${cat}-${i + 1}` }))
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // Derive a category guess from slug prefix (placeholder convention)
  const categorySlug = slug.split("-").slice(0, 1).join("-");

  return (
    <div className="px-4 py-12 md:py-16">
      <article className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-tertiary text-sm mb-8">
          <Link href="/apprendre" className="hover:text-accent transition-colors">
            Académie
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href={`/apprendre/category/${categorySlug}`}
            className="hover:text-accent transition-colors"
          >
            {categorySlug}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-secondary truncate">{slug}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <h1 className="heading-1 text-primary mb-4 leading-tight">
            Article — {slug}
          </h1>
          <p className="text-tertiary text-xs mono-caps">
            Auteur Zenith · 5 min de lecture · Bientôt
          </p>
        </header>

        {/* Body placeholder */}
        <div className="bg-card border border-surface rounded-xl p-8 prose prose-invert">
          <p className="text-secondary leading-relaxed">
            Cet article est en cours de rédaction. Les articles Zenith couvrent
            les thèmes ci-dessous avec exemples concrets, captures et cas
            d&apos;usage. Revenez bientôt pour le contenu complet.
          </p>
        </div>

        {/* Related */}
        <section className="mt-16">
          <h2 className="heading-3 text-primary mb-6">Sur le même sujet</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <Link key={i} href={`/apprendre/article/${categorySlug}-${i + 2}`}>
                <div className="bg-card border border-surface rounded-xl p-5 hover:border-hover transition-colors h-full">
                  <div className="aspect-[16/9] rounded-lg bg-raised mb-3" />
                  <p className="mono-caps text-tertiary mb-2">
                    Bientôt · ~5 min de lecture
                  </p>
                  <h3 className="font-semibold text-sm text-primary leading-snug">
                    Article lié — {categorySlug}-{i + 2}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Back link */}
        <div className="mt-16">
          <Link
            href={`/apprendre/category/${categorySlug}`}
            className="inline-flex items-center gap-2 text-accent text-sm font-mono uppercase tracking-wider hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la catégorie
          </Link>
        </div>
      </article>
    </div>
  );
}
