<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 700; margin: 0.25rem 0; color: #00e5ff;">ZENITH</h1>
  <p style="font-size: 1.125rem; color: #9ca3af;">Inteligencia Financiera en Tiempo Real — Datos, Análisis, Gestión de Cartera</p>
</div>

<p align="center">
  <a href="README.md">EN</a> ·
  <a href="README.fr.md">FR</a> ·
  <a href="README.de.md">DE</a> ·
  <strong>ES</strong> ·
  <a href="README.zh.md">ZH</a> ·
  <a href="README.jp.md">JP</a> ·
  <a href="README.ar.md">AR</a>
</p>

---

**Zenith** es una plataforma de inteligencia financiera profesional para los mercados de **criptomonedas, forex y materias primas**.

### Características

- **Gráficos en Tiempo Real** — TradingView Lightweight Charts v5, 60fps, multi-marco temporal
- **Datos en Vivo** — Streaming WebSocket via Bun + Dragonfly Pub/Sub (feed Binance)
- **Análisis Multi-Mercado** — Crypto, Forex, Materias Primas, Índices, ETFs
- **Calendario Económico** — Eventos macroeconómicos, informes de ganancias, fechas clave
- **Analítica de Cartera** — KPIs, P&L, ratio Sharpe, volatilidad, asignación de activos, drawdown
- **Alertas Inteligentes** — Umbrales de precio con BullMQ y entrega por correo Resend
- **Paleta de Comandos** — ⌘K — descubrimiento instantáneo de rutas y activos
- **Autenticación** — Clerk con RBAC, gestión de sesiones
- **Internacionalización** — 21 idiomas con soporte RTL

### Stack Tecnológico

| Frontend | Backend | Infraestructura |
|----------|---------|-----------------|
| Next.js 16 | Bun 1.2 | Dragonfly (Redis) |
| Tailwind CSS 4 | WebSocket nativo | QuestDB (series temporales) |
| Motion.dev | BullMQ (colas) | Turso (SQLite) |
| Clerk (Auth) | Resend (email) | Cloudflare R2 |
| next-intl (i18n) | Drizzle (ORM) | Docker |

### Inicio Rápido

```bash
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install
docker compose -f infra/docker-compose.dev.yml up -d
cp apps/web/.env.example apps/web/.env.local
cd apps/web && bun run db:push
bun run dev
```

Detalles completos en el [README principal](README.md).
