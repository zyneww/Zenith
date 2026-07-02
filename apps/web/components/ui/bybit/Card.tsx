"use client";

import React from "react";
import { tokens } from "@/lib/theme/bybit";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "compact" | "standard" | "relaxed";
  hover?: boolean;
}

const paddingMap = {
  none: "",
  compact: "p-3",
  standard: "p-4",
  relaxed: "p-6",
};

export default function Card({
  children,
  className = "",
  padding = "standard",
  hover = false,
}: CardProps) {
  return (
    <div
      className={`bg-[${tokens.color.bg.card}] border border-[${tokens.color.border.default}] rounded-sm ${paddingMap[padding]} ${hover ? "transition hover:border-[" + tokens.color.border.hover + "]" : ""} ${className}`}
      style={{
        backgroundColor: tokens.color.bg.card,
        borderColor: tokens.color.border.default,
        boxShadow: tokens.shadow.level1,
        transition: hover ? tokens.transition.standard : undefined,
      }}
    >
      {children}
    </div>
  );
}
