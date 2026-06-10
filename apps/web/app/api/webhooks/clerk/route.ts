import { Webhook } from "svix"
import { logger } from "@/lib/logger";
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { createRateLimitMiddleware, rateLimits } from "@/lib/rate-limit"

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
const webhookRateLimit = createRateLimitMiddleware(rateLimits.webhook)

export async function POST(req: Request) {
  // Rate limiting
  const rateLimitResponse = await webhookRateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  if (!WEBHOOK_SECRET) {
    logger.error("CLERK_WEBHOOK_SECRET not configured")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  const payload = await req.text()
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 })
  }

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: any

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
  } catch (err) {
    logger.error("Webhook verification failed:", err)
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  const eventType = evt.type
  const userData = evt.data

  logger.log(`Webhook received: ${eventType} for user ${userData.id}`)

  try {
    switch (eventType) {
      case "user.created": {
        await db.insert(users).values({
          clerkId: userData.id,
          plan: "free",
          locale: "fr",
        }).onConflictDoNothing()
        logger.log(`✅ User created: ${userData.id}`)
        break
      }
      case "user.updated": {
        await db.update(users)
          .set({ updatedAt: new Date() })
          .where(eq(users.clerkId, userData.id))
        logger.log(`✅ User updated: ${userData.id}`)
        break
      }
      case "user.deleted": {
        await db.delete(users).where(eq(users.clerkId, userData.id))
        logger.log(`✅ User deleted: ${userData.id}`)
        break
      }
      default:
        logger.log(`ℹ️ Unhandled event: ${eventType}`)
    }

    return NextResponse.json({ success: true, event: eventType }, { status: 200 })
  } catch (error) {
    logger.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}

// Debug endpoint
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  const allUsers = await db.select().from(users)
  return NextResponse.json({
    count: allUsers.length,
    users: allUsers,
  })
}
