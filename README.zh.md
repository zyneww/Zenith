<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 700; margin: 0.25rem 0; color: #00e5ff;">ZENITH</h1>
  <p style="font-size: 1.125rem; color: #9ca3af;">实时金融智能平台 — 数据、分析、投资组合管理</p>
</div>

<p align="center">
  <a href="README.md">EN</a> ·
  <a href="README.fr.md">FR</a> ·
  <a href="README.de.md">DE</a> ·
  <a href="README.es.md">ES</a> ·
  <strong>ZH</strong> ·
  <a href="README.jp.md">JP</a> ·
  <a href="README.ar.md">AR</a>
</p>

---

**Zenith** 是一款面向 **加密货币、外汇和大宗商品** 市场的专业级金融智能平台。

### 功能特性

- **实时图表** — TradingView Lightweight Charts v5，60fps，多时间框架
- **实时数据** — 基于 Bun + Dragonfly Pub/Sub 的 WebSocket 流（币安数据源）
- **多市场筛选** — 加密货币、外汇、大宗商品、指数、ETF
- **经济日历** — 宏观经济事件、财报发布、关键日期
- **投资组合分析** — KPI、盈亏、夏普比率、波动率、资产配置、回撤分析
- **智能警报** — 基于 BullMQ 的价格阈值触发 + Resend 邮件送达
- **命令面板** — ⌘K 快捷键，路由与资产即时发现
- **身份认证** — Clerk 驱动的 RBAC、会话管理
- **国际化** — 21 种语言，支持 RTL 布局

### 技术栈

| 前端 | 后端 | 基础设施 |
|------|------|---------|
| Next.js 16 | Bun 1.2 | Dragonfly（Redis） |
| Tailwind CSS 4 | 原生 WebSocket | QuestDB（时序） |
| Motion.dev | BullMQ（队列） | Turso（SQLite） |
| Clerk（认证） | Resend（邮件） | Cloudflare R2 |
| next-intl（国际化） | Drizzle（ORM） | Docker |

### 快速开始

```bash
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install
docker compose -f infra/docker-compose.dev.yml up -d
cp apps/web/.env.example apps/web/.env.local
cd apps/web && bun run db:push
bun run dev
```

完整详情请参阅[主 README](README.md)。
