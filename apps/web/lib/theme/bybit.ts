// BYBIT v2 Design Tokens — extracted from DESIGN BYBIT ⁄ CoinGecko.html
// Usage: import { tokens } from "@/lib/theme/bybit" and use inline styles or map to Tailwind classes

export const tokens = {
  color: {
    bg: {
      dark: "#0B0E11",
      panel: "#12161A",
      card: "#161A1E",
      raised: "#1A1E23",
      input: "#161A1E",
    },
    border: {
      default: "#222930",
      hover: "#2A3038",
      accent: "#F5A623",
    },
    text: {
      primary: "#EAECEF",
      secondary: "#848E9C",
      muted: "#5D6677",
      faint: "#3D4352",
      inverse: "#0B0E11",
    },
    accent: {
      primary: "#F5A623",   // Bybit Yellow
      green: "#4DAB9A",    // CoinGecko Green (up)
      red: "#FF7369",      // down
      blue: "#4DA6FF",     // brand blue
      warning: "#F59E0B",
    },
  },
  font: {
    sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
  radius: {
    xs: "4px",
    sm: "5px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },
  shadow: {
    level1: "0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)",
    focus: "0 0 0 2px rgba(245,166,35,0.4)",
  },
  transition: {
    standard: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    fast: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  spacing: {
    compact: "0.5rem",   // 8px
    standard: "1rem",    // 16px
    relaxed: "1.5rem", // 24px
  },
} as const;

// Convenience type helpers
export type BybitToken = typeof tokens;
