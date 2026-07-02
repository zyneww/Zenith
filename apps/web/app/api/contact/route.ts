import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const MAX_NAME_LEN = 100;
const MAX_SUBJECT_LEN = 200;
const MAX_MESSAGE_LEN = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > MAX_NAME_LEN) return null;
  // Allow letters, spaces, hyphens, apostrophes and common punctuation
  if (!/^[\p{L}\p{M}\s'\-'.]+$/u.test(trimmed)) return null;
  return trimmed;
}

function sanitizeSubject(subject: unknown): string | null {
  if (typeof subject !== "string") return null;
  const trimmed = subject.trim();
  if (!trimmed || trimmed.length > MAX_SUBJECT_LEN) return null;
  // Reject control characters and newlines that could be used for header injection
  if (/[\r\n\x00-\x08\x0B\x0C\x0E-\x1F]/.test(trimmed)) return null;
  return trimmed;
}

function sanitizeMessage(message: unknown): string | null {
  if (typeof message !== "string") return null;
  const trimmed = message.trim();
  if (!trimmed || trimmed.length > MAX_MESSAGE_LEN) return null;
  return trimmed;
}

function sanitizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || trimmed.length > 254 || !EMAIL_REGEX.test(trimmed)) return null;
  // Prevent header injection
  if (/[\r\n\s]/.test(trimmed)) return null;
  return trimmed;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const rl = await rateLimit(`contact:${ip}`, {
    maxRequests: 3,
    windowMs: 60_000,
    keyPrefix: "ratelimit:contact",
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const raw = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const name = sanitizeName(raw.name);
  const email = sanitizeEmail(raw.email);
  const subject = sanitizeSubject(raw.subject);
  const message = sanitizeMessage(raw.message);

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: "Email not configured" }, { status: 503 });
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Use a fixed reply-to so the message cannot be used to spoof the sender
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);

  try {
    await resend.emails.send({
      from: "Zenith <team@zenith.xyz>",
      to: "team@zenith.xyz",
      replyTo: "support@zenith.xyz",
      subject: `[CONTACT] ${subject}`,
      text: `Nom: ${name}\nEmail: ${email}\nSujet: ${subject}\n\n${message}`,
      html: `<h1>Nouveau message de contact</h1><p><b>Nom:</b> ${safeName}</p><p><b>Email:</b> ${safeEmail}</p><p><b>Sujet:</b> ${safeSubject}</p><p><b>Message:</b></p><p>${safeMessage.replace(/\n/g, "<br>")}</p>`,
    });
    return NextResponse.json({ ok: true, message: "Message envoyé" });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ ok: false, error: "resend_failed", detail }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
