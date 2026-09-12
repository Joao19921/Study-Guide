import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminPanel from "@/components/admin/AdminPanel";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  return <AdminPanel />;
}
