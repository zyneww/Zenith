"use client";

import Header from "@/components/landing/Header";
import MetricsCards from "@/components/dashboard/MetricsCards";
import PortfolioChart from "@/components/dashboard/PortfolioChart";
import ActivePositions from "@/components/dashboard/ActivePositions";
import RecentAlerts from "@/components/dashboard/RecentAlerts";

export default function DashboardPage() {
return (
    <>
      <Header />
      <main className="min-h-screen bg-canvas text-primary">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div
            className="mb-8"
          >
            <h1 className="text-3xl font-medium text-primary mb-2">Dashboard</h1>
            <p className="text-secondary">
              Vue d'ensemble de votre portfolio et performances du marché.
            </p>
          </div>

          {/* Metrics */}
          <div className="mb-8">
            <MetricsCards />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart - takes 2 columns */}
            <div className="lg:col-span-2">
              <PortfolioChart />
            </div>

            {/* Alerts */}
            <div className="lg:col-span-1">
              <RecentAlerts />
            </div>
          </div>

          {/* Positions */}
          <div className="mt-8">
            <ActivePositions />
          </div>
        </div>
      </main>
    </>
  );
}
