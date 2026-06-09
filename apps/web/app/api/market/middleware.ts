import { NextResponse } from 'next/server';
import { createRateLimitMiddleware, rateLimits } from '@/lib/rate-limit';

const marketRateLimit = createRateLimitMiddleware(rateLimits.market);

export async function middleware(request: Request) {
  // Apply rate limiting to market routes
  if (request.url.includes('/api/market/')) {
    const rateLimitResponse = await marketRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/market/:path*',
};
