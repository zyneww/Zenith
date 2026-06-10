<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 800; margin: 0.25rem 0;">
    <span style="color: #00e5ff;">ZENITH</span>
  </h1>
  <p style="font-size: 1.2rem; color: #9ca3af;">⚡ Inteligencia financiera en tiempo real</p>
</div>

<p align="center">
  <a href="README.md">🇬🇧 English</a> ·
  <a href="README.fr.md">🇫🇷 Français</a> ·
  <a href="README.de.md">🇩🇪 Deutsch</a> ·
  <strong>🇪🇸 Español</strong> ·
  <a href="README.zh.md">🇨🇳 中文</a> ·
  <a href="README.jp.md">🇯🇵 日本語</a> ·
  <a href="README.ar.md">🇸🇦 العربية</a>
</p>

---

**Zenith** es una plataforma de inteligencia financiera de nivel profesional para los mercados de **cripto, forex y materias primas**.

### ✦ Características

- 📊 Gráficos TradingView en tiempo real (v5)
- ⚡ Precios en vivo vía WebSocket (Bun + Dragonfly + Binance)
- 📈 Análisis multi-mercado (Crypto, Forex, Materias Primas, Índices, ETFs)
- 📉 Análisis de cartera (Sharpe, Drawdown, Volatilidad, Beta)
- 📰 Calendario económico y feed de noticias
- 🔔 Alertas inteligentes (BullMQ + Resend)
- 🔒 Autenticación Clerk (RBAC, sesiones)
- 🌐 21 idiomas con soporte RTL
- ⌘K Paleta de comandos

### ✦ Stack Tecnológico

| Frontend | Backend | Infraestructura |
|----------|---------|-----------------|
| Next.js 16 | Bun 1.2 | Dragonfly (Redis) |
| Tailwind CSS 4 | WebSocket nativo | QuestDB (TS) |
| Motion.dev | BullMQ (colas) | Turso (SQLite) |
| Clerk (Auth) | Resend (email) | Cloudflare R2 |
| next-intl (i18n) | Drizzle (ORM) | Docker |

### ✦ Inicio Rápido

```bash
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install
docker compose -f infra/docker-compose.dev.yml up -d
cp apps/web/.env.example apps/web/.env.local
cd apps/web && bun run db:push
bun run dev
```

### ✦ Licencia

MIT — © 2025 Zenith. Detalles completos en el [README principal](README.md).
