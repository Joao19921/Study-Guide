import { requireUser } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { certificationService } from "@/services/certificationService";

type Params = { params: Promise<{ id: string; themeId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const { id, themeId } = await params;
    const linkedThemes = await certificationService.unlinkTheme(id, themeId, user.id);
    return jsonOk(linkedThemes);
  });
}
