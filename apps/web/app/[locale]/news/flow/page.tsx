import ComingSoon from "@/components/ui/ComingSoon";
import { setRequestLocale } from "next-intl/server";

export default async function NewsFlowPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon title="News Flow" description="Agrégation en temps réel de toutes les actualités du marché crypto, forex et commodities." />;
}
