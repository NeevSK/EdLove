# C++ / Rust / React Native Native Module Research — Full Reference

Context: solo developer + AI as "team," building a React Native/Expo app,
exploring custom high-performance visuals (own tab bar, FAB) and evaluating
native tooling (C++ vs Rust) for anything that needs to go beyond JS.

---

## 1. Why C++ has a "hard" reputation — and how it's managed in practice

- The reputation mostly comes from *old-style* C++: manual `new`/`delete`,
  raw pointers, easy-to-trigger undefined behavior, messy build tooling.
- Modern C++ (RAII, smart pointers, `std::optional`/`std::expected`,
  standard containers, `constexpr`/templates) avoids most classic foot-guns
  through discipline and idiom — not a language-enforced guarantee like Rust.
- **Marc Rousavy (Margelo)** — creator of react-native-vision-camera and
  **Nitro Modules** — manages this by:
  - Writing modern-idiom C++ (smart pointers, RAII) rather than raw C-style code.
  - Using **Nitrogen**, his own codegen tool: you write a TypeScript interface,
    it generates the C++/Swift/Kotlin bindings. Nitro statically generates
    type-safe bindings from TS — wrong types or nulls simply won't compile.
  - So most of the manual-memory-risk C++ is *generated boilerplate*, not
    hand-written line by line.

---

## 2. C++23 — what it actually offers, and the modules gap

- C++23 adds real features: `std::expected` (structured error handling),
  ranges improvements, `deducing this`, better `constexpr`.
- **Not** a memory-safety overhaul like Rust — still manual/unsafe by default
  unless you consistently use smart pointers/RAII/modern containers.
- **C++20 Modules (`import`/`export`)** are a *separate* feature from "using
  C++23 in general." You can use C++23 fully via normal `#include` headers —
  modules are optional, not a prerequisite.
- Why modules aren't practical yet — a four-layer chicken-and-egg problem:
  1. **Compilers** (GCC 13+, Clang 16+, MSVC) mostly support the syntax.
  2. **Build systems** (CMake, Ninja) need to resolve module dependency order
     *before* compiling — a fundamentally different build-graph problem than
     `#include`. Only got decent experimental support in CMake 3.28+.
  3. **Package managers** (vcpkg, Conan) — almost no published libraries ship
     as modules yet, so there's nothing to import even with perfect tooling.
  4. **IDE tooling** (clangd, IntelliSense) still indexes modules poorly.
- **Practical takeaway**: use C++23 language/library features freely via
  headers; treat modules as "watch this space," not something to design around.

---

## 3. Mobile toolchain caveats (the real nuance, not the standard itself)

- **Android NDK** lags behind the official standard:
  - Android Studio's new-project wizard tops out at C++17.
  - You can manually bump Gradle to C++20 (mostly works).
  - C++23 fails compiler checks even on recent NDK versions; some stdlib
    features (e.g. `std::stacktrace`) aren't available even on NDK r26/r27.
- **Apple/Xcode Clang** generally supports more C++20/23 features, **but**:
  - `libc++` ships with the **OS**, not the compiler — many features are
    gated behind a minimum deployment target check.
  - A feature can compile fine in Xcode but not exist at runtime on an
    older iOS version your app still supports. This bug class doesn't exist
    in JS/TS, where the runtime ships bundled with the app.
- **Practical takeaway**: for a shared cross-platform C++ core (Nitro-style),
  target C++17/conservative C++20 as the real baseline. Treat individual
  C++23 features as opt-in, verified separately on both toolchains — don't
  blanket-adopt C++23 across shared mobile C++ code yet.

---

## 4. RN native module architectures — the performance tiers

From loosest/easiest DX to tightest/fastest:

