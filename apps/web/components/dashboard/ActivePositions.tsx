"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useRealtimePrice } from "@/lib/hooks/useRealtimePrice";

interface Position {
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  iconBg: string;
  iconText: string;
}

const POSITIONS: Position[] = [
  { symbol: "BTC", name: "Bitcoin", quantity: 0.5, avgBuyPrice: 58000, iconBg: "bg-orange-500", iconText: "₿" },
  { symbol: "ETH", name: "Ethereum", quantity: 4.2, avgBuyPrice: 1650, iconBg: "bg-blue-500", iconText: "Ξ" },
  { symbol: "SOL", name: "Solana", quantity: 25, avgBuyPrice: 145, iconBg: "bg-gradient-to-tr from-green-400 to-purple-500", iconText: "S" },
  { symbol: "BNB", name: "BNB", quantity: 2.1, avgBuyPrice: 590, iconBg: "bg-yellow-500", iconText: "B" },
];

function PositionRow({ position, index }: { position: Position; index: number }) {
  const symbols = useMemo(() => [position.symbol + "USDT"], [position.symbol]);
  const { getPrice } = useRealtimePrice(symbols);
  const priceData = getPrice(position.symbol + "USDT");
  const currentPrice = priceData?.price || position.avgBuyPrice;
  const totalValue = currentPrice * position.quantity;
  const invested = position.avgBuyPrice * position.quantity;
  const pnl = totalValue - invested;
  const pnlPercent = ((pnl / invested) * 100).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-center justify-between py-4 border-b border-surface last:border-0"
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${position.iconBg} flex items-center justify-center text-primary text-xs font-medium`}>
          {position.iconText}
        </div>
        <div>
          <p className="text-primary font-medium">{position.name}</p>
          <p className="text-secondary text-sm">{position.quantity} {position.symbol}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-primary font-medium">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <div className={`flex items-center gap-1 ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
          {pnl >= 0 ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          <span className="text-sm">
            {pnl >= 0 ? "+" : ""}{pnlPercent}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ActivePositions() {
  return (
    <div className="bg-card border border-surface rounded-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary font-semibold text-lg">Positions Actives</h3>
        <button className="text-brand-cyan text-sm hover:underline">Voir tout</button>
      </div>
      <div>
        {POSITIONS.map((position, index) => (
          <PositionRow key={position.symbol} position={position} index={index} />
        ))}
      </div>
    </div>
  );
}
