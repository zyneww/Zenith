import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Portefeuille" };

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
