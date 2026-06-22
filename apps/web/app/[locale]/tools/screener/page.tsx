import { Construction } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Screener",
  description: "Filtrez et analysez les actifs avec notre screener avancé.",
};

export default async function ScreenerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Construction className="w-16 h-16 text-accent mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">Screener</h1>
        <p className="text-secondary text-center max-w-md">
          Cette page est en cours de construction. Revenez bientôt pour découvrir notre screener avancé.
        </p>
      </main>
      <Footer />
    </>
  );
}
