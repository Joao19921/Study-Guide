import { auth } from "@/auth";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });

  const rows = await db.select().from(categories).where(eq(categories.userId, session.user.id));
  return new Response(JSON.stringify(rows), { status: 200 });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { name, color } = body as { name?: string; color?: string };
  if (!name) return new Response(JSON.stringify({ error: "name is required" }), { status: 400 });

  const result = await db.insert(categories).values({ userId: session.user.id, name, color: color ?? "#80aeca" }).returning();
  return new Response(JSON.stringify(result[0]), { status: 201 });
}
