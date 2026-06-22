import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({
  title = "Bientôt disponible",
  description = "Cette fonctionnalité est en cours de développement. Revenez bientôt pour découvrir les nouveautés.",
}: ComingSoonProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-canvas text-primary">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-lg bg-accent-subtle border border-accent/20 flex items-center justify-center">
            <Construction className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-3">{title}</h1>
          <p className="text-secondary text-sm leading-relaxed mb-8">{description}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-on-accent text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