| Tier | Mechanism | Notes |
|---|---|---|
| **Expo Modules API** | Swift + Kotlin, JSI-based | Best DX, no Obj-C bridging, "fast where it matters" per Expo, but has an extra Swift/Kotlin dispatch hop. Similar perf to Turbo Modules. |
| **Turbo Modules (typical/hand-written)** | JS → codegen'd C++ interface → Obj-C/Java → your code | The Obj-C/Java hop is where slowdown creeps in — this is the "Turbo is slower" comparison point. |
| **Nitro Modules** | Direct C++ ↔ Swift interop (skips Obj-C entirely), statically compiled JSI bindings | Built by Marc Rousavy; optimizes for raw performance over DX. |
| **UBRN (uniffi-bindgen-react-native)** | Rust → generated JSI C++ directly | Same "skip the intermediary" trick as Nitro, but for Rust. Uses the Turbo Module *registration mechanism* (RN's own supported New Architecture plumbing) while generating direct JSI bindings — not the "slow hand-written" pattern. |
| **Raw JSI C++ modules** | Hand-written, bypasses Turbo Module subsystem entirely | Fastest possible, but poorly documented and tricky to set up (per community consensus, not vendor docs). |

- Expo SDK 56+: Swift now talks to JSI directly on iOS, removing the
  Objective-C++ layer — further closing the Expo/Nitro gap for typical use.
- **When the tier actually matters**: high-frequency calls (per-animation-frame,
  audio/video streaming) and large binary payloads. For occasional calls
  (settings, button-press compute), the overhead is negligible regardless of tier.

---

## 5. C++ vs Rust — domain-by-domain competition

| Domain | C++ still leads | Rust competes/wins |
|---|---|---|
| Graphics/shaders/GPU | Skia, most game engines, Vulkan/Metal tooling | wgpu is Rust-native, smaller ecosystem |
| Video/audio/media codecs | FFmpeg | Used in newer codec work, not incumbent |
| Vector search / ML inference | Faiss, llama.cpp, ONNX Runtime — dominant | Candle (HF) real but smaller |
| Databases/storage engines | SQLite, RocksDB | Arguably *stronger* here — sled, TiKV |
| New systems-level projects | Legacy dominance | Default choice for greenfield systems code today |

**Framing**: Rust wins on *compile-time-enforced* memory safety. C++ wins on
*ecosystem maturity* (decades of libraries: Faiss, llama.cpp, Skia, FFmpeg).
Consuming existing hardened C++ libraries (vs. writing new low-level C++
yourself) makes the Rust safety argument matter less — you're not the one
introducing the risk.

### Genuine C++/Rust-worthy use cases (vs. NOT needed)
**Actually need native code for:**
- Custom shaders/GPU pipelines beyond what Skia's SkSL exposes
- Real-time video/image processing (camera filters, frame-rate compositing)
- Audio DSP / low-latency synthesis
- Custom physics/simulation beyond Reanimated's primitives
- Heavy off-UI-thread compute (image recognition, compression, crypto)
- Vector search / on-device LLM-SLM inference (Faiss, llama.cpp, sqlite-vec)
- Sharing identical logic across iOS + Android without writing it twice

**Don't need it for:**
- Tab bars, FABs, buttons, standard animations, gestures, layout
  → Reanimated + Gesture Handler + Skia (if custom drawing) covers this
- Standard list/scroll perf → FlashList/Reanimated
- One-off platform API access → Expo Modules API (Swift/Kotlin), no C++/Rust needed

**Signal to actually drop to native**: *profiling* shows the JS/worklet
thread is the bottleneck — not a guess that it "should" be faster in C++/Rust.

---

## 6. Vector search / on-device AI-ML — the concrete C++ (and some Rust) stack

- **Faiss** (Meta) — the reference vector search library, C++.
- **sqlite-vec** — pure C, no dependencies, successor to sqlite-vss (which
  was Faiss-based); ships prebuilt for pip/npm/gem/cargo, plus a raw C/C++
  amalgamation. Runs anywhere SQLite runs, including WASM and Raspberry Pi.
- **SQLite-Vector** — newer extension, stores vectors as ordinary BLOBs,
  SIMD-accelerated C distance functions, ~30MB default memory footprint,
  targets mobile/edge explicitly.
- **llama.cpp** — the reference on-device LLM/SLM inference engine, C++,
  hand-tuned for CPU SIMD + quantization.
- Trend driver: rising cloud AI costs + tightening privacy regs (EU AI Act)
  are pushing more inference/search onto-device through 2026.

---

## 7. C++ package managers (if you ever need third-party C++ libs)

- **vcpkg** (Microsoft) — largest package catalog, CMake toolchain
  integration, but can't easily host multiple versions of the same package
  or a private repo.
- **Conan** (JFrog) — better documented, more version control, supports
  decentralized/private repositories. Python-dependency overhead is minor.
- For RN/mobile cross-compilation specifically: Nitro/Turbo/UBRN projects
  mostly hand-vendor small deps via CMake/CocoaPods/Gradle rather than
  leaning fully on either package manager.
- **ABI compatibility** (not "C++ version") is the real cross-platform risk —
  mixing compiler/stdlib versions across iOS Clang vs Android NDK Clang.

---

## 8. Agent-facing skills & tools for C++ work

- **`cpp-pro` skill** (fullstack-dev-skills collection) — idiomatic modern
  C++, RAII, smart pointers, STL, templates, move semantics, perf
  optimization; ships reference files for build tooling, concurrency,
  memory/performance, templates.
- **Anthropic's official skills repo** (`github.com/anthropics/skills`) —
  safest source to check first for anything C++-related.
- **C++ Style Guide MCP Server** (`SongJiangzhou/cpp_guidelines_mcp`) —
  agent-callable, not just a static doc. Tools include:
  - `analyze_memory_safety` — detects leaks, dangling pointers, unsafe patterns
  - `suggest_modern_cpp` — modernization suggestions up to C++23
  - `check_const_correctness`
  - Resources covering RAII/Pimpl/Factory/Observer patterns
  - Install: `npx -y @smithery/cli install cpp_guidelines --client claude`
- Underlying knowledge sources these are built from:
  - `cpp-best-practices/cppbestpractices` (Jason Turner's collection)
  - `federico-busato/Modern-CPP-Programming` (full course, C++03–C++23/26)
  - Google's `cpplint` / C++ style guide

**Recommended setup**: `cpp-pro`-style skill for "how to write it" +
C++ Style Guide MCP server so the agent can self-check output, backed by
real clang-tidy/ASan/UBSan in the actual build as the final backstop.

---

## 9. Rust for RN — UniFFI / UBRN deep dive

- **UniFFI** (Mozilla) — generates Swift/Kotlin/Python/etc. bindings from
  annotated Rust code. Used in production in Firefox mobile for years.
  "Ready for production use" but explicitly pre-1.0 — breaking changes
  possible on upgrade.
- **uniffi-bindgen-react-native (UBRN)** — generates TypeScript + JSI C++
  bindings so RN calls Rust directly via Turbo Modules' registration
  mechanism, skipping hand-written Swift/Kotlin glue (same "skip the
  intermediary" pattern as Nitro, just for Rust).
- **Two independent paths available:**
  - *Path A*: Rust → UniFFI generates Swift/Kotlin → wrap in an Expo local
    module → Expo bridges to JS. No UBRN needed. Simpler DX, fine for
    occasional calls.
  - *Path B*: Rust → UBRN generates JSI bindings directly → fewer hops.
    Matters for high-frequency calls / large payloads (streaming, per-frame).
- **The WASM naming pivot, explained**: UBRN added WASM support as a
  *third, separate target* (Web), not a replacement for its RN path.
  - RN target: Rust compiles to native ARM/x86, called via JSI C++. No WASM.
  - Web target: Rust compiles to actual WASM bytecode (via wasm-bindgen) —
    required because browsers can't run native ARM/x86 binaries.
  - Rename to `uniffi-bindgen-javascript` reflects broadened scope
    (RN + Web + Node), not any change to how RN itself works. Backwards
    compatibility explicitly promised.
  - Hermes (RN's JS engine) has no role in the WASM path at all — the "no
    Hermes JIT/WASM roadmap" concern is real but irrelevant here.
- **Health/activity signals (positive)**:
  - Steady changelog cadence, closely tracking uniffi-rs version bumps
  - WASM support followed a deliberate ~6-month development push
  - LiveKit deprecated its own competing tool (`uniffi-bindgen-node`) in
    favor of this project gaining Node support — real ecosystem consolidation
  - Backed by Mozilla's long-running UniFFI project + community guidelines
  - Real production users cited (ChessTiles)
- **Caveats**:
  - Still pre-1.0; expect occasional breaking changes
  - Single visible primary maintainer (James Hugman) — bus-factor risk
  - Smaller community/StackOverflow footprint than Nitro's C++ ecosystem

---

## 10. Android-specific nuance: Kotlin ↔ Rust is not "zero-cost"

- UniFFI's standard Android/JVM path uses **JNA (Java Native Access)**,
  which relies on **Java reflection** to call native functions — not a
  direct compiled call.
- Two concrete gotchas:
  1. R8/ProGuard (release-mode obfuscation) can rename the classes/methods
     JNA depends on, causing `UnsatisfiedLinkError` at runtime unless you
     add the right ProGuard rules (not bundled in the official AAR).
  2. If Rust spawns a thread that calls back into Kotlin, it must be
     explicitly attached to the JVM — otherwise JNA attaches/detaches a
     thread on *every single call*, which is a heavy operation.
- **Kotlin/Native** (as opposed to Kotlin/JVM) uses `cinterop` instead of
  JNA — a lighter-weight path, but not what most RN/Android projects hit
  by default.
- iOS/Swift's bridge is more direct (closer to native C interop) — a real
  asymmetry between platforms worth remembering.
- **Bottom line**: still "fast enough for real work" (Mozilla ships this in
  production), but not mechanically identical to the Swift/iOS side. Two
  lines of setup (ProGuard rule + thread attach) avoid the known pitfalls.

---

## 11. Full production lifecycle checklist (if doing real native work)

- **Build**: CMake (near-universal for C++); Cargo for Rust (much less
  fragmented than the C++ packaging story)
- **Dependency management**: Conan/vcpkg for real C++ third-party deps;
  otherwise vendor small libs directly
- **Static analysis**: clang-tidy, cppcheck, Google cpplint — run in CI
- **Sanitizers**: ASan/UBSan in debug/test builds only (too slow for prod)
- **Testing**: GoogleTest/Catch2 (C++), plug into CMake/CTest
- **CI**: build + test + sanitizers on every PR, across both iOS and
  Android toolchains (ABI issues are platform-specific)
- **Formatting**: clang-format, follow existing repo `.clang-format`
- **Versioning**: semver on your own module; pin native dep versions
  explicitly — silent ABI drift is a classic production incident
- **Build times**: precompiled headers / ccache-sccache matter a lot for
  velocity; C++ compiles slowly
- **Binary size**: native code changes app size directly — budget it in CI
- **Crash reporting**: native crashes need separate tooling (symbolication)
  beyond standard JS error tracking
- **Onboarding cost**: C++/Rust mobile toolchain setup (Xcode, NDK, CMake/
  Cargo versions) is heavier than "npm install" — document explicitly
- **Debug loop**: native changes require a full native rebuild, no hot
  reload — biggest DX regression coming from pure RN/TS work

---

## 12. Source-code dissection notes — Nitro, Nitrogen, and UniFFI/UBRN

### Nitro core (`react-native-nitro-modules`) — the `HybridObject` pattern
- Everything funnels through one small base class (`HybridObject`) with a
  `loadHybridMethods()` registration step — register-then-dispatch, not a
  unique bridge per method. Reusable pattern for any plugin-style system.
- `JSIConverter<T>` — a template-specialization mechanism: define a converter
  once per custom type (enum/union/struct), and the compiler enforces every
  usage matches. This is the actual compile-time-safety trick behind "wrong
  types won't compile" — achieved via disciplined C++ templates, not a
  borrow checker. Nitrogen auto-generates these; hand-writing is discouraged.
- Platform-specific zero-overhead tricks: Swift↔C++ direct interop on iOS
  (no Obj-C hop, via Swift 5.9 C++ interop), fbjni on Android for
  low-overhead Kotlin/Java bridging.
- Real production bug worth remembering: a Kotlin `HybridObject` memory leak
  was fixed by switching a strong `jni::global_ref` to a `weak_ptr` — a
  cross-language *ownership/lifecycle* bug (GC vs C++ refcounting
  disagreeing about ownership), not a classic dangling-pointer bug. This is
  the real caveat category once you're past raw memory management.
- Common real failure mode: "HybridObject X has not yet been registered in
  the HybridObjectRegistry" — a registration-order bug class, from missing
  init calls at app startup.
- Health signals (as of this research): 1.9k stars, 96 forks, 110 releases,
  v0.35.9, actively maintained, healthy multi-language split (48% C++,
  27.5% TS, 14% Swift, 8% Kotlin).

### Nitrogen (the codegen) — the general pattern worth reusing
- Uses the real TypeScript compiler's own AST parser to read `.nitro.ts`
  files — never hand-parse a language you don't have to.
- Generates a native "Spec" (protocol/interface) per platform from one TS
  source of truth. If the native implementation doesn't satisfy the spec
  exactly, the app won't compile — full type/null-safety enforced by each
  platform's own compiler, not by Nitro itself.
- **General-purpose lesson**: "generate an abstract interface from one
  source, let each target language's own compiler enforce conformance" is
  reusable for anything — e.g. a design-token DSL (single token source →
  generate TS/Swift/Kotlin/Figma-JSON output) to avoid drift between
  platforms, not just for native module bindings.
- Deliberately generates once and commits output to git (unlike RN's old
  Codegen, which regenerates every app build) — trades repo noise for
  build reliability and reproducibility.

### UniFFI / UBRN — real-world integration notes
- Core `uniffi-rs` has serious production pedigree: used by Mozilla since
  2020 for Firefox's bookmarks/history sync, Suggest, telemetry — hundreds
  of millions of users; also used in AOSP.
- UBRN (the RN-specific layer) is meaningfully newer/less proven — one part
  of its own docs says "still in early development, should not yet be used
  in production," while other pages describe real production users
  (ChessTiles). Docs disagreeing with themselves is itself a signal to lean
  conservative on production-readiness assumptions.
- Genuinely clever architectural trick: bidirectional FFI — a Rust trait
  (e.g. `BinaryOperator`) can be implemented either in Rust or directly in
  TypeScript, and Rust code can call whichever implementation it's handed.
  Useful pattern: "run a hot loop in Rust that calls back into
  user-supplied JS logic per iteration" (e.g. custom scoring/sort/filter
  callbacks) — a callback/strategy pattern crossing the language boundary.
- Config-driven integration: `ubrn.config.yaml` points at an external Rust
  repo/branch/manifest path rather than vendoring source directly — lets
  one Rust core be shared cleanly across multiple apps/forks.
- Sharp real gotcha: forgetting to enable a `staticlib` crate type in the
  Rust project's `Cargo.toml` is a common, easy-to-hit build failure.
- Comparison point (`uniffi-rs-fullstack-examples`, a small 97-star teaching/
  consulting-portfolio repo, not an active framework): shows how thin *raw*
  uniffi-rs is on its own — no HybridObject-equivalent abstraction, no
  RN-specific build pipeline. The real lesson is by contrast: the gap
  between "a working FFI mechanism" and "a pleasant, production-usable RN
  integration" is almost entirely in the middle layer (build tooling,
  packaging, type-safety abstraction) — that's the expensive part Nitro
  invested years into, and what UBRN is still catching up on relative to
  Nitro's maturity.

---

## 13. Final decision and rationale (for this project)

- **UI/visuals**: Reanimated + Skia first, before any native code, for the
  custom tab bar/FAB work.
- **Native layer, if/when actually needed**: **Rust over C++.**
  - Rationale: solo + AI setup has no human code reviewer. Rust's
    compiler-enforced memory safety substitutes structurally for that
    missing review step — bad Rust mostly fails to compile (visible,
    fixable same-session); bad C++ can compile and run fine for months
    before failing in a way that's hard to root-cause alone.
  - Real cost acknowledged: C++/Nitro has a bigger ecosystem and more
    examples for an AI to pattern-match against — a genuine tradeoff, just
    outweighed by the review-gap argument above.
- **Bridging tool**: UniFFI, with Expo Modules API wrapping for simple/
  occasional calls, or UBRN for high-frequency/large-payload cases later.
- **Most likely real future native use case**: vector search / on-device
  small-model inference — not the UI work.
