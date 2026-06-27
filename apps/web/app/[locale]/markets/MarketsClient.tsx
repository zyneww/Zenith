"use client";

import { useSearchParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import MarketsLayout from "@/components/markets/MarketsLayout";

export default function MarketsClient({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const view = searchParams.get("view") || "";

  const tabMap: Record<string, string> = {
    crypto: "crypto",
    indices: "indices",
    forex: "forex",
    futures: "futures",
    commodities: "commodities",
    stocks: "stocks",
    etfs: "stocks",
  };

  const activeTab = category ? tabMap[category] || "apercu" : "apercu";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-canvas text-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
          <MarketsLayout activeTab={activeTab} locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}
