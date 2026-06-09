import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0b0e14",
};

export const metadata: Metadata = {
  title: "Zenith",
  description: "Multi-asset financial intelligence platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}