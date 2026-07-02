import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Actualités" };

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
