import CalendarSubClient from "@/components/calendar/CalendarSubClient";

export const metadata = { title: "Earnings" };

export default function EarningsPage() {
  return <CalendarSubClient type="earnings" title="Earnings" endpoint="/api/calendar/earnings" />;
}
