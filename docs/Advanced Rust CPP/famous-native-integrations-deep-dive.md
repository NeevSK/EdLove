# Famous Native C++/Rust Integrations — Deep Dive & Learnings

Real source code and repo structure pulled directly from each project (not
just marketing claims), analyzed for patterns worth borrowing.

---

## 1. `signalapp/libsignal` (Rust) — the most rigorous example available

**What it is**: the Signal Protocol + crypto primitives, shared as one Rust
core across Android, iOS, Desktop, and server — used by one of the most
security-scrutinized apps in the world.

**Repo shape**: `rust/` (core logic) → `rust/bridge/jni/`, `rust/bridge/node/`
(bridge code physically separated from core logic in the folder structure)
→ `java/`, `swift/`, `node/` (the published wrapper packages).

**Key pattern — inverted source of truth vs Nitrogen/UniFFI-for-RN**:
Nitrogen/UBRN start from TypeScript and generate outward. libsignal does the
opposite: when exposing a new API to Java or Node, you run a Python codegen
script (`gen_java_decl.py` / `gen_ts_decl.py`) that generates the Java/
TypeScript declarations *from* the Rust code, using `cbindgen` to bridge
Rust→C first.
> **Lesson**: "one source of truth, generate everything else" is universal,
> but *which* language is the source of truth should match where the real
> business logic lives — Rust-first for a crypto core (one implementation
> to audit), TS-first for a UI-glue layer.

**Real documented packaging gotcha**: building for Android needs both
`libsignal-android` and `libsignal-client`, but the Windows/macOS native
libraries bundled in `libsignal-client` are *not* automatically excluded
from the final Android app — you must explicitly exclude
`libsignal_jni*.dylib` / `signal_jni*.dll` via Gradle's
`packaging.resources.excludes`.
> **Lesson**: exactly the "unexpected binary bloat from a cross-platform
> dependency" class of bug flagged earlier as worth checking for — here's
> a real, named instance, straight from the project's own docs.

**Stability tiering, explicitly stated**: the public Java/Swift/TypeScript/
non-bridge Rust APIs follow semver; the JNI/C/Node "bridge" layers are
explicitly called out as subject to change without notice.
> **Lesson**: a deliberate two-tier stability promise, not one blanket
> guarantee. Worth copying for your own adapters — state clearly which
> layer is "stable contract" vs "implementation detail that may shift."

**On pre-1.0 status — an important counter-data-point**: this is v0.94.0
(still technically pre-1.0), 4,051 commits, 206 releases, 5.8k stars,
719 forks — and it protects the private messages of one of the most
scrutinized apps on Earth.
> **Lesson**: "pre-1.0" alone isn't the real signal — rigor is. What
> actually matters: `CODING_GUIDELINES.md`, `SECURITY.md`, `RELEASE.md`,
> `TESTING.md`, a required CLA, an explicit "not all changes accepted"
> contribution policy, and a pinned Rust *nightly* compiler version for
> build reproducibility. That's the real evidence of production-grade
> discipline, independent of the semver number.

---

## 2. `pytorch/executorch` (C++) — the AOT/runtime split behind "50KB footprint"

**What it is**: Meta's on-device inference runtime, powering AI features in
Instagram, WhatsApp, Messenger, and Facebook at billions-of-users scale.

**The actual architecture**: a three-stage pipeline —
**Export** (capture the PyTorch model graph via `torch.export()`) →
**Compile** (quantize, optimize, partition to hardware backends, producing
a `.pte` file) → **Execute** (load the `.pte` on-device via a lightweight
C++ runtime).
> **Lesson**: the general pattern for "powerful but tiny at runtime" — do
> all the expensive, smart work *once*, offline, ahead of time, and ship
> the device only a lean interpreter for the pre-optimized result. Same
> idea as Nitrogen generating bindings at publish-time rather than
> app-build-time: push cost to the least-frequent point in the pipeline.

**Modularity that directly explains the small footprint**: the core
runtime library (`libexecutorch_core.a`) contains *no* operator/kernel or
backend definitions at all — those live in separate libraries
(`libportable_kernels.a`, per-backend libs for CoreML/MPS/Vulkan/XNNPACK/
Qualcomm/MediaTek) that you only link if you actually use them.
> **Lesson**: same idea as tree-shaking in JS, applied to a C++ static-link
> build — never ship what you don't use.

**A real, documented linker gotcha — a fourth failure category worth
tracking**: generated kernel-registration code must be linked with
`-Wl,-force_load` (or `--whole-archive`) specifically because it relies on
load-time self-registration functions that linkers prune by default, since
nothing directly calls them.
> **Lesson**: distinct from memory bugs, lifecycle bugs (the Nitro Kotlin
> leak), and registration-order bugs (the HybridObjectRegistry error) —
> this is silent linker dead-code elimination of things that "aren't
> called" but need to run anyway. A fourth thing to check when a native
> module mysteriously doesn't work despite compiling clean.

---

## 3. `1Password/typeshare` (Rust) — a third distinct codegen technique

