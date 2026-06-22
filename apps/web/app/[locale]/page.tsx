import LandingPage from "@/components/landing/LandingPage";
import { setRequestLocale } from "next-intl/server";

export const metadata = { title: "Accueil" };

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LandingPage />;
}
