import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Apprendre" };

export default function ApprendreLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
