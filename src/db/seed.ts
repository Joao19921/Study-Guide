import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to your .env file.");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_EMAIL = "seed-demo@studyhub.local";

async function main() {
  console.log("Seeding demo data for", DEMO_EMAIL);

  await db
    .insert(schema.users)
    .values({ id: DEMO_USER_ID, email: DEMO_EMAIL, name: "Demo Seed User", role: "admin" })
    .onConflictDoNothing();

  const [frontend, backend, cloud] = await db
    .insert(schema.categories)
    .values([
      { userId: DEMO_USER_ID, name: "Frontend", color: "#ef806e" },
      { userId: DEMO_USER_ID, name: "Backend", color: "#80aeca" },
      { userId: DEMO_USER_ID, name: "Cloud", color: "#e5b766" },
    ])
    .returning();

  const [reactTheme, sqlTheme, awsTheme] = await db
    .insert(schema.themes)
    .values([
      { userId: DEMO_USER_ID, categoryId: frontend.id, name: "React Hooks", description: "Hooks, componentes e arquitetura React", progress: 60 },
      { userId: DEMO_USER_ID, categoryId: backend.id, name: "SQL e bancos", description: "Consultas, modelagem e performance", progress: 40 },
      { userId: DEMO_USER_ID, categoryId: cloud.id, name: "AWS Fundamentals", description: "Fundamentos de cloud e serviços AWS", progress: 20 },
    ])
    .returning();

  const [certification] = await db
    .insert(schema.certifications)
    .values([{ userId: DEMO_USER_ID, name: "AWS Cloud Practitioner", provider: "AWS", examDate: new Date(Date.now() + 60 * 86400000), progress: 0 }])
    .returning();

  await db.insert(schema.certificationThemes).values([{ certificationId: certification.id, themeId: awsTheme.id }]).onConflictDoNothing();

  await db.insert(schema.resources).values([
    { userId: DEMO_USER_ID, themeId: reactTheme.id, title: "React — The Complete Guide", type: "curso", url: "https://example.com/react-course", status: "em_andamento", progress: 68 },
    { userId: DEMO_USER_ID, themeId: sqlTheme.id, title: "SQLBolt — exercícios práticos", type: "link", url: "https://sqlbolt.com", status: "em_andamento", progress: 42 },
    { userId: DEMO_USER_ID, themeId: awsTheme.id, title: "AWS Skill Builder", type: "plataforma", url: "https://skillbuilder.aws", status: "em_andamento", progress: 20 },
  ]);

  await db.insert(schema.goals).values([
    { userId: DEMO_USER_ID, title: "Estudar 12 horas esta semana", period: "weekly", targetHours: 12, dueDate: new Date(Date.now() + 7 * 86400000) },
    { userId: DEMO_USER_ID, title: "Concluir módulo de React", period: "monthly", targetHours: null, progress: 74, dueDate: new Date(Date.now() + 12 * 86400000) },
  ]);

  await db.insert(schema.tasks).values([
    { userId: DEMO_USER_ID, themeId: reactTheme.id, title: "Revisar hooks do React", subtitle: "Frontend · 45 min", priority: "alta" },
    { userId: DEMO_USER_ID, themeId: sqlTheme.id, title: "Praticar consultas SQL", subtitle: "Backend · 30 min", priority: "media" },
    { userId: DEMO_USER_ID, title: "Exercícios de TypeScript", subtitle: "Frontend · 40 min", priority: "media" },
  ]);

  await db.insert(schema.studySessions).values([
    { userId: DEMO_USER_ID, themeId: reactTheme.id, title: "Revisar hooks do React", durationMinutes: 45, occurredAt: new Date() },
    { userId: DEMO_USER_ID, themeId: sqlTheme.id, title: "Praticar consultas SQL", durationMinutes: 30, occurredAt: new Date(Date.now() - 86400000) },
  ]);

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
