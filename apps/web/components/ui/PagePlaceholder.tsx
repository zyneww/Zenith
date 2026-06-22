import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Sparkles } from "lucide-react";

interface PagePlaceholderProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  features?: { title: string; description: string; icon: React.ReactNode }[];
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  lastUpdated?: string;
}

export default function PagePlaceholder({
  icon,
  eyebrow,
  title,
  subtitle,
  features,
  primaryCta,
  secondaryCta,
  lastUpdated,
}: PagePlaceholderProps) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-primary">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-accent-subtle flex items-center justify-center">
              {icon}
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <p className="mono-caps text-accent">{eyebrow}</p>
              <span className="mono-caps text-warning">Bientôt</span>
            </div>
            <h1 className="heading-1 text-primary mb-5">{title}</h1>
            <p className="text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
            {lastUpdated && (
              <p className="mono-caps text-tertiary mt-6">Dernière mise à jour : {lastUpdated}</p>
            )}
          </div>

          {/* Features */}
          {features && features.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-card border border-surface rounded-lg p-6 hover:border-hover transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="heading-3 text-primary mb-2">{f.title}</h3>
                  <p className="text-secondary text-sm leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          {(primaryCta || secondaryCta) && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="inline-flex items-center gap-2 bg-accent text-on-accent rounded-full px-6 py-3 text-sm font-semibold hover:bg-accent/90 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex items-center gap-2 border border-surface text-primary rounded-full px-6 py-3 text-sm font-semibold hover:bg-raised transition-colors"
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
