import { requireAdmin } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { competitionService } from "@/services/competitionService";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    await requireAdmin();
    const { id } = await params;
    return jsonOk(await competitionService.closeSeason(id));
  });
}
