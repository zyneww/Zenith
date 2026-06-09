import ComingSoon from "@/components/ui/ComingSoon";
import { setRequestLocale } from "next-intl/server";

export default async function AccessibilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon title="Accessibilité" description="Notre engagement pour une plateforme accessible à tous." />;
}
