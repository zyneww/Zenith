<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 800; margin: 0.25rem 0;">
    <span style="color: #00e5ff;">ZENITH</span>
  </h1>
  <p style="font-size: 1.2rem; color: #9ca3af;">⚡ 实时金融智能平台</p>
</div>

<p align="center">
  <a href="README.md">🇬🇧 English</a> ·
  <a href="README.fr.md">🇫🇷 Français</a> ·
  <a href="README.de.md">🇩🇪 Deutsch</a> ·
  <a href="README.es.md">🇪🇸 Español</a> ·
  <strong>🇨🇳 中文</strong> ·
  <a href="README.jp.md">🇯🇵 日本語</a> ·
  <a href="README.ar.md">🇸🇦 العربية</a>
</p>

---

**Zenith** 是一个面向 **加密货币、外汇和大宗商品** 市场的高端金融智能平台。

### ✦ 功能特点

- 📊 TradingView 实时图表 (v5, 60fps)
- ⚡ WebSocket 实时价格推送 (Bun + Dragonfly + Binance)
- 📈 多市场筛选 (加密货币、外汇、大宗商品、指数、ETF)
- 📉 投资组合分析 (夏普比率、回撤、波动率、贝塔)
- 📰 经济日历和新闻流
- 🔔 智能警报 (BullMQ + Resend)
- 🔒 Clerk 身份认证 (RBAC、会话管理)
- 🌐 21 种语言，支持 RTL
- ⌘K 命令面板

### ✦ 技术栈

| 前端 | 后端 | 基础设施 |
|------|------|---------|
| Next.js 16 | Bun 1.2 | Dragonfly (Redis) |
| Tailwind CSS 4 | 原生 WebSocket | QuestDB (时序) |
| Motion.dev | BullMQ (队列) | Turso (SQLite) |
| Clerk (认证) | Resend (邮件) | Cloudflare R2 |
| next-intl (国际化) | Drizzle (ORM) | Docker |

### ✦ 快速开始

```bash
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install
docker compose -f infra/docker-compose.dev.yml up -d
cp apps/web/.env.example apps/web/.env.local
cd apps/web && bun run db:push
bun run dev
```

### ✦ 许可证

MIT — © 2025 Zenith。完整详情请参阅[主 README](README.md)。
