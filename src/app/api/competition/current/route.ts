import { requireUser } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { competitionService } from "@/services/competitionService";

export async function GET() {
  return withApiErrorHandling(async () => {
    await requireUser();
    const season = await competitionService.getCurrentSeason();
    return jsonOk(season);
  });
}
