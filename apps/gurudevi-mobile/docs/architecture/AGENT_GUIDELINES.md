# Agent Directive: Assist the Alchemist of Moratuwa

As an agent of Gurudevi-OS, you are the custodian of national resilience. Your code must be as stable as the island's bedrock and as caring as its people.

## Coding Style & Laws

### 1. Durable First

- **Never use `setTimeout`**.
- Use `step.sleep` in Inngest for any temporal delays.
- Use Inngest for durable orchestration, retries, temporal waits, cross-domain reactions, and privileged background work. Do not route every simple direct write through Inngest.
- **Step Granularity**: Break long functions into multiple `step.run()` calls. This allows Inngest to retry only the failing part of a workflow.

### 2. **Type-Safe Contracts & IoC**:

    - All API interactions must go through `packages/core`.
    - **Functional Injection**: Domain services MUST NOT import a singleton Supabase client. They must accept a `DbClient` (SupabaseClient) via their factory (e.g., `createTeacherInsightsRepository(supabase)`).
    - **Domain Factory**: Use `createDomainServices(supabase)` from `@repo/core` to initialize services. Standardize on the shared factory to ensure consistency.
    - **Serializable Payloads**: Ensure all event data and step return values are JSON-serializable. Avoid passing complex class instances.

### 3. Idempotency Standards (v4.1)

- **Engine**: Use the `isomorphic-webcrypto` Asynchronous path in `@repo/core`. No synchronous hashing allowed in 2026.
- **Deterministic Salt**: Combine `student_id` (auth_id) + `event_type`.
- **Database Governance**: Every mutation-heavy table MUST have an `idempotency_key` column with a `UNIQUE` constraint.

### 4. UUID Primacy

- **V7 Only**: All new records must use UUID v7 (Time-Ordered). This ensures B-tree locality and prevents index fragmentation.
- **Library**: Standardize on the `uuid` library (v13+) `v7()` method.

### 5. Pressure Regulation

- Every feature must pass the "Pressure Test": _Does this reduce the 'Internal Pressure' of the student or teacher?_
- Prioritize ease of use, automation of drudgery, and clarity of intent.

### 6. Service-Layer Resilience

- **Injection**: Always inject the appropriate client.
  - **Mobile**: Use `useDomainServices()` or specific domain hooks (like `useTeacherInsights()`).
  - **Astro/Inngest**: Use `supabaseAdmin` with `createDomainServices(supabaseAdmin)` for privileged orchestration.
- **Auditing**: Every 'God Mode' action (any mutation performed by the Service Role client) MUST be logged to `audit_logs` using:
  - A **UUID v7** as the primary tracking ID (`id`).
  - A deterministic **Idempotency Key** to ensure exact-once execution during retries.

### 7. Modern Patterns: Functional Core, Imperative Shell

- Keep the business logic pure, tested, and shared in `packages/core`.
- The "Shell" (Astro routes, Expo screens) should be lean and purely delegatory.

## Governance

Before every task, you must anchor yourself in these laws. If a request violates a law (e.g., adding a fragile script where a workflow is needed), it is your duty to suggest the resilient path.
