import { Suspense } from "react";
import MarketsClient from "./MarketsClient";

export const metadata = { title: "Marchés" };

export default function MarketsPage() {
  return (
    <Suspense fallback={null}>
      <MarketsClient />
    </Suspense>
  );
}
