---
title: "Offline-First Architecture & Synchronization"
status: "active"
created: 2026-02-25
updated: 2026-02-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Offline-First Architecture & Synchronization
**Date:** 2026-02-15
**Status:** Implemented (Phase 8)

## Overview
This document details the "Offline First" architecture implemented for the Gurudevi Mobile application. The goal is to ensure **zero data loss** when users perform actions while offline or with unstable connectivity. We utilize a persistent "Outbox" pattern to queue mutations and replay them when connectivity is restored.

## Architecture Components

### 1. Mutation Queue (The Outbox)
- **File**: `src/lib/sync/useMutationQueue.ts`
- **Technology**: Zustand + `SafeZustandStorage` (MMKV/AsyncStorage).
- **Purpose**: Persists a list of pending actions to disk.
- **Structure**: Each queued item consists of:
  - `id`: Unique UUID.
  - `name`: Mutation key (e.g., `'createPost'`).
  - `variables`: The data payload for the API call.
  - `type`: Action type (`CREATE`, `UPDATE`, `DELETE`).
  - `scope`: Feature scope (e.g., `community`).
  - `timestamp`: When the action occurred.
  - `retryCount`: Number of failed sync attempts.

### 2. Synchronization Manager (The Orchestrator)
- **File**: `src/lib/sync/SyncManager.tsx`
- **Type**: Headless React Component (mounted in `App.tsx`).
- **Function**: 
  - Monitors network status (`NetInfo`) and queue state.
  - When **Online** AND **Queue > 0**:
    - Iterates through the queue sequentially.
    - Looks up the executable function in the `MUTATION_REGISTRY`.
    - Executes the API call.
    - **Success**: Removes the item from the queue and notifies the user.
    - **Failure**: Increments `retryCount`. If `retryCount >= 3`, discards the item (poison pill protection) and notifies the user.

### 3. Mutation Registry (The Map)
- **File**: `src/lib/sync/registry.ts`
- **Purpose**: Maps string keys (stored in the queue) to actual asynchronous API functions. This prevents serialization issues since functions cannot be stored in JSON.
- **Examples**:
  - `'createPost'` -> `api.community.createPost`
  - `'createprospect'` -> `api.school.createProspect`

### 4. Resilient Hook (The Interface)
- **File**: `src/hooks/useSafeMutation.ts`
- **Usage**: Replaces standard `useMutation`.
- **Logic**:
  1. **Optimistic Update**: Runs `onMutate` immediately.
  2. **Network Check**: 
     - If **Offline**: Adds to `MutationQueue`, returns `null`, and triggers `onSuccess` (Optimistic Success).
     - If **Online**: Attempts the API call.
  3. **Error Handling**:
     - If the API call fails due to network issues, it falls back to the `MutationQueue`.
     - Returns optimistic success to keep the UI responsive.

## UI Feedback
- **Banner**: `NetworkStatusBanner` shows:
  - **Red**: Offline + Count of pending items.
  - **Blue/Saffron**: Syncing... + Count of remaining items.
- **Toasts**: Notifies the user when items are saved to the Outbox and when they are successfully synced.

## Development Workflow
To add a new offline-capable feature:
1. **Define API**: Ensure the API function is in `src/lib/api`.
2. **Register**: Add the function to `MUTATION_REGISTRY` in `src/lib/sync/registry.ts` with a unique key.
3. **Use Hook**: In your component, use `useSafeMutation`:
   ```typescript
   const { mutate } = useSafeMutation(api.myFeature.createThing, {
       mutationKey: 'createThing', // Must match Registry
       scope: 'myFeature',
       onSuccess: () => { /* Update UI */ }
   });
   ```

## Next Steps
- **Conflict Resolution**: Currently, "last write wins". Future improvements could include version checking or server-side merging.
- **Background Sync**: Implementing `expo-background-fetch` to sync even when the app is backgrounded.
