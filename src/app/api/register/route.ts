import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, normalizeEmail } from "@/lib/password";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80),
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(128),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }

    const email = normalizeEmail(parsed.data.email);
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) return Response.json({ error: "Já existe uma conta com este e-mail." }, { status: 409 });

    const [user] = await db.insert(users).values({
      name: parsed.data.name,
      email,
      passwordHash: hashPassword(parsed.data.password),
    }).returning({ id: users.id, email: users.email });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Registration error", error);
    return Response.json({ error: "Não foi possível criar a conta agora." }, { status: 500 });
  }
}
