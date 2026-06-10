<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="120" height="auto" style="margin-bottom: 0px;">
  </picture>
  <h1 align="center" style="font-size: 2.5rem; font-weight: 800; letter-spacing: -0.02em; margin-top: 0.25rem; margin-bottom: 0.25rem;">
    <span style="color: #00e5ff;">ZENITH</span>
  </h1>
  <p align="center" style="font-size: 1.125rem; color: #9ca3af; max-width: 600px; margin-top: 0;">
    Intelligence financière temps réel — Crypto, Forex, Commodités
  </p>
</div>

<p align="center">
  <a href="https://github.com/zyneww/Zenith/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square&color=00e5ff" alt="License">
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js">
  </a>
  <a href="https://bun.sh/">
    <img src="https://img.shields.io/badge/Bun-1.2-black?style=flat-square&logo=bun&logoColor=white" alt="Bun">
  </a>
  <a href="https://turbo.build/repo">
    <img src="https://img.shields.io/badge/Turborepo-2.9-black?style=flat-square&logo=turborepo&logoColor=white" alt="Turborepo">
  </a>
  <a href="https://clerk.com/">
    <img src="https://img.shields.io/badge/Clerk-Auth-7b3fe4?style=flat-square&logo=clerk&logoColor=white" alt="Clerk">
  </a>
  <a href="https://questdb.io/">
    <img src="https://img.shields.io/badge/QuestDB-Time--Series-00e5ff?style=flat-square&logo=questdb&logoColor=white" alt="QuestDB">
  </a>
  <a href="https://www.dragonflydb.io/">
    <img src="https://img.shields.io/badge/Dragonfly-Redis-7b3fe4?style=flat-square&logo=dragonflydb&logoColor=white" alt="Dragonfly">
  </a>
</p>

---

## ✦ Overview

**Zenith** is a production-grade financial intelligence platform designed for **crypto, forex, and commodities** markets. It delivers TradingView-quality charts, real-time data streaming, and comprehensive portfolio analytics — all wrapped in a premium dark-themed UI.

> **Core focus:** Market analysis, technical/fundamental insights, and portfolio tracking — *not trading execution.*

### ✦ Key Features

| Feature | Description |
|---------|-------------|
| **📊 Real-Time Charts** | TradingView Lightweight Charts v5 — interactive, responsive, 60fps |
| **⚡ Live Prices** | WebSocket streaming via Bun + Dragonfly Pub/Sub (Binance data) |
| **📈 Market Screening** | Crypto, Forex, Commodities, Indices, ETFs — sortable/filterable |
| **📰 Economic Calendar** | Macro events, earnings, and key dates |
| **📉 Portfolio Analytics** | KPIs, P&L tracking, Sharpe ratio, volatility metrics |
| **🔔 Smart Alerts** | Price thresholds, BullMQ queuing, Resend email delivery |
| **🔍 Deep Search** | ⌘K command palette — instant route/asset discovery |
| **🔒 Enterprise Auth** | Clerk-powered — sign-in/sign-up, RBAC, session management |
| **🌐 Multi-Locale** | 21 languages — full i18n with RTL support |

---

## ✦ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                    │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│   │ Markets  │ │Dashboard │ │ Portfolio│ │  Pricing/Auth │  │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘  │
│        │            │           │               │          │
│   ┌────┴────────────┴───────────┴───────────────┴───────┐   │
│   │          SocketContext (WebSocket Client)            │   │
│   └───────────────────────┬─────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│              WS Server (Bun · Port 3001)                     │
│   ┌────────────────────────────────────────────────────┐     │
│   │  Binance WebSocket → Dragonfly Pub/Sub             │     │
│   │  REST fallback polling (2s)                        │     │
│   └────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     Data Layer                                │
│   ┌──────────────┐  ┌──────────────┐  ┌────────────────┐     │
│   │   Turso      │  │   QuestDB    │  │   Dragonfly    │     │
│   │  (SQLite ·   │  │ (Time-series)│  │   (Redis ·     │     │
│   │   Identity)  │  │  OHLCV data  │  │   Pub/Sub +    │     │
│   │              │  │              │  │   Rate Limit)  │     │
│   └──────────────┘  └──────────────┘  └────────────────┘     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                 Infrastructure (Docker)                       │
│   ┌──────────────┐  ┌──────────────┐  ┌────────────────┐     │
│   │   Dragonfly  │  │   QuestDB    │  │   BullMQ       │     │
│   │    (6379)    │  │ (8812/9000)  │  │ (Indicators,   │     │
│   │              │  │              │  │  Alerts, Email)│     │
│   └──────────────┘  └──────────────┘  └────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

---

