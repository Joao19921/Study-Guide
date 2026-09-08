import { auth } from "@/auth";
import { db } from "@/db";
import { certifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });

  const rows = await db.select().from(certifications).where(eq(certifications.userId, session.user.id));
  return new Response(JSON.stringify(rows), { status: 200 });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { name, provider, examDate } = body as any;
  if (!name) return new Response(JSON.stringify({ error: "name is required" }), { status: 400 });

  const result = await db.insert(certifications).values({ userId: session.user.id, name, provider: provider ?? null, examDate: examDate ? new Date(examDate) : null }).returning();
  return new Response(JSON.stringify(result[0]), { status: 201 });
}
