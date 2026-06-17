"use client";

import { motion } from "motion/react";
import { PieChart, TrendingUp, Clock, ArrowRight } from "lucide-react";
import Header from "@/components/landing/Header";

interface Asset {
  name: string;
  symbol: string;
  allocation: number;
  value: number;
  color: string;
}

const ASSETS: Asset[] = [
  { name: "Bitcoin", symbol: "BTC", allocation: 45, value: 56166.58, color: "#f7931a" },
  { name: "Ethereum", symbol: "ETH", allocation: 30, value: 37444.39, color: "#627eea" },
  { name: "Solana", symbol: "SOL", allocation: 15, value: 18722.19, color: "#14f195" },
  { name: "Autres", symbol: "OTH", allocation: 10, value: 12481.46, color: "#ef2cc1" },
];

interface Transaction {
  id: string;
  type: "buy" | "sell";
  asset: string;
  amount: number;
  price: number;
  total: number;
  date: string;
  status: "completed" | "pending";
}

const TRANSACTIONS: Transaction[] = [
  { id: "1", type: "buy", asset: "BTC", amount: 0.1, price: 64330.91, total: 6433.09, date: "2024-06-04", status: "completed" },
  { id: "2", type: "sell", asset: "ETH", amount: 2.5, price: 1788.33, total: 4470.83, date: "2024-06-03", status: "completed" },
  { id: "3", type: "buy", asset: "SOL", amount: 15, price: 172.34, total: 2585.10, date: "2024-06-02", status: "completed" },
  { id: "4", type: "buy", asset: "BTC", amount: 0.05, price: 62800.00, total: 3140.00, date: "2024-06-01", status: "completed" },
  { id: "5", type: "sell", asset: "BNB", amount: 3, price: 605.20, total: 1815.60, date: "2024-05-30", status: "completed" },
];

function AssetAllocation() {
  const totalValue = ASSETS.reduce((sum, a) => sum + a.value, 0);

  return (
    <div className="bg-card border border-surface rounded-sm p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-primary font-semibold text-lg flex items-center gap-2">
          <PieChart className="w-5 h-5 text-brand-purple-light" />
          Répartition des Actifs
        </h3>
        <span className="text-secondary text-sm">{ASSETS.length} actifs</span>
      </div>

      {/* Simple bar chart representation */}
      <div className="flex h-4 rounded-full overflow-hidden mb-6">
        {ASSETS.map((asset) => (
          <div
            key={asset.symbol}
            style={{
              width: `${asset.allocation}%`,
              backgroundColor: asset.color,
            }}
            className="h-full"
          />
        ))}
      </div>

      {/* Asset list */}
      <div className="space-y-3">
        {ASSETS.map((asset, index) => (
          <motion.div
            key={asset.symbol}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: asset.color }}
              />
              <div>
                <p className="text-primary font-medium">{asset.name}</p>
                <p className="text-secondary text-sm">{asset.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-primary font-medium">${asset.value.toLocaleString()}</p>
              <p className="text-secondary text-sm">{asset.allocation}%</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-surface">
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Valeur Totale</span>
          <span className="text-primary font-medium">${totalValue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function TransactionTable() {
  return (
    <div className="bg-card border border-surface rounded-sm p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-primary font-semibold text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-cyan" />
          Historique des Transactions
        </h3>
        <button className="text-brand-cyan text-sm hover:underline flex items-center gap-1">
          Voir tout <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface">
              <th className="text-left text-secondary text-sm font-medium pb-3">Type</th>
              <th className="text-left text-secondary text-sm font-medium pb-3">Actif</th>
              <th className="text-right text-secondary text-sm font-medium pb-3">Montant</th>
              <th className="text-right text-secondary text-sm font-medium pb-3">Prix</th>
              <th className="text-right text-secondary text-sm font-medium pb-3">Total</th>
              <th className="text-right text-secondary text-sm font-medium pb-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((tx, index) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-surface/50 last:border-0 hover:bg-raised transition-colors"
              >
                <td className="py-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tx.type === "buy"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {tx.type === "buy" ? "Achat" : "Vente"}
                  </span>
                </td>
                <td className="py-3 text-primary font-medium">{tx.asset}</td>
                <td className="py-3 text-right text-primary">{tx.amount}</td>
                <td className="py-3 text-right text-primary">${tx.price.toLocaleString()}</td>
                <td className="py-3 text-right text-primary font-medium">
                  ${tx.total.toLocaleString()}
                </td>
                <td className="py-3 text-right text-secondary text-sm">{tx.date}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PerformanceMetrics() {
  const metrics = [
    { label: "Sharpe Ratio", value: "1.85", icon: TrendingUp, color: "text-green-500" },
    { label: "Drawdown Max", value: "-12.4%", icon: TrendingUp, color: "text-red-500" },
    { label: "Volatilité", value: "24.8%", icon: TrendingUp, color: "text-yellow-500" },
    { label: "Beta", value: "0.92", icon: TrendingUp, color: "text-brand-cyan" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-card border border-surface rounded-sm p-4"
        >
          <p className="text-secondary text-sm mb-1">{metric.label}</p>
          <div className="flex items-center gap-2">
            <metric.icon className={`w-4 h-4 ${metric.color}`} />
            <span className="text-xl font-medium text-primary">{metric.value}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function PortfolioPage() {
return (
    <>
      <Header />
      <main className="min-h-screen bg-canvas text-primary">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-primary mb-2">Portfolio</h1>
            <p className="text-secondary">
              Analyse détaillée de vos actifs et performances historiques.
            </p>
          </motion.div>

          {/* Performance Metrics */}
          <div className="mb-8">
            <PerformanceMetrics />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Asset Allocation */}
            <div className="lg:col-span-1">
              <AssetAllocation />
            </div>

            {/* Transaction History - takes 2 columns */}
            <div className="lg:col-span-2">
              <TransactionTable />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
