import { Suspense } from "react";
import MarketsClient from "./MarketsClient";

export default function MarketsPage() {
  return (
    <Suspense fallback={null}>
      <MarketsClient />
    </Suspense>
  );
}
