import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "NFTs" };

export default function NftsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
