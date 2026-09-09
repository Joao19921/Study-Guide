import { requireUser } from "@/lib/auth-guard";
import { jsonOk, withApiErrorHandling } from "@/lib/api-response";
import { searchService } from "@/services/searchService";

export async function GET(req: Request) {
  return withApiErrorHandling(async () => {
    const user = await requireUser();
    const query = new URL(req.url).searchParams.get("q") ?? "";
    const results = await searchService.search(user.id, query);
    return jsonOk(results);
  });
}
