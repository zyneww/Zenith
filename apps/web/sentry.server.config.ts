import { init } from '@sentry/nextjs';

init({
  dsn: process.env.SENTRY_DSN || '',
  
  // Enable performance monitoring
  tracesSampleRate: 1.0,
  
  // Server-side profiling
  profilesSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
  
  // Before send hook to filter sensitive data
  beforeSend(event) {
    // Remove sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }
    
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    
    // Remove sensitive query params
    if (event.request?.url) {
      const url = new URL(event.request.url);
      url.searchParams.delete('api_key');
      url.searchParams.delete('token');
      url.searchParams.delete('secret');
      event.request.url = url.toString();
    }
    
    return event;
  },
  
  // Ignore specific errors
  ignoreErrors: [
    'Network Error',
    'Failed to fetch',
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
  ],
  
  // Debug in development
  debug: process.env.NODE_ENV === 'development',
});
