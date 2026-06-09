"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  ArrowRight,
  Home,
  BarChart3,
  Bell,
  Wallet,
  Settings,
  Newspaper,
  HelpCircle,
  LayoutDashboard,
  Briefcase,
} from "lucide-react";
import { useCommandPalette } from "@/lib/context/CommandPaletteContext";

interface CommandItem {
  id: string;
  name: string;
  shortcut?: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
}

const NAV_ITEMS: CommandItem[] = [
  { id: "home", name: "Accueil", icon: <Home className="w-4 h-4" />, href: "/" },
  { id: "markets", name: "Marchés", shortcut: "G M", icon: <BarChart3 className="w-4 h-4" />, href: "/markets" },
  { id: "news", name: "Actualités", icon: <Newspaper className="w-4 h-4" />, href: "/news/crypto" },
  { id: "dashboard", name: "Dashboard", shortcut: "G D", icon: <LayoutDashboard className="w-4 h-4" />, href: "/dashboard" },
  { id: "portfolio", name: "Portfolio", shortcut: "G P", icon: <Briefcase className="w-4 h-4" />, href: "/portfolio" },
  { id: "alerts", name: "Alertes", icon: <Bell className="w-4 h-4" />, href: "/tools/alerts" },
  { id: "help", name: "Aide", icon: <HelpCircle className="w-4 h-4" />, href: "/help" },
  { id: "settings", name: "Paramètres", icon: <Settings className="w-4 h-4" />, href: "/app/settings" },
];

const ASSET_ITEMS: CommandItem[] = [
  { id: "bitcoin", name: "Bitcoin", icon: <span className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-[8px]">₿</span>, href: "/markets/bitcoin" },
  { id: "ethereum", name: "Ethereum", icon: <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">Ξ</span>, href: "/markets/ethereum" },
  { id: "solana", name: "Solana", icon: <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-green-400 to-purple-500 flex items-center justify-center text-[8px]">S</span>, href: "/markets/solana" },
  { id: "bnb", name: "BNB", icon: <span className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px]">B</span>, href: "/markets/bnb" },
  { id: "xrp", name: "XRP", icon: <span className="w-4 h-4 rounded-full bg-gray-800 flex items-center justify-center text-[8px]">X</span>, href: "/markets/xrp" },
];

export default function CommandPalette() {
  const { isOpen, open, close } = useCommandPalette();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) close();
        else open();
      }
      if (e.key === "/") {
        e.preventDefault();
        open();
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        close();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, open, close]);

  const handleSelect = (href?: string) => {
    close();
    if (href) {
      router.push(href);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm" onClick={close}>
      <div className="w-full max-w-2xl bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <Command className="[&_[cmdk-root]]:flex [&_[cmdk-root]]:flex-col [&_[cmdk-root]]:h-full">
          <div className="flex items-center border-b border-dark-border px-4 py-3">
            <Search className="w-4 h-4 text-gray-500 mr-3" />
            <Command.Input
              placeholder="Rechercher un actif, une page, une action..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
              autoFocus
            />
            <kbd className="bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded text-xs text-gray-400 ml-2">
              ESC
            </kbd>
          </div>
          
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-gray-500 text-sm">
              Aucun résultat trouvé.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs text-gray-500 uppercase tracking-wider px-2 py-2">
              {NAV_ITEMS.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.name}
                  className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition text-sm text-gray-200"
                  onSelect={() => handleSelect(item.href)}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.shortcut && (
                    <div className="flex gap-1">
                      {item.shortcut.split(" ").map((key) => (
                        <kbd key={key} className="bg-gray-800 border border-gray-700 px-1.5 rounded text-xs text-gray-500">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  )}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Actifs Populaires" className="text-xs text-gray-500 uppercase tracking-wider px-2 py-2 mt-2">
              {ASSET_ITEMS.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.name}
                  className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition text-sm text-gray-200"
                  onSelect={() => handleSelect(item.href)}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-600" />
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
