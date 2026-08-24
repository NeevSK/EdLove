---
title: "Local PDP Implementation Plan â€” Staged Build"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [docs, current_progress, historical]
---

# Local PDP Implementation Plan — Staged Build

Companion to `gurudevi-authz-decision-record.md`. Read that first — this
is the "how," that's the "why and what's off the table."

Each stage is independently checkable. Don't start a stage until the
previous one's verification evidence is in hand — not assumed.

---

## Stage 1 — Pure Rust Core (zero device involved)

**Goal:** a small Rust crate wrapping `cedar-policy::evaluate()` directly
— no Cedarling, no ubrn, no uniffi yet. JSON request in, JSON decision
out, matching a shape you already know
(`cedarling_c`'s pattern — init/evaluate/free lifecycle) without
inheriting any of its schema/token opinions.

```
Create a new, standalone Rust crate: gurudevi-cedar-core (or similar —
propose a name, don't just default to something generic).

1. SCHEMA AND POLICIES
   Load Gurudevi's actual Cedar schema (schema.cedarschema) and the 10
   real policy files from packages/policies/src/policies/. Do not
   invent placeholder policies — use the real ones, copied or
   referenced from their current location. Confirm the schema validates
   in STRICT mode against these policies before writing any Rust code —
   report the validation result explicitly, including whether
   personal.cedar:9 (resource.type == "User") passes or fails STRICT
   validation. This answers a question flagged as open in the decision
   record.

2. CORE FUNCTION
   Write one function: evaluate(request_json: &str) -> String, where
   request_json contains principal attrs, action, resource attrs, and
   context — matching the actual shape used in
   cedarClientEvaluator.ts's Shape2 request today, not an invented
   shape. Response JSON should include: decision (Allow/Deny), and the
   determining policy ID(s), matching what Cedar's own Response
   diagnostics already provide — don't discard that information.

3. NO PANICS ACROSS ANY FUTURE FFI BOUNDARY
   Wrap the core evaluation in error handling that converts any
   internal error into a JSON error response rather than panicking —
   this crate will eventually sit behind an FFI boundary in Stage 2,
   and a panic there is undefined behavior, not a clean error. This
   doesn't require FFI code yet, just result types that won't panic
   when Stage 2 wraps them.

4. TEST SUITE — THIS IS THE ACTUAL DELIVERABLE OF THIS STAGE
   Write real unit tests using the actual policies and schema, not
   synthetic ones. At minimum, one test per real policy file, covering:
   - The permit case (a request that SHOULD be allowed by that policy)
   - At least one deny case per policy (a request that looks similar
     but is correctly rejected — e.g. a teacher requesting access to a
     classroom_id NOT in their classroom_ids)
   - The two "GAP" cases from parent.cedar specifically (parent reading
     own child's grade = allow, parent reading a different child's
     grade = deny) — these are your one true Cedar-only enforcement
     guarantee per the decision record, so they get dedicated tests
   Run cargo test and report the full output verbatim — pass count,
   fail count, and the actual test names, not a summary claiming
   success.

5. REPORT
   - Full `cargo test` output, verbatim
   - STRICT validation result for the schema against all 10 policies
   - Explicit confirmation: no device, emulator, or FFI code was
     required for anything in this stage
```

**Verification standard for this stage:** Naveen reads the `cargo test`
output directly — pass/fail is unambiguous, no device needed, no trust
required in an agent's narrative summary.

---

## Stage 2 — Safe JNI Boundary (real device required)

**Do not start until Stage 1's test output is reviewed.**

```
Using the `jni` crate (not manual JNI symbol handling, not
std::mem::transmute, not vtable indexing — the real, checked crate),
expose Stage 1's evaluate() function to Kotlin via JNI, on Android,
arm64-v8a first.

1. Use jni::JNIEnv's safe methods for string conversion
   (get_string / new_string or equivalent in the crate's current API —
   check the crate's actual current version and API, don't assume it
   matches an older tutorial).

2. Confirm ownership/lifetime handling explicitly: does the jni crate's
   safe wrappers handle the Java string lifecycle automatically, or is
   manual release still needed? State this plainly rather than assuming
   safety from using a "safe" crate — verify what it actually guarantees
   versus what still needs care.

3. Reuse the proven Expo Inline Module pattern from the earlier spike
   (System.loadLibrary + external fun matching the correct JNI symbol
   name — including the $Companion mangling if applicable, which was
   the specific bug found and fixed in that spike).

4. RUNTIME PROOF — same standard as the earlier spike, no exceptions:
   - Real device or real emulator, not build success alone
   - Full logcat output, verbatim, from the moment the function is
     called
   - The actual decision JSON appearing on screen or in logs, quoted
     exactly
   - Test at least one real policy end-to-end (e.g. the parent/child
     grade case from Stage 1's tests) through this full path, not a
     placeholder string

5. Report exactly what happened — do not describe this as "proven"
   without the logcat and on-screen evidence pasted in.
```

---

## Stage 3 — Detachability Boundary

**This stage is the direct answer to "modular so we can detach it."**

```
1. Create an isolated package (e.g. packages/cedar-native or similar —
   propose a name) containing everything from Stages 1-2: the Rust
   crate, the JNI bridge, the Kotlin Inline Module, and nothing else.
   No other package should import from inside this one except through
   one narrow, explicit interface.

2. Add a single config toggle to CedarAuthorizationAdapter (or wherever
   the actual adapter construction happens):
   evaluationMode: 'local-native' | 'snapshot-only'
   Default it to 'snapshot-only'.

3. When 'snapshot-only': the adapter behaves exactly as it does today
   (HMAC-signed snapshot path, already working, already audited).
   When 'local-native': the adapter calls into the new package instead.

4. Write down, explicitly, in a README inside the new package: "To
   remove this capability entirely: delete this package, and set
   evaluationMode to 'snapshot-only' (or remove the toggle and hardcode
   snapshot-only). No other file should require changes." Then verify
   this claim is actually true by checking for any other reference to
   the new package elsewhere in the codebase — there should be none
   outside the adapter's toggle logic.

5. Report: confirm no other file imports from the new package directly,
   and confirm the toggle is the only integration point.
```

---

## Stage 4 — Wire In, Defaulted Off

```
1. Set evaluationMode to 'snapshot-only' in all current app
   configuration — this stage does not change runtime behavior for any
   real user yet.

2. Add the toggle to a dev/internal build config only, so it can be
   flipped for internal testing without affecting production.

3. Explicitly resolve localEvaluator.native.ts per the decision
   record's Section 5, point 7: either remove it and confirm this new
   package supersedes its functionality, or mark it deprecated with an
   explicit comment linking to the decision record, stating clearly
   which one is the intended path going forward. Do not leave both as
   ambiguous parallel options.

4. Report which choice was made and why, plus confirmation that no
   code path can currently reach 'local-native' mode outside of the
   internal dev build config.
```

---

### Sequencing note

Stage 1 is the one to start today — it's fully self-contained, fully
verifiable without you touching a device, and it directly resolves the
open `personal.cedar:9` STRICT-validation question as a side effect.
Everything else waits on its output.
