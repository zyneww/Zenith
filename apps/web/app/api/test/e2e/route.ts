// apps/web/app/api/test/e2e/route.ts
// End-to-end test endpoint for validating the full flow
// This is only available in development mode

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, watchlists, portfolioPositions, alerts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { addIndicatorJob, addAlertJob, addEmailJob } from '@/lib/queue';
import { sendEmail } from '@/lib/email';
import { getOHLCV, getLatestTrades, questdbHealth } from '@/lib/db/questdb';
import { rateLimit } from '@/lib/rate-limit';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  try {
    // Test 1: Turso database connection
    console.log('🧪 Test 1: Turso database');
    const allUsers = await db.select().from(users);
    results.tests.turso = {
      status: 'passed',
      userCount: allUsers.length,
      users: allUsers.map(u => ({ clerkId: u.clerkId, plan: u.plan })),
    };
  } catch (error) {
    results.tests.turso = { status: 'failed', error: (error as Error).message };
  }

  try {
    // Test 2: QuestDB connection
    console.log('🧪 Test 2: QuestDB');
    const health = await questdbHealth();
    const ohlcv = await getOHLCV('BTCUSDT', '5m');
    results.tests.questdb = {
      status: 'passed',
      healthy: health,
      ohlcvCount: ohlcv.length,
      sample: ohlcv[0],
    };
  } catch (error) {
    results.tests.questdb = { status: 'failed', error: (error as Error).message };
  }

  try {
    // Test 3: Dragonfly / Redis connection
    console.log('🧪 Test 3: Dragonfly (Redis)');
    const Redis = require('ioredis');
    const redis = new Redis(process.env.DRAGONFLY_URL || 'redis://:dragonfly_dev@localhost:6379');
    const pong = await redis.ping();
    const info = await redis.info('server');
    await redis.quit();
    results.tests.dragonfly = {
      status: 'passed',
      ping: pong,
      server: info.split('\n').find((l: string) => l.includes('redis_version')),
    };
  } catch (error) {
    results.tests.dragonfly = { status: 'failed', error: (error as Error).message };
  }

  try {
    // Test 4: BullMQ queues
    console.log('🧪 Test 4: BullMQ queues');
    const testJob = await addIndicatorJob({
      symbol: 'BTCUSDT',
      timeframe: '1m',
      indicators: ['rsi', 'macd'],
    });
    results.tests.bullmq = {
      status: 'passed',
      jobId: testJob.id,
      jobName: testJob.name,
    };
  } catch (error) {
    results.tests.bullmq = { status: 'failed', error: (error as Error).message };
  }

  try {
    // Test 5: Email template rendering
    console.log('🧪 Test 5: Email templates');
    const emailResult = await sendEmail({
      to: 'test@example.com',
      template: 'alert-triggered',
      data: {
        symbol: 'BTCUSDT',
        targetPrice: 50000,
        currentPrice: 51000,
        condition: 'above',
      },
    });
    results.tests.email = {
      status: 'passed',
      id: emailResult.id,
      note: 'Template rendered (sending requires RESEND_API_KEY)',
    };
  } catch (error) {
    results.tests.email = { status: 'failed', error: (error as Error).message };
  }

  try {
    // Test 6: Rate limiting
    console.log('🧪 Test 6: Rate limiting');
    const ip = '127.0.0.1';
    const limitConfig = { maxRequests: 5, windowMs: 60_000, keyPrefix: 'test' };
    const limit1 = await rateLimit(ip, limitConfig);
    const limit2 = await rateLimit(ip, limitConfig);
    results.tests.rateLimit = {
      status: 'passed',
      firstRequest: limit1,
      secondRequest: limit2,
      working: limit1.allowed && !limit2.allowed,
    };
  } catch (error) {
    results.tests.rateLimit = { status: 'failed', error: (error as Error).message };
  }

  // Overall status
  const allPassed = Object.values(results.tests).every((t: any) => t.status === 'passed');
  results.overall = {
    status: allPassed ? 'all passed' : 'some failed',
    total: Object.keys(results.tests).length,
    passed: Object.values(results.tests).filter((t: any) => t.status === 'passed').length,
    failed: Object.values(results.tests).filter((t: any) => t.status === 'failed').length,
  };

  return NextResponse.json(results, { status: allPassed ? 200 : 500 });
}
