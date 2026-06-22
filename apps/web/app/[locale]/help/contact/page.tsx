import { setRequestLocale } from "next-intl/server";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact",
  description: "Contactez l'équipe Zenith.",
};

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="bg-canvas text-primary min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4">
        <section className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="heading-1 mb-4">Nous contacter</h1>
            <p className="text-secondary max-w-2xl mx-auto">
              Une question technique, commerciale ou de presse ? Écrivez-nous, on répond sous 24h en semaine.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <ContactForm />
            </div>
            <aside className="md:col-span-1 space-y-6">
              <div className="bg-card border border-surface rounded-xl p-6">
                <h3 className="title mb-3">Heures d'ouverture</h3>
                <p className="text-secondary text-sm">Lun–Ven, 9h–18h CET</p>
                <p className="text-tertiary text-xs mt-2">Réponse sous 24h en semaine.</p>
              </div>
              <div className="bg-card border border-surface rounded-xl p-6">
                <h3 className="title mb-3">Email direct</h3>
                <a href="mailto:team@zenith.xyz" className="text-accent text-sm hover:underline">
                  team@zenith.xyz
                </a>
              </div>
              <div className="bg-card border border-surface rounded-xl p-6">
                <h3 className="title mb-3">Discord</h3>
                <a
                  href="https://discord.gg/zenith"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent text-sm hover:underline"
                >
                  Rejoindre le serveur →
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
