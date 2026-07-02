import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Tableau de bord" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
