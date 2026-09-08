import { auth } from "@/auth";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });
  }

  const rows = await db.select().from(tasks).where(eq(tasks.userId, session.user.id));
  return new Response(JSON.stringify(rows), { status: 200 });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { title, subtitle, priority, themeId, dueDate } = body as any;

  if (!title) {
    return new Response(JSON.stringify({ error: "title is required" }), { status: 400 });
  }

  const result = await db
    .insert(tasks)
    .values({
      userId: session.user.id,
      title,
      subtitle: subtitle ?? null,
      priority: priority ?? "media",
      themeId: themeId ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
    })
    .returning();

  return new Response(JSON.stringify(result[0]), { status: 201 });
}
