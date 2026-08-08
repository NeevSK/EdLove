# Toward Multi-Agent, Graph-Grounded Detection of Cross-Language FFI Bugs
### A synthesis and research proposal

---

## Abstract

Cross-language foreign function interface (FFI) boundaries — between Rust,
C/C++, Swift, and Kotlin, as used in React Native native modules — are a
disproportionate source of real, exploitable bugs, because each language's
"obviously valid" input or assumption can be specifically undefined in the
other's semantic model. Existing tooling addresses pieces of this problem
in isolation: static/dynamic FFI-specific checkers (FFIChecker, rCanary),
single-language formal verifiers (Miri, Kani), general-purpose multi-agent
LLM vulnerability detectors (iAudit, GPTLENS, VulTrial), and graph-grounded
LLM detectors (LLMxCPG). One very recent system (April 2026) combines
multi-agent LLM orchestration with symbolic execution and graph-database
construction for single-language Rust CVE analysis. **No published system
yet combines all three ingredients — bug-category-specialized subagents,
critic/adversarial synthesis, and cross-language graph grounding —
specifically targeted at the FFI boundary itself**, across the language
combinations (Rust↔C++, Swift↔C++, Kotlin↔C++/JNI) that make up real
mobile native-module stacks. This document synthesizes the real precedent
work found across this research thread and proposes a concrete system
architecture, evaluation plan, and honest list of open risks.

---

## 1. The problem, restated precisely

Real empirical and CVE studies establish the shape of the problem:
- Root causes of real cross-language bugs are dominated by **logic errors**
  and **boundary conditional errors** (e.g. a `size=0` value, ordinary in
  one language, undefined in the other at a `realloc`-style call).
- Real Rust CVEs have been caused by UB in the *foreign* function being
  called, not the Rust side (`mallocx()` undefined for zero size; a race
  condition via `getenv()`/`setenv()`; memory misalignment; inconsistent
  data layout).
- A CMU study found real bugs from incorrect `const`/`mut` pointer
  declarations and cyclic aliasing violations, and concluded there is no
  production-ready method yet for finding aliasing violations across
  language boundaries at scale.
- No single-language tool can see across the boundary: Miri and Kani
  verify Rust rigorously but treat the foreign side as an untrusted,
  unverified stub; static FFI-specific tools (FFIChecker, rCanary) catch
  real bugs but are narrowly scoped to Rust↔C specifically, not the
  Swift/Kotlin legs that RN native modules also cross.

---

## 2. Related work — what already exists

### 2.1 FFI-boundary-specific static/dynamic analysis (Rust↔C only)
- **FFIChecker** (ESORICS 2022) — static analysis dedicated to memory
  management issues across the Rust/C FFI specifically. Evaluated on 987
  real-world Rust packages from the official registry; found 34
  previously-unknown bugs in 12 packages. Open-sourced.
- **rCanary** — detects memory leaks across the "semi-automated memory
  management boundary" (i.e. the FFI boundary) in Rust. Directly
  benchmarked against FFIChecker, SABER (SVF-based value-flow leak
  analysis), LeakSanitizer, Miri, and libFuzzer — the most complete
  existing head-to-head comparison of FFI-focused tools.
- **Value-flow-graph (VFG) based multilingual bug detection** — traces
  pointer objects specifically from FFI call sites backward along
  value-flow edges to their allocation sites, since a memory object can
  only cross a language boundary through a raw pointer at an FFI call.
  Found a real, critical (CVSS 9.8) use-after-free in the `openssl` Rust
  crate (CVE-2018-20997) caused by improper multilingual interaction.
- **SafeFFI** — a dynamic, sanitizer-based approach (modified rustc/LLVM)
  specifically for the safe/unsafe boundary in Rust FFI, trading some
  runtime overhead for higher precision than static approaches, which
  the authors note suffer from false positives and compile-time cost.

**Gap**: all four are Rust↔C specific. None cover Swift↔C++ or
Kotlin↔C++/JNI, the other two legs present in a real RN/Nitro/UBRN stack.

### 2.2 General-purpose multi-agent LLM vulnerability detection (single language)
- **iAudit** — four specialized roles (Detector, Reasoner, Ranker, Critic)
  iteratively debating the most plausible vulnerability cause; F1 = 91.21%.
- **GPTLENS** — splits detection into two cooperating, adversarial agents
  specifically to reduce false positives.
- **VulTrial** (ICSE 2026) — a "courtroom" structure (prosecutor/defense/
  judge/jury roles) debating vulnerabilities through structured
  adversarial argument. Its own stated limitation: agents argue about
  whether code "appears" vulnerable with **no formal intermediate
  representation** defining what a vulnerability actually is for the code
  under analysis — a documented gap that graph-grounding directly addresses.
