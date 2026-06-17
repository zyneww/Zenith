import Header from "./Header";
import Hero from "./Hero";
import MarketOverview from "./MarketOverview";
import CryptoDeepDive from "./CryptoDeepDive";
import QuickTools from "./QuickTools";
import Features from "./Features";
import CTAFinal from "./CTAFinal";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <MarketOverview />
      <CryptoDeepDive />
      <QuickTools />
      <Features />
      <CTAFinal />
      <Footer />
    </main>
  );
}
