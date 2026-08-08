# FFI Mechanics Deep Dive — UniFFI, JSI, and What Actually Counts as FFI

---

## 1. What FFI actually is, mechanically

Every FFI system solves the same root problem: **how do you get a rich,
language-specific value across a boundary that only understands "numbers
and pointers"?** A CPU calling convention can only pass integers, pointers,
floats — not a Rust `String`, a C++ `std::vector`, or a JS object.

The near-universal answer is the **C ABI** (`extern "C"` in C++,
`#[no_mangle] pub extern "C"` in Rust) — not because C is special, but
because every OS/compiler agrees on its calling convention. This is
specifically about avoiding C++ **name mangling**: a C++ compiler renames
`add(int,int)` internally (e.g. `_Z3addii`) to support overloading; a
C-ABI function keeps its exact symbol name, so any language can find and
call it by name alone.

**Canonical definition** (Wikipedia): a foreign function interface is a
mechanism by which a program written in one language can call routines
written or compiled in another — often used specifically in contexts where
calls are made into a binary dynamic-link library. Important explicit
carve-out: the term is generally **not** used to describe multi-lingual
runtimes where a common substrate lets any compliant language use services
defined in any other (example given: the CLR/.NET) — this carve-out
matters a lot for the JSI question below.

---

## 2. UniFFI (Rust) — real internals

**Lifting and lowering** — the core mechanism: the sending side "lowers" a
language-specific value into a primitive FFI type; the receiving side
"lifts" that primitive back into its own language-specific type. Simple
types (integers) are cast directly; non-trivial types (Strings, Records,
Optionals) are serialized into a byte buffer called a `RustBuffer`.

**`RustBuffer`** — the actual answer to "how do you pass a String/struct
across a boundary that only understands primitives": it decomposes a
`Vec<u8>` into raw parts (pointer, length, capacity) passed as a plain
struct. This is unsafe by construction, so UniFFI enforces strict rules:
`RustBuffer`s must only be constructed from a `Vec<u8>`, and deliberately
do **not** implement Rust's `Drop` trait, since they're meant to be handed
to foreign code outside Rust's own ownership system. To avoid leaks, a
`RustBuffer` must be explicitly passed back into Rust and destroyed via
`RustBuffer::destroy` (or converted back to a `Vec<u8>`, which then drops
normally). **Ownership crossing an FFI boundary is never implicit** —
someone has to explicitly hand it back, or it leaks silently, forever.

**Rust "scaffolding"** — every exported Rust function gets a real
`extern "C"` twin doing lower→call→lift on both ends. For proc-macro-based
projects this is generated automatically by the macros; for the older
UDL-file approach, a `build.rs` calls `uniffi::generate_scaffolding(...)`
to produce it.

**Contract/ABI version checking** — the generated scaffolding includes an
`extern "C"` function whose only job is returning a `UNIFFI_CONTRACT_VERSION`
number, so generated bindings can verify at runtime that the Rust library
and the Kotlin/Swift bindings agree on the wire format before making any
real call — a concrete guard against silent ABI mismatches.

**Async — solved with a polling loop, not a callback**: an async Rust
function is implemented by a scaffolding function that returns a
`RustFuture` handle (not the result). The generated bindings then run an
async loop *on the foreign side* that repeatedly calls a `rust_future_poll`
function with a continuation callback, until the future signals completion.
This is the concrete reason async-across-FFI is fiddly — you're
implementing a real polling protocol by hand (generated, but still a real
protocol), not just calling a function and awaiting a value.

---

## 3. JSI (C++) — real internals

**Core primitive**: `jsi::HostObject` — a C++ class you subclass,
overriding `get`/`set`, that JS treats as an ordinary object:
```cpp
class NativeStorageModule : public jsi::HostObject {
public:
  jsi::Value get(jsi::Runtime& runtime, const jsi::PropNameID& name) override {
    if (name.utf8(runtime) == "getItem") {
      return jsi::Function::createFromHostFunction(
        runtime, name, 1,
        [this](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t) {
          auto key = args[0].getString(rt).utf8(rt);
          return jsi::Value(rt, jsi::String::createFromUtf8(rt, storage_[key]));
        });
    }
    return jsi::Value::undefined();
  }
private:
  std::unordered_map<std::string, std::string> storage_;
};
```

**Why this works with no serialization step**: the JS runtime itself
(Hermes/V8/JSC) is written in C++ — so JS can hold a direct memory
reference to a C++ `HostObject`, no "lift/lower into bytes" protocol
needed, unlike UniFFI. This is only possible because both sides share one
compiled runtime/address space; it's not a true process/library boundary.

**Memory ownership — refcounting instead of an explicit destroy call**: a
`HostObject` is held via `std::shared_ptr`, exposed to JS via
`jsi::Object::createFromHostObject`. This integrates with the JS garbage
collector — when JS stops referencing the object, the `shared_ptr`
refcount drops and the C++ object is destroyed automatically. Directly
contrasts with UniFFI's `RustBuffer`, which needs an explicit destroy call
with no GC integration — two different, each-correct answers depending on
whether there's a shared GC to hook into.

**The real footgun specific to JSI**: synchronous calls are allowed, but
calling a slow C++ method synchronously freezes the JS thread for its
entire duration — the fix is Promise-based async patterns for I/O-bound
native work. A different problem from UniFFI's async complexity: JSI's
issue is blocking one *shared* thread; UniFFI's issue is genuinely crossing
between two *separate* async runtimes.

---

## 4. Is JSI/Nitro actually "FFI"? — the precise answer

**Not quite, by the strict/classical definition — though it's commonly
called that colloquially.**

