import type { Metadata } from "next";
import ReloadButton from "./ReloadButton";

export const metadata: Metadata = {
  title: "Hors ligne — Zenith",
  description: "Vous êtes actuellement hors ligne.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <div className="min-h-[100dvh] bg-[#0b0e14] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        {/* Logo Zenith inline SVG — simple peak/boussole symbol */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto"
        >
          <circle cx="50" cy="50" r="46" stroke="#00e5ff" strokeWidth="2" fill="none" opacity="0.2" />
          <circle cx="50" cy="50" r="36" stroke="#00e5ff" strokeWidth="1.5" fill="none" opacity="0.1" />
          <path
            d="M50 14 L62 46 L62 46 L86 46 L66 62 L74 90 L50 74 L26 90 L34 62 L14 46 L38 46 L50 14 Z"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="8" fill="#00e5ff" opacity="0.8" />
          <circle cx="50" cy="50" r="4" fill="#0b0e14" />
        </svg>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
        Connexion perdue
      </h1>

      <p className="text-base md:text-lg text-[#94a3b8] max-w-md mb-8 leading-relaxed">
        Vous êtes actuellement hors ligne.
        <br />
        Vérifiez votre connexion et réessayez.
      </p>

      <ReloadButton />

      <footer className="mt-16 text-sm text-[#475569]">
        Zenith — Votre sommet, vos marchés, votre clarté
      </footer>
    </div>
  );
}
