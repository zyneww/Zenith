// apps/web/lib/queue/index.ts
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { sendEmail } from '../email';

const redisConnection = new Redis(process.env.DRAGONFLY_URL || 'redis://:dragonfly_dev@localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
}) as any;

// Queue for indicator calculations
export const indicatorQueue = new Queue('indicators', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// Queue for price alerts
export const alertQueue = new Queue('alerts', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// Queue for email notifications
export const emailQueue = new Queue('emails', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// Job types
export interface IndicatorJobData {
  symbol: string;
  timeframe: string;
  indicators: string[]; // e.g., ['rsi', 'macd', 'sma20']
}

export interface AlertJobData {
  alertId: string;
  userId: string;
  symbol: string;
  condition: 'above' | 'below' | 'crosses';
  targetPrice: number;
  currentPrice: number;
}

export interface EmailJobData {
  to: string;
  template: string;
  data: Record<string, any>;
}

// Add jobs to queues
export async function addIndicatorJob(data: IndicatorJobData) {
  return await indicatorQueue.add('calculate', data, {
    jobId: `indicator-${data.symbol}-${data.timeframe}-${Date.now()}`,
  });
}

export async function addAlertJob(data: AlertJobData) {
  return await alertQueue.add('check', data, {
    jobId: `alert-${data.alertId}-${Date.now()}`,
  });
}

export async function addEmailJob(data: EmailJobData) {
  return await emailQueue.add('send', data, {
    jobId: `email-${data.to}-${data.template}-${Date.now()}`,
  });
}

// Worker for indicator calculations
export const indicatorWorker = new Worker<IndicatorJobData>(
  'indicators',
  async (job: Job<IndicatorJobData>) => {
    const { symbol, timeframe, indicators } = job.data;
    console.log(`📊 Calculating indicators for ${symbol} (${timeframe})`);
    
    // TODO: Implement actual indicator calculations
    // For now, return mock results
    const results: Record<string, number> = {};
    for (const indicator of indicators) {
      results[indicator] = Math.random() * 100;
    }
    
    return { symbol, timeframe, indicators: results };
  },
  { connection: redisConnection }
);

// Worker for price alerts
export const alertWorker = new Worker<AlertJobData>(
  'alerts',
  async (job: Job<AlertJobData>) => {
    const { alertId, symbol, condition, targetPrice, currentPrice } = job.data;
    console.log(`🚨 Checking alert ${alertId} for ${symbol}`);
    
    let triggered = false;
    switch (condition) {
      case 'above':
        triggered = currentPrice >= targetPrice;
        break;
      case 'below':
        triggered = currentPrice <= targetPrice;
        break;
      case 'crosses':
        // Simplified: check if price is close to target
        triggered = Math.abs(currentPrice - targetPrice) < (targetPrice * 0.01);
        break;
    }
    
    if (triggered) {
      // Trigger email notification
      await addEmailJob({
        to: job.data.userId, // TODO: Look up user's email
        template: 'alert-triggered',
        data: {
          symbol,
          targetPrice,
          currentPrice,
          condition,
        },
      });
    }
    
    return { triggered, alertId, symbol, currentPrice, targetPrice };
  },
  { connection: redisConnection }
);

// Worker for email notifications
export const emailWorker = new Worker<EmailJobData>(
  'emails',
  async (job: Job<EmailJobData>) => {
    const { to, template, data } = job.data;
    console.log(`📧 Sending email to ${to} (template: ${template})`);
    
    try {
      const result = await sendEmail({
        to,
        template: template as any,
        data,
      });
      
      console.log(`✅ Email sent to ${to}: ${result.id}`);
      return { sent: true, to, template, id: result.id };
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  },
  { connection: redisConnection }
);

// Event listeners for workers
indicatorWorker.on('completed', (job) => {
  console.log(`✅ Indicator job ${job.id} completed`);
});

indicatorWorker.on('failed', (job, err) => {
  console.error(`❌ Indicator job ${job?.id} failed:`, err);
});

alertWorker.on('completed', (job) => {
  console.log(`✅ Alert job ${job.id} completed`);
});

alertWorker.on('failed', (job, err) => {
  console.error(`❌ Alert job ${job?.id} failed:`, err);
});

emailWorker.on('completed', (job) => {
  console.log(`✅ Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Email job ${job?.id} failed:`, err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down BullMQ workers...');
  await indicatorWorker.close();
  await alertWorker.close();
  await emailWorker.close();
  await indicatorQueue.close();
  await alertQueue.close();
  await emailQueue.close();
  await redisConnection.quit();
});

export default {
  indicatorQueue,
  alertQueue,
  emailQueue,
  indicatorWorker,
  alertWorker,
  emailWorker,
  addIndicatorJob,
  addAlertJob,
  addEmailJob,
};