- **MAVUL** — documents a real failure mode in prior multi-round agent
  debate systems: agents "forget context after multiple rounds of
  conversation" when memory management isn't explicitly designed in.
- **Big Sleep** (Google Project Zero + DeepMind) — a real, credible proof
  point: an LLM agent found an actual exploitable stack buffer underflow
  in SQLite, a codebase fuzzed and audited for over two decades.

**Gap**: general-purpose, single-language (typically C/C++ or smart
contracts); not targeted at the cross-language boundary specifically.

### 2.3 Graph-grounded LLM detection (addresses data scarcity directly)
- **LLMxCPG** — grounds LLM vulnerability reasoning in a Code Property
  Graph rather than relying on pattern-matching from training examples;
  15–40% F1-score improvement over prior state-of-the-art, and
  demonstrably robust under syntactic code modification (i.e., it isn't
  just memorizing surface patterns).
- **Joern** — the open-source CPG engine underlying much of this line of
  work; unifies AST + CFG + PDG into one graph, spans ~8 language
  frontends into one query language (CPGQL).
- **codebadger** (March 2026) — an MCP server exposing Joern's CPG
  operations (slicing, taint tracking, dataflow, bounds checking) directly
  as callable tools for an LLM agent.

**This is the direct answer to the "not enough data" concern**: graph
grounding substitutes structural signal for missing labeled examples,
exactly the intuition that motivated this proposal.

### 2.4 The closest existing system to this proposal
**"Symbolic Execution Meets Multi-LLM Orchestration"** (April 2026) is the
nearest published precedent, and combines all three ingredients this
proposal wants — just for a narrower target:
- A coordinated **4-agent pipeline** synthesizes KLEE-compatible FFI test
  harnesses from *incomplete* Rust CVE code snippets (existing tools like
  KLEE, Kani, Prusti, and Creusot all fail outright on incomplete
  snippets, requiring a full compilable Cargo project).
- Multi-agent coordination reduced FFI-harness compilation failures from
  **42% (single-agent) to 9.7%** — a large, measured improvement directly
  attributable to specialization/coordination rather than a bigger model.
- **A Graph Database is constructed from the symbolic execution results**
  — CVE files, CWE categories, error types, and execution paths as typed
  nodes and edges, enabling structured cross-CVE queries and clustering.
- Evaluated on 31 real-world Rust CVEs across 11 CWE categories: 1,206
  critical errors detected at an 83.9% detection rate.
- Explicitly billed by its authors as "a combination not previously
  attempted in the literature," and "the first multi-agent LLM
  architecture for Rust CVE analysis."

**The remaining gap, even here**: this targets Rust CVE snippets and their
FFI harnesses in isolation — it does not extend to the Swift/Kotlin legs,
does not use a CPG (its graph is a *results* database, not a *program*
structure the agents reason over during detection), and is not framed
around a known cross-language bug taxonomy for triage/prioritization.

### 2.5 An explicitly stated future-work gap, from independent research
A December 2025 paper on Rust concurrency-bug graph visualization lists as
its own future work: extending its LLVM-IR-based graph representation to
model **cross-language interaction between Rust and C/C++/Swift/Kotlin
Native via FFI specifically**, since this is "where the majority of memory
safety problems occur" — proposing LLVM-IR itself as a common
representation spanning exactly the language set a real RN/Nitro/UBRN
stack uses. As of this research, that extension has not yet been carried out.

---

## 3. The proposed system

Combining the strongest proven piece of each thread above, scoped to the
actual language combination in a React Native native-module stack
(Rust, C++, Swift, Kotlin):

### 3.1 Specialized subagents, ranked by the real known bug taxonomy
Rather than one generalist agent, specialize by the bug categories already
empirically established as dominant across this research:
1. **Ownership/lifecycle agent** — the Nitro Kotlin `jni::global_ref`-vs-
   `weak_ptr` leak class; rCanary/FFIChecker's memory-management domain.
2. **ABI/type-mismatch agent** — the `const`/`mut` pointer misdeclaration
   class from the CMU study; UniFFI contract-version-check style checks.
3. **Boundary-condition agent** — the `realloc(size=0)` class; best paired
   with fuzzing (`cargo-fuzz`) since this is precisely what fuzzing excels
   at finding.
4. **Aliasing/UB agent** — cyclic aliasing violations; scoped Miri runs
   with its experimental FFI-execution tracking.
5. **Linker/registration agent** — the ExecuTorch static-initializer-
   pruning class and Nitro's HybridObjectRegistry-ordering class; these
   are build-time/link-time, not runtime, so this agent works from build
   logs and linker output rather than source alone.

