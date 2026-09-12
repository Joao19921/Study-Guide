ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "active" boolean NOT NULL DEFAULT true;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "must_change_password" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deactivated_at" timestamp;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp NOT NULL DEFAULT now();
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "completed_at" timestamp;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "certificates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "provider" text,
  "credential_url" text,
  "issued_at" timestamp NOT NULL,
  "verified" boolean NOT NULL DEFAULT false,
  "points" integer NOT NULL DEFAULT 100,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "verified_at" timestamp,
  "verified_by" uuid REFERENCES "users"("id") ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "competition_seasons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "starts_at" timestamp NOT NULL,
  "ends_at" timestamp NOT NULL,
  "status" text NOT NULL DEFAULT 'scheduled',
  "created_at" timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "competition_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "season_id" uuid NOT NULL REFERENCES "competition_seasons"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "score" integer NOT NULL,
  "position" integer NOT NULL,
  "certificates" integer NOT NULL DEFAULT 0,
  "performance_points" integer NOT NULL DEFAULT 0,
  "certificate_points" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "competition_results_season_user_unique" UNIQUE ("season_id", "user_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "certificates_user_id_idx" ON "certificates" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "competition_results_season_score_idx" ON "competition_results" ("season_id", "score" DESC);
