# FFI Verification R&D — Master Synthesis

This is the capstone doc for a long research thread on native C++/Rust
integration in RN/Expo, running from "why is C++ hard" through real
production case studies, FFI mechanics, and into the open question of
whether tooling (AI-assisted or otherwise) can make cross-language
boundaries genuinely verifiable rather than just carefully engineered.

**Companion docs from this same research thread:**
- `cpp-rust-rn-native-research.md` — Nitro/Nitrogen/Rust decision, RN architecture tiers
- `famous-native-integrations-deep-dive.md` — libsignal, ExecuTorch, Typeshare, application-services
- `ai-agent-tooling-and-rn-toolchain-guide.md` — Skills/MCP landscape, real 2026 practitioner toolchain
- `ffi-mechanics-deep-dive.md` — UniFFI/JSI internals, is JSI "really" FFI, the three-leg Swift/Kotlin/C++ interop
- `expo-prebuild-ci-config-patterns.md` — prebuild wipe mechanics, CI/config drift

---

## 1. Why this is genuinely hard — the research-grounded case

Real, published research confirms this isn't a "just be careful" problem:
- A 2025 empirical study of real cross-language bug-fixing commits found
  **logic errors and boundary conditional errors dominate** — e.g. a
  `size=0` passed into `realloc` across a Java–C boundary is ordinary in
  Java but implementation-defined/undefined in C. Each language's
  "obviously fine" input can be specifically undefined in the other's model.
- Real Rust CVEs have been caused by undefined behavior in the *foreign*
  function being called (`mallocx()` undefined for zero size; a race
  condition via `getenv()`/`setenv()`; memory misalignment; inconsistent
  data layout) — "safe" code on one side doesn't protect against UB in
  the other.
- A CMU study auditing real Rust FFI usage found bugs like a foreign
  pointer incorrectly declared `const` vs `mut`, and concluded plainly:
  **"it is easy to inadvertently introduce undefined behavior... it seems
  likely that many will persist until the Rust community develops a
  production-ready method for finding aliasing violations."** No mature,
  reliable tool exists yet for this whole bug class.
- Even foundational semantics were only recently settled: Rust's own team
  didn't formalize whether an exception can cross the C ABI until a
  dedicated multi-year "ffi-unwind" project — before that, it was simply
  undefined behavior because nobody had specified the correct behavior.
- Academia itself acknowledges the gap: there is "little in the way of
  design assistance for FFI-based multilingual software" comparable to
  established single-language design methods.

**Takeaway**: this is a genuinely hard, still-actively-researched domain —
not a skill gap on any one engineer's part.

---

## 2. Alternative engineering responses to the same problem

- **Fil-C** (Filip Pizlo) — a fork of Clang/LLVM giving C/C++ full memory
  safety via invisible per-pointer capabilities checked at the LLVM IR
  level, with zero unsafe escape hatches (unlike ASan/MTE, which attackers
  can bypass). Retrofits safety onto *existing* massive C/C++ codebases
  with minimal/no changes — a different strategy from Rust's compile-time
  approach: runtime capability checks + GC, at a real performance cost.
  Not "better than Rust" categorically — different tool for existing vs.
  new code.
- **Zig's `comptime`** — collapses "runtime code" and "compile-time code"
  into the same language rather than a separate macro/template system;
  same syntax, same semantics, different execution phase. Directly
  relevant: some validation that would be a runtime assertion in C or a
  panic in Rust becomes an actual compile error in Zig — moving boundary
  checking earlier. Easy C interop (`@cImport`), but small/immature
  ecosystem, pre-1.0.

---

## 3. Simulating/verifying the boundary logically — real current tools

Real tools already exist for "verify against lower-level constraints
logically, without a full real-hardware run every time":

- **Miri** — interprets Rust's MIR step-by-step with exhaustive UB checks;
  found dozens of real bugs, now in the Rust standard library's own CI.
  As of Dec 2025, has **experimental support for executing FFI native code
  itself** and tracking shared memory across that boundary — a direct,
  current answer to "simulate the cross-language boundary." Limits: does
  NOT catch logic errors, only UB; the native code itself still runs with
  zero UB checking; slow (orders of magnitude vs native).
