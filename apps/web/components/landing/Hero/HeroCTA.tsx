"use client";

import { useEffect, useState } from "react";
import { useAuth, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const baseBtn =
  "bg-brand-blue text-on-accent rounded-full px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-raised transition-colors flex items-center justify-center gap-2";

export default function HeroCTA() {
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isSignedIn) {
    return (
      <Link href="/dashboard" className={`${baseBtn} inline-flex`}>
        Accéder au compte
        <ArrowRight className="w-4 h-4" />
      </Link>
    );
  }

  return (
    <SignUpButton mode="modal" forceRedirectUrl="/pricing">
      <button type="button" className={baseBtn}>
        Créer mon compte gratuit
        <ArrowRight className="w-4 h-4" />
      </button>
    </SignUpButton>
  );
}
