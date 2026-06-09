import { Construction } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Actualités Forex — Zenith",
  description: "Les dernières actualités sur le marché Forex.",
};

export default async function NewsForexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Construction className="w-16 h-16 text-brand-cyan mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Actualités Forex</h1>
        <p className="text-gray-400 text-center max-w-md">
          Cette page est en cours de construction. Revenez bientôt pour découvrir les dernières actualités sur le marché Forex.
        </p>
      </main>
      <Footer />
    </>
  );
}
