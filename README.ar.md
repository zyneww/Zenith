<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 800; margin: 0.25rem 0;">
    <span style="color: #00e5ff;">ZENITH</span>
  </h1>
  <p style="font-size: 1.2rem; color: #9ca3af;">⚡ ذكاء مالي في الوقت الفعلي</p>
</div>

<p align="center" dir="rtl">
  <a href="README.md">🇬🇧 English</a> ·
  <a href="README.fr.md">🇫🇷 Français</a> ·
  <a href="README.de.md">🇩🇪 Deutsch</a> ·
  <a href="README.es.md">🇪🇸 Español</a> ·
  <a href="README.zh.md">🇨🇳 中文</a> ·
  <a href="README.jp.md">🇯🇵 日本語</a> ·
  <strong>🇸🇦 العربية</strong>
</p>

---

**زينيث** هي منصة ذكاء مالي فائقة لأسواق **العملات الرقمية، الفوركس، والسلع**.

### ✦ المميزات

- 📊 رسوم بيانية مباشرة من TradingView (v5)
- ⚡ أسعار حية عبر WebSocket (Bun + Dragonfly + Binance)
- 📈 فحص متعدد الأسواق (عملات رقمية، فوركس، سلع، مؤشرات، صناديق)
- 📉 تحليل المحفظة (Sharpe، Drawdown، التقلبات، Beta)
- 📰 تقويم اقتصادي وتدفق الأخبار
- 🔔 تنبيهات ذكية (BullMQ + Resend)
- 🔒 توثيق Clerk (RBAC، جلسات)
- 🌐 21 لغة مع دعم RTL
- ⌘K لوحة الأوامر

### ✦ التقنيات

| الواجهة الأمامية | الخلفية | البنية التحتية |
|----------------|---------|--------------|
| Next.js 16 | Bun 1.2 | Dragonfly (Redis) |
| Tailwind CSS 4 | WebSocket | QuestDB (TS) |
| Motion.dev | BullMQ (قوائم) | Turso (SQLite) |
| Clerk (توثيق) | Resend (بريد) | Cloudflare R2 |
| next-intl (ترجمة) | Drizzle (ORM) | Docker |

### ✦ بداية سريعة

```bash
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install
docker compose -f infra/docker-compose.dev.yml up -d
cp apps/web/.env.example apps/web/.env.local
cd apps/web && bun run db:push
bun run dev
```

### ✦ الرخصة

MIT — © 2025 Zenith. التفاصيل الكاملة في [الملف الرئيسي](README.md).
