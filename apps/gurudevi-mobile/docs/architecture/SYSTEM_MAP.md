# Gurudevi OS - System Map (April 2026)

## From "Backendless" to "Durable"

Gurudevi started as a passive **BaaS** (Backend as a Service) using Supabase and ZenStack. While this provided excellent memory and real-time syncing, it lacked a proactive "Will"—a way to ensure complex, multi-step operations completed successfully regardless of client connectivity or server crashes.

### The New Architecture: Durable Execution

We are augmenting our stack with **Inngest** to enable **Durable Execution**.

#### 1. The Sensing Layer (React Native / Expo)
The mobile app remains the primary interface. It emits **Events** (Intents) rather than just making CRUD requests.

#### 2. The Orchestration Layer (Astro SSR in `apps/marketingWeb`)
Instead of a separate heavyweight backend, we use our Astro project to serve as the brain. It hosts:
- **Inngest Serve Endpoint**: The gateway for the Inngest runner to trigger functions.
- **Background Workers**: Functions that coordinate business logic across services.

#### 3. Shared Logic (`packages/core`)
All validation, schemas, and core services reside here. Both the "Sensing Layer" and the "Orchestration Layer" consume the same source of truth.

#### 4. The Memory (Supabase)
Used for state persistence. Inngest workers interact with Supabase using the shared core client.

### Key Workflows
- **Trigger**: Client sends an event (e.g., `student.pulse.checked`).
- **Orchestrate**: Inngest picks up the event and runs the workflow in Astro.
- **Ensure**: Even if the network drops or the Astro instance restarts, Inngest resumes the workflow exactly where it left off.
