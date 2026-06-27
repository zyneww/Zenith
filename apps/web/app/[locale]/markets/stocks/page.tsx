import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import CategoryPage from "../CategoryPage";

export const metadata = { title: "Actions & ETFs" };

export default async function StocksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={null}>
      <CategoryPage locale={locale} tab="stocks" />
    </Suspense>
  );
}
