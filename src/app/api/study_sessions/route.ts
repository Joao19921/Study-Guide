import { auth } from "@/auth";
import { db } from "@/db";
import { studySessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });

  const rows = await db.select().from(studySessions).where(eq(studySessions.userId, session.user.id));
  return new Response(JSON.stringify(rows), { status: 200 });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { title, durationMinutes, themeId, occurredAt } = body as any;
  if (!title || !durationMinutes) return new Response(JSON.stringify({ error: "title and durationMinutes are required" }), { status: 400 });

  const result = await db.insert(studySessions).values({ userId: session.user.id, title, durationMinutes, themeId: themeId ?? null, occurredAt: occurredAt ? new Date(occurredAt) : new Date() }).returning();
  return new Response(JSON.stringify(result[0]), { status: 201 });
}
