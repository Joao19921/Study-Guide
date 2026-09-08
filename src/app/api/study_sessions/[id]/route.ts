import { auth } from "@/auth";
import { db } from "@/db";
import { studySessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  if (!id) return new Response(null, { status: 400 });

  const row = await db.select().from(studySessions).where(eq(studySessions.id, id), eq(studySessions.userId, session.user.id));
  if (!row || row.length === 0) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  return new Response(JSON.stringify(row[0]), { status: 200 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  if (!id) return new Response(null, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { title, durationMinutes, themeId, occurredAt } = body as any;
  const values: any = {};
  if (typeof title === "string") values.title = title;
  if (typeof durationMinutes === "number") values.durationMinutes = durationMinutes;
  if (themeId !== undefined) values.themeId = themeId;
  if (occurredAt !== undefined) values.occurredAt = occurredAt ? new Date(occurredAt) : null;

  const result = await db.update(studySessions).set(values).where(eq(studySessions.id, id), eq(studySessions.userId, session.user.id)).returning();
  if (!result || result.length === 0) return new Response(JSON.stringify({ error: "Not found or not allowed" }), { status: 404 });
  return new Response(JSON.stringify(result[0]), { status: 200 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  if (!id) return new Response(null, { status: 400 });

  const result = await db.delete(studySessions).where(eq(studySessions.id, id), eq(studySessions.userId, session.user.id)).returning();
  if (!result || result.length === 0) return new Response(JSON.stringify({ error: "Not found or not allowed" }), { status: 404 });
  return new Response(null, { status: 204 });
}
