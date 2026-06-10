<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 800; margin: 0.25rem 0;">
    <span style="color: #00e5ff;">ZENITH</span>
  </h1>
  <p style="font-size: 1.2rem; color: #9ca3af;">⚡ Echtzeit-Finanzintelligenz</p>
</div>

<p align="center">
  <a href="README.md">🇬🇧 English</a> ·
  <a href="README.fr.md">🇫🇷 Français</a> ·
  <strong>🇩🇪 Deutsch</strong> ·
  <a href="README.es.md">🇪🇸 Español</a> ·
  <a href="README.zh.md">🇨🇳 中文</a> ·
  <a href="README.jp.md">🇯🇵 日本語</a> ·
  <a href="README.ar.md">🇸🇦 العربية</a>
</p>

---

**Zenith** ist eine professionelle Finanzintelligenz-Plattform für **Krypto-, Forex- und Rohstoffmärkte**.

### ✦ Funktionen

- 📊 TradingView Echtzeit-Charts (v5)
- ⚡ Live-Kurse via WebSocket (Bun + Dragonfly + Binance)
- 📈 Multi-Markt-Screening (Crypto, Forex, Rohstoffe, Indizes, ETFs)
- 📉 Portfolio-Analyse (Sharpe, Drawdown, Volatilität, Beta)
- 📰 Wirtschaftskalender und Nachrichten-Feed
- 🔔 Intelligente Benachrichtigungen (BullMQ + Resend)
- 🔒 Clerk Authentifizierung (RBAC, Sessions)
- 🌐 21 Sprachen mit RTL-Unterstützung
- ⌘K Befehlspalette

### ✦ Technologie-Stack

| Frontend | Backend | Infrastruktur |
|----------|---------|---------------|
| Next.js 16 | Bun 1.2 | Dragonfly (Redis) |
| Tailwind CSS 4 | Native WebSocket | QuestDB (TS) |
| Motion.dev | BullMQ (Queues) | Turso (SQLite) |
| Clerk (Auth) | Resend (E-Mail) | Cloudflare R2 |
| next-intl (i18n) | Drizzle (ORM) | Docker |

### ✦ Schnellstart

```bash
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install
docker compose -f infra/docker-compose.dev.yml up -d
cp apps/web/.env.example apps/web/.env.local
cd apps/web && bun run db:push
bun run dev
```

### ✦ Lizenz

MIT — © 2025 Zenith. Vollständige Details im [Haupt-README](README.md).
