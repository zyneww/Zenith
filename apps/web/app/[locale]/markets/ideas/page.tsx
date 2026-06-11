import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import IdeasClient from "./IdeasClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "markets" });
  return {
    title: t("ideas.title"),
    description: t("ideas.description"),
  };
}

export default async function IdeasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "markets" });

  return (
    <main className="min-h-screen bg-[#0b0e14]">
      <div className="px-4 sm:px-8 lg:px-16 xl:px-28 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t("ideas.title")}</h1>
          <p className="text-gray-400">{t("ideas.description")}</p>
        </div>
        <IdeasClient />
      </div>
    </main>
  );
}
