import { Construction } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Centre d'aide — Zenith",
  description: "Centre d'aide et documentation de Zenith.",
};

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Construction className="w-16 h-16 text-accent mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">Centre d'aide</h1>
        <p className="text-secondary text-center max-w-md">
          Cette page est en cours de construction. Revenez bientôt pour accéder au centre d'aide de Zenith.
        </p>
      </main>
      <Footer />
    </>
  );
}
