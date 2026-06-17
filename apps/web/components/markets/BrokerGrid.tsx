"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

interface Broker {
  id: string;
  name: string;
  logo: string;
  rating: number;
  minDeposit: string;
  leverage: string;
  spread: string;
  features: string[];
  ctaUrl: string;
  isPromoted?: boolean;
}

const BROKERS: Broker[] = [
  {
    id: "1",
    name: "Zenith Pro",
    logo: "Z",
    rating: 4.9,
    minDeposit: "100€",
    leverage: "1:500",
    spread: "0.0 pips",
    features: ["Zero commission", "Éxécution instantanée", "24/7 support"],
    ctaUrl: "#",
    isPromoted: true,
  },
  {
    id: "2",
    name: "TradeGlobal",
    logo: "T",
    rating: 4.7,
    minDeposit: "200€",
    leverage: "1:400",
    spread: "0.1 pips",
    features: ["Multi-asset", "Copy trading", "Mobile app"],
    ctaUrl: "#",
  },
  {
    id: "3",
    name: "ForexPrime",
    logo: "F",
    rating: 4.6,
    minDeposit: "50€",
    leverage: "1:300",
    spread: "0.2 pips",
    features: ["Micro lots", "EA allowed", "VPS gratuite"],
    ctaUrl: "#",
  },
  {
    id: "4",
    name: "CryptoX",
    logo: "C",
    rating: 4.5,
    minDeposit: "10€",
    leverage: "1:100",
    spread: "0.5%",
    features: ["200+ cryptos", "Staking", "NFT marketplace"],
    ctaUrl: "#",
  },
];

export default function BrokerGrid() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Courtiers recommandés</h2>
          <p className="text-xs text-secondary">Plateformes de trading partenaires</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BROKERS.map((broker) => (
          <BrokerCard key={broker.id} broker={broker} />
        ))}
      </div>
    </div>
  );
}

function BrokerCard({ broker }: { broker: Broker }) {
  return (
    <div className={`relative bg-card border rounded-sm p-4 hover:border-surface transition-colors ${broker.isPromoted ? "border-accent/30" : "border-surface"}`}>
      {broker.isPromoted && (
        <div className="absolute -top-2 left-4 bg-accent text-inverse text-[10px] font-bold px-2 py-0.5 rounded-full">
          RECOMMANDÉ
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-sm bg-raised flex items-center justify-center text-lg font-medium text-accent">
          {broker.logo}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary">{broker.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
            <span className="text-xs text-secondary">{broker.rating}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-secondary">Dépôt min.</span>
          <span className="text-primary font-medium">{broker.minDeposit}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-secondary">Levier</span>
          <span className="text-primary font-medium">{broker.leverage}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-secondary">Spread</span>
          <span className="text-accent font-medium">{broker.spread}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {broker.features.map((feature) => (
          <span key={feature} className="text-[10px] text-secondary bg-raised px-2 py-0.5 rounded">
            {feature}
          </span>
        ))}
      </div>

      <Link
        href={broker.ctaUrl}
        className="flex items-center justify-center gap-1 w-full py-2 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-medium rounded-sm transition-colors"
      >
        Ouvrir un compte
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
