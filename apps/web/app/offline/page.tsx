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
    <div className="min-h-[100dvh] bg-canvas flex flex-col items-center justify-center px-4 text-center">
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
          <circle cx="50" cy="50" r="46" stroke="#c8f6f9" strokeWidth="2" fill="none" opacity="0.2" />
          <circle cx="50" cy="50" r="36" stroke="#c8f6f9" strokeWidth="1.5" fill="none" opacity="0.1" />
          <path
            d="M50 14 L62 46 L62 46 L86 46 L66 62 L74 90 L50 74 L26 90 L34 62 L14 46 L38 46 L50 14 Z"
            fill="none"
            stroke="#c8f6f9"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="8" fill="#c8f6f9" opacity="0.8" />
          <circle cx="50" cy="50" r="4" fill="#010120" />
        </svg>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 tracking-tight">
        Connexion perdue
      </h1>

      <p className="text-base md:text-lg text-secondary max-w-md mb-8 leading-relaxed">
        Vous êtes actuellement hors ligne.
        <br />
        Vérifiez votre connexion et réessayez.
      </p>

      <ReloadButton />

      <footer className="mt-16 text-sm text-tertiary">
        Zenith — Votre sommet, vos marchés, votre clarté
      </footer>
    </div>
  );
}
