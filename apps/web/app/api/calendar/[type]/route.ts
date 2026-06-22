import { NextResponse } from "next/server";
import { createRateLimitMiddleware, rateLimits } from "@/lib/rate-limit";
import { getCalendarData } from "@/lib/calendar/finnhub";
import { getMockCalendar } from "@/lib/calendar/mock";
import { CALENDAR_TYPES, type CalendarType } from "@/lib/calendar/types";

const limiter = createRateLimitMiddleware(rateLimits.default);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const rateLimitResponse = await limiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { type } = await params;
  if (!(CALENDAR_TYPES as readonly string[]).includes(type)) {
    return NextResponse.json(
      { error: "Invalid calendar type", allowed: CALENDAR_TYPES },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";

  if (!from || !to) {
    return NextResponse.json(
      { error: "Missing 'from' or 'to' query param (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const calendarType = type as CalendarType;
  let data = await getCalendarData(calendarType, { from, to });
  if (!data || data.length === 0) {
    data = getMockCalendar(calendarType);
  }

  return new Response(
    JSON.stringify({ type: calendarType, from, to, count: data.length, data }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
}
