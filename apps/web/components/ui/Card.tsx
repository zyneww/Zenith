"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-2.5",
  md: "p-3",
  lg: "p-4",
};

export function Card({ children, className = "", padding = "md" }: CardProps) {
  return (
    <div className={`bg-card border border-surface rounded-lg ${paddingMap[padding]} ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-xs font-bold text-primary mb-2 uppercase tracking-wide ${className}`}>
      {children}
    </h3>
  );
}
