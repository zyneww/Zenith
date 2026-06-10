<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 800; margin: 0.25rem 0;">
    <span style="color: #00e5ff;">ZENITH</span>
  </h1>
  <p style="font-size: 1.2rem; color: #9ca3af;">⚡ リアルタイム金融インテリジェンス</p>
</div>

<p align="center">
  <a href="README.md">🇬🇧 English</a> ·
  <a href="README.fr.md">🇫🇷 Français</a> ·
  <a href="README.de.md">🇩🇪 Deutsch</a> ·
  <a href="README.es.md">🇪🇸 Español</a> ·
  <a href="README.zh.md">🇨🇳 中文</a> ·
  <strong>🇯🇵 日本語</strong> ·
  <a href="README.ar.md">🇸🇦 العربية</a>
</p>

---

**Zenith** は、**暗号資産、外国為替、コモディティ**市場向けのプロフェッショナルグレードの金融インテリジェンスプラットフォームです。

### ✦ 特徴

- 📊 TradingView リアルタイムチャート (v5)
- ⚡ WebSocket によるリアルタイム価格 (Bun + Dragonfly + Binance)
- 📈 マルチマーケットスクリーニング
- 📉 ポートフォリオ分析 (シャープレシオ、ドローダウン、ボラティリティ)
- 📰 経済カレンダーとニュースフィード
- 🔔 スマートアラート (BullMQ + Resend)
- 🔒 Clerk 認証 (RBAC、セッション管理)
- 🌐 21言語対応 (RTLサポート)
- ⌘K コマンドパレット

### ✦ 技術スタック

| フロントエンド | バックエンド | インフラ |
|--------------|------------|---------|
| Next.js 16 | Bun 1.2 | Dragonfly (Redis) |
| Tailwind CSS 4 | ネイティブWebSocket | QuestDB (TS) |
| Motion.dev | BullMQ (キュー) | Turso (SQLite) |
| Clerk (認証) | Resend (メール) | Cloudflare R2 |
| next-intl (i18n) | Drizzle (ORM) | Docker |

### ✦ クイックスタート

```bash
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install
docker compose -f infra/docker-compose.dev.yml up -d
cp apps/web/.env.example apps/web/.env.local
cd apps/web && bun run db:push
bun run dev
```

### ✦ ライセンス

MIT — © 2025 Zenith。詳細は[メインREADME](README.md)をご覧ください。
