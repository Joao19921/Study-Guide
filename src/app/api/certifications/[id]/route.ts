import { auth } from "@/auth";
import { db } from "@/db";
import { certifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  if (!id) return new Response(null, { status: 400 });

  const row = await db.select().from(certifications).where(eq(certifications.id, id), eq(certifications.userId, session.user.id));
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
  const { name, provider, examDate, progress } = body as any;
  const values: any = {};
  if (typeof name === "string") values.name = name;
  if (typeof provider === "string") values.provider = provider;
  if (examDate !== undefined) values.examDate = examDate ? new Date(examDate) : null;
  if (typeof progress === "number") values.progress = progress;

  const result = await db.update(certifications).set(values).where(eq(certifications.id, id), eq(certifications.userId, session.user.id)).returning();
  if (!result || result.length === 0) return new Response(JSON.stringify({ error: "Not found or not allowed" }), { status: 404 });
  return new Response(JSON.stringify(result[0]), { status: 200 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  if (!id) return new Response(null, { status: 400 });

  const result = await db.delete(certifications).where(eq(certifications.id, id), eq(certifications.userId, session.user.id)).returning();
  if (!result || result.length === 0) return new Response(JSON.stringify({ error: "Not found or not allowed" }), { status: 404 });
  return new Response(null, { status: 204 });
}
