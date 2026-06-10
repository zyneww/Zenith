<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 700; margin: 0.25rem 0; color: #00e5ff;">ZENITH</h1>
  <p style="font-size: 1.125rem; color: #9ca3af;">リアルタイム金融インテリジェンス — データ、分析、ポートフォリオ管理</p>
</div>

<p align="center">
  <a href="README.md">EN</a> ·
  <a href="README.fr.md">FR</a> ·
  <a href="README.de.md">DE</a> ·
  <a href="README.es.md">ES</a> ·
  <a href="README.zh.md">ZH</a> ·
  <strong>JP</strong> ·
  <a href="README.ar.md">AR</a>
</p>

---

**Zenith** は、**暗号資産、外国為替、コモディティ**市場向けのプロフェッショナルグレードの金融インテリジェンスプラットフォームです。

### 機能

- **リアルタイムチャート** — TradingView Lightweight Charts v5、60fps、マルチタイムフレーム
- **ライブデータ** — Bun + Dragonfly Pub/Sub による WebSocket ストリーミング（Binance フィード）
- **マルチマーケット分析** — 暗号資産、FX、コモディティ、インデックス、ETF
- **経済カレンダー** — マクロ経済イベント、収益報告、重要日付
- **ポートフォリオ分析** — KPI、P&L、シャープレシオ、ボラティリティ、アセットアロケーション、ドローダウン
- **スマートアラート** — BullMQ + Resend による価格閾値アラート
- **コマンドパレット** — ⌘K — ルートとアセットの即時検索
- **認証** — Clerk（RBAC、セッション管理）
- **国際化** — 21言語対応、RTLサポート

### 技術スタック

| フロントエンド | バックエンド | インフラ |
|--------------|------------|---------|
| Next.js 16 | Bun 1.2 | Dragonfly（Redis） |
| Tailwind CSS 4 | ネイティブWebSocket | QuestDB（時系列） |
| Motion.dev | BullMQ（キュー） | Turso（SQLite） |
| Clerk（認証） | Resend（メール） | Cloudflare R2 |
| next-intl（i18n） | Drizzle（ORM） | Docker |

### クイックスタート

```bash
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install
docker compose -f infra/docker-compose.dev.yml up -d
cp apps/web/.env.example apps/web/.env.local
cd apps/web && bun run db:push
bun run dev
```

詳細は[メインREADME](README.md)をご覧ください。
