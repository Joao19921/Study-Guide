import { ZodError } from "zod";
import { ApiError } from "./api-error";

export function jsonOk(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function jsonNoContent() {
  return new Response(null, { status: 204 });
}

/**
 * Route handlers stay thin: call a service inside this wrapper so every
 * ApiError/ZodError maps to a consistent response instead of leaking
 * stack traces or raw DB errors to clients.
 */
export async function withApiErrorHandling(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json({ error: error.message, details: error.details }, { status: error.status });
    }
    if (error instanceof ZodError) {
      return Response.json({ error: "Validation failed", details: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
