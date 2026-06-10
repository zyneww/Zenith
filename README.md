<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 800; letter-spacing: -0.03em; margin: 0.25rem 0;">
    <span style="color: #00e5ff;">ZENITH</span>
  </h1>
  <p style="font-size: 1.2rem; color: #9ca3af; max-width: 600px; margin: 0 auto;">
    ⚡ Intelligence financière temps réel — Crypto, Forex, Commodités
  </p>
</div>

<br>

<p align="center">
  <a href="#readme">🇬🇧 English</a> ·
  <a href="README.fr.md">🇫🇷 Français</a> ·
  <a href="README.de.md">🇩🇪 Deutsch</a> ·
  <a href="README.es.md">🇪🇸 Español</a> ·
  <a href="README.zh.md">🇨🇳 中文</a> ·
  <a href="README.jp.md">🇯🇵 日本語</a> ·
  <a href="README.ar.md">🇸🇦 العربية</a>
</p>

<br>

<p align="center">
  <a href="https://github.com/zyneww/Zenith/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-00e5ff?style=flat-square" alt="License">
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js">
  </a>
  <a href="https://bun.sh/">
    <img src="https://img.shields.io/badge/Bun_1.2-black?style=flat-square&logo=bun&logoColor=white" alt="Bun">
  </a>
  <a href="https://turbo.build/repo">
    <img src="https://img.shields.io/badge/Turborepo-black?style=flat-square&logo=turborepo&logoColor=white" alt="Turborepo">
  </a>
  <a href="https://clerk.com/">
    <img src="https://img.shields.io/badge/Clerk_Auth-7b3fe4?style=flat-square&logo=clerk&logoColor=white" alt="Clerk">
  </a>
  <a href="https://questdb.io/">
    <img src="https://img.shields.io/badge/QuestDB_TS-00e5ff?style=flat-square&logo=questdb&logoColor=white" alt="QuestDB">
  </a>
  <a href="https://www.dragonflydb.io/">
    <img src="https://img.shields.io/badge/Dragonfly-redis-004359?style=flat-square&logo=dragonflydb&logoColor=white" alt="Dragonfly">
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind">
  </a>
  <a href="https://resend.com/">
    <img src="https://img.shields.io/badge/Resend_Email-000?style=flat-square&logo=resend&logoColor=white" alt="Resend">
  </a>
  <a href="https://sentry.io/">
    <img src="https://img.shields.io/badge/Sentry-362D59?style=flat-square&logo=sentry&logoColor=white" alt="Sentry">
  </a>
</p>

<br>

<p align="center">
  <strong>Zenith</strong> is a production-grade financial intelligence platform for <strong>crypto, forex, and commodities</strong> markets — featuring real-time data streaming, TradingView-quality charts, portfolio analytics, and a premium dark-themed UI.
</p>

<p align="center">
  <em>Core focus: market analysis, technical/fundamental insights, and portfolio tracking — not trading execution.</em>
</p>

