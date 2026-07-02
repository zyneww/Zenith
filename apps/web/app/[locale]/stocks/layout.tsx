import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Actions" };

export default function StocksLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
