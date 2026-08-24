---
title: "Gurudevi Authorization Architecture â€” Decision Record"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [docs, decisions, historical]
---

# Gurudevi Authorization Architecture — Decision Record

**Status:** Living document. Update in place as decisions change — don't
let a future exploration re-derive what's already settled here.

---

## 1. Origin

The permission/authz/pricing/feature-flag layer had become architecturally
unclear after repeated AI-agent-driven changes across multiple migrations:
parallel implementations, orphaned files, legacy code layered under new
code, low confidence in what was actually running versus what was
documented.

**Methodology established and used throughout this investigation:**
- Audit passes and fix passes never share a context window
- Every claim requires a file:line citation — no claims from memory or
  inference presented as fact
- Independent second-opinion passes for judgment calls, not just the
  original agent grading its own work
- "Builds successfully" is never accepted as proof of runtime correctness
  — real device/logcat evidence required for anything native
- Characterization tests (recording actual current behavior) before any
  refactor, not tests of intended behavior
- Secondary sources (blog posts, marketing copy) are not evidence —
  primary sources only (official changelogs, actual source code, actual
  device output)

---

## 2. Confirmed-Good Architecture (keep as-is)

- **Four-gate model** in `sanctuaryFeature()`: Citizenship → Entitlement →
  Cedar (authz) → Feature Flag, short-circuiting on first failure
  (confirmed in code, `sanctuaryFeature.ts`)
- **Entitlement is genuinely isolated from Cedar** — confirmed by full
  code audit (Item 2, entitlement-boundary report): no entitlement/
  pricing field appears in any Cedar `evaluate()` call, in any of 6
  evaluation paths (server WASM, client Shape1/Shape2, snapshot
  fallback, snapshot generator). This is a deliberate design and it is
  intact in the actual code, not just in docs.
- **Fail-closed by default** on every Cedar evaluation path (server,
  client WASM, snapshot) — confirmed by code audit
- **HMAC-signed permission snapshots** for the offline path — working,
  confirmed, used by `usePermissionStore` and `localEvaluator.native.ts`
- **JWKS caching + coalesced fetch** already implemented server-side
  (`jwt.ts`) for Supabase-issued JWTs — real, working infrastructure
- Cedar policy set: ~90% pure RBAC/ownership-scoping (role +
  relationship checks), expressible without any dynamic evaluation

---

## 3. Confirmed Bugs (fix independent of everything else below)

1. **`deviceTrust.ts:167-182` fails OPEN on network error** — returns
   `true` (trusted) when the trust-check RPC call fails. This is the
   opposite of every other evaluation path in the codebase, which all
   fail closed. Gates Grade creation only, currently — but wrong
   direction regardless of scope.
2. **`personal.cedar:9`** checks `resource.type == "User"`, but the
   Cedar schema defines no `type` attribute on the `User` entity. Needs
   `cedar validate` in STRICT mode to confirm whether this policy is
   silently dead. If dead, likely should be `resource is User` to match
   the pattern used everywhere else (27+ other occurrences).
