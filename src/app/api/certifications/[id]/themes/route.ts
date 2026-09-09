import { requireUser } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { certificationService } from "@/services/certificationService";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const linkedThemes = await certificationService.linkTheme(id, user.id, body);
    return jsonOk(linkedThemes, 201);
  });
}
