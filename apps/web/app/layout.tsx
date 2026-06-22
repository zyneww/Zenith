import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#010120",
};

export const metadata: Metadata = {
  title: {
    default: "Zenith",
    template: "Zenith | %s",
  },
  description: "Multi-asset financial intelligence platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
