# 30 Rust Crates Worth Knowing About — Gurudevi Reference

**Purpose:** a "notice it exists, file it away" list, not a build queue.
Nothing here is a recommendation to adopt anything now. Data pulled
directly from crates.io's API on 2026-07-25 — real download counts and
last-publish dates, not impressions.

**How to read the numbers:** `updated` = last publish (younger isn't
automatically better — some of these are simply *done*, not
abandoned). `recent/90d` vs total `downloads` = how much of its usage is
happening right now vs historical. `n_versions` = release cadence — very
high can mean either active care or churn, worth a second look either way.

---

## Rule of Thumb: Rust vs. Not, Especially for UI

**Don't use Rust for anything the user looks at or taps.** Rust's value
is compute, correctness, and safety at a boundary — not rendering,
layout, or interaction. Every native-binding conversation in this
thread (Nitro, Expo Inline Modules, JNI) exists specifically to get
Rust's *results* back into a UI written in something else — never to
put UI logic in Rust itself.

The dividing line: **if it's answering a question, Rust. If it's drawing
something on screen, not Rust.** Cedar evaluation → answers a yes/no
question → good Rust use. A settings screen → draws things → bad Rust
use, even though Rust UI frameworks technically exist (see #29 below —
included specifically as a "know it exists, still say no" example).

---

## The List

### Foundational — maximum Lindy, not going anywhere

| # | Crate | What it is | downloads (total / 90d) | updated | n_versions |
|---|---|---|---|---|---|
| 1 | **serde** | THE serialization backbone of Rust | 1.20B / 246M | 2026-07-18 | 316 |
| 2 | **tokio** | The async runtime nearly everyone builds on | 827M / 196M | 2026-07-20 | 195 |
| 3 | **rustls** | Pure-Rust TLS, no OpenSSL dependency pain | 787M / 179M | 2026-07-23 | 113 |
| 4 | **tracing** | Structured, contextual logging/observability | 728M / 168M | 2025-12-18 | 46 |
| 5 | **thiserror** | Ergonomic custom error types | 1.23B / 305M | 2026-07-18 | 90 |
| 6 | **anyhow** | Ergonomic error handling for application code | 825M / 181M | 2026-07-18 | 106 |
| 7 | **regex** | THE regex engine | 1.00B / 208M | 2026-07-15 | 169 |
| 8 | **uuid** | UUID generation/parsing | 685M / 156M | 2026-07-15 | 94 |

**Directly relevant right now:** `thiserror` + `anyhow` are worth
grabbing immediately for Stage 1 of the local PDP — clean error types
at the exact boundary (Rust logic → JSON error response) the
implementation plan already calls for.

### FFI / Safety-relevant to what you're building

| # | Crate | What it is | downloads | updated | n_versions |
|---|---|---|---|---|---|
| 9 | **jni** | Safe, checked JNI wrappers — already in the plan | 147M / 40M | 2026-03-16 | 49 |
| 10 | **zerocopy** | Compile-time-checked safe transmutes — the *correct* tool for exactly the kind of raw memory access the earlier vtable spike got dangerously wrong | 751M / 211M | 2026-07-20 | 166 |
| 11 | **rkyv** | Zero-copy deserialization — read a byte buffer as a struct with no parsing step at all | 133M / 33M | 2026-07-02 | 94 |

`zerocopy` deserves a specific callback: it's a Google-backed crate that
gives you compile-time-proven-safe access to raw bytes — the thing the
earlier spike was trying to do by hand with `transmute` and a hardcoded
vtable offset. Worth a look if any future FFI work needs to go lower-
level than `jni`'s string marshaling.

### Testing discipline — fits your established methodology exactly

| # | Crate | What it is | downloads | updated | n_versions |
|---|---|---|---|---|---|
| 12 | **criterion** | Statistically rigorous benchmarking, not "felt faster" | 246M / 52M | 2026-02-04 | 30 |
| 13 | **proptest** | Property-based testing — generates hundreds of inputs to find edge cases you didn't think of | 158M / 41M | 2026-03-24 | 48 |
| 14 | **insta** | Snapshot testing — record actual output, get a diff when it changes | 82M / 21M | 2026-06-11 | 121 |

