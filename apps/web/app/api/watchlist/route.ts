import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { watchlist } from '@/lib/db/schema'
import { rateLimit } from '@/lib/rate-limit'

const ALLOWED_TYPES = ['crypto', 'forex', 'commodity', 'index'] as const

async function checkRate(userId: string, op: string, max: number) {
  const rl = await rateLimit(`watchlist:${op}:${userId}`, {
    maxRequests: max,
    windowMs: 60_000,
    keyPrefix: `ratelimit:watchlist:${op}`,
  })
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }
  return null
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const rl = await checkRate(userId, 'get', 60)
  if (rl) return rl

  const items = await db
    .select()
    .from(watchlist)
    .where(eq(watchlist.userId, userId))
    .orderBy(watchlist.createdAt)

  return NextResponse.json({ ok: true, items })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const rl = await checkRate(userId, 'post', 30)
  if (rl) return rl

  let body: { symbol?: string; type?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const { symbol, type } = body
  if (!symbol || typeof symbol !== 'string' || !symbol.trim()) {
    return NextResponse.json({ ok: false, error: 'invalid_symbol' }, { status: 400 })
  }
  if (!type || !ALLOWED_TYPES.includes(type as typeof ALLOWED_TYPES[number])) {
    return NextResponse.json({ ok: false, error: 'invalid_type' }, { status: 400 })
  }

  try {
    const [item] = await db
      .insert(watchlist)
      .values({
        userId,
        symbol: symbol.toUpperCase(),
        type,
        createdAt: Math.floor(Date.now() / 1000),
      })
      .returning()
    return NextResponse.json({ ok: true, item })
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.toLowerCase().includes('unique')) {
      return NextResponse.json({ ok: false, error: 'duplicate' }, { status: 409 })
    }
    throw err
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const rl = await checkRate(userId, 'delete', 60)
  if (rl) return rl

  let body: { symbol?: string; type?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const { symbol, type } = body
  if (!symbol || typeof symbol !== 'string' || !type || !ALLOWED_TYPES.includes(type as typeof ALLOWED_TYPES[number])) {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const result = await db
    .delete(watchlist)
    .where(
      and(
        eq(watchlist.userId, userId),
        eq(watchlist.symbol, symbol.toUpperCase()),
        eq(watchlist.type, type)
      )
    )

  return NextResponse.json({ ok: true, removed: result.rowsAffected ?? 0 })
}
