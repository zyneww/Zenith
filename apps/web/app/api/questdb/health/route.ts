import { NextResponse } from "next/server";
import { questdbHealth } from "@/lib/db/questdb";

export async function GET() {
  const health = await questdbHealth();
  return NextResponse.json(health);
}
