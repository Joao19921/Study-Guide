import { z } from "zod";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { bootstrapRecoveryService } from "@/services/bootstrapRecoveryService";

const schema = z.object({
  code: z.string().min(1),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    const body = schema.parse(await req.json());
    await bootstrapRecoveryService.reset(body.password, body.code);
    return jsonOk({ success: true });
  });
}
