import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import IndicesClient from "./IndicesClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "markets" });
  return {
    title: t("indices.title"),
    description: t("indices.description"),
  };
}

export default async function IndicesPage({
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t("indices.title")}
          </h1>
          <p className="text-secondary">
            {t("indices.description")}
          </p>
        </div>

        {/* Indices Component */}
        <IndicesClient />
      </div>
      </main>
      <Footer />
    </>
  );
}
