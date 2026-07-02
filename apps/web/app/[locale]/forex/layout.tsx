import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Forex" };

export default function ForexLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
