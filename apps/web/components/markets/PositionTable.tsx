"use client";

import { useMemo } from "react";
import { useFormatPrice } from "@/lib/context/CurrencyContext";

interface Position {
  pair: string;
  side: "Long" | "Short";
  entry: number;
  current: number;
  size: string;
}

function randVariation(base: number, pct: number): number {
  return base * (1 + (Math.random() - 0.5) * pct);
}

const POSITION_TEMPLATES: Omit<Position, "current">[] = [
  { pair: "BTC/USDT", side: "Long", entry: 62450, size: "0.15" },
  { pair: "ETH/USDT", side: "Short", entry: 3450, size: "2.5" },
  { pair: "SOL/USDT", side: "Long", entry: 142.8, size: "12" },
  { pair: "EUR/USD", side: "Long", entry: 1.0875, size: "10,000" },
];

export default function PositionTable() {
  const formatPrice = useFormatPrice();
  const positions = useMemo(
    () =>
      POSITION_TEMPLATES.map((p) => ({
        ...p,
        current: randVariation(p.entry, 0.08),
      })),
    []
  );

  return (
    <div className="p-2">
      {positions.length === 0 ? (
        <div className="text-center py-6 text-tertiary text-xs">
          <p>Aucune position ouverte</p>
          <p className="mt-1">
            <a href="/fr/sign-in" className="text-accent hover:underline">
              Connectez-vous
            </a>{" "}
            pour trader en réel
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-tertiary border-b border-default">
                  <th className="text-left py-1.5 px-2 font-medium">Paire</th>
                  <th className="text-left py-1.5 px-2 font-medium">Side</th>
                  <th className="text-right py-1.5 px-2 font-medium">Entrée</th>
                  <th className="text-right py-1.5 px-2 font-medium">Actuel</th>
                  <th className="text-right py-1.5 px-2 font-medium">Taille</th>
                  <th className="text-right py-1.5 px-2 font-medium">P&L</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, i) => {
                  const pnl = pos.side === "Long" ? pos.current - pos.entry : pos.entry - pos.current;
                  const pnlPct = (pnl / pos.entry) * 100;
                  const isPositive = pnl >= 0;
                  return (
                    <tr
                      key={i}
                      className="border-b border-default/50 hover:bg-raised/30 transition-colors"
                    >
                      <td className="py-2 px-2 text-primary font-medium">{pos.pair}</td>
                      <td className="py-2 px-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                            pos.side === "Long"
                              ? "bg-up-subtle text-up"
                              : "bg-down-subtle text-down"
                          }`}
                        >
                          {pos.side}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right text-secondary font-mono tabular-nums">
                        {formatPrice(pos.entry)}
                      </td>
                      <td className="py-2 px-2 text-right text-secondary font-mono tabular-nums">
                        {formatPrice(pos.current)}
                      </td>
                      <td className="py-2 px-2 text-right text-secondary font-mono tabular-nums">{pos.size}</td>
                      <td
                        className={`py-2 px-2 text-right font-mono tabular-nums font-medium ${
                          isPositive ? "text-up" : "text-down"
                        }`}
                      >
                        <span>{isPositive ? "+" : ""}{formatPrice(Math.abs(pnl))}</span>
                        <span className="text-[9px] ml-1">
                          ({isPositive ? "+" : ""}{pnlPct.toFixed(2)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-center py-3 text-muted text-[9px]">
            <a href="/fr/sign-in" className="text-accent hover:underline">Connectez-vous</a> pour trader en réel
          </div>
        </>
      )}
    </div>
  );
}
