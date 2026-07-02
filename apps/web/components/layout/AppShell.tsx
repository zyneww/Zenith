import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
