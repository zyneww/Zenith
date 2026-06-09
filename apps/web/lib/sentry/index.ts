// apps/web/lib/sentry/index.ts
import { captureException, captureMessage, setUser, setContext, setTag, startSpan, withScope } from '@sentry/nextjs';

// Capture API errors
export function captureApiError(error: Error, context?: Record<string, any>) {
  withScope((scope) => {
    if (context) {
      scope.setContext('api', context);
    }
    scope.setTag('type', 'api_error');
    captureException(error);
  });
}

// Capture validation errors
export function captureValidationError(error: Error, data?: Record<string, any>) {
  withScope((scope) => {
    if (data) {
      scope.setContext('validation', data);
    }
    scope.setTag('type', 'validation_error');
    captureException(error);
  });
}

// Capture rate limit events
export function captureRateLimit(ip: string, path: string, limit: number) {
  withScope((scope) => {
    scope.setContext('rate_limit', {
      ip: ip.substring(0, 7) + '...', // Mask IP
      path,
      limit,
    });
    scope.setTag('type', 'rate_limit');
    captureMessage(`Rate limit exceeded: ${path}`, 'warning');
  });
}

// Capture webhook events
export function captureWebhookError(error: Error, payload?: Record<string, any>) {
  withScope((scope) => {
    if (payload) {
      // Remove sensitive data from payload
      const sanitizedPayload = { ...payload };
      delete sanitizedPayload.secret;
      delete sanitizedPayload.token;
      delete sanitizedPayload.password;
      scope.setContext('webhook', sanitizedPayload);
    }
    scope.setTag('type', 'webhook_error');
    captureException(error);
  });
}

// Capture database errors
export function captureDbError(error: Error, query?: string, table?: string) {
  withScope((scope) => {
    scope.setContext('database', {
      query: query?.substring(0, 100), // Truncate long queries
      table,
    });
    scope.setTag('type', 'database_error');
    captureException(error);
  });
}

// Capture real-time errors
export function captureRealtimeError(error: Error, socketId?: string, event?: string) {
  withScope((scope) => {
    scope.setContext('realtime', {
      socketId: socketId?.substring(0, 8),
      event,
    });
    scope.setTag('type', 'realtime_error');
    captureException(error);
  });
}

// Set user context (safely)
export function setSentryUser(userId: string, email?: string) {
  setUser({
    id: userId,
    // Only set email if explicitly provided and needed
    ...(email ? { email } : {}),
  });
}

// Start performance transaction
export function startPerformanceTransaction<T>(name: string, op: string, callback: () => T): T {
  return startSpan({ name, op }, callback);
}

// Set transaction tag
export function setTransactionTag(key: string, value: string) {
  setTag(key, value);
}

// Set transaction context
export function setTransactionContext(name: string, context: Record<string, any>) {
  setContext(name, context);
}

export default {
  captureApiError,
  captureValidationError,
  captureRateLimit,
  captureWebhookError,
  captureDbError,
  captureRealtimeError,
  setSentryUser,
  startPerformanceTransaction,
  setTransactionTag,
  setTransactionContext,
};
