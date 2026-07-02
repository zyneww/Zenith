"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface TabsContextType {
  value: string;
  onValueChange: (val: string) => void;
}

const TabsCtx = createContext<TabsContextType | null>(null);

function useTabs() {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error("Tabs subcomponents must be inside <Tabs>");
  return ctx;
}

export function Tabs({
  value: controlledValue,
  onValueChange,
  defaultValue,
  children,
  className = "",
}: {
  value?: string;
  onValueChange?: (val: string) => void;
  defaultValue?: string;
  children: ReactNode;
  className?: string;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue! : internalValue;

  const handleChange = useCallback(
    (val: string) => {
      if (!isControlled) setInternalValue(val);
      onValueChange?.(val);
    },
    [isControlled, onValueChange]
  );

  const ctxVal = currentValue ?? "";
  return (
    <TabsCtx.Provider value={{ value: ctxVal, onValueChange: handleChange }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex gap-1 border-b border-surface ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className = "",
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { value: current, onValueChange } = useTabs();
  const active = current === value;
  return (
    <button
      onClick={() => onValueChange(value)}
      className={`px-3 py-2 text-xs font-medium transition relative ${
        active
          ? "text-accent"
          : "text-secondary hover:text-primary"
      } ${className}`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
      )}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className = "",
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { value: current } = useTabs();
  if (current !== value) return null;
  return <div className={className}>{children}</div>;
}
