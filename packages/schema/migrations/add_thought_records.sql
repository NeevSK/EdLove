-- Add thought_records Table
-- Phase: Self Domain — Reframe (CBT thought records)
-- Description: Creates the Postgres backing table for the local-first Reframe
-- feature. Clients persist thought records to local SQLite first and sync via
-- the outbox; this table is the server-side mirror (same pattern as mood_logs).
-- RLS mirrors the ZenStack policy: users read/write only their own rows.

CREATE TABLE IF NOT EXISTS "public"."thought_records" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"          UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS "thought_records_user_created_idx"
  ON "public"."thought_records" ("user_id", "created_at");

ALTER TABLE "public"."thought_records" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "thought_records_owner_all"
  ON "public"."thought_records"
  USING ((SELECT auth.uid()) = "user_id")
  WITH CHECK ((SELECT auth.uid()) = "user_id");