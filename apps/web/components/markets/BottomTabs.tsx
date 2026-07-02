"use client";

import { useEffect, useState } from "react";
import {
  Database, Newspaper, PieChart, Calculator, Info,
  ThumbsUp, ThumbsDown, Globe, Search, Github,
  MessageCircle, ExternalLink
} from "lucide-react";
import { tokens } from "@/lib/theme/bybit";
import type { AssetMeta } from "@/lib/assets/registry";

const TABS = [
  { key: "info", label: "Informations", icon: Info },
  { key: "fundamentals", label: "Statistiques Fondamentales", icon: Database },
  { key: "news", label: "Actualités Chaudes", icon: Newspaper },
  { key: "sentiment", label: "Sentiment & Tokenomics", icon: PieChart },
  { key: "converter", label: "Convertisseur & Liens", icon: Calculator },
];

interface BottomTabsProps {
  asset: AssetMeta;
  currentPrice?: number;
}

interface Fundamentals {
  marketCapRank: number | null;
  marketCap: number | null;
  fullyDilutedValuation: number | null;
  circulatingSupply: number | null;
  maxSupply: number | null;
  totalSupply: number | null;
  ath: number | null;
  athDate: string | null;
  atl: number | null;
  atlDate: string | null;
}

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment?: number;
}

interface InfoData {
  name: string;
  symbol: string;
  type: string;
  slug: string;
  tags: string[];
  description: string;
  logoUrl: string;
  coingeckoId?: string;
  homepageUrl?: string | null;
  explorerUrl?: string | null;
  subredditUrl?: string | null;
  twitterHandle?: string | null;
  githubUrl?: string | null;
  genesisDate?: string | null;
  platform?: string | null;
  categories?: string[];
  marketCapRank?: number | null;
}

function fmtCompact(val: number | null | undefined): string {
  if (val == null) return "\u2014";
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
  return `$${val.toLocaleString("fr-FR")}`;
}

function fmtSupply(val: number | null | undefined, suffix = ""): string {
  if (val == null) return "\u2014";
  let num: string;
  if (val >= 1e9) num = `${(val / 1e9).toFixed(2)}B`;
  else if (val >= 1e6) num = `${(val / 1e6).toFixed(2)}M`;
  else num = val.toLocaleString("fr-FR");
  return `${num}${suffix}`;
}

function fmtPrice(val: number | null | undefined, decimals = 2): string {
  if (val == null) return "\u2014";
  return `$${val.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 0) return "maintenant";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Il y a ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)}j`;
}

function sentimentLabel(sentiment?: number): { label: string; color: string; bg: string } {
  if (sentiment == null) return { label: "Neutre", color: tokens.color.text.secondary, bg: "rgba(132,142,156,0.12)" };
  if (sentiment > 0.25) return { label: "Bullish", color: tokens.color.accent.green, bg: "rgba(77,171,154,0.12)" };
  if (sentiment < -0.25) return { label: "Bearish", color: tokens.color.accent.red, bg: "rgba(255,115,105,0.12)" };
  return { label: "Neutre", color: tokens.color.text.secondary, bg: "rgba(132,142,156,0.12)" };
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-1" style={{ borderBottom: `1px solid ${tokens.color.border.default}` }}>
      <span style={{ color: tokens.color.text.muted }}>{label}</span>
      <span className="font-semibold text-right max-w-[60%] break-words" style={{ color: tokens.color.text.primary }}>{value}</span>
    </div>
  );
}

