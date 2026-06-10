<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 700; letter-spacing: -0.03em; margin: 0.25rem 0; color: #00e5ff;">
    ZENITH
  </h1>
  <p style="font-size: 1.125rem; color: #9ca3af; max-width: 560px; margin: 0 auto;">
    Financial Intelligence Platform — Real-Time Data, Analytics, Portfolio Management
  </p>
</div>

<p align="center">
  <a href="#readme">EN</a> ·
  <a href="README.fr.md">FR</a> ·
  <a href="README.de.md">DE</a> ·
  <a href="README.es.md">ES</a> ·
  <a href="README.zh.md">ZH</a> ·
  <a href="README.jp.md">JP</a> ·
  <a href="README.ar.md">AR</a>
</p>

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
    <img src="https://img.shields.io/badge/Dragonfly_Redis-004359?style=flat-square&logo=dragonflydb&logoColor=white" alt="Dragonfly">
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
  <a href="https://www.docker.com/">
    <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker">
  </a>
</p>

<br>

<p align="center">
  <strong>Zenith</strong> is a production-grade financial intelligence platform serving <strong>cryptocurrency, forex, and commodities</strong> markets. It delivers real-time data streaming, TradingView-class charting, and comprehensive portfolio analytics through a unified, dark-themed interface.
</p>

<p align="center" style="color: #9ca3af; font-size: 0.9rem;">
  <em>Core focus: market analysis, technical/fundamental insights, and portfolio tracking.</em>
