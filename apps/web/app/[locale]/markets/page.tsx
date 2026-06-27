import { Suspense } from "react";
import MarketsClient from "./MarketsClient";

export const metadata = { title: "Marchés" };

export default async function MarketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <Suspense fallback={null}>
      <MarketsClient locale={locale} />
    </Suspense>
  );
}
