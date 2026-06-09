import ComingSoon from "@/components/ui/ComingSoon";
import { setRequestLocale } from "next-intl/server";

export default async function WatchlistPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon title="Watchlist" description="Créez et gérez vos listes de suivi personnalisées. Suivez vos actifs préférés en temps réel." />;
}
