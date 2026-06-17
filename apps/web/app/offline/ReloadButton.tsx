"use client";

import { useCallback } from "react";

export default function ReloadButton() {
  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <button
      onClick={handleReload}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-[#010120] bg-[#c8f6f9] hover:bg-[#c8f6f9]/80 transition-colors duration-200 cursor-pointer"
      type="button"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21.5 2v6h-6" />
        <path d="M21.34 5.5A10 10 0 1 1 17.6 2.2" />
      </svg>
      Réessayer
    </button>
  );
}
