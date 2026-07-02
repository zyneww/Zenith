import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Dérivés" };

export default function DerivativesLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