These three map almost exactly onto the discipline this whole
conversation has been enforcing manually — `proptest` in particular is
basically automated characterization testing. Worth genuinely
considering for Stage 1's test suite: instead of hand-writing every
deny case, `proptest` can generate hundreds of near-miss requests
against your real policies and flag anything Cedar decides
surprisingly.

### Performance / compute

| # | Crate | What it is | downloads | updated | n_versions |
|---|---|---|---|---|---|
| 15 | **rayon** | Trivial data parallelism — `.iter()` becomes `.par_iter()` | 468M / 104M | 2026-04-14 | 40 |
| 16 | **polars** | Blazing-fast dataframes, pandas without Python's overhead | 13M / 2.9M | 2026-06-04 | 123 |
| 17 | **ndarray** | Numeric arrays, NumPy-shaped | 104M / 22M | 2026-01-10 | 93 |
| 18 | **blake3** | Modern, extremely fast hashing — worth a real look for your snapshot HMAC scheme | 154M / 35M | 2026-04-25 | 44 |

### Storage / networking

| # | Crate | What it is | downloads | updated | n_versions |
|---|---|---|---|---|---|
| 19 | **redb** | Pure-Rust embedded key-value store, ACID | 7.9M / 3.3M | 2026-04-19 | 74 |
| 20 | **axum** | Mature, well-liked Rust web framework | 399M / 102M | 2026-04-14 | 94 |
| 21 | **reqwest** | The standard HTTP client | 600M / 151M | 2026-05-25 | 125 |
| 22 | **sqlx** | Async SQL, compile-time query checking | 122M / 32M | 2026-05-21 | 59 |
| 23 | **governor** | Clean rate limiting | 67M / 13M | 2025-12-16 | 25 |

### Search / ML / sandboxing — the genuinely fun ones

| # | Crate | What it is | downloads | updated | n_versions |
|---|---|---|---|---|---|
| 24 | **tantivy** | Full-text search engine, embeddable — a Lucene you can ship on-device | 16M / 3.5M | 2026-04-21 | 62 |
| 25 | **wasmtime** | The real, production-grade embeddable WASM runtime (what Cloudflare Workers runs on) — the ironic postscript to this whole thread's WASM saga | 29M / 7.6M | 2026-07-21 | 205 |
| 26 | **candle-core** | HuggingFace's Rust ML framework — small models running natively, no Python | 6.4M / 2.4M | 2026-06-26 | 37 |
| 27 | **pyo3** | Call Rust from Python and vice versa — if a future data-science/analytics tooling story ever needs it | 215M / 50M | 2026-06-11 | 113 |

**The genuinely wild idea worth remembering:** `tantivy` embedded
on-device would let students/teachers search across lesson materials
and notes with zero connectivity and zero server round-trip — a real
feature, not a toy, especially for low-connectivity areas.

### Media

| # | Crate | What it is | downloads | updated | n_versions |
|---|---|---|---|---|---|
| 28 | **image** | On-device thumbnail generation, format conversion | 157M / 38M | 2026-03-10 | 118 |

### The "exists, but no" example

| # | Crate | What it is | downloads | updated | n_versions |
|---|---|---|---|---|---|
| 29 | **dioxus** | A real, legitimate Rust UI framework | 2.0M / 663K | 2026-05-19 | 54 |

Included on purpose, as the concrete anchor for the rule of thumb above.
It's real, it works, people build things with it. It's also exactly the
kind of tool that would violate everything this thread learned about
scope discipline if it showed up in a Gurudevi PR — a second UI
framework living alongside React Native, solving a problem you don't
have, for a benefit (some UI logic in Rust) nobody asked for. Its
download count next to `serde`'s is itself the rule of thumb, visually.

### Bonus #30

| # | Crate | What it is |
|---|---|---|
| 30 | **plotters** | Pure-Rust charting/plotting, can render straight to a bitmap — worth remembering alongside `criterion` (#12), which can also generate real HTML reports with graphs. The first genuinely rigorous performance number in this entire WASM/JNI investigation would have come from a `criterion` benchmark, not a `console.log` and a stopwatch. |
