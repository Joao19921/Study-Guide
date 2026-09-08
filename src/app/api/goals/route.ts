import { auth } from "@/auth";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });

  const rows = await db.select().from(goals).where(eq(goals.userId, session.user.id));
  return new Response(JSON.stringify(rows), { status: 200 });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { title, period, targetHours, dueDate } = body as any;
  if (!title) return new Response(JSON.stringify({ error: "title is required" }), { status: 400 });

  const result = await db.insert(goals).values({ userId: session.user.id, title, period: period ?? "weekly", targetHours: targetHours ?? null, dueDate: dueDate ? new Date(dueDate) : null }).returning();
  return new Response(JSON.stringify(result[0]), { status: 201 });
}
