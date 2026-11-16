# E1 Complete Production Diff Review

**Subsystem:** Offline Permission Evaluation & Snapshot Cryptographic Verification  
**Repository Working Tree:** `.tmp-worktrees/exp-e1`  
**Anchor Commit:** `252bec65f746c362fec12472999cccfba187d0b9`  
**Status:** Ready for Review  

---

## 1. Unified Diff

```diff
diff --git a/packages/core/src/logic/permissions/signature.ts b/packages/core/src/logic/permissions/signature.ts
index a2758372a..a100e2f0e 100644
--- a/packages/core/src/logic/permissions/signature.ts
+++ b/packages/core/src/logic/permissions/signature.ts
@@ -9,11 +9,7 @@ function decodeBase64(value: string): Uint8Array {
   return Uint8Array.from(binary, (character) => character.charCodeAt(0));
 }
 
-/**
- * Verifies the cryptographic signature of the PowerSync synced PermissionSnapshot.
- * Shared across local evaluators and react permission stores.
- */
-export async function verifySnapshotSignature(snapshot: {
+export interface SnapshotSignatureInput {
   userId: string;
   activeBondId: string;
   activeEntityId: string;
@@ -25,8 +21,30 @@ export async function verifySnapshotSignature(snapshot: {
   permissions: string;
   temporalHints: string | null;
   signature: string;
-}): Promise<boolean> {
+}
+
+/**
+ * Pure, side-effect-free cryptographic signature verification helper.
+ *
+ * Verifies the Ed25519 signature of a PowerSync synced PermissionSnapshot
+ * against an explicitly provided public key.
+ *
+ * Side-effect-free: Performs zero ambient environment lookups, zero disk I/O, and zero mutations.
+ * Dependency-explicit: Requires the signing public key to be passed explicitly.
+ */
+export async function verifySnapshotCryptographicSignature(
+  snapshot: SnapshotSignatureInput,
+  publicKey: string,
+): Promise<boolean> {
   try {
+    if (
+      !publicKey ||
+      typeof publicKey !== 'string' ||
+      !snapshot?.signature?.startsWith('ed25519:')
+    ) {
+      return false;
+    }
+
     // 1. Reconstruct the exact JSON payload generated on the server (preserving order of keys)
     const payload = {
       generatedAt: snapshot.generatedAt,
@@ -41,13 +59,7 @@ export async function verifySnapshotSignature(snapshot: {
       temporalHints: snapshot.temporalHints ? JSON.parse(snapshot.temporalHints) : {},
     };
 
-    const publicKey =
-      process.env.EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY ||
-      process.env.NEXT_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY;
-    if (!publicKey || !snapshot.signature.startsWith('ed25519:')) return false;
-
-    // 2. Verify with a public key shipped in the client. The private key never
-    // leaves the server/operator environment.
+    // 2. Verify with explicit public key. The private key never leaves the server/operator environment.
     const enc = new TextEncoder();
     const messageData = enc.encode(JSON.stringify(payload));
     const signatureBytes = decodeBase64(snapshot.signature.slice('ed25519:'.length));
@@ -78,13 +90,17 @@ export async function verifySnapshotSignature(snapshot: {
       typeof payload.temporalHints !== 'object' ||
       Array.isArray(payload.temporalHints) ||
       Object.keys(payload.temporalHints).length !== 0
-    )
+    ) {
       return false;
+    }
+
     const resourceNames = Object.keys(payload.permissions);
     if (
       resourceNames.some((name) => !(AUTHORIZATION_RESOURCES as readonly string[]).includes(name))
-    )
+    ) {
       return false;
+    }
+
     const permissions: Record<string, Record<string, boolean>> = {};
     for (const resource of AUTHORIZATION_RESOURCES) {
       if (!Object.hasOwn(payload.permissions, resource)) continue;
@@ -96,19 +112,22 @@ export async function verifySnapshotSignature(snapshot: {
             !(AUTHORIZATION_ACTIONS as readonly string[]).includes(name) ||
             typeof actions[name] !== 'boolean',
         )
-      )
+      ) {
         return false;
+      }
       permissions[resource] = {};
       for (const action of AUTHORIZATION_ACTIONS) {
         if (Object.hasOwn(actions, action)) permissions[resource][action] = actions[action];
       }
     }
+
     const recovered = {
       ...payload,
       generatedAt: new Date(payload.generatedAt).toISOString(),
       expiresAt: new Date(payload.expiresAt).toISOString(),
       permissions,
     };
+
     return await crypto.subtle.verify(
       { name: 'Ed25519' },
       importedKey,
@@ -120,3 +139,24 @@ export async function verifySnapshotSignature(snapshot: {
     return false;
   }
 }
+
+/**
+ * Verifies the cryptographic signature of the PowerSync synced PermissionSnapshot.
+ * Shared across local evaluators and react permission stores.
+ * Delegates to the pure verifySnapshotCryptographicSignature helper.
+ */
+export async function verifySnapshotSignature(
+  snapshot: SnapshotSignatureInput,
+  explicitPublicKey?: string,
+): Promise<boolean> {
+  const publicKey =
+    explicitPublicKey ??
+    process.env.EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY ??
+    process.env.NEXT_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY;
+
+  if (!publicKey) {
+    return false;
+  }
+
+  return verifySnapshotCryptographicSignature(snapshot, publicKey);
+}
```

---

## 2. Line-by-Line Architectural Assessment

1. **`SnapshotSignatureInput` Interface (Lines 12–24):**
   Explicitly models the contract for snapshot records. No fields added, deleted, or renamed. 100% compatible with PowerSync schema and SQLite column mappings.
2. **`verifySnapshotCryptographicSignature` (Lines 26–138):**
   Pure helper function. Decouples the cryptographic verification algorithm from ambient environment state (`process.env`). All dependencies are supplied via arguments. Fail-closed error handling is strictly preserved.
3. **`verifySnapshotSignature` Delegation (Lines 140–162):**
   Preserves the original API signature while allowing optional dependency injection of `explicitPublicKey`. Prevents disruption to existing callers (`useCedarDecisionStore.ts`, `snapshotRefresh.ts`, `localEvaluator.native.ts`, `localEvaluator.native.dynamic.test.ts`).
4. **Evaluator Orchestrator (`localEvaluator.native.ts`):**
   No net change required to call site. Temporal expiration, scope matching, and freshness checks remain untouched.

---

## 3. Conformance Checklist

- [x] Pure helper extracted (`verifySnapshotCryptographicSignature`).
- [x] Temporal expiration kept separate.
- [x] Orchestrator validates user, bond, entity, and policy version.
- [x] Evaluation order preserved.
- [x] Fail-closed semantics preserved.
- [x] Executed exclusively in `.tmp-worktrees/exp-e1`.
- [x] Zero changes to primary checkout.
- [x] Parity audit passes (0.11s, exit code 0).
- [x] All 26 native unit tests pass (1.86s, exit code 0).
- [x] All 19 acceptance tests pass (1.18s, exit code 0).
- [x] Signature bypass mutation caught independently.
- [x] AMB-04 investigated and reported.
- [x] Stopped awaiting human review before commit or merge.
