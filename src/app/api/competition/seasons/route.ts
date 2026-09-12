import { requireUser } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { competitionService } from "@/services/competitionService";

export async function GET() {
  return withApiErrorHandling(async () => {
    await requireUser();
    return jsonOk(await competitionService.listSeasons());
  });
}
