<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/logo2.svg">
    <img alt="Zenith" src="apps/web/public/logo2.svg" width="100" height="auto">
  </picture>
  <h1 style="font-size: 2.75rem; font-weight: 700; margin: 0.25rem 0; color: #00e5ff;">ZENITH</h1>
  <p style="font-size: 1.125rem; color: #9ca3af;">منصة ذكاء مالي في الوقت الفعلي — بيانات، تحليلات، إدارة محافظ</p>
</div>

<p align="center" dir="rtl">
  <a href="README.md">EN</a> ·
  <a href="README.fr.md">FR</a> ·
  <a href="README.de.md">DE</a> ·
  <a href="README.es.md">ES</a> ·
  <a href="README.zh.md">ZH</a> ·
  <a href="README.jp.md">JP</a> ·
  <strong>AR</strong>
</p>

---

**زينيث** هي منصة ذكاء مالي احترافية لأسواق **العملات الرقمية، الفوركس، والسلع**.

### المميزات

- **رسوم بيانية فورية** — TradingView Lightweight Charts v5، 60 إطارًا في الثانية، أطر زمنية متعددة
- **بيانات حية** — بث WebSocket عبر Bun + Dragonfly Pub/Sub (مصدر Binance)
- **فحص متعدد الأسواق** — عملات رقمية، فوركس، سلع، مؤشرات، صناديق استثمار
- **تقويم اقتصادي** — أحداث الاقتصاد الكلي، تقارير الأرباح، التواريخ الرئيسية
- **تحليل المحفظة** — مؤشرات الأداء، الأرباح والخسائر، نسبة شارب، التقلبات، توزيع الأصول
- **تنبيهات ذكية** — عتبات سعرية مع BullMQ وتسليم عبر Resend
- **لوحة الأوامر** — ⌘K — اكتشاف فوري للمسارات والأصول
- **المصادقة** — Clerk مع RBAC وإدارة الجلسات
- **التدويل** — 21 لغة مع دعم RTL

### التقنيات

| الواجهة الأمامية | الخلفية | البنية التحتية |
|----------------|---------|--------------|
| Next.js 16 | Bun 1.2 | Dragonfly (Redis) |
| Tailwind CSS 4 | WebSocket أصلي | QuestDB (سلسلة زمنية) |
| Motion.dev | BullMQ (قوائم انتظار) | Turso (SQLite) |
| Clerk (توثيق) | Resend (بريد إلكتروني) | Cloudflare R2 |
| next-intl (ترجمة) | Drizzle (ORM) | Docker |

### بداية سريعة

```bash
git clone https://github.com/zyneww/Zenith.git
cd Zenith
bun install
docker compose -f infra/docker-compose.dev.yml up -d
cp apps/web/.env.example apps/web/.env.local
cd apps/web && bun run db:push
bun run dev
```

التفاصيل الكاملة في [الملف الرئيسي](README.md).
