import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { passwordResetService } from "@/services/passwordResetService";
import { passwordResetSchema } from "@/validations/passwordReset";

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    const body = passwordResetSchema.parse(await req.json());
    await passwordResetService.reset(body.token, body.password);
    return jsonOk({ success: true });
  });
}