- **Kani** — a bounded model checker for Rust, using an SMT solver (via
  CBMC) to try to mathematically prove properties hold for all valid
  inputs. Has an explicit, ongoing **"C-FFI Milestone"** project aimed at
  eventually supporting verification of FFI-called code. Limits: current
  "stubs" for FFI are unverified — the user asserts a stub is accurate and
  Kani trusts it; doesn't track data races or full aliasing/lifetimes.
- **CBMC** — AWS's own production bounded model checker for C, proven at
  scale (boot code, crypto SDK, network protocols) via **triage, not
  comprehensive formalization** — see Section 5.
- **No current sanitizer or checker rules out all UB, even for a single
  execution** — some UB requires state (pointer provenance) that isn't
  tracked by any current tool.

---

## 4. Modeling the boundary itself — multi-language semantics

The idea of modeling "language A's own rules," "language B's own rules,"
and "the interaction layer" as three separate, explicit things is a real,
named academic technique:

- **Matthews & Findler (POPL 2007)** — "multi-language semantics": rather
  than one merged model, give each language its own semantics plus an
  explicit **boundary construct** ("A on the outside, B on the inside" and
  vice versa) connecting them.
- **Melocoton** — a real, working, mechanized (in Coq/Iris) proof-of-concept
  doing exactly this for OCaml, C, and the OCaml FFI specifically — the
  first formal semantics of a large chunk of the real OCaml FFI (previously
  only informal prose in the OCaml manual), plus a program logic to reason
  about OCaml/C interaction. This is not hypothetical — it's been built,
  once, for one real pair.
- **Why it hasn't been done for every pair (Rust+C, Swift+C++, Kotlin+JNI)
  yet**: each is genuinely PhD-thesis-scale dedicated formal-methods labor
  from scratch — a research-time bottleneck, not a theoretical one.

---

## 5. The practical answer: triage, not comprehensive formalization

Real production practice (not just theory) already resolves the
"from-scratch is too much" tension via triage:
- AWS's own published practice: CBMC targeted at specific known-high-risk
  C code (boot code, crypto SDK, network protocols, RTOS) — not an attempt
  to formalize all of C.
- A separate paper on cloud-provider practice uses the literal word
  **"triage"**: bounded model checkers used to triage the severity of
  security bugs.
- Very recent research (weeks old) formalizes this as **function-level
  prioritization** — focusing verification effort on the most critical
  code parts — evaluated on real open-source C projects, finding real,
  developer-confirmed vulnerabilities.

**A graduated cost/rigor ladder, triaged by risk:**
1. **Cheapest** — mechanical type/contract checks at the boundary (already
   built into UniFFI's contract-version check, Nitrogen's `JSIConverter<T>`)
2. **Medium** — targeted dynamic checks on just the boundary-crossing code
   (Miri scoped to FFI modules, sanitizers, `cargo-fuzz` aimed at
   boundary-crossing functions specifically, since fuzzing is exactly the
   right tool for hunting boundary-condition bugs like the realloc-zero case)
3. **Expensive, rare** — bounded model checking on top-priority functions
   only (Kani, CBMC)
4. **Reserved** — full bilateral multi-language semantics (Melocoton-style),
   only for the single highest-stakes boundary you actually have

**The triage input is the known-bug taxonomy already assembled across
this research**: the realloc-zero-size class, const/mut pointer
mismatches, aliasing violations, the Nitro Kotlin `jni::global_ref`-vs-
`weak_ptr` leak, ExecuTorch's linker-pruning gotcha, libsignal's bundled-
dylib bloat, the `staticlib` crate-type miss in UBRN. This list *is* the
priority ranking — no need to derive it from scratch.

---

## 6. Where AI genuinely helps — current, measured, not hypothetical

Real, current (2026) neurosymbolic verification results, using the exact
loop this research kept converging on (AI proposes → real external
prover/solver checks → refine on actual counterexamples → repeat):
- **AutoVerus** — LLM agent pipeline for Rust's Verus verifier, mirroring
  human proof-construction phases (draft → refine → debug from verifier
  errors); >90% success on a 150-task benchmark.
- **A Rust-to-Lean pipeline** already run on real production cryptographic
  code (zkVM), using AI provers as black-box proof-search engines — a real
  deployment, not a demo.
- **MemHint** — combines LLM-assisted summary generation with Z3-based
  symbolic validation specifically for finding C/C++ memory leaks,
  outperforming both plain static analysis and other baselines — directly
  relevant to the exact bug class in Nitro's real Kotlin leak.
