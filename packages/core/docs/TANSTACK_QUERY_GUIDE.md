# TanStack Query (v5) Architectural Guidelines

## 1. Governance & Versioning
*   **Version Pinning**: The Polymath Platform strictly uses **TanStack Query v5** (`^5.90.20`).
*   **Single Source of Truth**: All domain-specific query hooks MUST live in `@repo/core/api/hooks`.
*   **Version Parity**: Any package using TanStack Query must align its `package.json` with `@repo/core` to prevent multiple versions in the bundle.

## 2. Modern v5 Patterns (Mandatory)

### 2.1 Object Syntax
All hooks must use the **Object Syntax**. Passing separate arguments (e.g., `useQuery(key, fn)`) is a legacy anti-pattern.

```typescript
// ✅ CORRECT (v5 Object Syntax)
const { data } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
  staleTime: 5 * 60 * 1000,
});

// ❌ INCORRECT (Legacy v4/v3 patterns)
const { data } = useQuery(['user', id], () => fetchUser(id));
```

### 2.2 Query Key Factories
All Query Keys must be generated via a centralized factory to ensure cache consistency and prevent manual string typo bugs.

```typescript
// @repo/core/api/hooks/keys.ts
export const communityKeys = {
  all: ['community'] as const,
  posts: (groupId: string) => [...communityKeys.all, 'posts', groupId] as const,
  comments: (postId: string) => [...communityKeys.all, 'comments', postId] as const,
};
```

### 2.3 Explicit Transitions (Mutations)
Use `useMutation` for any side-effect causing write operations. **Never** put write logic inside a `useQuery` or a `useEffect`.

```typescript
// ✅ CORRECT
const mutation = useMutation({
  mutationFn: (newPost) => api.createPost(newPost),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: communityKeys.all });
  },
});
```

## 3. Legacy Anti-Patterns (Forbidden)

### 3.1 useEffect Fetching
**Forbidden**: Fetching data inside `useEffect` and manually setting state.
*   *Why*: Causes race conditions, double-fetching, and bypasses the global cache.
*   *Remedy*: Use `useQuery` or `useSuspenseQuery`.

### 3.2 Sync-Effects (setState in success)
**Forbidden**: Using `onSuccess` or `useEffect` to copy query data into a local `useState`.
*   *Why*: Creates a second "ghost" source of truth that inevitably de-syncs.
*   *Remedy*: Consume `data` directly from the hook. Use `select` transform if data needs normalization.

### 3.3 Manual Loading/Error States
**Forbidden**: Creating manual `[isLoading, setIsLoading] = useState(true)` blocks for fetch operations.
*   *Why*: TanStack Query already provides derived, reactive status flags.
*   *Remedy*: Destructure `{ isPending, isError, data }` from the hook.

## 4. Platform Sovereignty (Native vs. Web)
*   **NetInfo Integration**: In mobile environments, hooks should respect the `onlineManager` to pause/resume queries based on connectivity.
*   **Persistence**: Critical server state should be persisted using `@tanstack/react-query-persist-client` with the `MMKV` storage adapter for sub-1ms re-hydration on mobile.

---
**Document Status**: 2026-04-28 - Zero-Legacy Enforced.
