"use client";

import React from "react";
import { tokens } from "@/lib/theme/bybit";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: tokens.color.accent.primary,
    color: tokens.color.text.inverse,
    border: `1px solid ${tokens.color.accent.primary}`,
  },
  secondary: {
    backgroundColor: tokens.color.bg.raised,
    color: tokens.color.text.primary,
    border: `1px solid ${tokens.color.border.default}`,
  },
  ghost: {
    backgroundColor: "transparent",
    color: tokens.color.text.secondary,
    border: "1px solid transparent",
  },
  danger: {
    backgroundColor: "transparent",
    color: tokens.color.accent.red,
    border: `1px solid ${tokens.color.accent.red}44`,
  },
};

const sizeStyles: Record<Size, string> = {
  xs: "px-2 py-1 text-[10px]",
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-2.5 text-base",
};

export default function Button({
  variant = "secondary",
  size = "sm",
  children,
  className = "",
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center font-medium rounded-sm transition ${sizeStyles[size]} ${className}`}
      style={{
        ...variantStyles[variant],
        transition: tokens.transition.standard,
        ...style,
      }}
      onMouseEnter={(e) => {
        const t = e.currentTarget;
        if (variant === "secondary") t.style.borderColor = tokens.color.border.hover;
        if (variant === "ghost") t.style.color = tokens.color.text.primary;
        if (variant === "danger") t.style.backgroundColor = `${tokens.color.accent.red}11`;
      }}
      onMouseLeave={(e) => {
        const t = e.currentTarget;
        t.style.cssText = "";
        // Re-apply base styles via inline reset isn't clean; rely on CSS vars or re-render
      }}
      {...props}
    >
      {children}
    </button>
  );
}
