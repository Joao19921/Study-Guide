import { auth } from "@/auth";
import { ApiError } from "./api-error";

export type AuthenticatedUser = {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
};

export async function requireUser(): Promise<AuthenticatedUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError(401, "Unauthenticated");
  }
  return session.user as AuthenticatedUser;
}

export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new ApiError(403, "Forbidden: admin role required");
  }
  return user;
}