- **Honest caveats**: current progress is overwhelmingly *single-language*
  (Verus/Rust specifically leverages Rust's own type system to avoid the
  hardest aliasing/memory-safety reasoning) — the true bilateral
  cross-language extension (the Melocoton-for-Rust-and-C version) remains
  open. Formal-verification-language training data is severely scarce
  (fewer than 50 public Verus repos vs. millions of general-purpose repos)
  — a real practical bottleneck for any AI approach here, likely worse for
  a cross-language-contract corpus specifically.

**AI's realistic, well-scoped role**: candidate-contract generator, never
final authority — every AI-drafted spec/stub must survive an external,
non-AI verifier (Kani, Miri, an SMT solver, a fuzzer) before being trusted.

---

## 7. Assembling a real toolset — SARIF vs. Code Property Graphs

Two genuinely different layers, easy to conflate:

- **SARIF** (OASIS open standard) — unifies tool *output* only ("what was
  found"), not detection method. A JSON schema for findings (location,
  rule, severity, path, fix) so 20 different scanners can report into one
  dashboard without custom per-tool integration. CodeQL and Semgrep both
  emit it natively; Miri/Kani/CBMC would need a thin adapter.
- **Code Property Graphs (CPG)**, via **Joern** — merges the AST, CFG, and
  PDG into one unified graph structure, spanning ~8 language frontends
  into the same graph and query language (CPGQL). This is closer to your
  original ambition: not aggregating separate tools' conclusions, but
  sharing the actual underlying representation multiple analyses reason
  over. Genuinely open-source. Robust/fuzzy parsing — works even without
  a complete build environment.
  - **Still cannot do**: formal semantic proof (no SMT solving, no UB
    detection like Miri/Kani), true runtime FFI/ABI ownership-crossing
    semantics (it's structural/source-level, not a model of the actual
    calling-convention boundary). Complements, doesn't replace, the
    verification tiers above.
- **codebadger** (March 2026) — an open-source MCP server integrating
  Joern's CPG engine directly with LLMs, exposing program slicing, taint
  tracking, dataflow analysis, call graph extraction, and bounds checking
  as tools an agent can invoke directly — solving the "LLM can't hold a
  whole codebase in context or hand-write CPG queries" problem.

**Licensing gotchas** (matters if scoping this as "if open source"):
- Semgrep core is LGPL (open), but some features moved commercial in Dec
  2024 — a community fork, **Opengrep**, exists in response.
- CodeQL requires a GitHub Advanced Security license for automated CI/CD
  use on private repos — free tier is mainly for public open-source.
- Miri, Kani, CBMC, Joern: genuinely fully open (MIT/Apache/BSD-style),
  no use restrictions.

**Realistic build, not a multi-year fork-everything undertaking**:
1. Run Semgrep/Opengrep + CodeQL (if repo qualifies) + clang-tidy,
   configured to emit SARIF.
2. Add a thin SARIF adapter for Miri/Kani/CBMC output (the one piece of
   real new "glue" code).
3. Optionally add Joern/codebadger as a deeper structural-analysis layer
   underneath the SARIF aggregation.
4. Write one aggregator applying the known-bug-taxonomy triage ranking
   from Section 5 — this is the actual missing, buildable artifact:
   nobody has published a Semgrep/CPG ruleset encoding this specific
   cross-language FFI bug taxonomy yet.
5. Wrap the aggregator as an MCP tool so an agent can invoke "run the full
   triage suite" and get back one prioritized list.

---

## 8. Closing reflection

None of this required outsized resources to explore meaningfully — every
tool named here (Miri, Kani, CBMC, Joern, SARIF, UniFFI, Nitrogen) is free
and open. The realistic, non-grandiose contribution available from a
solo+AI setup isn't out-building Mozilla or AWS's research teams — it's
exactly what this research thread did: triage a known bug taxonomy from
real published studies, and assemble the pieces (SARIF aggregation + CPG
structural analysis + targeted Miri/Kani checks on the highest-risk
boundary functions) into one coherent, currently-unbuilt tool. That's a
genuinely useful, scoped, buildable artifact — not a lesser imitation of
big-lab R&D, just a differently-sized slice of the same real problem.
