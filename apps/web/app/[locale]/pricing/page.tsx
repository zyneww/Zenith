"use client";

import { Check } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import PricingCard from "@/components/subscription/PricingCard";
import ComparisonTable from "@/components/subscription/ComparisonTable";

const plans = [
  {
    name: "Free",
    description: "Pour découvrir et suivre vos premiers actifs",
    price: "$0",
    period: "forever",
    iconName: "Zap",
    featured: false,
    features: [
      "Charts basiques avec 1 indicateur",
      "3 actifs suivis en temps réel",
      "Alertes email (1/jour)",
      "Données 24h en temps réel",
      "Dashboard simple",
      "Command palette",
      "Support communautaire",
    ],
    cta: "Commencer gratuitement",
    href: "/markets",
  },
  {
    name: "Pro",
    description: "Pour les traders sérieux qui veulent l'excellence",
    price: "$9.99",
    period: "/mois",
    iconName: "Crown",
    featured: true,
    features: [
      "Charts avancés avec 25+ indicateurs",
      "Actifs suivis illimités",
      "Alertes SMS + Webhook",
      "Données historiques illimitées",
      "Portfolios multiples",
      "Studies techniques (SMA, EMA, RSI, MACD)",
      "Export données CSV",
      "Support prioritaire",
    ],
    cta: "Passer Pro",
    href: "#checkout",
  },
];

export default function SubscriptionPage() {
return (
    <div className="min-h-[100dvh] bg-[#0b0e14] text-white">
      <Header />

      {/* Hero Pricing */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Choisissez votre{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-brand-purple">
              plan
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Des outils puissants pour chaque niveau. Commencez gratuit et
            évoluez vers le Pro quand vous êtes prêt.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-white">
            Comparaison des fonctionnalités
          </h2>
          <ComparisonTable plans={plans} />
        </div>
      </section>

      {/* Trust badges */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto text-center pt-12">
          <p className="text-sm text-gray-500 mb-4">
            Paiement sécurisé par Stripe. Annulez à tout moment.
          </p>
          <div className="flex justify-center items-center gap-6 text-gray-400">
            <span className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              SSL 256-bit
            </span>
            <span className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              PCI Compliant
            </span>
            <span className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              Sans engagement
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
