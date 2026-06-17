import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import ForexClient from "./ForexClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "markets" });
  return {
    title: t("forex.title"),
    description: t("forex.description"),
  };
}

export default async function ForexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "markets" });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-canvas">
        <div className="px-4 sm:px-8 lg:px-16 xl:px-28 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">{t("forex.title")}</h1>
          <p className="text-secondary">{t("forex.description")}</p>
        </div>
        <ForexClient />
      </div>
      </main>
      <Footer />
    </>
  );
}
