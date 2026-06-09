import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
const DATA_DIR = join(process.cwd(), "data");
const USERS_FILE = join(DATA_DIR, "users.json");

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  portfolioBalance: number;
  isActive: boolean;
}

interface UsersDB {
  users: Record<string, UserData>;
  lastUpdated: string;
}

function ensureDB(): UsersDB {
  if (!existsSync(DATA_DIR)) {
    require("fs").mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(USERS_FILE)) {
    const initial: UsersDB = { users: {}, lastUpdated: new Date().toISOString() };
    writeFileSync(USERS_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(readFileSync(USERS_FILE, "utf-8"));
}

function saveDB(db: UsersDB) {
  db.lastUpdated = new Date().toISOString();
  writeFileSync(USERS_FILE, JSON.stringify(db, null, 2));
}

function createUser(userData: any): UserData {
  return {
    id: userData.id,
    email: userData.email_addresses?.[0]?.email_address || "",
    firstName: userData.first_name || undefined,
    lastName: userData.last_name || undefined,
    imageUrl: userData.image_url || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    portfolioBalance: 10000, // Balance initiale par défaut
    isActive: true,
  };
}

function updateUser(existing: UserData, userData: any): UserData {
  return {
    ...existing,
    email: userData.email_addresses?.[0]?.email_address || existing.email,
    firstName: userData.first_name || existing.firstName,
    lastName: userData.last_name || existing.lastName,
    imageUrl: userData.image_url || existing.imageUrl,
    updatedAt: new Date().toISOString(),
  };
}

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const payload = await req.text();
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const eventType = evt.type;
  const userData = evt.data;

  console.log(`Webhook received: ${eventType} for user ${userData.id}`);

  const db = ensureDB();

  try {
    switch (eventType) {
      case "user.created": {
        const user = createUser(userData);
        db.users[user.id] = user;
        console.log(`✅ User created: ${user.email} (${user.id})`);
        break;
      }
      case "user.updated": {
        const existing = db.users[userData.id];
        if (existing) {
          db.users[userData.id] = updateUser(existing, userData);
          console.log(`✅ User updated: ${userData.id}`);
        } else {
          // User doesn't exist, create it
          db.users[userData.id] = createUser(userData);
          console.log(`✅ User created (from update): ${userData.id}`);
        }
        break;
      }
      case "user.deleted": {
        if (db.users[userData.id]) {
          db.users[userData.id].isActive = false;
          db.users[userData.id].updatedAt = new Date().toISOString();
          console.log(`✅ User soft-deleted: ${userData.id}`);
        }
        break;
      }
      default:
        console.log(`ℹ️ Unhandled event: ${eventType}`);
    }

    saveDB(db);
    return NextResponse.json({ success: true, event: eventType }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

// Endpoint pour récupérer les utilisateurs (pour debug)
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const db = ensureDB();
  return NextResponse.json({
    count: Object.keys(db.users).length,
    users: db.users,
    lastUpdated: db.lastUpdated,
  });
}