### 3.2 Cross-language graph grounding
Following LLMxCPG's proven mechanism (grounding reasoning in structure to
compensate for scarce cross-language training data) and the VFG-based
approach's proven technique (tracing pointer objects specifically from FFI
call sites backward to allocation sites):
- Use **Joern's CPG** as the base structural substrate per language, and
  the **LLVM-IR future-work idea** from Section 2.5 as the unifying layer
  *across* languages — since LLVM IR is already the common backend for
  Rust, C++, Swift, and (via Kotlin Native) Kotlin.
- Each specialized subagent queries this shared graph rather than raw
  source text, directly addressing the "not enough data" problem the same
  way LLMxCPG does.

### 3.3 Critic/adversarial synthesis stage
Following iAudit/GPTLENS/VulTrial's proven pattern, but fixing VulTrial's
own documented weakness: rather than agents debating whether code
"appears" vulnerable with no formal ground truth, the critic stage
adjudicates *against the CPG*, not against another agent's unstructured
opinion — closing exactly the gap VulTrial's authors flagged in their own
paper.

### 3.4 Verification handoff — never trust the agent as final authority
Consistent with the "AI proposes, real verifier disposes" principle
established throughout this research: any candidate bug/fix the agent
pipeline proposes must be confirmed by an actual external tool before
being trusted — Miri for UB, Kani/CBMC for the highest-priority functions,
`cargo-fuzz` for boundary-condition candidates specifically. This mirrors
the "Symbolic Execution Meets Multi-LLM Orchestration" paper's own design
(agents synthesize the harness; KLEE, a real symbolic executor, actually
runs it) and avoids the untrusted-stub weakness Kani's own docs admit to.

### 3.5 Explicit context-management design
Given MAVUL's documented finding that naive multi-round agent debate loses
context, each subagent's findings are written to the shared graph
structure itself (as annotated nodes/edges) rather than kept only in
conversational history — turning the graph into the persistent shared
memory across agent rounds, not just the analysis substrate.

---

## 4. Evaluation plan

- **Ground truth corpus**: combine FFIChecker's 34 confirmed real bugs
  across 12 packages, rCanary's benchmark set, the 31 real-world Rust CVEs
  from the Symbolic-Execution-Meets-Multi-LLM paper, and the specific real
  bugs catalogued from famous cases dissected in this research (the Nitro
  Kotlin leak, the openssl use-after-free CVE-2018-20997).
- **Metric**: detection rate and false-positive rate against this known
  corpus, directly comparable to FFIChecker/rCanary's own reported numbers
  (34/987, and their head-to-head comparison table) and to the 83.9%
  detection rate reported for the closest existing multi-agent system.
- **Ablation**: run each specialized subagent alone vs. the full
  critic-mediated pipeline, to isolate how much benefit comes from
  specialization+critique vs. graph-grounding alone (isolating exactly
  which of the three combined ingredients is doing the real work).

---

## 5. Honest open risks and limitations

- **No existing system has actually built the Swift/Kotlin legs of this**
  — everything found here (FFIChecker, rCanary, VFG approach, the 4-agent
  Rust CVE pipeline) is Rust↔C specific. Extending to Swift's C++ interop
  and Kotlin's JNI is new territory, not a proven extension.
- **LLVM IR as a true unifying cross-language representation is currently
  only a stated future-work item in independent research**, not a working
  system — this is the single largest unproven assumption in the proposal.
- **Data scarcity likely worsens, not improves, for a genuinely
  cross-language corpus** — even single-language formal-verification data
  is scarce (fewer than 50 public Verus repos); a labeled cross-language
  FFI-bug corpus spanning four languages is smaller still.
- **The critic/graph-grounding fix to VulTrial's weakness is a design
  proposal here, not something empirically validated yet** — it follows
  logically from the two source papers' own stated gaps, but hasn't been
  built and measured.
- **Every AI-generated finding must still clear a real external verifier**
  before being trusted — this proposal does not claim to eliminate that
  requirement, only to make the candidate-generation stage smarter and
  better-grounded than a single generalist agent working from raw text.

---

## 6. Closing note

Every individual ingredient of this proposal — bug-taxonomy-specialized
subagents, critic/adversarial synthesis, graph-grounded LLM reasoning,
and agent-synthesized verification harnesses — has already been built and
measured by real, independent research teams, in the past twelve months.
What doesn't yet exist is their combination, aimed specifically at the
cross-language FFI boundary across the exact language set (Rust, C++,
Swift, Kotlin) that a real React Native native-module stack uses. That is
a genuinely scoped, currently-unclaimed research gap — not a restatement
of solved work, and not a fantasy either.
