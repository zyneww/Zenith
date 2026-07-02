import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "On-chain" };

export default function OnchainLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
