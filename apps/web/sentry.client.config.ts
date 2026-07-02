import { init } from '@sentry/nextjs';

init({
  dsn: process.env.SENTRY_DSN || '',
  
  // Enable performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable profiling (requires @sentry/profiling-node)
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
  
  // Before send hook to filter sensitive data
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }
    
    // Remove sensitive user data
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    
    return event;
  },
  
  // Ignore specific errors
  ignoreErrors: [
    // Browser extension errors
    'chrome-extension',
    'eval at <anonymous>',
    // Network errors
    'Network Error',
    'Failed to fetch',
    // Known non-critical errors
    'ResizeObserver loop',
  ],
  
  // Deny URLs for inbound filters
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
  ],
  
  // Integrations
  integrations: [
    // Auto-session tracking
    new (require('@sentry/nextjs').BrowserTracing)({
      // Track API routes
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/zenith\.xyz\/api/,
      ],
    }),
  ],
  
  // Debug in development
  debug: process.env.NODE_ENV === 'development',
});
