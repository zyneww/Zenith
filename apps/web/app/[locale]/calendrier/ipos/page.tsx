import CalendarSubClient from "@/components/calendar/CalendarSubClient";

export const metadata = { title: "IPO" };

export default function IposPage() {
  return <CalendarSubClient type="ipos" title="IPO" endpoint="/api/calendar/ipos" />;
}
