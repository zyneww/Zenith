import { Construction } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Corrélation — Zenith",
  description: "Analysez la corrélation entre différents actifs.",
};

export default async function CorrelationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Construction className="w-16 h-16 text-brand-cyan mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Corrélation</h1>
        <p className="text-gray-400 text-center max-w-md">
          Cette page est en cours de construction. Revenez bientôt pour analyser les corrélations entre actifs.
        </p>
      </main>
      <Footer />
    </>
  );
}
