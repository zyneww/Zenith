<div align="center">

<h1>Zenith</h1>

**Financial Intelligence Platform** — Real-time crypto, forex, commodities & indices. Markets, calendar, learn, portfolio, alerts.

<br>

[![License](https://img.shields.io/badge/license-MIT-4da6ff?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js_16-1a1a1a?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Bun](https://img.shields.io/badge/Bun_1.3-1a1a1a?style=flat-square&logo=bun&logoColor=white)](https://bun.sh/)
[![Turborepo](https://img.shields.io/badge/Turborepo-1a1a1a?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/repo)
[![TypeScript](https://img.shields.io/badge/TypeScript-1a1a1a?style=flat-square&logo=typescript&logoColor=3178C6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-1a1a1a?style=flat-square&logo=tailwindcss&logoColor=06B6D4)](https://tailwindcss.com/)

<br>

[English](README.md) · [Français](README.fr.md)

</div>

---

Zenith is a production-ready financial intelligence platform covering **cryptocurrency, forex, commodities, and indices** markets. Live WebSocket streaming, TradingView-class charting, 6-type economic calendar, educational hub, portfolio analytics — in a unified dark interface inspired by Notion's warm minimalism.

**Design system**: [Notion-inspired DESIGN.md](./DESIGN.md) installed via `getdesign.md` — self-adapting AI-readable design tokens.

<br>

## Features

| | Capability |
|:---|:---|
| **Real-Time Ticker** | WebSocket feed (Binance) with BUY/SELL direction, scroll animation |
| **Live Charts** | TradingView Lightweight Charts v5 — multi-asset, 1h OHLCV |
| **Market Screening** | 500+ assets — sortable, filterable, searchable, sparklines |
| **6-Type Calendar** | Economic, Earnings, Dividends, IPOs, Splits, Holidays — Finnhub + mock |
| **Learn Hub** | OKX-inspired educational section (categories, articles placeholder) |
| **Sentiment** | Fear & Greed Index — live via alternative.me API |
| **Gas Tracker** | Live gas fees for Ethereum, Polygon, Arbitrum, Base, Optimism |
| **Portfolio** | P&L, Sharpe ratio, drawdown, asset allocation, live prices |
| **Smart Alerts** | Price thresholds via BullMQ queuing + Resend email |
| **Watchlist** | localStorage (anon) + Turso sync (signed-in), optimistic UI |
| **Command Palette** | `⌘K` / `/` — instant route and asset discovery |
| **Auth** | Clerk with RBAC, sign-in/sign-up, session management |
| **i18n** | 21 locales with full RTL support |
| **Legal** | CGU, Privacy, Cookies, Accessibility — lightweight RGPD-compliant |
| **Design Referenced** | Notion design tokens in `DESIGN.md` — AI-guided UI generation |

<br>

## Architecture

```
Frontend (Next.js 16 · App Router · Tailwind 4)
  ├── /fr, /en, ...            → 21 locale routes
  ├── /markets                 → Asset hub + 30 detail pages
  ├── /apprendre               → Educational hub (6 categories)
  ├── /calendrier              → 6-type calendar (Finnhub)
  ├── /dashboard               → Portfolio metrics & chart
  ├── /portfolio               → Asset allocation & transactions
  ├── /help/*                  → FAQ, Support, Contact, Why, Roadmap, Community
  ├── /legal/*                 → CGU, Privacy, Cookies, Accessibility
  ├── /tools/*                 → Screener, alerts, calculators, heatmaps
  ├── /community/*             → Forum, ideas, education redirect
  └── /resources/*             → API, status, docs, blog pages

  ├── WebSocket Context        → ws://localhost:3001/ws
  └── useRealtimePrice hook    → Subscribes to symbol updates

WebSocket Server (Bun · ws-server/)
  └── Binance Streams → Dragonfly Pub/Sub

Data Layer
  ├── Turso            → Edge SQLite: identity, portfolio, watchlist
  ├── QuestDB          → Time-series: OHLCV, trades
  └── Dragonfly        → Redis cache, pub/sub, rate limiting

Background Jobs (BullMQ)
  ├── Indicators → Technical analysis pipeline
  ├── Alerts     → Price threshold notifications
  └── Emails     → Transactional via Resend

External APIs
  ├── CoinGecko      → Market data, sparklines, categories
  ├── Finnhub        → Forex, commodities, indices quotes
  ├── alternative.me → Fear & Greed index
  ├── Etherscan      → Gas fees (Ethereum, Polygon, ...)
  └── Clearbit       → Asset logos (fallback monogram)

External Services
  ├── Clerk           → Authentication & RBAC
  ├── Stripe          → Subscription billing (Pro $9.99/mo)
  ├── Cloudflare R2   → Object storage
  ├── Resend          → Transactional email
  ├── Sentry          → Error tracking & performance
  └── Doppler         → Secrets management
```

<br>

## Tech Stack

### Frontend

| Technology | Purpose |
|:---|:---|
| [Next.js 16](https://nextjs.org/) (App Router) | Framework + Turbopack HMR |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling + CSS vars |
| [TradingView Lightweight Charts v5](https://www.tradingview.com/lightweight-charts/) | Financial charting |
| [Motion](https://motion.dev/) | GPU-accelerated animations (dropdowns, modals) |
| [Clerk](https://clerk.com/) | Auth, RBAC, sessions |
| [next-intl](https://next-intl.dev/) | 21-locale i18n |
| [cmdk](https://cmdk.paco.me/) | `⌘K` command palette |
| [Lucide](https://lucide.dev/) | Icons |

### Backend & Infrastructure

| Technology | Purpose |
|:---|:---|
| [Bun 1.3](https://bun.sh/) | Runtime & package manager |
| [Dragonfly](https://www.dragonflydb.io/) | Redis-compatible cache, pub/sub, rate limiting |
| [QuestDB](https://questdb.io/) | Time-series storage (OHLCV, trades) |
| [Turso](https://turso.tech/) | Edge SQLite |
| [Drizzle ORM](https://orm.drizzle.team/) | Type-safe SQL |
| [BullMQ](https://bullmq.io/) | Job queues (indicators, alerts, emails) |
| [Resend](https://resend.com/) | Transactional email (contact form, alerts) |
| [Cloudflare R2](https://r2.cloudflare.com/) | S3-compatible object storage |
| [Sentry](https://sentry.io/) | Error tracking & performance |
| [Doppler](https://doppler.com/) | Secrets management |
| [Docker](https://docker.com/) | Dragonfly + QuestDB orchestration |

<br>

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.3+
- [Docker](https://docker.com/)
- [Git](https://git-scm.com/)

### Quick Start

```bash
# Clone & install
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install

# Start infrastructure (Dragonfly + QuestDB)
docker compose -f infra/docker-compose.dev.yml up -d

# Configure environment (mandatory)
cp apps/web/.env.example apps/web/.env.local
# → Edit .env.local with Clerk keys (required for auth)

# Push database schema
cd apps/web && bun run db:push

# Start development server
cd ../..
bun run dev
```

> Web app at `http://localhost:3000` · WebSocket server at `ws://localhost:3001` · Dragonfly at `localhost:6379` · QuestDB at `localhost:8812`

### Without Auth

If you skip Clerk keys, sign-in won't work but all public pages (markets, apprendre, calendrier, help, legal, resources) render fine.

### Environment Variables

<details>
<summary>View all required variables</summary>

```env
# Authentication (Clerk) — REQUIRED for auth pages
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Database (Turso)
TURSO_URL=file:./zenith.db
TURSO_AUTH_TOKEN=

# Time-Series (QuestDB)
QUESTDB_URL=postgresql://zenith:questdb_dev@localhost:8812/qdb

# Cache (Dragonfly)
REDIS_URL=redis://:dragonfly_dev@localhost:6379

# Email (Resend) — required for contact form
RESEND_API_KEY=re_...

# Market data API keys
FINNHUB_API_KEY=
ETHERSCAN_API_KEY=
POLYGONSCAN_API_KEY=

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=zenith-assets

# Monitoring (Sentry)
SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...

# Secrets (Doppler)
DOPPLER_TOKEN=...
```

</details>

<br>

## Project Structure

```
zenith/
├── DESIGN.md                          # Notion-inspired design system (AI-readable)
├── apps/
│   ├── web/                           # Next.js 16 frontend
│   │   ├── app/[locale]/              # i18n routes (21 locales)
│   │   │   ├── apprendre/             # Hub + 6 categories + article detail
│   │   │   ├── calendrier/            # 6-type economic calendar
│   │   │   ├── community/             # Forum, ideas, editors picks, pine-script
│   │   │   ├── dashboard/             # Portfolio KPIs & metrics
│   │   │   ├── help/                  # FAQ, Support, Contact, Why, Roadmap, Community
│   │   │   ├── legal/                 # CGU, Privacy, Cookies, Accessibility
│   │   │   ├── markets/[slug]/        # 30+ asset detail pages (live LW Charts)
│   │   │   ├── portfolio/             # Asset allocation, transaction history
│   │   │   ├── resources/             # API, status, docs, widgets, blog
│   │   │   ├── tools/                 # Screener, alerts, calculators, heatmaps…
│   │   │   ├── sign-in/               # Clerk auth pages
│   │   │   └── sign-up/
│   │   ├── components/
│   │   │   ├── landing/               # Hero, ticker, quick-tools, footer, features…
│   │   │   ├── charts/                # TradingView wrapper
│   │   │   ├── dashboard/             # KPI cards, portfolio chart, positions
│   │   │   ├── command-palette/       # ⌘K palette
│   │   │   ├── markets/               # TradingViewOverview, CoinGeckoTable…
│   │   │   └── ui/                    # DropdownMenu, UserMenu, Modal…
│   │   └── lib/
│   │       ├── assets/registry.ts     # 30+ asset metadata
│   │       ├── calendar/              # Finnhub client + mock fallback
│   │       ├── realtime/              # WebSocket SocketContext
│   │       ├── db/                    # Drizzle ORM + QuestDB
│   │       ├── queue/                 # BullMQ workers
│   │       ├── email/                 # Resend templates
│   │       └── rate-limit.ts          # Sliding-window rate limiter
│   └── ws-server/                     # Bun WebSocket server
│       ├── src/index.ts               # Entry point
│       ├── src/binance.ts             # Binance consumer
│       └── src/dragonfly.ts           # Dragonfly client
├── infra/
│   ├── docker-compose.dev.yml         # Local infrastructure
│   └── questdb/                       # Time-series schema
├── turbo.json                         # Turborepo pipeline
└── package.json                       # Workspace root
```

<br>

## API Reference

| Method | Endpoint | Description | Cache |
|:---|:---|:---|:---:|
| `GET` | `/api/market/top-cryptos?limit=10` | Top cryptos (price, sparkline, categories) | 60s |
| `GET` | `/api/market/movers/[type]` | Trend, gainers, losers (top 5) | 60s |
| `GET` | `/api/market/asset/[slug]` | Single asset full data | 60s |
| `GET` | `/api/market/ohlcv/[slug]` | OHLCV 1h for chart (100 points) | 60s |
| `GET` | `/api/sentiment/fear-greed` | Fear & Greed index (alternative.me) | 1h |
| `GET` | `/api/gas/[chain]` | Gas fees (Ethereum, Polygon, Arbitrum…) | 30s |
| `GET` | `/api/calendar/[type]` | Economic calendar (Finnhub + mock) | 5min |
| `GET` | `/api/calendar/economic` | Same with filters | 5min |
| `GET` | `/api/watchlist` | User watchlist (auth Clerk) | DB |
| `POST` | `/api/watchlist` | Add to watchlist | DB |
| `DELETE` | `/api/watchlist` | Remove from watchlist | DB |
| `POST` | `/api/contact` | Contact form → Resend email | — |
| `GET` | `/api/ohlcv` | OHLCV chart data (QuestDB → mock) | 60s |
| `GET` | `/api/questdb/health` | QuestDB health check | — |
| `GET` | `/api/test/e2e` | Integration test suite | — |

All endpoints are rate-limited (60/min per IP) and cached via ioredis (Dragonfly).  
On upstream failure → 503 `upstream_unavailable` with `Cache-Control: no-store` (strict mode).

<br>

## Design System

| Token | Light | Dark | Usage |
|:---|:---:|:---:|:---|
| `--bg-canvas` | `#f6f5f4` | `#1a1a1a` | Page background |
| `--bg-card` | `#ffffff` | `#252525` | Cards, dropdowns |
| `--text-primary` | `#000000` | `#e3e2e0` | Headings & body |
| `--text-secondary` | `#31302e` | `#9b9a97` | Body text, metadata |
| `--text-accent` | `#0075de` | `#4da6ff` | Links, CTAs |
| `--border-default` | `#e6e6e6` | `rgba(255,255,255,0.08)` | Hairlines |
| `--text-up` | `#16a34a` | `#4dab9a` | Positive changes |
| `--text-down` | `#dc2626` | `#ff7369` | Negative changes |

Notion-inspired · Dark by default · Desktop-first · USD native · WCAG AA compliant

See [DESIGN.md](./DESIGN.md) for the full AI-readable design system spec.

<br>

## Roadmap

| Phase | Scope | Status |
|:---:|:---|:---:|
| 1 | Landing Page & Design System (Notion-inspired) | ✅ |
| 2 | Real-Time Data Infrastructure (Binance WS + Dragonfly) | ✅ |
| 3 | Markets & Asset Detail (30+ assets, LW Charts, live prices) | ✅ |
| 4 | Dashboard, Portfolio, Pricing | ✅ |
| 5 | Auth Clerk, Turso, QuestDB, BullMQ, Resend, R2, Sentry, Doppler | ✅ |
| 6 | **Apprendre Hub + 6-type Calendar** | ✅ |
| 7 | **Institutional Pages (FAQ, Contact, Why, Roadmap, Community)** | ✅ |
| 8 | **Legal Pages (CGU, Privacy, Cookies, Accessibility)** | ✅ |
| 9 | **Live APIs (CoinGecko, Finnhub, fear-greed, gas)** | ✅ |
| 10 | **Watchlist (localStorage + Turso)** | ✅ |
| 11 | Stripe Checkout + Webhooks | 🔲 |
| 12 | Mobile app (React Native / PWA) | 🔲 |
| 13 | Forum intégré (Discourse) | 🔲 |
| 14 | Ambassador/referral program | 🔲 |

<br>

<div align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <a href="https://star-history.com/#zyneww/Zenith&Date">
          <img src="https://api.star-history.com/svg?repos=zyneww/Zenith&type=Date" alt="Star History" width="95%">
        </a>
      </td>
      <td align="center" width="50%">
        <img src="https://repobeats.axiom.co/api/embed/8068f284e12efd4d192aa9620068768732a9d753.svg" alt="Repobeats analytics" width="95%">
      </td>
    </tr>
  </table>
</div>

---

<div align="center">

Built with [Next.js](https://nextjs.org/), [Bun](https://bun.sh/), [Dragonfly](https://www.dragonflydb.io/) · Design tokens by [DESIGN.md](https://getdesign.md/notion/design-md)

[GitHub](https://github.com/zyneww/Zenith) · [Instagram](https://www.instagram.com/zenithmrkt)

<sub>© 2026 Zenith</sub>

</div>