- **UniFFI** = textbook FFI: real `extern "C"` functions, a genuinely
  separate compiled Rust binary, explicit lift/lower across an actual
  process/library boundary, no shared runtime underneath.
- **JSI/Nitro** = closer to an **embedding/host-object API** — the same
  category as V8's own C++ Embedder API, or Python's C extension API — not
  classical FFI, because there's no `dlopen`/symbol-table lookup into an
  independently-linked binary. It shares one compiled runtime rather than
  crossing into a separate one.
- This distinction is made in practice, not just academically: the
  Node.js community explicitly separates "Node addons (N-API/NAN)" —
  compiled directly into the same process — from "userland FFI libraries"
  (`ffi-napi` and predecessors, which depend on a real FFI library like
  `libffi` to dynamically construct calls at runtime). JSI/Nitro is
  architecturally in the "addon" category, same shape as N-API.
- RN community writing reflects this too — "bridge"/"interface" language
  is used for JSI far more than the literal term "FFI," even loosely.

**Practical takeaway**: JSI's speed advantage *comes from* not needing a
real FFI-style boundary crossing — this definitional distinction isn't
pedantry, it's the actual architectural reason JSI is fast.

---

## 5. The three-leg reality: JS ↔ C++ ↔ Swift/Kotlin

The "no real FFI" argument only applies to the **C++ leg** (since Hermes
*is* C++). Swift and Kotlin are not the JS engine's implementation
language, so both need a genuine interop step — two different ones:

### Kotlin → C++: this one really is textbook FFI
Kotlin/Java reaches C++ via **JNI** — matching the strict definition
exactly: JVM bytecode calling into an independently compiled native
library through a formally defined interface. Real-world cost, from a
practitioner directly: "Kotlin/Java → JNI (**which is SLOW**) → C++."
`fbjni` (Facebook's helper library) exists specifically to make
hand-writing this genuinely-FFI boundary less painful.

### Swift → C++: historically a language trick, now a third distinct category
- **Historically**: Swift module code sat behind an Objective-C++
  translation layer, which then called into JSI's C++ implementation —
  because Swift couldn't talk to C++ directly. Objective-C++ (`.mm` files)
  was the only practical bridge. Real cost: every call crossed two
  language boundaries each way, with values converted twice
  (`std::string`→`NSString`→Swift `String`), each conversion allocating
  and copying memory.
- **As of Expo SDK 56 (May 2026)**: Swift now talks to JSI directly via
  Swift/C++ interop, removing the Objective-C++ middle layer entirely —
  Nitro Modules pioneered this exact approach earlier, when Swift/C++
  interop was even less mature.
- Swift's C++ interop (introduced in Swift 5.9) is a genuinely **third
  category**: not a shared runtime (Swift and C++ are still different
  languages), not classical dlopen-based FFI either — it's **compile-time
  interop support built directly into the Swift compiler**. Swift can
  import a C++ header and call into it as native Swift, at compile time,
  with no dynamic symbol resolution.

### The full stack is three different mechanisms, not one
1. **JS ↔ C++** — shared runtime (Hermes is C++), the "not really FFI" leg
2. **C++ ↔ Swift** — Swift's compile-time C++ interop, a distinct third mechanism
3. **C++ ↔ Kotlin** — JNI, genuinely textbook FFI, and the slowest leg

Confirmed directly in Expo's own architecture docs: JSI access on iOS goes
through `RCTHostRuntimeDelegate`; on Android it goes through `ReactHost`
and JNI bindings — two structurally different paths to reach the same
JSI/C++ layer.

### A real, current bug proving these mechanisms genuinely collide
A November 2025 pull request in the `swift-java` project documents: when a
Swift module enables C++ interoperability mode, the standard `jni.h`
header gets parsed differently — `JNIEnv` becomes a struct type instead of
a pointer type — causing real type-mismatch compile errors between the
generated JNI bridge code and Swift's C++ interop expectations. This is a
live, currently-being-fixed bug, not a hypothetical — direct proof that
Swift's compile-time C++ interop and Kotlin's JNI-based FFI are genuinely
different mechanisms that can interfere with each other when both are
active in the same build.

---

## 6. Cross-cutting summary table

| Boundary | Mechanism | Real FFI (strict def.)? | Ownership model | Known footgun |
|---|---|---|---|---|
| JS ↔ C++ (Hermes) | JSI HostObject, shared runtime | No — embedding/host-object API | `shared_ptr` + GC integration | Blocking the JS thread with a slow sync call |
| C++ ↔ Swift | Swift/C++ compile-time interop (Swift 5.9+) | No — compiler-level interop, 3rd category | Swift ARC ↔ C++ RAII, compiler-bridged | Collides with JNI's C-mode assumptions when both active |
| C++ ↔ Kotlin/JVM | JNI (+ `fbjni` helper) | **Yes** — textbook FFI | Manual (`jni::global_ref` vs `weak_ptr`, as seen in Nitro's real leak fix) | Slow; reflection/registration overhead |
| Rust ↔ Swift/Kotlin/TS | UniFFI (`RustBuffer`, scaffolding, contract version check) | **Yes** — textbook FFI | Explicit destroy/lift-lower, no shared GC | Async requires hand-rolled polling protocol |

**The general lesson**: "FFI" gets used colloquially as an umbrella term
for "call code in another language," but the actual mechanism — and its
real performance/safety tradeoffs — depends entirely on whether there's a
shared runtime underneath. Three genuinely different answers to the same
question (shared-runtime embedding, compiler-level interop, and classical
symbol-boundary FFI) are all stacked in a single Nitro/Expo module call,
and each has its own distinct failure modes worth knowing separately.
