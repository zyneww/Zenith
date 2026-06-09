// apps/web/lib/db/index.ts
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

const TURSO_URL = process.env.TURSO_URL || 'file:./zenith.db'
const TURSO_TOKEN = process.env.TURSO_TOKEN

export const client = createClient({
  url: TURSO_URL,
  ...(TURSO_TOKEN ? { authToken: TURSO_TOKEN } : {}),
})

export const db = drizzle(client)
