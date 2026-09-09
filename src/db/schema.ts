import type { AdapterAccountType } from "next-auth/adapters";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// --- Auth.js required tables ---

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

// --- Study Hub domain tables ---

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#80aeca"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const themes = pgTable("themes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description"),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const certifications = pgTable("certifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  provider: text("provider"),
  examDate: timestamp("exam_date", { mode: "date" }),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  period: text("period").notNull().default("weekly"), // weekly | monthly | quarterly | yearly
  targetHours: real("target_hours"),
  progress: integer("progress").notNull().default(0),
  dueDate: timestamp("due_date", { mode: "date" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// certification <-> theme relation, used to derive certification progress
// and to build the annual roadmap (competências necessárias por certificação).
export const certificationThemes = pgTable(
  "certification_themes",
  {
    certificationId: uuid("certification_id")
      .notNull()
      .references(() => certifications.id, { onDelete: "cascade" }),
    themeId: uuid("theme_id")
      .notNull()
      .references(() => themes.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.certificationId, t.themeId] })]
);

// Material/recurso de estudo (biblioteca): links, cursos, livros etc.
export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  themeId: uuid("theme_id").references(() => themes.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  type: text("type").notNull().default("link"), // curso | livro | link | plataforma | artigo
  url: text("url"),
  status: text("status").notNull().default("nao_iniciado"), // nao_iniciado | em_andamento | concluido
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studySessions = pgTable("study_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  themeId: uuid("theme_id").references(() => themes.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  occurredAt: timestamp("occurred_at", { mode: "date" }).notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  themeId: uuid("theme_id").references(() => themes.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  priority: text("priority").notNull().default("media"), // alta | media | baixa
  done: boolean("done").notNull().default(false),
  dueDate: timestamp("due_date", { mode: "date" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
