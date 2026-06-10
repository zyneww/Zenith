<div align="center">

<img src="apps/web/public/logo2.svg" alt="Zenith" width="72" height="72">

<h1>Zenith</h1>

**Financial Intelligence Platform** — Real-time markets, analytics & portfolio management

<br>

[![License](https://img.shields.io/badge/license-MIT-00e5ff?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Bun](https://img.shields.io/badge/Bun_1.2-black?style=flat-square&logo=bun&logoColor=white)](https://bun.sh/)
[![Turborepo](https://img.shields.io/badge/Turborepo-black?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/repo)
[![TypeScript](https://img.shields.io/badge/TypeScript-black?style=flat-square&logo=typescript&logoColor=3178C6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-black?style=flat-square&logo=tailwindcss&logoColor=06B6D4)](https://tailwindcss.com/)

<br>

[English](README.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [中文](README.zh.md) · [日本語](README.jp.md) · [العربية](README.ar.md)

</div>

---

Zenith is a production-grade financial intelligence platform covering **cryptocurrency, forex, and commodities** markets. Built on a modern monorepo stack, it delivers real-time WebSocket streaming, TradingView-class charting, and portfolio analytics through a unified dark-themed interface.

<br>

## Features

| | Capability |
|:---|:---|
| **Real-Time Charts** | TradingView Lightweight Charts v5 — 60fps, multi-timeframe, fully interactive |
| **Live Data** | WebSocket streaming via Bun + Dragonfly Pub/Sub (Binance feed) |
| **Market Screening** | Crypto, Forex, Commodities, Indices, ETFs — sortable, filterable, searchable |
| **Economic Calendar** | Macroeconomic events, earnings reports, key market dates |
| **Portfolio Analytics** | P&L tracking, Sharpe ratio, volatility, drawdown analysis, asset allocation |
| **Smart Alerts** | Price thresholds via BullMQ queuing and Resend email delivery |
| **Command Palette** | `⌘K` — instant route and asset discovery |
| **Authentication** | Clerk with RBAC, session management, sign-in/sign-up |
| **Internationalization** | 21 locales with full i18n and RTL support |
| **Responsive Design** | Desktop-first with adaptive mobile layouts |

<br>

## Architecture

```
Frontend (Next.js 16 · App Router)
  └── WebSocket Context
         │ ws://localhost:3001
WebSocket Server (Bun)
  └── Binance Streams → Dragonfly Pub/Sub
         │
Data Layer
  ├── Turso      — Edge SQLite: identity, portfolios, watchlists
  ├── QuestDB    — Time-series: OHLCV, trades
  └── Dragonfly  — Redis cache, pub/sub, rate limiting
         │
Background Jobs (BullMQ)
  ├── Indicators — Technical analysis pipeline
  ├── Alerts     — Price threshold notifications
  └── Emails     — Transactional via Resend
         │
External Services
  ├── Cloudflare R2 — Object storage
  ├── Sentry        — Error tracking & performance
  └── Doppler       — Secrets management
```

<br>

## Tech Stack

### Frontend

| Technology | Purpose |
|:---|:---|
| [Next.js 16](https://nextjs.org/) (App Router) | Framework + Turbopack HMR |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [TradingView Lightweight Charts v5](https://www.tradingview.com/lightweight-charts/) | Financial charting |
| [Motion](https://motion.dev/) | GPU-accelerated animations |
| [Clerk](https://clerk.com/) | Auth, RBAC, sessions |
| [next-intl](https://next-intl.dev/) | 21-locale i18n |
| [cmdk](https://cmdk.paco.me/) | ⌘K command palette |

### Backend & Infrastructure

| Technology | Purpose |
|:---|:---|
| [Bun 1.2](https://bun.sh/) | Runtime & package manager |
| [Dragonfly](https://www.dragonflydb.io/) | Redis-compatible cache, pub/sub, rate limiting |
| [QuestDB](https://questdb.io/) | Time-series storage (OHLCV, trades) |
| [Turso](https://turso.tech/) | Edge SQLite |
| [Drizzle](https://orm.drizzle.team/) | Type-safe ORM |
| [BullMQ](https://bullmq.io/) | Job queues (indicators, alerts, emails) |
| [Resend](https://resend.com/) | Transactional email |
| [Cloudflare R2](https://r2.cloudflare.com/) | S3-compatible object storage |
| [Sentry](https://sentry.io/) | Error tracking & performance |
| [Doppler](https://doppler.com/) | Secrets management |
| [Docker](https://docker.com/) | Dragonfly + QuestDB orchestration |

<br>

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.2+
- [Docker](https://docker.com/)
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/zyneww/Zenith.git
cd Zenith

# Install dependencies
bun install

# Start infrastructure (Dragonfly + QuestDB)
docker compose -f infra/docker-compose.dev.yml up -d

# Configure environment
cp apps/web/.env.example apps/web/.env.local

# Push database schema
cd apps/web && bun run db:push

# Start all development servers
bun run dev
```

> Web app at `http://localhost:3000` · WebSocket server at `http://localhost:3001`

### Environment Variables

<details>
<summary>View all required variables</summary>

```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Database (Turso)
TURSO_URL=file:./zenith.db
TURSO_AUTH_TOKEN=

# Time-Series (QuestDB)
QUESTDB_URL=postgresql://zenith:questdb_dev@localhost:8812/qdb

# Cache (Dragonfly)
REDIS_URL=redis://:dragonfly_dev@localhost:6379

# Email (Resend)
RESEND_API_KEY=re_...

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
├── apps/
│   ├── web/                    # Next.js 16 frontend
│   │   ├── app/[locale]/       # i18n routes (21 locales)
│   │   ├── components/
│   │   │   ├── landing/        # Hero, features, header, footer
│   │   │   ├── charts/         # TradingView wrappers
│   │   │   ├── dashboard/      # KPIs, portfolio charts
│   │   │   ├── portfolio/      # Asset allocation, transactions
│   │   │   └── ui/             # Shared primitives
│   │   └── lib/
│   │       ├── db/             # Drizzle ORM + QuestDB
│   │       ├── realtime/       # WebSocket context
│   │       ├── queue/          # BullMQ workers
│   │       └── email/          # Resend templates
│   └── ws-server/              # Bun WebSocket server
│       └── src/
│           ├── index.ts        # Entry point
│           ├── binance.ts      # Binance consumer
│           └── dragonfly.ts    # Dragonfly client
├── infra/
│   ├── docker-compose.dev.yml  # Local infrastructure
│   └── questdb/                # Time-series schema
├── turbo.json                  # Turborepo pipeline
└── package.json                # Workspace root
```

<br>

## Design System

| Token | Value | Usage |
|:---|:---|:---|
| `--bg-primary` | `#0b0e14` | Application background |
| `--bg-secondary` | `#131722` | Cards, dropdowns |
| `--accent-cyan` | `#00e5ff` | Primary accent, interactive elements |
| `--accent-purple` | `#7b3fe4` | CTAs, premium indicators |
| `--text-primary` | `#ffffff` | Headings |
| `--text-secondary` | `#9ca3af` | Body text, metadata |

Dark-first · Desktop-first · USD native · WCAG-compliant

<br>

## API Reference

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/ohlcv` | OHLCV chart data (QuestDB → mock fallback) |
| `GET` | `/api/questdb/health` | QuestDB health check |
| `POST` | `/api/webhooks/clerk` | User sync (Svix-verified) |
| `GET` | `/api/test/e2e` | Integration test suite |

<br>

## Roadmap

| Phase | Scope | Status |
|:---:|:---|:---:|
| 1 | Landing Page & Design System | ✅ |
| 2 | Real-Time Data Infrastructure | ✅ |
| 3 | Markets & Asset Detail | ✅ |
| 4 | Dashboard, Portfolio & Pricing | ✅ |
| 5 | Auth, Payments & Production Infrastructure | ✅ |
| 6 | Stripe Subscription Integration | 🔲 |
| 7 | Deployment (Vercel + Railway / Fly.io) | 🔲 |
| 8 | Mobile Responsiveness Optimization | 🔲 |

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

Built with [Next.js](https://nextjs.org/), [Bun](https://bun.sh/), and [Dragonfly](https://www.dragonflydb.io/)

[GitHub](https://github.com/zyneww/Zenith) · [Issues](https://github.com/zyneww/Zenith/issues) · [Discussions](https://github.com/zyneww/Zenith/discussions)

<sub>© 2025 Zenith</sub>

</div>
