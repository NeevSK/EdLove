# The WASM Deep Dive — Component Model, Mobile JIT Constraints, and Per-Language Hosting

Context: exploring whether WebAssembly's Component Model offers a better
cross-language safety story than the FFI/verification tooling explored
elsewhere in this research, specifically for a React Native/Expo mobile
app with native modules in C++, Rust, Swift, and Kotlin.

---

## 1. The WebAssembly Component Model — solve it by design, not detection

Unlike everything else explored in this research (Miri, Kani, CPG-based
detection), the Component Model is a **prevention-by-design** strategy:
make the unsafe version of an FFI call impossible to express, rather than
detecting bugs in it after the fact.

- **WIT (WebAssembly Interface Types)** — an IDL describing component
  interfaces using only high-level types (`list<string>`, `result<user,
  error>`), never raw pointers.
- **Canonical ABI** — handles lifting/lowering automatically (same
  terminology and mechanism as UniFFI's `RustBuffer`, just standardized
  as a general, cross-language W3C spec rather than one project's
  Rust-specific solution). A component written in Rust can be consumed
  directly by Python, JS, or Go via this shared contract.
- **This eliminates whole bug classes by construction**: since raw
  pointers never cross the boundary, the `const`/`mut` misdeclaration
  class and raw-pointer-ownership-transfer class simply can't be
  expressed — not detected-and-flagged, but structurally impossible.
- **WasmGC** generalizes JSI's "shared GC handles cross-boundary
  ownership" trick beyond same-runtime sharing — the *host engine's* GC
  can manage typed heap objects from *any* language's module, without
  that module needing to share the host's actual runtime.
- **Current maturity**: W3C Phase 2/3 proposal, not yet in browsers,
  Wasmtime is the only fully-conformant runtime. Cross-component calls
  were synchronous-only until Preview 3 (April 2026) introduced native
  `Future`/`Stream` types — even this from-scratch, safety-first design
  hit the same "blocking the caller" problem JSI has.
- **Stated motivation, capturing the whole tension of this research
  thread**: C-based FFIs are notoriously fragile and memory-unsafe, while
  RPC-based systems introduce serialization overhead that can account for
  60% of total latency — the Component Model tries to get JSI's speed
  *and* UniFFI's safety simultaneously, via one standard.

**Where it actually lives right now**: browsers and server-side runtimes
(Wasmtime, Node) — not mobile. See Section 2 for why.

---

## 2. Why mobile (RN/iOS) can't get the Component Model's real benefit

### The root cause is a platform policy, not an RN/Hermes limitation
Apple's App Store policy forbids third-party apps from JIT-compiling code
on-device at all. Any WASM runtime hits this wall on iOS — not solvable
by picking a different JS engine or WASM library. A developer who tried
embedding the Wasmer runtime as an RN native module found it "really
slow, mainly because of the restriction on iOS devices that apps are not
allowed to perform JIT compilation."

### Hermes itself has zero built-in WASM support anyway
A long-open GitHub issue (since 2020) confirms Hermes has no
`global.WebAssembly` — unlike V8/JSC, you can't call
`WebAssembly.instantiate()` in Hermes at all, independent of the iOS
JIT issue.

### The real, current, production answer on RN: wasm2c (fully AOT, no JIT ever)
**Callstack's Polygen** uses `wasm2c` to transpile WASM into plain C code
at build time, then generates JSI glue so JS can call the result as a
normal native module. No JIT anywhere in the pipeline — genuinely
sidesteps the iOS restriction. Current 2026 runtime benchmarks confirm
wasm2c remains excellent for this deployment model: "if ahead-of-time
translation to native C is acceptable, it's hard to beat." React Native
0.84 added official WebAssembly support as a headline feature — almost
certainly formalizing this same AOT approach, given the iOS JIT wall is
a hard constraint no RN version can lift.

### What this costs you vs. the Component Model's actual promise
The Component Model's headline benefit — dynamically loading signed
components from a registry (e.g. WA.dev) at runtime, no recompile needed
— depends on dynamic instantiation, which iOS forbids outside a narrow,
non-general carve-out (see Section 5). On mobile, wasm2c gets you WASM's
*portability as a source format*, but not the Component Model's actual
dynamic-composition story — you're back to a normal, build-time-linked
native module that merely originated as WASM.

---

## 3. Per-language hosting options — real current tools

### C++ — WAMR (WebAssembly Micro Runtime)
- Bytecode Alliance project; simple C APIs to embed directly into a C/C++
  host application — the natural fit for a Nitro-style native module.
- Supports **interpreter, AOT, and two JIT tiers** (Fast JIT, LLVM JIT,
  with dynamic tier-up) in one runtime; explicitly supports Android among
  its platforms (self-implemented AOT loader).
- Real measured numbers: interpreter ~3–5x slower than native; Fast JIT
  reaches 70–80% native; AOT delivers 80–90% native with zero runtime
  compile cost. Small footprint (~85KB interpreter core, ~200–300KB with
  JIT).
- On iOS: JIT tiers hit the same Apple wall as everything else; AOT and
  interpreter modes work fine.
- Governance note: mid-transition to a new independent organizational
  home the week of July 27–31, 2026, keeping the same maintainers — a
  live, current data point, not a red flag.

