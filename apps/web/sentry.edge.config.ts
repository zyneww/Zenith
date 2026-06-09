import { init } from '@sentry/nextjs';

init({
  dsn: process.env.SENTRY_DSN || '',
  
  // Enable performance monitoring
  tracesSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
  
  // Before send hook
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }
    
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    
    return event;
  },
  
  // Ignore specific errors
  ignoreErrors: [
    'Network Error',
    'Failed to fetch',
  ],
  
  // Debug in development
  debug: process.env.NODE_ENV === 'development',
});
