---
title: Library read procedures oRPC cutover
status: implemented
date: 2026-07-30
scope: sanctuary-api, packages/library, packages/core
---

# Decision

The library resource and collection read paths use the native oRPC procedures as their source of truth:

- `library.getResources`
- `library.getResource`
- `library.searchLibrary`
- `library.getCollections`
- `library.getCollection`

The library package keeps its existing UI-facing method names and richer local types, but delegates these operations to the shared `@repo/core` oRPC client. This keeps React Query keys and screens stable while removing direct Supabase reads from the active read path.

The active mutation paths now also use native oRPC:

- `library.createResource`
- `library.createCollection`
- `library.addToCollection`
- `library.engage` for views, uses, endorsements, and bookmarks

Engagement toggles are handled transactionally by the server and derive the actor from the authenticated context.

# Why this slice

The API already had explicit DTOs and handlers for the reads, and the mutation additions now cover the active UI callers. This is a bounded vertical cutover that can be verified through native oRPC HTTP tests. Resource update/delete, collection editing beyond creation and membership addition, topology, temporal reconstruction, and bookmarked-resource queries remain tracked as follow-up work instead of being silently approximated.

# Tradeoffs

- The adapter maps strict server DTOs into the library package's richer view model, supplying presentation defaults for fields not yet owned by the API contract.
- The adapter forwards only contract-supported filters. Temporal, visibility, source, and advanced ranking filters remain on the legacy path until their semantics are added to the contract.
- This is an in-place caller cutover; the old implementation remains temporarily only for unsupported methods.

# Verification

The API contract suite must pass in both Node and Bun. Package-level typecheck remains separately tracked because the workspace currently has pre-existing export and UI type errors outside this slice.
