import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const startedAt = Date.now();

export async function GET() {
  const checks = {
    application: { status: "ok" as const },
    database: { status: "unknown" as "ok" | "error" | "unknown" },
  };

  try {
    await db.execute(sql`select 1`);
    checks.database.status = "ok";
  } catch (error) {
    console.error("[health] database check failed", error);
    checks.database.status = "error";
  }

  const healthy = checks.database.status === "ok";

  return Response.json(
    {
      status: healthy ? "ok" : "degraded",
      service: "study-guide",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      checks,
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
