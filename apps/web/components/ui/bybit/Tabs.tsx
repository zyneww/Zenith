"use client";

import React from "react";
import { tokens } from "@/lib/theme/bybit";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, active, onChange, className = "" }: TabsProps) {
  return (
    <div className={`flex items-center border-b border-[${tokens.color.border.default}] ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3 py-2 text-xs font-medium transition ${
              isActive
                ? "text-primary border-b-2"
                : "text-secondary hover:text-primary border-b-2 border-transparent"
            }`}
            style={{
              color: isActive ? tokens.color.text.primary : undefined,
              borderColor: isActive ? tokens.color.accent.primary : undefined,
              transition: tokens.transition.standard,
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
