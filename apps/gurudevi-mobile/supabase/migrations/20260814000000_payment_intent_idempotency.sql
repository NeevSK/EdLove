-- Server-owned payment intents need a durable replay key. The API stores the
-- key in metadata for compatibility with the existing table shape; this
-- migration adds a generated lookup column only when the deployment supports
-- it. The handler still treats provider callbacks as a separate boundary.
create unique index if not exists payment_intents_idempotency_metadata_idx
  on public.payment_intents ((metadata->>'idempotency_key'))
  where metadata ? 'idempotency_key';
