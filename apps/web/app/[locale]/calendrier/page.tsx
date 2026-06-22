import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { CalendarClient } from "./CalendarClient";
import { getCalendarData, defaultRange } from "@/lib/calendar/finnhub";
import { getMockCalendar, CALENDAR_LABELS } from "@/lib/calendar/mock";
import { CALENDAR_TYPES, type CalendarType } from "@/lib/calendar/types";

export const metadata: Metadata = {
  title: "Calendrier — Zenith",
  description: "Calendrier économique, résultats, dividendes, IPOs, splits et jours fériés.",
};

function validateType(t: string | undefined): CalendarType {
  if (t && (CALENDAR_TYPES as readonly string[]).includes(t)) {
    return t as CalendarType;
  }
  return "economic";
}

export default async function CalendrierPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; from?: string; to?: string; country?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const type = validateType(sp.type);
  const from = sp.from || defaultRange().from;
  const to = sp.to || defaultRange().to;

  const availableTypes = CALENDAR_TYPES.map((value) => ({
    value,
    label: CALENDAR_LABELS[value],
  }));

  let data = await getCalendarData(type, { from, to });
  if (!data || data.length === 0) {
    data = getMockCalendar(type);
  }

  return (
    <div className="bg-canvas text-primary min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="px-4 sm:px-8 lg:px-16 xl:px-28 py-8">
          <CalendarClient
            type={type}
            data={data}
            from={from}
            to={to}
            availableTypes={availableTypes}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
