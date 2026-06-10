<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 800; margin: 0.25rem 0;">
    <span style="color: #00e5ff;">ZENITH</span>
  </h1>
  <p style="font-size: 1.2rem; color: #9ca3af;">⚡ Intelligence financière temps réel</p>
</div>

<p align="center">
  <a href="README.md">🇬🇧 English</a> ·
  <strong>🇫🇷 Français</strong> ·
  <a href="README.de.md">🇩🇪 Deutsch</a> ·
  <a href="README.es.md">🇪🇸 Español</a> ·
  <a href="README.zh.md">🇨🇳 中文</a> ·
  <a href="README.jp.md">🇯🇵 日本語</a> ·
  <a href="README.ar.md">🇸🇦 العربية</a>
</p>

---

**Zenith** est une plateforme d'intelligence financière haut de gamme pour les marchés **crypto, forex et commodités**.

### ✦ Fonctionnalités

- 📊 Graphiques TradingView temps réel (v5, 60 ips)
- ⚡ Prix en direct via WebSocket (Bun + Dragonfly + Binance)
- 📈 Screening multi-marchés (Crypto, Forex, Commodités, Indices, ETFs)
- 📉 Analyse de portefeuille (Sharpe, Drawdown, Volatilité, Bêta)
- 📰 Calendrier économique et flux d'actualités
- 🔔 Alertes intelligentes (BullMQ + Resend)
- 🔒 Authentification Clerk (RBAC, sessions)
- 🌐 21 langues avec support RTL
- ⌘K Palette de commandes

### ✦ Stack Technique

| Frontend | Backend | Infrastructure |
|----------|---------|----------------|
| Next.js 16 | Bun 1.2 | Dragonfly (Redis) |
| Tailwind CSS 4 | WebSocket natif | QuestDB (TS) |
| Motion.dev | BullMQ (queues) | Turso (SQLite) |
| Clerk (Auth) | Resend (email) | Cloudflare R2 |
| next-intl (i18n) | Drizzle (ORM) | Docker |

### ✦ Démarrage Rapide

```bash
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install
docker compose -f infra/docker-compose.dev.yml up -d
cp apps/web/.env.example apps/web/.env.local
cd apps/web && bun run db:push
bun run dev
```

### ✦ Licence

MIT — © 2025 Zenith. Voir le [README principal](README.md) pour les détails complets.
