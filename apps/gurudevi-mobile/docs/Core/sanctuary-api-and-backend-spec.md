---
title: "Sanctuary API and Backend Spec"
status: "active"
created: 2026-06-09
updated: 2026-06-09
author: "Naveen"
scribe: "Antigravity"
tags: [technical, api, backend, hono, mcp]
---

# Sanctuary API and Backend Spec

This document details the backend architectural specifications, schema-first design, and API gateway mechanisms for Gurudevi.

---

## 1. Type-Safe Hono API Gateway

The Gurudevi backend (Sanctuary API) is built on Hono to deliver lightweight, ultra-fast routing across both serverless edge functions and node environments.

* **Dynamic OpenAPI Generation**: All route handlers are declared using `@hono/zod-openapi` instead of standard Hono routing. This guarantees that API implementations and OpenAPI v3 documentation remain perfectly synchronized.
* **Auto-generated Clients**: The generated OpenAPI schemas are compiled into type-safe SDK clients for consumption in the Expo/React Native mobile app and the Astro/React web app.
* **Middleware Stack**:
  * **Authentication**: Verifies Supabase JWTs and extracts tenant/user claims.
  * **Rate Limiting**: IP and token-bucket based limiting.
  * **Idempotency Check**: Middleware that reads client transaction keys from the header (`X-Idempotency-Key`) to prevent double-writes.

---

## 2. ZenStack & Zod v4 Schema Validation

Data modeling and database-level security policies are managed using a schema-first approach via ZenStack.

* **Prisma Schema Extension**: ZenStack extends standard Prisma schemas (`schema.zmodel`) with access control policies directly on the model definitions.
* **Zod v4 Schema Generation**: ZenStack compiles the `.zmodel` definition to output type-safe Zod v4 schemas.
* **Validation Runtime**:
  * Incoming client payloads are validated against the generated Zod v4 schemas at the Hono routing boundary before hitting service layers.
  * Security policies defined in ZenStack are enforced automatically inside the database client wrapper based on the session's active security context.

---

## 3. Model Context Protocol (MCP) Integration

To enable agentic AI integration (allowing localized agents to execute tool calls on behalf of users or orchestrators):

* **Hono MCP Host**: The Sanctuary API exposes a standard MCP (Model Context Protocol) endpoint.
* **Tool Registration**: Backend services can decorate normal service methods to register them as MCP tools. The Hono server automatically compiles and publishes these tools to authorized agent connections.
* **Agent Context & Security**:
  * MCP connections must carry valid authorization headers.
  * Tool executions run under the exact security context of the authenticated user, inheriting Cedar ReBAC policies.

---

## 4. API Boundaries Supporting Offline Synchronization

While synchronization logic is handled by the client-side PowerSync engine and local SQLite storage, the backend exposes specialized boundaries to support offline requirements:

* **Idempotent Queue Ingest**: Ingestion endpoints accept batched mutation arrays from the client sync queue. Success results are cached against the transaction keys for quick replays.
* **Soft Deletes Propagation**: Databases handle soft-deletes via a dedicated column. Query builders automatically filter these out for standard endpoints, but sync projection channels explicitly yield records with `is_deleted = true` to allow clients to clean up local SQLite storage.
* **Temporal Tracking**: Tables preserve the `occurred_at` (event timestamp) alongside standard `updated_at` timestamps to allow conflict-free temporal Last-Write-Wins evaluations.
