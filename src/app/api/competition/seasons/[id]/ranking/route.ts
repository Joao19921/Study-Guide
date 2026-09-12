import { requireUser } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { competitionService } from "@/services/competitionService";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    await requireUser();
    const { id } = await params;
    return jsonOk(await competitionService.ranking(id));
  });
}
