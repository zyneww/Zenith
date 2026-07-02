"use client";

import React from "react";
import { tokens } from "@/lib/theme/bybit";

type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "pro";

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneMap: Record<BadgeTone, { bg: string; text: string; border: string }> = {
  neutral: { bg: tokens.color.bg.raised, text: tokens.color.text.secondary, border: tokens.color.border.default },
  primary: { bg: `${tokens.color.accent.primary}18`, text: tokens.color.accent.primary, border: `${tokens.color.accent.primary}33` },
  success: { bg: `${tokens.color.accent.green}18`, text: tokens.color.accent.green, border: `${tokens.color.accent.green}33` },
  warning: { bg: `${tokens.color.accent.warning}18`, text: tokens.color.accent.warning, border: `${tokens.color.accent.warning}33` },
  danger:  { bg: `${tokens.color.accent.red}18`, text: tokens.color.accent.red, border: `${tokens.color.accent.red}33` },
  pro:     { bg: `${tokens.color.accent.green}18`, text: tokens.color.accent.green, border: `${tokens.color.accent.green}33` },
};

export default function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  const t = toneMap[tone];
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wide ${className}`}
      style={{ backgroundColor: t.bg, color: t.text, border: `1px solid ${t.border}` }}
    >
      {children}
    </span>
  );
}
