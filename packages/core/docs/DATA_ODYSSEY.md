# The Data Odyssey: A Sovereign Journey 🗺️

This document outlines the bidirectional flow of data within the Polymath Platform, from the physical storage in Supabase to the pixels in the Sanctuary UI.

## 1. The Architectural Pillars
The platform is built on a **Unified Authorization Fabric** that ensures security-in-depth across multiple layers.

1.  **ZenStack (The Law)**: Source of truth for models and access policies (`schema.zmodel`).
2.  **Hexagonal Architecture (The Structure)**: Decouples business logic from infrastructure via Ports and Adapters.
3.  **ReBAC (The Bonds)**: Relationship-Based Access Control defines *who* you are in relation to *what* (e.g., Teacher of School X).
4.  **Citizenship (The Persona)**: A lifecycle-based grouping of access (Wanderer, 2nd Class, 1st Class).
5.  **POA (Permission-Oriented Architecture)**: API calls are proxied and checked against **ts-rest** contracts BEFORE execution.
6.  **The Shadow DB (PowerSync)**: Local-first SQLite sync for offline-first resilience.
7.  **The Pulse (Inngest)**: Asynchronous event bus for background workflows and agentic tasks.
8.  **Agentic Sight (MCP)**: The Model Context Protocol bridge that allows AI agents to "see" and "act" within the platform safely.
9.  **The Watchtower (Sentry/PostHog)**: Unified observability for errors and behavioral signals.

---

## 2. The Outbound Journey (Database ➡️ UI)
How data is retrieved and secured for the user.

### Step 1: The Physical Guard (RLS)
The database (PostgreSQL) uses **Row Level Security**. Even if an API is compromised, the DB itself will only return rows belonging to the authenticated `auth.uid()`.

### Step 2: The Policy Wrapper (ZenStack)
The `ZenStack` generated client applies the `@@allow` rules from the ZModel. It acts as an ORM-level filter that ensures complex business rules (like "Teachers can see students in their classroom") are enforced.

### Step 3: The Identity Resolution (Adapter)
The `SupabaseIdentityAdapter` resolves the user's **Bonds** and **Citizenship**. This context is injected into the request lifecycle.

### Step 4: Data Normalization (Zod)
Before data reaches the UI, it passes through **Zod schemas**. This ensures that even if the DB contains extra "leaky" fields, only the fields defined in the public contract are sent to the device.

### Step 5: The Presentation Gate (CASL)
The UI converts Bonds into a **CASL Ability** instance. React hooks like `useAbility` use this to hide/show UI elements (buttons, tabs, screens) instantly.

---

## 3. The Inbound Journey (UI ➡️ Database)
How an action is validated and persisted.

### Step 1: The UI Spark
A user clicks "Create Post." The UI checks `ability.can('create', 'Post')` to enable the button.

### Step 2: The POA Proxy (The Interceptor)
The request hits the `POAProxy`. It looks up the **Contract Metadata** (e.g., `authority: { action: 'create', subject: 'Post' }`).
*   It calls the **Composer** to build the current user's Ability.
*   The **AuthorityInterceptor** enforces the rule. If you aren't a 1st Class citizen or don't have the Bond, the request dies here.

### Step 3: Validation (Zod)
The incoming payload is validated against the input Zod schema. This prevents injection and ensures data integrity.

### Step 4: Execution & Persistence
The core service executes the logic using the `ZenStack` client, which performs a final policy check before writing to the DB.

---

## 4. The 2026 Error Strategy (Sovereign Error)
To prevent "Schema Leakage," we use a tiered error reporting system:

| Audience | Detail Level | Purpose |
| :--- | :--- | :--- |
| **User** | Generic & Warm | "Something went wrong. We've notified the architects." |
| **Developer** | Verbose & Raw | Full stack traces, Zod issues, and SQL hints (only in `__DEV__`). |
| **AI Agent** | Semantic & Actionable | Error codes like `INSUFFICIENT_CITIZENSHIP` with a `retry_after` or `upgrade_path`. |
---

## 5. The Shadow Odyssey (Local Sync 🔄)
For a 2026 Sovereign App, "Offline" isn't an error state; it's a feature.
*   **PowerSync**: Acts as the bridge between Supabase (Postgres) and the local device (SQLite).
*   **Filtered Sync**: PowerSync only syncs the data your **Bonds** allow you to see. It respects RLS at the sync level.
*   **Latency Compensation**: When you create a post, it's written to SQLite instantly. PowerSync then handles the background "Odyssey" to the cloud.

---

## 6. The Asynchronous Pulse (Inngest & Events ⚡)
Not all data flows are immediate.
*   **Inngest**: Our event-driven workflow engine. When a `user/created` event fires, Inngest triggers the onboarding "journey."
*   **Message Bus**: Coordinates internal state updates. If a grade is published, the event bus ensures the "Student" UI updates without a refresh.

---

## 7. Agentic Sight (The MCP Bridge 🤖)
The platform is designed for both Humans and AI.
*   **MCP (Model Context Protocol)**: Exposes the platform's state and tools to AI agents.
*   **Actionable Errors**: When an agent fails a POA check, the `SovereignError` provides an `agentAction` payload, telling the agent exactly how to recover (e.g., "Request teacher bond for Classroom X").

---

## 8. The Watchtower (Observability 👁️)
*   **Sentry**: Captures the "Odyssey's" failures. It receives the `DiagnosticDetails` from `SovereignError`, allowing architects to see the raw crash while the user remains safe.
*   **PostHog**: Tracks the "Sovereignty Journey." We see how many "Wanderers" are upgrading to "2nd Class" and where the "1st Class" users are finding the most value.
