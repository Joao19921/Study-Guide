import { requireUser } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { certificateService } from "@/services/certificateService";

export async function GET() {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    return jsonOk(await certificateService.listMine(user.id));
  });
}

export async function POST(req: Request) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    return jsonOk(await certificateService.create(user.id, body), 201);
  });
}
