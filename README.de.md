<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 700; margin: 0.25rem 0; color: #00e5ff;">ZENITH</h1>
  <p style="font-size: 1.125rem; color: #9ca3af;">Echtzeit-Finanzintelligenz — Daten, Analysen, Portfolioverwaltung</p>
</div>

<p align="center">
  <a href="README.md">EN</a> ·
  <a href="README.fr.md">FR</a> ·
  <strong>DE</strong> ·
  <a href="README.es.md">ES</a> ·
  <a href="README.zh.md">ZH</a> ·
  <a href="README.jp.md">JP</a> ·
  <a href="README.ar.md">AR</a>
</p>

---

**Zenith** ist eine professionelle Finanzintelligenz-Plattform für **Kryptowährungs-, Devisen- und Rohstoffmärkte**.

### Funktionen

- **Echtzeit-Charts** — TradingView Lightweight Charts v5, 60fps, Multi-Timeframe
- **Live-Daten** — WebSocket-Streaming via Bun + Dragonfly Pub/Sub (Binance-Feed)
- **Multi-Markt-Screening** — Krypto, Forex, Rohstoffe, Indizes, ETFs
- **Wirtschaftskalender** — Makroökonomische Ereignisse, Gewinnberichte, Schlüsseldaten
- **Portfolio-Analyse** — KPIs, P&L, Sharpe-Ratio, Volatilität, Asset-Allokation, Drawdown
- **Smart Alerts** — Preisschwellen mit BullMQ und Resend-E-Mail-Zustellung
- **Befehlspalette** — ⌘K — sofortige Erkennung von Routen und Assets
- **Authentifizierung** — Clerk mit RBAC, Sitzungsverwaltung
- **Internationalisierung** — 21 Sprachen mit RTL-Unterstützung

### Tech-Stack

| Frontend | Backend | Infrastruktur |
|----------|---------|---------------|
| Next.js 16 | Bun 1.2 | Dragonfly (Redis) |
| Tailwind CSS 4 | Native WebSocket | QuestDB (Zeitreihen) |
| Motion.dev | BullMQ (Warteschlangen) | Turso (SQLite) |
| Clerk (Auth) | Resend (E-Mail) | Cloudflare R2 |
| next-intl (i18n) | Drizzle (ORM) | Docker |

### Schnellstart

```bash
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install
docker compose -f infra/docker-compose.dev.yml up -d
cp apps/web/.env.example apps/web/.env.local
cd apps/web && bun run db:push
bun run dev
```

Vollständige Details im [Haupt-README](README.md).