3. **`useCedarDecisionStore`** loads from `permission_snapshots` without
   HMAC verification (the check exists on the older `usePermissionStore`
   but wasn't ported when the new store was created).
4. **`_layout.tsx`** boot sequence has a dangling reference to
   `usePermissionStore`'s load call that needs patching before that
   store can be safely removed.
5. **`packages/core`** imports `@cedar-policy/cedar-wasm` at runtime
   without declaring it in its own `package.json` — relies on pnpm
   hoisting from `packages/policies`. Fragile; declare explicitly.

### Real, Cedar-only enforcement gaps (not bugs, but load-bearing facts)
- **Parent → child Grade/Attendance reads**: ZenStack has no relationship
  traversal from `StudentGuardianRelationship` to Grade/Attendance.
  **Cedar is the only layer currently preventing a parent from reading
  another family's child's data.** If Cedar evaluation is ever bypassed,
  skipped, or fails open, this breaks silently.
- **sectionHead/gradeHead scoping**: ZenStack's Classroom/Attendance
  rules are broader than Cedar's section/grade scoping intends — the
  opposite direction (over-permissive if Cedar bypassed, not under).

---

## 4. Investigated and Explicitly Shelved (do not re-explore without new evidence)

### 4a. WASM-in-Hermes for client-side Cedar evaluation
**Shelved — evidence, not assumption.** Secondary sources (Callstack,
various blogs) claimed Hermes V1 (RN 0.84+) supports running third-party
`.wasm` binaries via `global.WebAssembly`. Checked against primary
sources:
- Official RN 0.84 release blog: zero mention of WebAssembly
- Hermes maintainers (GitHub issue #429): explicitly stated WASM support
  "does not fit with the goals of the project," recommended `wasm2js`
  (compile-time WASM→JS transpilation) instead of runtime WASM execution
- Independent ecosystem evidence: `uniffi-bindgen-react-native`
  deliberately uses native JSI bindings for the React Native target and
  reserves WASM specifically for actual browser targets — a serious,
  unrelated engineering team arrived at the same conclusion independently
- No confirmed runtime evidence either way for the actual pinned Hermes
  version (`250829098.0.14`) — G.4 (device test) was never completed,
  but the weight of evidence made pursuing this path not worthwhile

### 4b. `uniffi-bindgen-react-native` (ubrn) for auto-generated RN/JSI bindings
**Shelved.** Strict version coupling to `uniffi = 0.31.0` exactly.
Cedarling's own `cedarling_uniffi` crate uses `0.29.0` — real,
confirmed mismatch (not hypothetical). ubrn also consumes
`uniffi_bindgen`'s internal (unstable, pre-1.0) Rust APIs directly, not
just its CLI — structurally exposed to breakage on any uniffi release,
not just this one. ubrn's own maintainers describe RN-specific
integration as "the most fragile part" of the project.

### 4c. Adopting Cedarling as-is (or forking it)
**Shelved.** Cedarling's core evaluator is genuinely schema-agnostic
(confirmed — `Jans::` namespace doesn't appear in core `.rs` source,
only in their own example policy/schema content; real `PolicyStore`
abstraction loads schema as data). But Cedarling's actual shipped model
is token-centric: policies read role/claims directly from JWT tags
(`context.tokens.jans_userinfo_token.hasTag("role")`), which directly
conflicts with Gurudevi's deliberate design of keeping business/identity
logic out of Cedar's context. Forking to strip this out is more work
than building a thin wrapper around raw `cedar-policy` directly, since
you'd inherit and need to remove: their JWT validation layer, their
policy store format, their namespace conventions — for a fraction of
Cedarling's actual native-binding infrastructure that's genuinely
reusable (Android TLS/JNI init, panic-guarded FFI).

### 4d. Nitro Modules for the native JS↔Rust bridge
**Shelved in favor of Expo Inline Modules**, not because Nitro is bad,
but because: (a) it's an additional third-party dependency with its own
independent version cadence — real, documented friction found (build
failures on latest Nitro + new Expo projects, intermittent
"NitroModules could not be found" crashes post-prebuild, manual
CMakeLists wiring required), and (b) Expo Inline Modules (SDK 56+) is
first-party, ships with the SDK already in use, and was proven to work
end-to-end on a real device with fewer new moving parts.

### 4e. Hand-authored raw JSI / raw vtable JNI hacking
**Shelved.** A spike used `std::mem::transmute` on a hardcoded JNI
vtable offset (`vtbl.add(167)`) to avoid writing C++ — this is worse
than the C++ it replaced (no compile-time safety, silent memory
corruption risk if the offset is ever wrong on a different ART/Android
build). The safe, correct path is the `jni` Rust crate (checked,
typed wrappers over `JNIEnv`), not manual FFI table indexing.

### 4f. Full local on-device PDP as originally scoped
**Revisited and reconsidered, then reinstated by explicit decision —
see Section 5.** The investigation found that ~90% of the actual policy
set is pure RBAC with no dynamic evaluation need, and the one
genuinely-dynamic case (`device_trust` on Grade creation) is currently
shallow, broken (fails open), and not even routed through Cedar at all
— it's a live RPC call. This raised a real question of whether a full
native on-device PDP was solving a problem the policy set doesn't
actually have yet. Naveen's explicit decision: **build it anyway, now,
deliberately** — see Section 5 for the reasoning and the constraints
that decision comes with.

---

## 5. Final Decision — Build a Modular Local PDP

**Decision:** proceed with a local, on-device Cedar evaluation capability
now, rather than deferring until a concrete dynamic-policy need
materializes.

**Explicit reasoning for building now despite the RBAC finding:**
Naveen's call — better to build it deliberately, correctly, and
detachably now than to leave it as an open question that resurfaces
later without the current investigation's context. Uncertainty about
future dynamic-policy needs is real and not resolvable in advance.

**Non-negotiable constraints on this build, given the above:**
1. **No Cedarling fork** — wrap raw `cedar-policy` directly (see 4c)
2. **No ubrn** — no dependency on `uniffi_bindgen`'s unstable internals
3. **`jni` crate, not hand-rolled JNI** — no vtable hacking, no raw
   `transmute` across the FFI boundary (see 4e)
4. **Modular and detachable by construction** — not "remember to remove
   it later." A config toggle at the adapter level
   (`local-native` vs `snapshot-only`) plus an isolated package boundary,
   so removal is deleting one package and flipping one flag — nothing
   else in the codebase should need to change if this is ever
   unneeded.
5. **Device-independent verification wherever possible** — core Rust
   logic must be provable via `cargo test` alone (known policy, known
   request, known expected decision), since Naveen cannot personally run
   device tests. Only the JNI boundary itself requires real device
   evidence (logcat, on-screen output — "build succeeded" is never
   sufficient, per the methodology in Section 1).
6. **Defaults OFF** — wired in behind the toggle, proven in isolation,
   before being live for any real user.
7. **`localEvaluator.native.ts`** (the existing partial local-WASM path)
   must be explicitly resolved — either superseded cleanly by this new
   module with the old path removed, or explicitly marked deprecated
   with a link to this document. It must not be left as an ambiguous,
   half-built parallel path — that pattern is the root cause this whole
   investigation started from.

**See the companion implementation plan document for the staged build.**

---

## 6. Still Open / Not Yet Started

- `policy_version` table (ADR-006) — never implemented, no snapshot
  invalidation mechanism exists. Needed regardless of the local-PDP
  decision. Design: schema + policies + a build-time version hash,
  referenced by every snapshot and decision log.
- Step-up authorization pattern for genuinely-dynamic, connectivity-
  required actions (starting with `device_trust`-gated Grade creation)
  — replaces the current fail-open RPC call with an honest "this action
  requires connectivity" UX instead of a silent trust assumption.
- Device-trust revocation propagation — currently best-effort, no
  bounded-time guarantee offline. Supabase Realtime channel already
  exists (`useAuthLifecycle.ts:203-241`) and could be extended if
  device trust ever becomes a primary control rather than a single
  narrow gate.
