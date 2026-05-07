# ⚡ FlashList v2: The Sovereign Performance Standard (2026)

> **Project Version:** `2.0.2` (Verified)
> **Architecture:** New Architecture (Fabric/TurboModules)

## 📊 V1 vs. V2: The Paradigm Shift

| Feature | FlashList v1 (Legacy) | FlashList v2 (Sovereign) |
| :--- | :--- | :--- |
| **Engine** | Async Bridge (Old) | **Synchronous New Arch (Fabric)** |
| **Sizing** | Manual (`estimatedItemSize`) | **Automatic** (Removed estimation) |
| **Implementation** | Hybrid (Native + JS) | **JS-Only (High Fidelity)** |
| **Scroll Guard** | `maintainVisibleContentPosition` (Optional) | **Default** (Chat-ready out-of-the-box) |
| **Masonry** | `MasonryFlashList` component | `masonry` prop on standard `FlashList` |

---

## 💎 Elite Patterns (Best Practices)

### 1. Kill the Estimates
In v2, **do not provide `estimatedItemSize`**. The new engine calculates this synchronously. Providing it is redundant and can occasionally conflict with the new auto-layout logic.

### 2. Strict Memoization
Because v2 is synchronous, any render lag directly impacts the UI thread (no more "blank cells" but instead potential frame drops).
- **Pattern:** Use `React.memo` on all `renderItem` components.
- **Pattern:** Use the `useMappingHelper` (if available) for large data transforms.

### 3. Maintain Presence
The `maintainVisibleContentPosition` prop is now extremely stable. Use it for all real-time feeds (Announcements, Chat, Audit Logs) where data is prepended to the top.

### 4. Semantic Recycling with `getItemType`
If your list has multiple UI types (e.g., a Teacher Dashboard with both `StatsCard` and `StudentRow`), always provide a `getItemType` function. This prevents the recycler from trying to transform a `StatsCard` into a `StudentRow`, which is expensive.

---

## ⚠️ Anti-Patterns (Pitfalls)

### ❌ Manual Keys
**Never** add a `key` prop to the root element of your `renderItem`. FlashList handles keys internally for recycling. Adding your own will break the recycling pool and lead to OOM on 2GB devices.

### ❌ Bridge Dependency
FlashList v2 **will fail** if the New Architecture is disabled. Ensure `newArchEnabled=true` in `gradle.properties`.

### ❌ Anonymous Functions
Avoid defining `renderItem` or `keyExtractor` as anonymous functions inside the component. Move them outside or use `useCallback` to prevent the recycler from resetting on every render.

---

## 🛠️ Refactor Checklist for Gurudevi
- [ ] Remove `estimatedItemSize` from all `SanctuaryFlashList` usages.
- [ ] Ensure all `renderItem` components in `@repo/ui` are wrapped in `React.memo`.
- [ ] Update `SanctuaryFlashList.tsx` to remove the required `estimatedItemSize` prop for v2 compatibility.
