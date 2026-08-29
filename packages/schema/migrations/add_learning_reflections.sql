-- Add learning_reflections Table
-- Phase: P1 Classroom reuse / engine extraction Phase 2
-- Description: Creates the Postgres backing table for the local-first Learning
-- Reflection feature (@repo/classroom). Distinct from thought_records per the
-- approved data-model decision (classroom reflections are their own row type,
-- carrying classroom/assignment context). Same pattern as thought_records:
-- clients persist locally first and sync via outbox; this table is the
-- server-side mirror.
-- RLS mirrors the ZenStack policy: users read/write only their own rows.

CREATE TABLE IF NOT EXISTS "public"."learning_reflections" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"          UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "classroom_id"     UUID,
  "assignment_id"    UUID,
  "thought"          TEXT NOT NULL,
  "situation"        TEXT,
  "emotion"          JSONB,
  "trap_ids"         JSONB,
  "evidence_for"     TEXT,
  "evidence_against" TEXT,
  "reframe"          TEXT,
  "mood_before"      INTEGER,
  "mood_after"       INTEGER,
  "post_outcome"     TEXT,
  "follow_up"        JSONB,
  "idempotency_key"  TEXT UNIQUE,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "learning_reflections_user_created_idx"
  ON "public"."learning_reflections" ("user_id", "created_at");

CREATE INDEX IF NOT EXISTS "learning_reflections_classroom_created_idx"
  ON "public"."learning_reflections" ("classroom_id", "created_at");

ALTER TABLE "public"."learning_reflections" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learning_reflections_owner_all"
  ON "public"."learning_reflections"
  USING ((SELECT auth.uid()) = "user_id")
  WITH CHECK ((SELECT auth.uid()) = "user_id");