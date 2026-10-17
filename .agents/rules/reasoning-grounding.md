---
title: "Autonomous Reasoning & Source-Code Grounding Invariant"
description: "Mandatory cognitive handshake and substrate grounding protocol enforced on every prompt before writing or modifying code."
status: "active"
---

# Autonomous Reasoning & Source-Code Grounding Invariant

> **THE GOLDEN PRINCIPLE: THE MODEL IS A STATELINK REASONER (CPU), NOT A MEMORY.**  
> Parametric memory is outdated, biased, and decays. The monorepo substrate, AST symbol tables, installed package types in `node_modules`, and live upstream registries are the **sole durable truth**. Never carry the burden of remembering; always ground in the physical substrate first.

---

## 1. The Mandatory Cognitive Handshake

Before proposing code, diffs, or executing implementation changes, every agent **MUST explicitly output the Cognitive Handshake Triad** at the very top of its response:

```text
[COGNITIVE HANDSHAKE]
1. Intent & Surface: [e.g. Add deep link parser | Mobile Surface (gurudevi-mobile) | Implement Mode]
2. Grounded Substrate: [e.g. Inspected packages/core/src/logic/deeplink/ and installed react-native 0.88 declarations]
3. Active Seam & Constraints: [e.g. Connects to EntryStartupBoundary; Rule 5 source-grounded; Deletion Veto active]
```

If this handshake is absent, the agent has fallen into passive memory recall and must halt.

---

## 2. The 5 Core Atoms of Generalized Reasoning

Every non-trivial engineering task follows this atomic sequence:

```
[Intent Resolution] ➔ [Substrate Grounding] ➔ [Upstream Verification] ➔ [Integrative Seam] ➔ [Minimal Delta & Audit]
```

1. **Intent Resolution (The 'Why'):**
   - Translate the user prompt into a concrete architectural invariant. De-noise ambiguities.
2. **Substrate Grounding & Structural Affordances (The 'What Is'):**
   - Use the 3-Layer Navigation Hierarchy: Lexical (`rg`/`fd`) ➔ Structural AST / Symbol Outlining (Biome search, Props/export extractors, `.d.ts`) ➔ Relational Call Graph.
   - Inspect package manifests (`package.json`) and open `node_modules/<pkg>/...` directly to verify live types and `@deprecated` annotations. Never guess.
3. **Upstream Two-Tier Precision Search (The 'How It Works Now'):**
   - Round 1 (Broad): Ingest best-in-class architectural patterns.
   - Round 2 (Dated Precision): Target official release tags, commit changelogs, RFCs, and migration guides tied to the exact active package versions (Expo SDK 58, RN 0.88, React 19, Effect v4).
4. **Integrative Seam Mapping (The 'How It Attaches'):**
   - Map the connective tissue. If building a UI slice, define how it consumes the hook. If writing an API, define how the client consumes the payload.
5. **Step 5: Post-Execution Delta-Reasoning Gate (The Formal Termination):**
   - Author the smallest verified patch that satisfies the intent.
   - Run `git diff` on all touched files before completion (*"Generator $\ne$ Verifier"*).
   - Reason across the delta: audit deletions (`-`) for accidental regressions (Deletion Veto), audit additions (`+`) for anti-slop violations, and verify blast-radius containment.
