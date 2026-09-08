import { auth } from "@/auth";
import { db } from "@/db";
import { themes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  if (!id) return new Response(null, { status: 400 });

  const row = await db
    .select()
    .from(themes)
    .where(eq(themes.id, id), eq(themes.userId, session.user.id));

  if (!row || row.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  return new Response(JSON.stringify(row[0]), { status: 200 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  if (!id) return new Response(null, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { name, description, progress, categoryId } = body as any;

  const values: any = {};
  if (typeof name === "string") values.name = name;
  if (typeof description === "string") values.description = description;
  if (typeof progress === "number") values.progress = progress;
  if (categoryId !== undefined) values.categoryId = categoryId;

  const result = await db
    .update(themes)
    .set(values)
    .where(eq(themes.id, id), eq(themes.userId, session.user.id))
    .returning();

  if (!result || result.length === 0) {
    return new Response(JSON.stringify({ error: "Not found or not allowed" }), { status: 404 });
  }

  return new Response(JSON.stringify(result[0]), { status: 200 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  if (!id) return new Response(null, { status: 400 });

  const result = await db
    .delete(themes)
    .where(eq(themes.id, id), eq(themes.userId, session.user.id))
    .returning();

  if (!result || result.length === 0) {
    return new Response(JSON.stringify({ error: "Not found or not allowed" }), { status: 404 });
  }

  return new Response(null, { status: 204 });
}
