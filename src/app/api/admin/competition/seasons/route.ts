import { requireAdmin } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { competitionService } from "@/services/competitionService";

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    return jsonOk(await competitionService.createSeason(body), 201);
  });
}
