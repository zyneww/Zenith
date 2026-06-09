import ComingSoon from "@/components/ui/ComingSoon";
import { setRequestLocale } from "next-intl/server";

export default async function ChangelogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon title="Changelog" description="Suivez l'évolution de Zenith avec les dernières mises à jour et nouvelles fonctionnalités." />;
}
