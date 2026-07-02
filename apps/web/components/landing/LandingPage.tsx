"use client";

import { useState, useCallback, useRef } from "react";
import { Newspaper } from "lucide-react";
import Header from "./Header";
import HomeMarketView from "@/components/home/HomeMarketView";
import Features from "./Features";
import CTAFinal from "./CTAFinal";
import Footer from "./Footer";
import NewsSidebar from "@/components/home/NewsSidebar";

export default function LandingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(360);
  const isResizing = useRef(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleWidthChange = useCallback((w: number) => {
    isResizing.current = true;
    setSidebarWidth(w);
  }, []);

  return (
    <div className="relative min-h-screen">
      <NewsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onWidthChange={handleWidthChange}
      />

      {/* Floating news toggle — top-left, outside header */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-5 left-5 z-[60] flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-all shadow-lg backdrop-blur-sm bg-card/90 text-secondary hover:text-primary border border-surface hover:border-accent/30"
          aria-label="Ouvrir les actualités"
          type="button"
          title="Ouvrir les actualités"
        >
          <Newspaper className="w-4 h-4" />
          <span className="hidden sm:inline">Actualités</span>
        </button>
      )}

      <div
        className={isResizing.current ? "" : "transition-[margin-left] duration-300 ease-in-out"}
        style={{ marginLeft: sidebarOpen ? sidebarWidth : 0 }}
      >
        <Header />
        <main>
          <HomeMarketView />
          <Features />
          <CTAFinal />
        </main>
        <Footer />
      </div>
    </div>
  );
}
