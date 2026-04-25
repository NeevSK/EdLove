# Inngest v4 Core-Shell Architecture

This document outlines the architectural pattern used for durable execution and background orchestration in the Polymath Platform.

## 🧱 The Core-Shell Pattern

To maintain platform-agnosticism and prevent environment leaks (e.g., exposing web API keys to mobile bundles), we use a decoupled architecture.

### 1. Sovereign Core (`@repo/core`)
- **Responsibility**: Defines the "What".
- **Exports**: Event Registry and Schemas.
- **Constraints**: Strictly NO client instantiation. No environment variable dependencies. Pure domain logic only.
- **Key File**: `packages/core/src/logic/events/schemas.ts`

### 2. Imperative Shells (`apps/*`)
- **Responsibility**: Implements the "How".
- **Behavior**: Instantiates the `Inngest` client with platform-specific transport, environment variables, and middleware.
- **Web Shell**: `apps/gurudevi-marketingWeb/src/lib/inngest.ts`
- **Mobile Shell**: `apps/gurudevi-mobile/src/lib/inngest.ts`

## 🧠 ZenStack Integration

Event payloads are strictly typed using **ZenStack v3 Zod models**. This ensures that data emitted by the client matches the database schema exactly.

### Workflow:
1. Update `schema.zmodel` in `packages/database/zenstack/schema.zmodel`.
2. Run `pnpm generate` to sync Zod models.
3. Reference the updated Zod schemas in `@repo/core/src/logic/events/schemas.ts`.

## 📱 Mobile Implementation (Emitter Client)

The mobile application acts as an **Emitter**. It does not typically serve functions (webhooks) but emits events directly to the Inngest Cloud or dev server.

- **Environment Key**: `EXPO_PUBLIC_INNGEST_EVENT_KEY`
- **Pattern**: `inngest.send({ name: 'user/created', data: payload })`

## 🌐 Web Implementation (Worker Client)

The web shell acts as both an **Emitter** and a **Worker**. It hosts the Inngest API route `/api/inngest` (or `/inngest` in Astro) to execute background functions.

- **Environment Key**: `INNGEST_EVENT_KEY`
- **Pattern**: Handles durable execution, retries, and cron jobs.

## 🛠️ Local Development

To test Inngest locally, run the Inngest CLI from the root:

```bash
# In one terminal
pnpm run dev

# In another terminal (requires inngest-cli)
inngest dev -u http://localhost:4321/api/inngest
```

---
*Created: 2026-04-24*  
*Architecture Level: Sovereign*
