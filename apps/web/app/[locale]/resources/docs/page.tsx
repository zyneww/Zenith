import ComingSoon from "@/components/ui/ComingSoon";
import { setRequestLocale } from "next-intl/server";

export default async function DocsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon title="Documentation" description="Documentation complète de l'API et des fonctionnalités Zenith." />;
}
