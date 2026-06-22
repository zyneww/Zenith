import { setRequestLocale } from "next-intl/server";
import { CheckCircle2, Circle } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Roadmap 2026 — Zenith",
  description: "Ce que nous construisons, trimestre par trimestre.",
};

type Status = "done" | "progress" | "planned";

const QUARTERS: {
  label: string;
  title: string;
  status: Status;
  milestones: { text: string; done: boolean }[];
}[] = [
  {
    label: "2026 — Q1",
    title: "Fondations : Landing + Infra temps réel + Markets",
    status: "done",
    milestones: [
      { text: "Landing v2 (page, design system Notion-inspired)", done: true },
      { text: "Binance WebSocket consumer live", done: true },
      { text: "Dragonfly Pub/Sub oper", done: true },
      { text: "Markets table + asset detail v1", done: true },
      { text: "Header mega dropdowns", done: true },
    ],
  },
  {
    label: "2026 — Q2",
    title: "Acquisition + Éducation",
    status: "progress",
    milestones: [
      { text: "Académie Zenith — 6 catégories live", done: false },
      { text: "Calendrier fusionné 6 types", done: false },
      { text: "Pages institutionnelles (FAQ, support, contact, pourquoi, roadmap, communauté)", done: false },
      { text: "PWA installable + offline mode", done: false },
      { text: "E2E Playwright 3/3", done: false },
    ],
  },
  {
    label: "2026 — Q3",
    title: "Produit payant + Rétention",
    status: "planned",
    milestones: [
      { text: "Stripe checkout + webhooks (Pro $9.99/mois)", done: false },
      { text: "Dashboard portfolio sync (positions live via WS)", done: false },
      { text: "Alertes prix → push + Discord + email", done: false },
      { text: "App mobile React Native (iOS/Android) v1", done: false },
      { text: "Export CSV sur portfolio et transactions", done: false },
    ],
  },
  {
    label: "2026 — Q4",
    title: "Scale + Communauté",
    status: "planned",
    milestones: [
      { text: "IPv6 + multi-régions (Vercel Edge)", done: false },
      { text: "Forum intégré (Discourse embed)", done: false },
      { text: "Ambassadeurs Zenith (programme referral)", done: false },
      { text: "Screener multi-critères (algo, tech, fund)", done: false },
      { text: "Backtesting sandbox (no-code)", done: false },
    ],
  },
];

const STATUS_BADGE: Record<Status, { label: string; cls: string }> = {
  done: { label: "Done", cls: "bg-up-subtle text-up" },
  progress: { label: "In Progress", cls: "bg-warning-subtle text-warning" },
  planned: { label: "Planned", cls: "bg-raised text-tertiary" },
};

export default async function RoadmapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="bg-canvas text-primary min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4">
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="heading-1 mb-4">Roadmap 2026</h1>
            <p className="text-secondary max-w-2xl mx-auto">
              Ce que nous construisons, trimestre par trimestre.
            </p>
          </div>

          <div className="space-y-6">
            {QUARTERS.map((q) => {
              const badge = STATUS_BADGE[q.status];
              return (
                <div key={q.label} className="bg-card border border-surface rounded-xl p-6">
                  <p className="eyebrow text-tertiary mb-2">{q.label}</p>
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <h2 className="heading-2">{q.title}</h2>
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-full ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {q.milestones.map((m) => (
                      <li key={m.text} className="flex items-start gap-3 text-sm">
                        {m.done ? (
                          <CheckCircle2 className="w-4 h-4 text-up shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                        )}
                        <span className={m.done ? "text-secondary" : "text-tertiary"}>{m.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p className="text-tertiary text-xs mt-8 text-center">
            La roadmap est indicative et peut évoluer en fonction des retours utilisateurs et des aléas techniques.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
