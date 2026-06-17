"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function Accordion({ title, defaultOpen = false, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const id = useId();
  const panelId = `accordion-panel-${id}`;

  return (
    <div className="border-b border-surface">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <span className="text-primary font-semibold text-base">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-secondary transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        id={panelId}
        className={`overflow-hidden transition-all duration-200 ease-out ${
          isOpen ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"
        }`}
        role="region"
        aria-hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
}
