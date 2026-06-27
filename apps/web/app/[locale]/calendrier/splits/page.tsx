import CalendarSubClient from "@/components/calendar/CalendarSubClient";

export const metadata = { title: "Splits" };

export default function SplitsPage() {
  return <CalendarSubClient type="splits" title="Splits" endpoint="/api/calendar/splits" />;
}
