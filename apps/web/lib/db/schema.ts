// apps/web/lib/db/schema.ts
import { sqliteTable, text, integer, real, unique, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey().default(sql`(uuid())`),
  clerkId: text('clerk_id').notNull().unique(),
  plan: text('plan').default('free'),
  locale: text('locale').default('fr'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const watchlists = sqliteTable('watchlists', {
  id: text('id').primaryKey().default(sql`(uuid())`),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  symbols: text('symbols').notNull(), // JSON array of symbols
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const watchlist = sqliteTable('watchlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  symbol: text('symbol').notNull(),
  type: text('type').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => ({
  userIdSymbolTypeUnique: unique('watchlist_user_symbol_type_unique').on(table.userId, table.symbol, table.type),
  userIdIndex: index('userIdIndex').on(table.userId),
}))

export const portfolioPositions = sqliteTable('portfolio_positions', {
  id: text('id').primaryKey().default(sql`(uuid())`),
  userId: text('user_id').notNull().references(() => users.id),
  symbol: text('symbol').notNull(),
  quantity: real('quantity').notNull(),
  avgPrice: real('avg_price').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const alerts = sqliteTable('alerts', {
  id: text('id').primaryKey().default(sql`(uuid())`),
  userId: text('user_id').notNull().references(() => users.id),
  symbol: text('symbol').notNull(),
  condition: text('condition').notNull(), // 'above', 'below', 'crosses'
  targetPrice: real('target_price').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  triggeredAt: integer('triggered_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})
