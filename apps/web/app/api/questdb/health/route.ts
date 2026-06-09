import { NextResponse } from "next/server";
import { questdbHealth } from "@/lib/db/questdb";
import { createRateLimitMiddleware, rateLimits } from "@/lib/rate-limit";

const marketRateLimit = createRateLimitMiddleware(rateLimits.market);

export async function GET(request: Request) {
  // Rate limiting
  const rateLimitResponse = await marketRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const health = await questdbHealth();
  return NextResponse.json(health);
}