</p>

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [API Endpoints](#api-endpoints)
- [Development Status](#development-status)
- [License](#license)

---

## Features

| Area | Capability |
|------|-----------|
| **Real-Time Charts** | TradingView Lightweight Charts v5 — 60fps, multi-timeframe, interactive |
| **Live Data** | WebSocket streaming via Bun + Dragonfly Pub/Sub (Binance feed) |
| **Market Screening** | Crypto, Forex, Commodities, Indices, ETFs — sortable, filterable, searchable |
| **Economic Calendar** | Macroeconomic events, earnings reports, key market dates |
| **Portfolio Analytics** | KPIs, P&L tracking, Sharpe ratio, volatility metrics, asset allocation, drawdown analysis |
| **Smart Alerts** | Price thresholds with BullMQ queuing and Resend email delivery |
| **Command Palette** | ⌘K keyboard shortcut — instant route and asset discovery |
| **Authentication** | Clerk-powered with RBAC, session management, sign-in/sign-up flows |
| **Internationalization** | 21 locales with full i18n and RTL support |
| **Responsive Design** | Desktop-first architecture with adaptive mobile layouts |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                             │
│                    Next.js 16 · App Router                     │
│                                                                │
│   Markets · Dashboard · Portfolio · Pricing · Auth · News     │
│          └────────── SocketContext (WS client) ──────────┘     │
└──────────────────────────────┬─────────────────────────────────┘
                               │ ws://localhost:3001/ws
┌──────────────────────────────┼─────────────────────────────────┐
│                    WEBSOCKET SERVER (Bun · Port 3001)            │
│                                                                │
│   Binance WebSocket Streams → Dragonfly Pub/Sub                 │
│   REST fallback polling (2s) on disconnection                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      DATA LAYER                               │
│                                                                │
│   ┌─────────────┐   ┌──────────────┐   ┌────────────────┐     │
│   │   Turso     │   │   QuestDB    │   │   Dragonfly    │     │
│   │ (Edge SQL)  │   │ (Time-series)│   │  (Redis cache)  │     │
│   │ Identity,   │   │ OHLCV,       │   │  Pub/Sub,       │     │
│   │ Portfolios, │   │ Trades       │   │  Rate Limiting  │     │
│   │ Watchlists  │   │              │   │                 │     │
│   └──────┬──────┘   └──────┬───────┘   └────────┬───────┘     │
│          │                 │                    │              │
│   ┌──────┴─────────────────┴────────────────────┴──────────┐  │
│   │              BACKGROUND JOBS (BullMQ)                   │  │
│   │   ┌──────────┐  ┌────────┐  ┌───────────────┐          │  │
│   │   │Indicators│  │ Alerts │  │   Emails      │          │  │
│   │   └──────────┘  └────────┘  └───────────────┘          │  │
│   └────────────────────────────────────────────────────────┘  │
│                                                                │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│   │Cloudflare R2 │  │   Resend     │  │    Sentry       │    │
│   │  (S3 Object) │  │  (Email)     │  │  (Monitoring)   │    │
│   └──────────────┘  └──────────────┘  └─────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) | React framework, Turbopack HMR |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS framework |
| Animation | [Motion](https://motion.dev/) | GPU-accelerated animations |
| Charts | [TradingView Lightweight Charts](https://www.tradingview.com/lightweight-charts/) v5 | Interactive financial charting |
| Auth | [Clerk](https://clerk.com/) | Authentication, RBAC, session management |
| i18n | [next-intl](https://next-intl.dev/) | 21-locale internationalization |
| Search | [cmdk](https://cmdk.paco.me/) | ⌘K command palette |

### Backend & Infrastructure

| Category | Technology | Purpose |
|----------|-----------|---------|
| Runtime | [Bun](https://bun.sh/) 1.2 | JavaScript runtime & package manager |
| WebSocket | Bun native (`Bun.serve`) | Real-time streaming |
| Message Broker | [Dragonfly](https://www.dragonflydb.io/) | Redis-compatible Pub/Sub, cache, rate limiting |
| Time-Series DB | [QuestDB](https://questdb.io/) | OHLCV, trade storage |
| Primary DB | [Turso](https://turso.tech/) | Edge SQLite (identity, portfolios, watchlists) |
| ORM | [Drizzle](https://orm.drizzle.team/) | Type-safe queries |
| Job Queues | [BullMQ](https://bullmq.io/) | Indicators, alerts, email processing |
| Email | [Resend](https://resend.com/) | Transactional email (welcome, alerts, digests) |
| Object Storage | [Cloudflare R2](https://r2.cloudflare.com/) | S3-compatible asset storage |
| Monitoring | [Sentry](https://sentry.io/) | Error tracking, performance monitoring |
| Secrets | [Doppler](https://doppler.com/) | Secrets management |
| Containers | [Docker](https://docker.com/) | Dragonfly + QuestDB orchestration |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.2+
- [Docker](https://docker.com/)
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone repository
git clone https://github.com/zyneww/Zenith.git
cd Zenith

# Install dependencies
bun install

# Start infrastructure (Dragonfly + QuestDB via Docker)
docker compose -f infra/docker-compose.dev.yml up -d

# Configure environment
cp apps/web/.env.example apps/web/.env.local

# Initialize database schema
cd apps/web && bun run db:push

# Start development servers
bun run dev
```

The application will be available at **http://localhost:3000** (WebSocket server on port 3001).

### Environment Variables

```env
# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Turso (Edge SQLite)
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

## Project Structure

```
zenith/
├── apps/
│   ├── web/                         # Next.js 16 frontend
│   │   ├── app/
│   │   │   ├── [locale]/            # i18n routes (21 locales)
│   │   │   ├── api/                 # API routes
│   │   │   └── ...
│   │   ├── components/              # React components
│   │   │   ├── landing/             # Header, Hero, Features, Footer
│   │   │   ├── charts/              # TradingView chart wrappers
│   │   │   ├── dashboard/           # KPI cards, portfolio chart
│   │   │   ├── portfolio/           # Asset allocation, transaction table
│   │   │   └── ui/                  # Shared UI primitives
│   │   ├── lib/                     # Core utilities
│   │   │   ├── db/                  # Drizzle ORM + QuestDB client
│   │   │   ├── realtime/            # WebSocket context
│   │   │   ├── queue/               # BullMQ jobs & workers
│   │   │   ├── email/               # Resend templates
│   │   │   ├── storage/             # R2 client
│   │   │   ├── sentry/              # Error tracking
│   │   │   ├── doppler/             # Secrets management
│   │   │   └── hooks/               # React hooks
│   │   ├── messages/                # 21 locale JSON files
│   │   └── public/                  # Static assets
│   ├── ws-server/                   # Bun WebSocket server
│   │   └── src/
│   │       ├── index.ts             # WebSocket entry point
│   │       ├── binance.ts           # Binance consumer
│   │       └── dragonfly.ts         # Dragonfly client
│   └── config/                      # Shared TypeScript configuration
├── infra/
│   ├── docker-compose.dev.yml       # Dragonfly + QuestDB
│   └── questdb/                     # Time-series schema
├── turbo.json                       # Turborepo pipeline
└── package.json                     # Workspace root
```

---

## Design System

### Core Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0b0e14` | Application background |
| `--bg-secondary` | `#131722` | Card surfaces, dropdowns |
| `--accent-cyan` | `#00e5ff` | Primary accent, interactive elements |
| `--accent-purple` | `#7b3fe4` | CTAs, premium indicators |
| `--text-primary` | `#ffffff` | Headings, primary content |
| `--text-secondary` | `#9ca3af` | Body text, metadata |

### Principles

- **Dark-first** — Native dark mode, no light mode toggle
- **Desktop-first** — Optimized for large screens with adaptive mobile views
- **USD native** — All pricing displayed in USD
- **Motion-first** — Hardware-accelerated animations via Motion.dev
- **WCAG-compliant** — Accessible contrast ratios and ARIA labeling

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ohlcv` | OHLCV chart data (QuestDB → mock fallback) |
| `GET` | `/api/questdb/health` | QuestDB connection health |
| `POST` | `/api/webhooks/clerk` | User sync (Svix-verified) |
| `GET` | `/api/test/e2e` | Integration test suite |

---

## Development Status

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Landing Page & Design System | Complete |
| 2 | Real-Time Data Infrastructure | Complete |
| 3 | Markets & Asset Detail | Complete |
| 4 | Dashboard, Portfolio & Pricing | Complete |
| 5 | Auth, Payments & Production Infrastructure | Complete |
| 6 | Stripe Subscription Integration | Planned |
| 7 | Deployment (Vercel + Railway/Fly.io) | Planned |
| 8 | Mobile Responsiveness Optimization | Planned |

---

<div align="center">

<table>
  <tr>
    <td align="center" width="50%">
      <a href="https://star-history.com/#zyneww/Zenith&Date">
        <img src="https://api.star-history.com/svg?repos=zyneww/Zenith&type=Date" alt="Star History" width="100%">
      </a>
    </td>
    <td align="center" width="50%">
      <img src="https://repobeats.axiom.co/api/embed/8068f284e12efd4d192aa9620068768732a9d753.svg" alt="Repobeats" width="100%">
    </td>
  </tr>
</table>

</div>

---

<p align="center" style="color: #9ca3af; font-size: 0.875rem;">
  Built with Next.js, Bun, and Dragonfly<br>
  © 2025 <span style="color: #00e5ff;">Zenith</span> — Financial Intelligence Platform<br>
  <a href="https://github.com/zyneww/Zenith">GitHub</a> ·
  <a href="https://zenith.xyz">Website</a> ·
  <a href="https://github.com/zyneww/Zenith/issues">Issues</a> ·
  <a href="https://github.com/zyneww/Zenith/discussions">Discussions</a>
</p>
