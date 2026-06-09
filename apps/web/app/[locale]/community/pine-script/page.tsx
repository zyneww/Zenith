import ComingSoon from "@/components/ui/ComingSoon";
import { setRequestLocale } from "next-intl/server";

export default async function PineScriptPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon title="Pine Script" description="Éditez et déployez vos propres scripts et indicateurs personnalisés sur Zenith." />;
}
