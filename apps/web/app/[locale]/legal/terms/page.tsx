import ComingSoon from "@/components/ui/ComingSoon";
import { setRequestLocale } from "next-intl/server";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon title="Conditions générales d'utilisation" description="Consultez nos CGU pour comprendre les conditions d'utilisation de Zenith." />;
}
