import ComingSoon from "@/components/ui/ComingSoon";
import { setRequestLocale } from "next-intl/server";

export default async function SocialPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon title="Réseau social" description="Connectez-vous avec la communauté de traders Zenith. Partagez vos idées et stratégies." />;
}
