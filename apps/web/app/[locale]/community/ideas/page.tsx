import ComingSoon from "@/components/ui/ComingSoon";
import { setRequestLocale } from "next-intl/server";

export default async function IdeasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon title="Idées de trading" description="Découvrez et partagez des idées de trading avec la communauté Zenith." />;
}
