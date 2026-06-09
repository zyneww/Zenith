import ComingSoon from "@/components/ui/ComingSoon";
import { setRequestLocale } from "next-intl/server";

export default async function EditorsPicksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon title="Éditeurs' picks" description="Les meilleures idées et stratégies sélectionnées par l'équipe Zenith." />;
}
