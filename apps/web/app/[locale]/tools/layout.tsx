import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Outils" };

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
