import ComingSoon from "@/components/ui/ComingSoon";
import { setRequestLocale } from "next-intl/server";

export default async function AlertsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon title="Alertes de prix" description="Configurez des alertes intelligentes et recevez des notifications en temps réel sur vos actifs préférés." />;
}