## ✦ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) (App Router) | React framework with Turbopack |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Motion](https://motion.dev/) | Animations & transitions |
| [TradingView LW](https://tradingview.com/lightweight-charts/) | Charts v5 |
| [Clerk](https://clerk.com/) | Authentication |
| [next-intl](https://next-intl.dev/) | Internationalization (21 locales) |
| [cmdk](https://cmdk.paco.me/) | Command palette ⌘K |

### Backend & Infrastructure
| Technology | Purpose |
|------------|---------|
| [Bun](https://bun.sh/) | Runtime & package manager |
| [Dragonfly](https://www.dragonflydb.io/) | Redis-compatible Pub/Sub |
| [QuestDB](https://questdb.io/) | Time-series database |
| [Turso](https://turso.tech/) | Edge SQLite (user data) |
| [BullMQ](https://bullmq.io/) | Job queues |
| [Resend](https://resend.com/) | Email delivery |
| [Cloudflare R2](https://cloudflare.com/r2/) | Object storage |
| [Sentry](https://sentry.io/) | Error tracking |
| [Doppler](https://doppler.com/) | Secrets management |
| [Docker](https://docker.com/) | Container orchestration |

---

## ✦ Getting Started

### Prerequisites
- [Bun](https://bun.sh/) 1.2+
- [Docker](https://docker.com/) (for Dragonfly + QuestDB)

### Installation

```bash
# Clone the repository
git clone https://github.com/zyneww/Zenith.git
cd Zenith

# Install dependencies
bun install

# Start infrastructure (Dragonfly + QuestDB)
docker compose -f infra/docker-compose.dev.yml up -d

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local

# Initialize the database
cd apps/web && bun run db:push

# Start development servers
bun run dev
```

The app will be available at **`http://localhost:3000`** with the WebSocket server on **port 3001**.

### Environment Variables

```env
# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Turso (Database)
TURSO_URL=file:./zenith.db
TURSO_AUTH_TOKEN=

# QuestDB (Time-series)
QUESTDB_URL=postgresql://zenith:questdb_dev@localhost:8812/qdb

# Dragonfly (Redis)
REDIS_URL=redis://:dragonfly_dev@localhost:6379

# Resend (Email)
RESEND_API_KEY=re_...

# Cloudflare R2 (Storage)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=zenith-assets

# Sentry (Error Tracking)
SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...

# Doppler (Secrets)
DOPPLER_TOKEN=...
```

---

## ✦ Project Structure

```
zenith/
├── apps/
│   ├── web/                    # Next.js 16 frontend
│   │   ├── app/               # App Router pages
│   │   │   ├── [locale]/      # i18n routes (fr, en-US, ...)
│   │   │   └── api/           # API routes
│   │   ├── components/        # React components
│   │   │   ├── landing/       # Landing page (Header, Hero, etc.)
│   │   │   ├── charts/        # TradingView chart wrappers
│   │   │   ├── dashboard/     # Dashboard widgets
│   │   │   ├── portfolio/     # Portfolio components
│   │   │   └── ui/            # Shared UI primitives
│   │   ├── lib/               # Utilities
│   │   │   ├── db/            # Drizzle ORM + QuestDB client
│   │   │   ├── hooks/         # React hooks
│   │   │   ├── realtime/      # WebSocket context
│   │   │   ├── queue/         # BullMQ jobs
│   │   │   ├── email/         # Resend templates
│   │   │   ├── storage/       # R2 client
│   │   │   ├── sentry/        # Error tracking
│   │   │   └── doppler/       # Secrets management
│   │   └── messages/          # 21 locale JSON files
│   ├── ws-server/             # Bun WebSocket server
│   └── config/                # Shared config package
├── infra/
│   ├── docker-compose.dev.yml # Dragonfly + QuestDB
│   └── questdb/               # Time-series schema
├── turbo.json                 # Turborepo config
└── package.json               # Workspace root
```

---

## ✦ Design System

Zenith follows a cohesive dark design language defined by the Landing Page Design System:

```css
/* Core palette */
--bg-primary:    #0b0e14;
--bg-secondary:  #131722;
--accent-cyan:   #00e5ff;
--accent-purple: #7b3fe4;
--text-primary:  #ffffff;
--text-secondary:#9ca3af;

/* Typography */
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

- **Desktop-first** responsive approach
- **Dark mode native** — no light mode toggle
- **USD native** display (everywhere)
- **Motion.dev** for hardware-accelerated animations

---

## ✦ API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/ohlcv` | OHLCV chart data (QuestDB → mock fallback) |
| `GET /api/questdb/health` | QuestDB connection status |
| `POST /api/webhooks/clerk` | User sync webhook (Svix-verified) |
| `GET /api/test/e2e` | End-to-end integration tests |

---

## ✦ Phases

| Phase | Status |
|-------|--------|
| Landing Page & Design System | ✅ Complete |
| Real-Time Data Infrastructure | ✅ Complete |
| Markets & Asset Detail | ✅ Complete |
| Dashboard & Portfolio | ✅ Complete |
| Auth, Payments, Production | ✅ Complete |

---

## ✦ License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with ❄️ using Next.js, Bun, and Dragonfly</sub>
  <br>
  <sub>© 2025 Zenith — Financial Intelligence Platform</sub>
</div>