<br>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗 Architecture](#-architecture)
- [🛠 Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🎨 Design System](#-design-system)
- [🌐 API Endpoints](#-api-endpoints)
- [📈 Phases](#-phases)
- [📄 License](#-license)

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>📊 Real-Time Charts</h3>
      <p>TradingView Lightweight Charts v5 — interactive, 60fps, multi-timeframe</p>
    </td>
    <td width="50%">
      <h3>⚡ Live Prices</h3>
      <p>WebSocket streaming via Bun + Dragonfly Pub/Sub (Binance data)</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📈 Market Screening</h3>
      <p>Crypto, Forex, Commodities, Indices, ETFs — sortable, filterable, searchable</p>
    </td>
    <td width="50%">
      <h3>📰 Economic Calendar</h3>
      <p>Macro events, earnings reports, and key market dates</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📉 Portfolio Analytics</h3>
      <p>KPIs, P&L tracking, Sharpe ratio, volatility metrics, asset allocation</p>
    </td>
    <td width="50%">
      <h3>🔔 Smart Alerts</h3>
      <p>Price thresholds, BullMQ queuing, Resend email delivery</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔍 Deep Search</h3>
      <p>⌘K command palette — instant route and asset discovery</p>
    </td>
    <td width="50%">
      <h3>🔒 Enterprise Auth</h3>
      <p>Clerk-powered — sign-in/sign-up, RBAC, session management</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🌐 Multi-Locale</h3>
      <p>21 languages with full i18n and RTL support</p>
    </td>
    <td width="50%">
      <h3>📱 Responsive</h3>
      <p>Desktop-first with adaptive mobile layouts</p>
    </td>
  </tr>
</table>

---

## 🏗 Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                         FRONTEND                               │
│                     Next.js 16 · App Router                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Markets  │  │ Dashboard│  │Portfolio │  │  Pricing/Auth │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │             │             │               │           │
│  ┌────┴─────────────┴─────────────┴───────────────┴───────┐    │
│  │            SocketContext (WebSocket Client)              │    │
│  └──────────────────────────┬──────────────────────────────┘    │
└─────────────────────────────┼──────────────────────────────────┘
                              │ ws://localhost:3001/ws
┌─────────────────────────────┼──────────────────────────────────┐
│                     WS SERVER (Bun · Port 3001)                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Binance WebSocket → Dragonfly Pub/Sub                   │   │
│  │  ⤵ REST fallback polling (2s interval) on disconnection  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                        DATA LAYER                              │
│                                                               │
│   ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐   │
│   │     Turso       │  │   QuestDB    │  │   Dragonfly    │   │
│   │   (Edge SQLite) │  │ (Time-series)│  │  (Redis Cache)  │   │
│   │   Users, Watch  │  │   OHLCV ·    │  │  Pub/Sub ·      │   │
│   │   lists, Alerts │  │   Trades     │  │  Rate Limiting  │   │
│   └────────┬────────┘  └──────┬───────┘  └───────┬────────┘   │
│            │                  │                   │            │
│   ┌────────┴──────────────────┴───────────────────┴────────┐   │
│   │              Background Jobs (BullMQ)                   │   │
│   │   ┌────────────┐  ┌────────┐  ┌───────────┐            │   │
│   │   │ Indicators │  │ Alerts │  │   Emails  │            │   │
│   │   └────────────┘  └────────┘  └───────────┘            │   │
│   └────────────────────────────────────────────────────────┘   │
│                                                               │
│   ┌──────────────┐  ┌──────────────┐  ┌────────────────┐      │
│   │  Cloudflare  │  │    Resend    │  │    Sentry      │      │
│   │    R2 (S3)   │  │  (Email)     │  │  (Monitoring)   │      │
│   └──────────────┘  └──────────────┘  └────────────────┘      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### 🎨 Frontend

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) | React framework with Turbopack HMR |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS framework |
| Animation | [Motion](https://motion.dev/) | GPU-accelerated animations |
| Charts | [TradingView LW](https://www.tradingview.com/lightweight-charts/) v5 | Interactive financial charts |
| Auth | [Clerk](https://clerk.com/) | Authentication & user management |
| i18n | [next-intl](https://next-intl.dev/) | Internationalization (21 locales) |
| Search | [cmdk](https://cmdk.paco.me/) | ⌘K command palette |

### 🖥 Backend

| Category | Technology | Purpose |
|----------|-----------|---------|
| Runtime | [Bun](https://bun.sh/) 1.2 | JavaScript runtime & package manager |
| WebSocket | Bun native (`Bun.serve`) | Real-time data streaming |
| Cache/Pub-Sub | [Dragonfly](https://www.dragonflydb.io/) | Redis-compatible, multi-threaded |
| Time-Series | [QuestDB](https://questdb.io/) | OHLCV & trades storage |
| Database | [Turso](https://turso.tech/) / SQLite | Edge SQLite (users, portfolios) |
| ORM | [Drizzle](https://orm.drizzle.team/) | Type-safe database queries |
| Queues | [BullMQ](https://bullmq.io/) | Job queues (indicators, alerts, email) |
| Email | [Resend](https://resend.com/) | Transactional email delivery |
| Storage | [Cloudflare R2](https://r2.cloudflare.com/) | S3-compatible object storage |
| Monitoring | [Sentry](https://sentry.io/) | Error tracking & performance |
| Secrets | [Doppler](https://doppler.com/) | Secrets management |
| Containers | [Docker](https://docker.com/) | Dragonfly + QuestDB orchestration |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.2+
- [Docker](https://docker.com/) (for Dragonfly + QuestDB)
- [Git](https://git-scm.com/)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/zyneww/Zenith.git
cd Zenith

# 2. Install dependencies
bun install

# 3. Start infrastructure (Dragonfly + QuestDB)
docker compose -f infra/docker-compose.dev.yml up -d

# 4. Configure environment
cp apps/web/.env.example apps/web/.env.local

# 5. Init database
cd apps/web && bun run db:push

# 6. Start development servers
bun run dev
```

The app will be available at **http://localhost:3000** (WebSocket server on port 3001).

### Environment Variables

Create `.env.local` in `apps/web/`:

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

## 📁 Project Structure

```
zenith/
├── apps/
│   ├── web/                         # Next.js 16 frontend
│   │   ├── app/
│   │   │   ├── [locale]/            # i18n routes (fr, en-US, de, es, ...)
│   │   │   │   ├── page.tsx         # Landing page
│   │   │   │   ├── layout.tsx       # Root layout (generateStaticParams)
│   │   │   │   ├── markets/         # Market screening & asset detail
│   │   │   │   ├── dashboard/       # Portfolio dashboard
│   │   │   │   ├── portfolio/       # Portfolio management
│   │   │   │   ├── pricing/         # Subscription plans
│   │   │   │   ├── news/            # Market news & calendar
│   │   │   │   ├── tools/           # Analysis tools
│   │   │   │   ├── help/            # Help & support
│   │   │   │   ├── sign-in/         # Clerk sign-in
│   │   │   │   └── sign-up/         # Clerk sign-up
│   │   │   └── api/                 # API routes
│   │   │       ├── ohlcv/           # OHLCV chart data
│   │   │       ├── questdb/health/  # QuestDB health check
│   │   │       ├── webhooks/clerk/  # User sync webhook
│   │   │       └── test/e2e/        # E2E integration tests
│   │   ├── components/
│   │   │   ├── landing/             # Header, Hero, Features, Footer
│   │   │   ├── charts/              # TradingView chart wrapper
│   │   │   ├── dashboard/           # MetricsCards, PortfolioChart
│   │   │   ├── portfolio/           # AssetAllocation, TransactionTable
│   │   │   └── ui/                  # DropdownMenu, MobileDrawer, Accordion
│   │   ├── lib/
│   │   │   ├── db/                  # Drizzle ORM + QuestDB client
│   │   │   ├── hooks/               # useRealtimePrice, etc.
│   │   │   ├── realtime/            # WebSocket context
│   │   │   ├── queue/               # BullMQ jobs & workers
│   │   │   ├── email/               # Resend templates
│   │   │   ├── storage/             # R2 S3 client
│   │   │   ├── sentry/              # Error tracking
│   │   │   ├── doppler/             # Secrets management
│   │   │   └── rate-limit.ts        # Sliding window rate limiter
│   │   ├── messages/                # 21 locale JSON files
│   │   └── public/                  # Static assets (logos, favicon)
│   ├── ws-server/                   # Bun WebSocket server
│   │   └── src/
│   │       ├── index.ts             # Bun.serve entry point
│   │       ├── binance.ts           # Binance WS + REST fallback
│   │       └── dragonfly.ts         # Dragonfly client
│   └── config/                      # Shared TypeScript config
├── infra/
│   ├── docker-compose.dev.yml       # Dragonfly + QuestDB
│   └── questdb/                     # Time-series schema (init.sql)
├── turbo.json                       # Turborepo pipeline
├── package.json                     # Workspace root
└── .gitignore
```

---

## 🎨 Design System

Zenith follows a deliberate dark design language:

```css
/* Core Palette */
--bg-primary:    #0b0e14;   /* Deep space black */
--bg-secondary:  #131722;   /* Card backgrounds */
--accent-cyan:   #00e5ff;   /* Primary accent */
--accent-purple: #7b3fe4;   /* CTAs & premium elements */
--text-primary:  #ffffff;   /* Headings */
--text-secondary:#9ca3af;   /* Body text */

/* Typography */
font-family: 'Inter', system-ui, -apple-system, sans-serif;

/* Effects */
.glow-cyan {   box-shadow: 0 0 20px rgba(0, 229, 255, 0.15); }
.glow-purple { box-shadow: 0 0 20px rgba(123, 63, 228, 0.3);  }
```

### Principles

| Principle | Description |
|-----------|-------------|
| 🌙 **Dark-first** | Dark mode native — no light mode toggle |
| 🖥 **Desktop-first** | Responsive, but optimized for large screens |
| 💵 **USD native** | All prices displayed in USD |
| 🎬 **Motion-first** | Hardware-accelerated animations via Motion.dev |
| ♿ **Accessible** | WCAG-compliant contrast, ARIA labels |
| 📐 **Consistent** | Single source of truth for spacing, color, typography |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ohlcv` | OHLCV chart data (QuestDB → mock fallback) |
| `GET` | `/api/questdb/health` | QuestDB connection status |
| `POST` | `/api/webhooks/clerk` | User sync (Svix-verified) |
| `GET` | `/api/test/e2e` | Full-stack integration tests |

---

## 📈 Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Landing Page & Design System | ✅ Complete |
| 2 | Real-Time Data Infrastructure | ✅ Complete |
| 3 | Markets & Asset Detail (TradingView charts) | ✅ Complete |
| 4 | Dashboard, Portfolio & Pricing | ✅ Complete |
| 5 | Auth, Payments & Production Infrastructure | ✅ Complete |
| 6 | Stripe Subscription Integration | 📅 Planned |
| 7 | Deployment (Vercel + Railway/Fly.io) | 📅 Planned |
| 8 | Mobile Responsiveness Optimization | 📅 Planned |

---

<p align="center">
  <sub>Built with <strong>Next.js</strong>, <strong>Bun</strong>, and <strong>Dragonfly</strong></sub>
  <br>
  <sub>© 2025 <strong style="color:#00e5ff;">Zenith</strong> — Financial Intelligence Platform</sub>
  <br>
  <sub>
    <a href="https://github.com/zyneww/Zenith">GitHub</a> ·
    <a href="https://zenith.xyz">Website</a> ·
    <a href="https://github.com/zyneww/Zenith/issues">Issues</a> ·
    <a href="https://github.com/zyneww/Zenith/discussions">Discussions</a>
  </sub>
</p>
