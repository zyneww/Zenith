import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Tarifs" };

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
