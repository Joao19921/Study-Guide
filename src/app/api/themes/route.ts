import { auth } from "@/auth";
import { db } from "@/db";
import { themes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });
  }

  const rows = await db.select().from(themes).where(eq(themes.userId, session.user.id));
  return new Response(JSON.stringify(rows), { status: 200 });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, description, categoryId } = body as {
    name?: string;
    description?: string;
    categoryId?: string | null;
  };

  if (!name) {
    return new Response(JSON.stringify({ error: "name is required" }), { status: 400 });
  }

  const result = await db
    .insert(themes)
    .values({
      userId: session.user.id,
      name,
      description: description ?? null,
      categoryId: categoryId ?? null,
    })
    .returning();

  return new Response(JSON.stringify(result[0]), { status: 201 });
}
