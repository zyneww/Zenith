<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 700; margin: 0.25rem 0; color: #00e5ff;">ZENITH</h1>
  <p style="font-size: 1.125rem; color: #9ca3af;">Plateforme d'Intelligence Financière — Temps Réel, Analyses, Gestion de Portefeuille</p>
</div>

<p align="center">
  <a href="README.md">EN</a> ·
  <strong>FR</strong> ·
  <a href="README.de.md">DE</a> ·
  <a href="README.es.md">ES</a> ·
  <a href="README.zh.md">ZH</a> ·
  <a href="README.jp.md">JP</a> ·
  <a href="README.ar.md">AR</a>
</p>

---

**Zenith** est une plateforme d'intelligence financière professionnelle pour les marchés **cryptomonnaies, forex et matières premières**.

### Fonctionnalités

- **Graphiques Temps Réel** — TradingView Lightweight Charts v5, 60 ips, multi-timeframes
- **Données en Direct** — WebSocket via Bun + Dragonfly Pub/Sub (flux Binance)
- **Screening Multi-Marchés** — Crypto, Forex, Commodités, Indices, ETFs — triable, filtrable, recherchable
- **Calendrier Économique** — Événements macroéconomiques, rapports, dates clés
- **Analytique de Portefeuille** — KPI, P&L, ratio de Sharpe, volatilité, allocation d'actifs
- **Alertes Intelligentes** — Seuils de prix avec files BullMQ et livraison email Resend
- **Palette de Commandes** — ⌘K — découverte instantanée des routes et actifs
- **Authentification** — Clerk avec RBAC, gestion de sessions
- **Internationalisation** — 21 langues avec support RTL

### Stack Technique

| Frontend | Backend | Infrastructure |
|----------|---------|----------------|
| Next.js 16 | Bun 1.2 | Dragonfly (Redis) |
| Tailwind CSS 4 | WebSocket natif | QuestDB (time-series) |
| Motion.dev | BullMQ (files d'attente) | Turso (SQLite) |
| Clerk (Auth) | Resend (email) | Cloudflare R2 |
| next-intl (i18n) | Drizzle (ORM) | Docker |

### Démarrage Rapide

```bash
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install
docker compose -f infra/docker-compose.dev.yml up -d
cp apps/web/.env.example apps/web/.env.local
cd apps/web && bun run db:push
bun run dev
```

Pour les détails complets, voir le [README principal](README.md).
