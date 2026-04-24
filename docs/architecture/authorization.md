# Authorization Flow & Responsibilities

This document details the five-layer authorization flow in the Gurudevi platform.

## 1. The Five Layers

### Layer 1: IdentityAPI (Authentication)
- **Responsibility**: Manages user identity, authentication, and session management.
- **Output**: Issues a JWT containing basic user identity and claims.

### Layer 2: BFF (Backend-for-Frontend)
- **Responsibility**: Token validation and ability serialization.
- **Action**: On authentication, fetches the user's full permission set from ZenStack policies and serializes it as a CASL-compatible payload.
- **Delivery**: Passes the permission payload to the client.

### Layer 3: CASL (Client-side Authorization)
- **Responsibility**: UI/UX control and offline security.
- **Logic**: Uses the permission payload from the BFF to enable/disable UI elements via `ability.can()`.
- **Capability**: Must work without network access to support teacher offline workflows.

### Layer 4: ZenStack v3 (Server-side Authorization)
- **Responsibility**: Transparent query enforcement and data-level security.
- **Implementation**: Access policies are embedded in the `ZModel` schema.
- **Mechanism**: All server queries run through a ZenStack enhanced Prisma client that automatically filters data based on user context.

### Layer 5: Supabase RLS (Database Defense in Depth)
- **Responsibility**: Final line of defense.
- **Implementation**: Row Level Security policies in PostgreSQL.
- **Consistency**: RLS should mirror core data access rules defined in ZenStack for maximum security.

## 2. Shared Logic
- **Single Source of Truth**: All permissions are derived from Zod schemas and ZModel definitions.
- **Rule over Role**: Permissions are checked against specific actions and subjects (e.g., `can update Lesson`), not raw roles.
