import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import CategoryPage from "../CategoryPage";

export const metadata = { title: "Cryptomonnaies" };

export default async function CryptoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={null}>
      <CategoryPage locale={locale} tab="crypto" />
    </Suspense>
  );
}
