"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-dark-bg px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Une erreur est survenue
        </h1>
        <p className="text-gray-400 mb-8">
          Nous avons rencontré un problème inattendu. Veuillez réessayer ou recharger la page.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-600 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-brand-purple text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-purple/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    </div>
  );
}
