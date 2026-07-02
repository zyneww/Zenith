"use client";

import { useNewsDrawer } from "@/lib/context/NewsDrawerContext";
import NewsSidebar from "./NewsSidebar";

export default function GlobalNewsDrawer() {
  const { isOpen, close } = useNewsDrawer();
  return <NewsSidebar isOpen={isOpen} onClose={close} side="right" />;
}