**What it is**: 1Password's open-sourced tool for keeping Rust types in
sync with Swift, Kotlin, TypeScript, Python, Go, and Scala.

**How it actually works — proc-macro annotation, not a separate spec file**:
```rust
#[typeshare]
struct MyStruct {
    my_name: String,
    my_age: u32,
}
```
generates, e.g., the matching TypeScript:
```ts
export interface MyStruct {
  my_name: string;
  my_age: number;
}
```
Built as a real Rust procedural macro (using the `syn`/`quote` crates to
parse and emit code) — a `#[typeshare]` attribute placed directly on the
Rust type itself, rather than a separate `.nitro.ts`-style spec file
(Nitrogen) or a Python post-hoc codegen pass (libsignal).
> **Lesson**: a third distinct flavor of the same universal codegen
> pattern — Nitrogen (separate TS spec file, TS-first), libsignal (Python
> script run after the fact, Rust-first), Typeshare (inline annotation via
> a proc macro, Rust-first but zero separate spec file to maintain). Three
> real production teams, three different implementations of "one source of
> truth, generate the rest" — the pattern is the durable lesson, not any
> one team's specific mechanism.
- Built on `serde` for the actual serialization logic — reuses the Rust
  ecosystem's existing serialization conventions rather than inventing new
  ones.
- Honest, stated limitation: it can't recognize types generated within
  other macros yet — a genuine current gap the team is still working on,
  not swept under the rug in their own docs.

---

## 4. `mozilla/application-services` — where UniFFI itself was born

**What it is**: the actual Mozilla project that created UniFFI, used to
share Firefox mobile's account/sync/experimentation logic across Android
and iOS.

**Repo shape**: `components/` holds one folder per feature area — `logins`
(saved password storage/sync), `places` (browsing history storage/sync),
`fxa-client` (Firefox Account sign-in + encryption keys), `nimbus`
(Mozilla's experimentation platform), `push` (WebPush). Each component
follows the same shape: shared Rust core + generated Kotlin bindings (for
Android) + generated Swift bindings (for iOS), via a `uniffi.toml` config
file per component.
> **Lesson**: this is the "one port, many adapters" pattern again, but
> applied at the *feature* level rather than the whole-app level — each
> Mozilla product feature is its own self-contained Rust-core component,
> independently versioned and bindable, not one monolithic shared library.
> Worth considering for your own analytics/native work: separate
> components per concern (e.g. `analytics-core`, `vector-search-core`)
> rather than one giant native module.

**An honest, load-bearing quote straight from UniFFI's own docs**: UniFFI
is explicitly described as being *developed concurrently with its initial
consumers* — changing rapidly, with real sharp edges in the developer
experience — while simultaneously being *considered developed enough for
production use in Mozilla's own products.*
> **Lesson**: directly confirms the nuance we flagged earlier about UBRN's
> own inconsistent production-readiness language — even the *origin*
> project of this whole toolchain openly held both things as true at once:
> "rough edges, actively changing" and "good enough to ship in production
> today." That's not a contradiction to resolve — it's the honest state of
> actively-evolving infrastructure, and it's fine to build on top of that
> as long as you go in with eyes open about which parts might shift.
- Real practical build note from their own docs: first-time setup for the
  full Android/iOS end-to-end build chain "is likely to take a number of
  hours to complete" — a genuinely honest acknowledgment of onboarding cost
  for this class of project, matching the "heavier than npm install"
  caveat we noted generally for native toolchains.

---

## 5. Cross-cutting patterns across all four (the actual takeaways)

1. **Codegen direction varies by where the truth lives** — TS-first
   (Nitrogen), Rust-first via post-hoc script (libsignal), Rust-first via
   inline proc macro (Typeshare). Pick based on where your real logic sits,
   not by copying whichever tool you saw first.
2. **Physically separate "core logic" from "bridge code"** in the repo
   layout, every time (`rust/` vs `rust/bridge/`, `runtime/` vs `backends/`
   vs `kernels/`). Never let bridge/glue code live inside your core logic
   folder — every serious example enforces this split.
3. **State stability tiers explicitly** (libsignal's public-API-vs-bridge
   split) rather than one blanket promise — reduces user surprise when
   internals change.
4. **Push expensive work to the least-frequent point in the pipeline**
   (ExecuTorch's AOT export/compile step, Nitrogen's publish-time codegen)
   — never redo at runtime what could've been done once, offline.
5. **"Pre-1.0" and "actively used in serious production" are not
   contradictory** — true for libsignal (v0.94.0, protects Signal's
   messages) and for UniFFI itself (Mozilla's own admission). Judge by
   process rigor (docs, tests, security policy, contribution discipline),
   not the version number.
6. **Every one of these has at least one documented "the build silently
   does the wrong thing" gotcha** (libsignal's bundled-dylib bloat,
   ExecuTorch's linker pruning, Nitro's HybridObjectRegistry ordering, the
   `staticlib` crate-type miss in UBRN). This class of bug is universal
   to native cross-language work — budget for hitting at least one of
   these yourself, in whichever stack you pick.
