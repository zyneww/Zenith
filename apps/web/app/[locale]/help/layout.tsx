import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Aide" };

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
