"use client";

type BadgeVariant = "live" | "offline" | "reconnecting" | "category" | "up" | "down" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  live: "bg-up/10 text-up",
  offline: "bg-raised text-tertiary",
  reconnecting: "bg-warning/10 text-warning",
  category: "bg-accent-subtle text-accent",
  up: "bg-up/10 text-up",
  down: "bg-down/10 text-down",
  default: "bg-raised text-secondary",
};

const dotStyles: Record<string, string | undefined> = {
  live: "bg-up animate-pulse",
  offline: "bg-tertiary",
  reconnecting: "bg-warning",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  const dot = dotStyles[variant];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-medium px-1.5 py-0.5 rounded ${variantStyles[variant]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "currentcolor" }} />}
      {children}
    </span>
  );
}
