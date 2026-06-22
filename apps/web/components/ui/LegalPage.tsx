import { ReactNode } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

interface LegalPageProps {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  subtitle?: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export default function LegalPage({
  icon,
  eyebrow,
  title,
  subtitle,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-primary">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-accent-subtle flex items-center justify-center">
              {icon}
            </div>
            <p className="mono-caps text-accent mb-4">{eyebrow}</p>
            <h1 className="heading-1 text-primary mb-5">{title}</h1>
            {subtitle && (
              <p className="text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
            <p className="mono-caps text-tertiary mt-6">Dernière mise à jour : {lastUpdated}</p>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section, i) => (
              <section key={i} className="scroll-mt-32">
                <h2 className="heading-3 text-primary mb-4 flex items-center gap-3">
                  <span className="mono-caps text-accent text-xs">{String(i + 1).padStart(2, "0")}</span>
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.paragraphs.map((p, j) => (
                    <p key={j} className="text-secondary text-base leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-20 p-6 rounded-lg border border-surface bg-card text-center">
            <p className="text-secondary text-sm mb-4">
              Une question sur ce document ?
            </p>
            <Link
              href="/help/contact"
              className="inline-flex items-center gap-2 text-accent text-sm font-semibold hover:underline"
            >
              Contacter notre équipe →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
