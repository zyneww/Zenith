import CalendarSubClient from "@/components/calendar/CalendarSubClient";

export const metadata = { title: "Dividendes" };

export default function DividendsPage() {
  return <CalendarSubClient type="dividends" title="Dividendes" endpoint="/api/calendar/dividends" />;
}
