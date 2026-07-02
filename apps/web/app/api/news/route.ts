import { NextResponse } from "next/server";
import { getLatestNews } from "@/lib/news/rss";

export const revalidate = 300;

export async function GET() {
  try {
    const news = await getLatestNews();
    return NextResponse.json(news, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
