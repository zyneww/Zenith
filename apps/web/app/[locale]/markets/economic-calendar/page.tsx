import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import CalendarClient from "./CalendarClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "markets" });
  return {
    title: t("calendar.title"),
    description: t("calendar.description"),
  };
}

export default async function EconomicCalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "markets" });

  return (
    <main className="min-h-screen bg-[#0b0e14]">
      <div className="px-4 sm:px-8 lg:px-16 xl:px-28 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("calendar.title")}
          </h1>
          <p className="text-gray-400">
            {t("calendar.description")}
          </p>
        </div>

        {/* Calendar Component */}
        <CalendarClient />
      </div>
    </main>
  );
}
