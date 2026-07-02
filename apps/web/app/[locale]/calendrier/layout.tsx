import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Calendrier" };

export default function CalendrierLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
