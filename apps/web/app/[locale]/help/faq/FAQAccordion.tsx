"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS: { q: string; a: string }[] = [
  { q: "Zenith est-il gratuit ?", a: "Oui, gratuit pour toujours : 80+ paires temps réel, charts LW, alertes prix essentielles. Le plan Pro à $9.99/mois débloque les alertes intelligentes multi-canaux, le screener avancé et l'export CSV." },
  { q: "Quels marchés sont couverts ?", a: "Crypto (Binance, CoinGecko), Forex (TwelveData), Commodities (or, pétrole, RegC), Indices mondiaux, ETFs US majeurs." },
  { q: "À quelle fréquence les prix sont-ils mis à jour ?", a: "En temps réel via WebSocket Binance direct (sub-seconde), sinon fallback REST 2s. Pas de stale cache." },
  { q: "Puis-je créer des alertes personnalisées ?", a: "Plan Pro uniquement : seuils, % de variation, conditions combinées, notifications par push, email et Discord." },
  { q: "Mes données personnelles sont-elles sécurisées ?", a: "Chiffrées en transit TLS 1.3 et au repos AES-256 via Turso + Cloudflare R2. Auth Clerk, zero PII exposée aux modèles IA." },
  { q: "Zenith fonctionne-t-il sur mobile ?", a: "Site optimisé desktop-first. App iOS/Android prévue Q3 2026. En attendant, PWA installable." },
  { q: "Comment annuler mon abonnement Pro ?", a: "Settings > Abonnement > Annuler. Aucun frais, effet immédiat, accès maintenu jusqu'à la fin de la période payée." },
  { q: "Puis-je exporter mes données ?", a: "Plan Pro : CSV pour transactions, alertes, portfolio. Export API JSON via /api/export (en préparation)." },
  { q: "Quels pays sont supportés pour le paiement ?", a: "Europe, US, UK, Canada. Stripe gère la facturation. Cartes (Visa/MC/Amex) + Apple Pay + Google Pay." },
  { q: "Comment puis-je contacter le support ?", a: "Via /help/contact (formulaire sous 24h), ou Discord (instantané en semaine). Tickets prioritaires pour plan Pro." },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="bg-card border border-surface rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-raised transition-colors"
              aria-expanded={isOpen}
            >
              <span className="title text-primary">{item.q}</span>
              <ChevronDown
                className={`w-5 h-5 text-tertiary shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div className={`px-5 transition-all duration-200 ${isOpen ? "pb-4" : "h-0 overflow-hidden"}`}>
              <p className="text-secondary text-sm leading-relaxed">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