export default function BottomTabs({ asset, currentPrice = 0 }: BottomTabsProps) {
  const [activeTab, setActiveTab] = useState("info");
  const [fundamentals, setFundamentals] = useState<Fundamentals | null>(null);
  const [fundamentalsLoading, setFundamentalsLoading] = useState(true);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [info, setInfo] = useState<InfoData | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [bull, setBull] = useState(68);
  const [bear, setBear] = useState(32);
  const [cryptoAmount, setCryptoAmount] = useState<string>("1");
  const [fiatAmount, setFiatAmount] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setInfoLoading(true);
    fetch(`/api/market/info/${asset.slug}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setInfo(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setInfoLoading(false); });
    return () => { cancelled = true; };
  }, [asset.slug]);

  useEffect(() => {
    let cancelled = false;
    setFundamentalsLoading(true);
    fetch(`/api/market/fundamentals?slug=${asset.slug}&type=${asset.type}`)
      .then((r) => r.json())
      .then((json) => { if (json.ok && !cancelled) setFundamentals(json.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setFundamentalsLoading(false); });
    return () => { cancelled = true; };
  }, [asset.slug, asset.type]);

  useEffect(() => {
    let cancelled = false;
    setNewsLoading(true);
    const category = asset.type === "crypto" ? "crypto" : asset.type === "forex" ? "forex" : "markets";
    fetch(`/api/market/news?category=${category}&limit=10`)
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setNews(json.articles ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setNewsLoading(false); });
    return () => { cancelled = true; };
  }, [asset.type]);

  useEffect(() => {
    if (currentPrice > 0) setFiatAmount((parseFloat(cryptoAmount || "0") * currentPrice).toFixed(2));
  }, [cryptoAmount, currentPrice]);

  const handleCryptoChange = (value: string) => {
    setCryptoAmount(value);
    const n = parseFloat(value);
    if (!isNaN(n) && currentPrice > 0) setFiatAmount((n * currentPrice).toFixed(2));
    else setFiatAmount("");
  };

  const handleFiatChange = (value: string) => {
    setFiatAmount(value);
    const n = parseFloat(value);
    if (!isNaN(n) && currentPrice > 0) setCryptoAmount((n / currentPrice).toFixed(6));
    else setCryptoAmount("");
  };

  const vote = (side: "bull" | "bear") => {
    if (side === "bull") setBull((b) => b + 1);
    else setBear((b) => b + 1);
  };

  const totalSentiment = bull + bear || 1;
  const bullPct = Math.round((bull / totalSentiment) * 100);
  const bearPct = 100 - bullPct;

  const athPct = fundamentals?.ath && currentPrice > 0
    ? ((currentPrice - fundamentals.ath) / fundamentals.ath) * 100 : null;
  const atlPct = fundamentals?.atl && currentPrice > 0
    ? ((currentPrice - fundamentals.atl) / fundamentals.atl) * 100 : null;

  const cardStyle = {
    backgroundColor: "rgba(18,22,26,0.4)",
    border: `1px solid ${tokens.color.border.default}`,
  };

  const links = [
    { label: "Site Officiel", href: info?.homepageUrl || "#", icon: Globe },
    { label: "Explorateur", href: info?.explorerUrl || "#", icon: Search },
    { label: "Communaute", href: info?.subredditUrl || `https://www.reddit.com/search/?q=${encodeURIComponent(asset.symbol)}`, icon: MessageCircle },
    { label: "Code Source", href: info?.githubUrl || `https://github.com/search?q=${encodeURIComponent(asset.name)}`, icon: Github },
  ];

  return (
    <div className="rounded-sm overflow-hidden" style={{ backgroundColor: tokens.color.bg.card, border: `1px solid ${tokens.color.border.default}` }}>
      <div className="flex items-center border-b overflow-x-auto hide-scrollbar" style={{ borderColor: tokens.color.border.default, backgroundColor: tokens.color.bg.panel }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0"
              style={{
                color: active ? tokens.color.accent.primary : tokens.color.text.muted,
                borderBottom: active ? `2px solid ${tokens.color.accent.primary}` : "2px solid transparent",
                backgroundColor: active ? tokens.color.bg.dark : "transparent",
              }}>
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      <div className={activeTab === "info" ? "block" : "hidden"}>
        <div className="p-4">
          {infoLoading ? (
            <p className="text-[11px] text-center py-6" style={{ color: tokens.color.text.muted }}>Chargement...</p>
          ) : !info ? (
            <p className="text-[11px] text-center py-6" style={{ color: tokens.color.text.muted }}>Indisponible</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-xs p-3.5 rounded" style={cardStyle}>
                <span className="font-bold uppercase tracking-wider text-[10px] block mb-2" style={{ color: tokens.color.accent.primary }}>Details de l'actif</span>
                <InfoRow label="Nom" value={info.name} />
                <InfoRow label="Symbole" value={info.symbol} />
                <InfoRow label="Type" value={info.type} />
                <InfoRow label="Rank CoinGecko" value={info.marketCapRank != null ? `#${info.marketCapRank}` : null} />
                {info.categories && info.categories.length > 0 && (
                  <div className="flex justify-between items-center py-1 flex-wrap gap-1" style={{ borderBottom: `1px solid ${tokens.color.border.default}` }}>
                    <span style={{ color: tokens.color.text.muted }}>Categories</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {info.categories.slice(0, 4).map((cat: string) => (
                        <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: `${tokens.color.accent.primary}18`, color: tokens.color.accent.primary }}>{cat}</span>
                      ))}
                    </div>
                  </div>
                )}
                {info.tags && info.tags.length > 0 && (
                  <div className="flex justify-between items-center py-1 flex-wrap gap-1" style={{ borderBottom: `1px solid ${tokens.color.border.default}` }}>
                    <span style={{ color: tokens.color.text.muted }}>Tags</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {info.tags.map((tag: string) => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: `${tokens.color.accent.green}18`, color: tokens.color.accent.green }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                <InfoRow label="Plateforme" value={info.platform ?? null} />
                <InfoRow label="Genese" value={info.genesisDate ?? null} />
              </div>
              <div className="space-y-2 text-xs p-3.5 rounded" style={cardStyle}>
                <span className="font-bold uppercase tracking-wider text-[10px] block mb-2" style={{ color: tokens.color.accent.green }}>Description & Liens</span>
                <p className="text-[11px] leading-relaxed" style={{ color: tokens.color.text.secondary }}>
                  {info.description || "Aucune description disponible."}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {links.filter((l) => l.href !== "#").map((l) => {
                    const Icon = l.icon;
                    return (
                      <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                        className="py-2 px-2.5 rounded flex items-center justify-between transition text-[11px]"
                        style={{ backgroundColor: tokens.color.bg.card, border: `1px solid ${tokens.color.border.default}`, color: tokens.color.text.secondary }}>
                        <span>{l.label}</span>
                        <ExternalLink className="w-3 h-3" style={{ color: tokens.color.text.muted }} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={activeTab === "fundamentals" ? "block" : "hidden"}>
        <div className="p-4">
          {fundamentalsLoading ? (
            <p className="text-[11px] text-center py-6" style={{ color: tokens.color.text.muted }}>Chargement...</p>
          ) : !fundamentals ? (
            <p className="text-[11px] text-center py-6" style={{ color: tokens.color.text.muted }}>Indisponible</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 text-xs p-3.5 rounded" style={cardStyle}>
                <span className="font-bold uppercase tracking-wider text-[10px] block mb-2" style={{ color: tokens.color.accent.green }}>Valorisation Globale</span>
                <div className="flex justify-between items-center py-1" style={{ borderBottom: `1px solid ${tokens.color.border.default}` }}>
                  <span style={{ color: tokens.color.text.muted }}>Capitalisation</span>
                  <span className="font-bold" style={{ color: tokens.color.text.primary }}>{fmtCompact(fundamentals.marketCap)}</span>
                </div>
                <div className="flex justify-between items-center py-1" style={{ borderBottom: `1px solid ${tokens.color.border.default}` }}>
                  <span style={{ color: tokens.color.text.muted }}>Val. Entierement Diluee</span>
                  <span className="font-semibold" style={{ color: tokens.color.text.primary }}>{fmtCompact(fundamentals.fullyDilutedValuation)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span style={{ color: tokens.color.text.muted }}>Rank Global</span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: tokens.color.accent.primary, color: tokens.color.text.inverse }}>Rank #{fundamentals.marketCapRank ?? "\u2014"}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs p-3.5 rounded" style={cardStyle}>
                <span className="font-bold uppercase tracking-wider text-[10px] block mb-2" style={{ color: tokens.color.accent.green }}>Offre de jetons</span>
                <div className="flex justify-between items-center py-1" style={{ borderBottom: `1px solid ${tokens.color.border.default}` }}>
                  <span style={{ color: tokens.color.text.muted }}>Offre en Circulation</span>
                  <span className="font-semibold" style={{ color: tokens.color.text.primary }}>{fmtSupply(fundamentals.circulatingSupply, ` ${asset.symbol}`)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span style={{ color: tokens.color.text.muted }}>Offre Maximale</span>
                  <span className="font-semibold" style={{ color: tokens.color.text.primary }}>{fmtSupply(fundamentals.maxSupply ?? fundamentals.totalSupply, ` ${asset.symbol}`)}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs p-3.5 rounded" style={cardStyle}>
                <span className="font-bold uppercase tracking-wider text-[10px] block mb-2" style={{ color: tokens.color.accent.green }}>Historique des records</span>
                <div className="flex justify-between items-center py-1" style={{ borderBottom: `1px solid ${tokens.color.border.default}` }}>
                  <span style={{ color: tokens.color.accent.green }}>All-Time High</span>
                  <div className="text-right">
                    <span className="font-bold block" style={{ color: tokens.color.text.primary }}>{fmtPrice(fundamentals.ath, asset.displayDecimals)}</span>
                    <span className="text-[10px] font-mono font-bold" style={{ color: tokens.color.accent.red }}>{athPct != null ? `${athPct >= 0 ? "+" : ""}${athPct.toFixed(2)}%` : "\u2014"}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span style={{ color: tokens.color.accent.red }}>All-Time Low</span>
                  <div className="text-right">
                    <span className="font-bold block" style={{ color: tokens.color.text.primary }}>{fmtPrice(fundamentals.atl, asset.displayDecimals)}</span>
                    <span className="text-[10px] font-mono font-bold" style={{ color: tokens.color.accent.green }}>{atlPct != null ? `${atlPct >= 0 ? "+" : ""}${atlPct.toFixed(2)}%` : "\u2014"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={activeTab === "news" ? "block" : "hidden"}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tokens.color.accent.green }}>Flash Infos & Sentiments</span>
            <span className="text-[10px] font-mono" style={{ color: tokens.color.text.muted }}>Mise a jour en temps reel</span>
          </div>
          {newsLoading ? (
            <p className="text-[11px] text-center py-6" style={{ color: tokens.color.text.muted }}>Chargement...</p>
          ) : news.length === 0 ? (
            <p className="text-[11px] text-center py-6" style={{ color: tokens.color.text.muted }}>Aucune actualite</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
              {news.map((a, i) => {
                const badge = sentimentLabel(a.sentiment);
                return (
                  <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                    className="block p-2.5 rounded transition group" style={cardStyle}>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h5 className="text-xs font-semibold leading-snug" style={{ color: tokens.color.text.primary }}>{a.title}</h5>
                      <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider shrink-0" style={{ color: badge.color, backgroundColor: badge.bg }}>{badge.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono" style={{ color: tokens.color.text.muted }}>
                      <span style={{ color: tokens.color.accent.green }}>{a.source}</span>
                      <span>.</span>
                      <span>{timeAgo(a.publishedAt)}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={activeTab === "sentiment" ? "block" : "hidden"}>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 p-4 rounded" style={cardStyle}>
              <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: tokens.color.accent.green }}>Sentiment de la Communaute</span>
              <p className="text-[11px] mb-3" style={{ color: tokens.color.text.muted }}>Votez en direct pour influencer l'indice local.</p>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span style={{ color: tokens.color.accent.green }}>{bullPct}% Haussier</span>
                  <span style={{ color: tokens.color.accent.red }}>{bearPct}% Baissier</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden flex" style={{ backgroundColor: tokens.color.bg.dark }}>
                  <div className="h-full transition-all duration-500" style={{ width: `${bullPct}%`, backgroundColor: tokens.color.accent.green }} />
                  <div className="h-full transition-all duration-500" style={{ width: `${bearPct}%`, backgroundColor: tokens.color.accent.red }} />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  <button onClick={() => vote("bull")}
                    className="py-1.5 rounded text-[10px] font-bold border uppercase transition"
                    style={{ backgroundColor: "rgba(77,171,154,0.1)", color: tokens.color.accent.green, borderColor: "rgba(77,171,154,0.2)" }}>
                    <ThumbsUp className="w-3 h-3 inline mr-1" /> Haussier
                  </button>
                  <button onClick={() => vote("bear")}
                    className="py-1.5 rounded text-[10px] font-bold border uppercase transition"
                    style={{ backgroundColor: "rgba(255,115,105,0.1)", color: tokens.color.accent.red, borderColor: "rgba(255,115,105,0.2)" }}>
                    <ThumbsDown className="w-3 h-3 inline mr-1" /> Baissier
                  </button>
                </div>
              </div>
            </div>
            <div className="md:col-span-7 p-4 rounded flex flex-col justify-between" style={cardStyle}>
              <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: tokens.color.accent.primary }}>Fiche d'identite Tokenomics</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded" style={{ backgroundColor: tokens.color.bg.card, border: `1px solid ${tokens.color.border.default}` }}>
                  <span className="block text-[9px] font-bold uppercase" style={{ color: tokens.color.text.muted }}>Emission</span>
                  <span className="font-semibold block mt-1" style={{ color: tokens.color.text.primary }}>{asset.type === "crypto" ? "Limitee / Dynamique" : "N/A"}</span>
                </div>
                <div className="p-2 rounded" style={{ backgroundColor: tokens.color.bg.card, border: `1px solid ${tokens.color.border.default}` }}>
                  <span className="block text-[9px] font-bold uppercase" style={{ color: tokens.color.text.muted }}>Consensus</span>
                  <span className="font-semibold block mt-1" style={{ color: tokens.color.text.primary }}>{asset.type === "crypto" ? "PoW / PoS" : "Marche centralise"}</span>
                </div>
                <div className="p-2 rounded" style={{ backgroundColor: tokens.color.bg.card, border: `1px solid ${tokens.color.border.default}` }}>
                  <span className="block text-[9px] font-bold uppercase" style={{ color: tokens.color.text.muted }}>Usage cle</span>
                  <span className="font-semibold block mt-1" style={{ color: tokens.color.text.primary }}>{asset.type === "crypto" ? "Reserve / DeFi" : "Trading / Hedging"}</span>
                </div>
              </div>
              <div className="mt-3 text-[11px] leading-relaxed" style={{ color: tokens.color.text.muted }}>
                <strong style={{ color: tokens.color.text.secondary }}>Description :</strong> {asset.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={activeTab === "converter" ? "block" : "hidden"}>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 p-4 rounded" style={cardStyle}>
              <span className="text-xs font-bold uppercase tracking-wider block mb-2.5" style={{ color: tokens.color.accent.green }}>Convertisseur instantane</span>
              <div className="space-y-2">
                <div className="flex items-center rounded px-3 py-2" style={{ backgroundColor: tokens.color.bg.card, border: `1px solid ${tokens.color.border.default}` }}>
                  <input type="number" value={cryptoAmount} step="any" onChange={(e) => handleCryptoChange(e.target.value)}
                    className="w-full bg-transparent text-sm focus:outline-none font-semibold font-mono" style={{ color: tokens.color.text.primary }} />
                  <span className="text-xs font-bold min-w-[50px] text-center uppercase font-mono" style={{ color: tokens.color.accent.primary }}>{asset.symbol}</span>
                </div>
                <div className="text-center py-0.5" style={{ color: tokens.color.text.muted }}>.</div>
                <div className="flex items-center rounded px-3 py-2" style={{ backgroundColor: tokens.color.bg.card, border: `1px solid ${tokens.color.border.default}` }}>
                  <input type="number" value={fiatAmount} step="any" onChange={(e) => handleFiatChange(e.target.value)}
                    className="w-full bg-transparent text-sm focus:outline-none font-semibold font-mono" style={{ color: tokens.color.text.primary }} />
                  <span className="text-xs font-bold min-w-[50px] text-center font-mono" style={{ color: tokens.color.accent.green }}>USD</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-6 p-4 rounded flex flex-col justify-between" style={cardStyle}>
              <span className="text-xs font-bold uppercase tracking-wider block mb-2.5" style={{ color: tokens.color.accent.primary }}>Ressources Externes</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {links.map((l) => {
                  const Icon = l.icon;
                  return (
                    <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                      className="py-2 px-2.5 rounded flex items-center justify-between transition"
                      style={{ backgroundColor: tokens.color.bg.card, border: `1px solid ${tokens.color.border.default}`, color: tokens.color.text.secondary }}>
                      <span>{l.label}</span>
                      <Icon className="w-3 h-3" style={{ color: tokens.color.text.muted }} />
                    </a>
                  );
                })}
              </div>
              <div className="text-[10px] mt-4 italic" style={{ color: tokens.color.text.muted }}>
                Liens vers les ressources publiques de l'actif.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
