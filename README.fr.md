<div align="center">

<h1>Zenith</h1>

**Plateforme d'intelligence financière** — Crypto, forex, commodities & indices en temps réel. Marchés, calendrier, apprendre, portfolio, alertes.

<br>

[![License](https://img.shields.io/badge/licence-MIT-4da6ff?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js_16-1a1a1a?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Bun](https://img.shields.io/badge/Bun_1.3-1a1a1a?style=flat-square&logo=bun&logoColor=white)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-1a1a1a?style=flat-square&logo=typescript&logoColor=3178C6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-1a1a1a?style=flat-square&logo=tailwindcss&logoColor=06B6D4)](https://tailwindcss.com/)

</div>

---

Zenith est une plateforme d'intelligence financière multi-actifs couvrant les marchés **crypto, forex, matières premières et indices**. Flux WebSocket temps réel, graphs de classe TradingView, calendrier économique 6 types, hub éducatif, analytics de portfolio — dans une interface sombre inspirée du minimalisme chaud de Notion.

**Système de design** : [DESIGN.md Notion](./DESIGN.md) installé via `getdesign.md` — jetons de design lisibles par IA.

<br>

## Fonctionnalités

| | Capacité |
|:---|:---|
| **Ticker temps réel** | Flux WebSocket Binance avec direction BUY/SELL, animation scroll |
| **Graphs live** | TradingView Lightweight Charts v5 — multi-actifs, OHLCV 1h |
| **Marchés** | 500+ actifs — triables, filtrés, sparklines, catégories |
| **Calendrier 6 types** | Économique, Résultats, Dividendes, IPOs, Splits, Fériés |
| **Apprendre** | Hub éducatif 6 catégories (OKX-like) — articles à venir |
| **Sentiment** | Fear & Greed Index live via alternative.me |
| **Gas Tracker** | Frais de gas live Ethereum, Polygon, Arbitrum, Base, Optimism |
| **Portfolio** | P&L, ratio de Sharpe, drawdown, allocation actifs, prix live |
| **Alertes** | Seuils de prix via BullMQ + email Resend |
| **Watchlist** | localStorage (anon) + sync Turso (connecté), UI optimiste |
| **Palette** | `⌘K` / `/` — navigation instantanée |
| **Auth** | Clerk avec RBAC, connexion/inscription |
| **i18n** | 21 langues avec support RTL |
| **Juridique** | CGU, Confidentialité, Cookies, Accessibilité — conformes RGPD |

<br>

## Prise en main rapide

```bash
# Cloner & installer
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install

# Démarrer l'infrastructure (Dragonfly + QuestDB)
docker compose -f infra/docker-compose.dev.yml up -d

# Configurer les variables d'environnement
cp apps/web/.env.example apps/web/.env.local

# Pusher le schéma de base de données
cd apps/web && bun run db:push

# Démarrer le serveur de développement
cd ../..
bun run dev
```

> App web : `http://localhost:3000` · WS server : `ws://localhost:3001`

<br>

## Structure du projet

```
zenith/
├── DESIGN.md                   # Design system Notion (lisible par IA)
├── apps/
│   ├── web/                    # Frontend Next.js 16
│   │   └── app/[locale]/
│   │       ├── apprendre/      # Hub éducatif + 6 catégories
│   │       ├── calendrier/     # Calendrier 6 types (Finnhub)
│   │       ├── community/      # Forum, idées, éducation
│   │       ├── dashboard/      # KPIs & métriques portfolio
│   │       ├── help/           # FAQ, Support, Contact, Pourquoi, Roadmap
│   │       ├── legal/          # CGU, Confidentialité, Cookies, Accessibilité
│   │       ├── markets/        # 30+ pages détail actifs (LW Charts live)
│   │       ├── resources/      # API, status, docs, widgets
│   │       ├── tools/          # Screener, alertes, calculatrices…
│   │       ├── sign-in/        # Pages Clerk
│   │       └── sign-up/
│   └── ws-server/              # Serveur WebSocket Bun
├── infra/
│   └── docker-compose.dev.yml
├── turbo.json
└── package.json
```

<br>

## Licence

MIT — © 2026 Zenith

[GitHub](https://github.com/zyneww/Zenith) · [Instagram](https://www.instagram.com/zenithmrkt)
