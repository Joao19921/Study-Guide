import { requireAdmin } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { passwordResetService } from "@/services/passwordResetService";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  return withApiErrorHandling(async () => {
    const admin = await requireAdmin();
    const { id } = await params;
    const result = await passwordResetService.createAdminReset(id, admin.id);
    return jsonOk({ resetToken: result.token, expiresAt: result.expiresAt });
  });
}