### Swift — WasmKit
- Pure-Swift WebAssembly interpreter, embeddable via SwiftPM, WASI
  support, **no JIT** — which is exactly why it works on iOS: an
  interpreter executes WASM as data, no code generation, no special
  entitlements — the same trick Hermes/JSC/QuickJS use for JS itself.
- Honest cost, stated plainly by the maintainers: interpreted execution
  runs 1–2 orders of magnitude slower than JIT-compiled WASM (itself
  slower than native) — "the wrong tool for a database engine or a
  render loop."
- **This partially restores the Component Model's dynamic-composition
  story on iOS** — you genuinely can dynamically load and execute
  arbitrary WASM at runtime via WasmKit; you're trading the Component
  Model's speed for its flexibility, not losing the capability entirely.
- Broader Swift trajectory: WebAssembly became a **Tier-1 Swift
  compilation target** as of Swift 6.1 (first-party, no forks, full
  SwiftPM/CI integration); Embedded Swift produces much smaller binaries;
  Apple is separately building official Swift-on-Android support (a
  Working Group, Swift 6.2 SDK bundles) — positioning Swift as a genuine
  cross-platform business-logic language, explicitly pitched as a modern
  alternative to sharing logic via C++.

### Kotlin — real capabilities vs. still-can't (precisely dated)
- **Real and production-credible**: WasmGC reached universal support
  across all major browsers (including Safari) by December 2024. Compose
  for Web hit Beta in September 2025, measured at ~3x faster than the
  equivalent Kotlin/JS build in UI-heavy workloads.
- **Still can't, as of the most current releases** (Kotlin 2.3.20 and
  2.4.20-Beta2, both within the last two weeks of this research): Kotlin/
  Wasm remains **Beta overall** per the March 2026 roadmap. The WASI
  (server-side) target exists but is explicitly **not recommended for
  production server workloads**. **Threading via the WASM threads
  proposal is still unshipped** — blocking any high-throughput/concurrent
  server use case. 2.4.20-Beta2 just added Wasmtime as a pluggable WASI
  runtime option days before this research — still actively moving.
- **Important distinction**: this is all Kotlin *compiling to* WASM (an
  output target), not Kotlin *hosting* WASM modules from inside a JVM/
  Android app — no Kotlin-native equivalent to WasmKit was found for that
  direction.
- **This matters less than it sounds, though**: Android has **no JIT
  restriction at all** — so for hosting WASM inside an Android native
  module, just use WAMR or Wasmtime directly via JNI bindings, getting
  full JIT speed with none of the iOS-side workarounds. The "host WASM
  from native code" problem is already solved and easy on Android
  specifically — the hard, interesting problem in this whole section is
  an iOS-only problem.

---

## 4. The JIT-entitlement timeline question — resolved: there isn't one

This is the single most important finding of this thread, and it's
definitive, not speculative:

- **BrowserEngineKit's JIT carve-out (Apple's EU DMA compliance
  framework) is legally restricted to actual alternative browser-engine
  apps** — not general-purpose apps, not native modules, not anything else.
- **Apple has already explicitly denied a real request to extend it.** A
  terminal-emulator app (iSH) filed a formal EU DMA interoperability
  request in mid-2024 asking Apple to expand JIT access beyond browsers
  to their non-browser app. After two months of deliberation, **Apple
  denied it outright.**
- Even for its *intended* use case, adoption has been essentially zero:
  years after BrowserEngineKit shipped, no browser has actually released
  an alternative-engine version on iOS, largely due to the EU-only scope
  and low incentive to fork a codebase for one regional market.

**Direct conclusion**: there is no foreseeable path — EU or otherwise —
for a general native module (Nitro's, UBRN's, or your own) to gain JIT
access on iOS. The 10–100x (WasmKit) or 3–5x (WAMR interpreter)
execution tax on dynamic WASM is not a temporary gap waiting to close —
it's a structural, indefinite feature of building on iOS. Plan around it
as permanent.

---

## 5. Summary table — the full picture

| Approach | Platform | Mechanism | Speed | Dynamic loading? |
|---|---|---|---|---|
| wasm2c (Polygen) | RN, both platforms | AOT → native C → JSI | Near-native | No — build-time only |
| WasmKit | Swift/iOS | Pure interpreter | 1–2 orders of magnitude slower | Yes |
| WAMR (interpreter) | C++/either platform | Interpreter | ~3–5x slower | Yes |
| WAMR (AOT) | C++/either platform | AOT | 80–90% native | No — build-time only |
| WAMR/Wasmtime (JIT) | Android only | JIT | 70–80%+ native | Yes |
| True Component Model w/ registry | Browser/server only | JIT + Canonical ABI | Near-native | Yes, by design |

**Bottom line for this project**: the Component Model's full promise
(safety-by-design + dynamic composition + near-native speed
simultaneously) is real, but currently lives on browsers/servers, not
mobile. On iOS specifically, you choose two of the three: fast+static
(wasm2c/WAMR AOT), or flexible+slow (WasmKit/WAMR interpreter) — never
fast+dynamic, and that limitation is permanent, not pending a future
Apple policy change.
