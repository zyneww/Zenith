"use client";

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import MarketsLayout from "@/components/markets/MarketsLayout";

export default function CategoryPage({ locale, tab }: { locale: string; tab: string }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-canvas text-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6">
          <MarketsLayout activeTab={tab} locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}
