import { setRequestLocale } from "next-intl/server";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import FAQAccordion from "./FAQAccordion";

export const metadata = {
  title: "FAQ — Zenith",
  description: "Questions fréquemment posées sur Zenith.",
};

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="bg-canvas text-primary min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-4">
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="heading-1 mb-4">Questions fréquentes</h1>
            <p className="text-secondary max-w-2xl mx-auto">
              Tout ce que vous devez savoir sur Zenith : tarifs, marchés couverts, alertes, sécurité et plus encore.
            </p>
          </div>
          <FAQAccordion />
        </section>
      </main>
      <Footer />
    </div>
  );
}
