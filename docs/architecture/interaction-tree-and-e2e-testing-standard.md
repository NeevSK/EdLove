---
title: "Interaction Tree Exploration & E2E Testing Standard"
status: "active"
created: 2026-11-17
updated: 2026-11-17
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, testing, e2e, interaction-tree, playwright, maestro, agent-device, expo, vite, pjc, mbt]
---

# Interaction Tree Exploration & E2E Testing Standard

This is the canonical engineering standard for autonomous, user-perspective end-to-end (E2E) verification across the Polymath Platform. It unifies **Web** (`apps/gurudevi-web`, `apps/gurudevi-public`, `apps/edlove-web`) and **Native Mobile** (`apps/gurudevi-mobile`) into a single, cohesive, stacked testing hierarchy grounded in our **Product and Journey Catalog (PJC)** and **Flow Navigator**.

---

## 1. The Stacked Navigation & Verification Hierarchy

In Gurudevi, testing is not an ad-hoc crawler clicking random HTML buttons in a vacuum. Navigation, permissions, and behaviors form a strictly stacked, interrelated architecture:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        THE POLYMATH STACKED NAVIGATION & TEST SYSTEM                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Layer 5: Product & Journey Catalog (PJC)                                              │
│ • packages/core/src/flows/pjc/catalog.v2.json                                          │
│ • Declares: Features ➔ Actor Intents ➔ Journeys ➔ Steps ➔ Ordered Transitions          │
│ • CLI: pnpm exec tsx scripts/pjc.ts tree --depth paths                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Layer 4: FlowDAG & Intent Orchestration (useFlowNavigator)                            │
│ • useFlowNavigator().open(flowId, stepId, params), .next(), .back()                    │
│ • Admission guards, size-class policies, and back-stack history                        │
│ • Web: apps/gurudevi-web/lib/navigation/useFlowNavigator.ts                           │
│ • Mobile: apps/gurudevi-mobile/src/navigation/useFlowNavigator.ts                      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Layer 3: Places, Routes & Floor Presentation                                           │
│ • Static Route Catalog: packages/core/src/routing/routeCatalog.generated.ts           │
│ • Web: TanStack Router (_app/self, _app/workspace, _app/library)                       │
│ • Mobile: Expo Router 58 Stack & Tabs ((tabs)/self, (tabs)/workspace)                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Layer 2: Interactive Controls & Reversible Affordances                                 │
│ • Forward Controls: @repo/ui Button, Card, TabBar, RadioGroup                         │
│ • Reverse Controls: < Back, Cancel, Close (✕), Escape key, Browser/Hardware Back      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Layer 1: Unified CLI Verification & Automation Tooling                                 │
│ ┌──────────────────────────────────────────┬─────────────────────────────────────────┐ │
│ │ Web Automation                           │ Mobile Automation                       │ │
│ │ • Playwright State-Graph Runner          │ • Maestro E2E Engine (maestro test)     │ │
│ │ • Vercel agent-browser (Fast CDP CLI)    │ • Callstack agent-device (sovereign_dev)│ │
│ └──────────────────────────────────────────┴─────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

When a user journey is tested, the test verifies that:
$$\text{PJC Journey Scenario} \iff \text{FlowDAG Step} \iff \text{FlowNavigator Route} \iff \text{Screen Components} \iff \text{E2E Automation}$$

---

## 2. The Core Philosophy: Bidirectional State Graphs & Round-Trip Invariants

Traditional testing pyramids fail at the interface boundary because developers write **isolated unit tests** reflecting how code was authored, not how a human or agent experiences software.

A real user lands on an entry screen and encounters a tree of possibilities. Every visible interactive element (`<button>`, `<a>`, `[role="button"]`, `<input>`, tab, pill) is a branch. Crucially, transitions in real software are **Bidirectional**:

```
┌─────────────────┐        Forward Edge: Click Link / Button / Card         ┌─────────────────┐
│                 ├────────────────────────────────────────────────────────▶│                 │
│  State Node A   │                                                         │  State Node B   │
│ (Parent Screen) │◀────────────────────────────────────────────────────────┤ (Child / Modal) │
└─────────────────┘   Reverse Edge: Back Button / Cancel / Close (✕) / ESC  └─────────────────┘
                                   Round-Trip Verification
```

### The 5 Round-Trip Reconstitution Guarantees

Whenever an interactive element is triggered anywhere in Gurudevi, the test runner must verify five invariants:

1. **Topological Reconstitution ($A' \cong A$)**: Popping back must return the user to the exact parent state (scroll position, active filters, selected tab) without state corruption.
2. **Internal Href & Catalog Acceptance**: Destination URLs must match registered routes in `routeCatalog.generated.ts` and pass `checkInternalHref(raw, platform)`. Zero `not_internal` rejections permitted.
3. **Clean Component Unmount & Zero 404 Leaks**: When leaving a state or dismissing a modal, components must cleanly dismount with zero memory leaks, zero detached DOM listeners, and zero network 404s on legacy or unmocked endpoints.
4. **History Stack & Modal Dismissal**: Pressing `< Back`, `Cancel`, or `Escape` while an overlay/sheet is active must dismiss the overlay *without* navigating away from the underlying screen.
5. **Zero Runtime Error Bleed**: The browser or runtime must log zero unhandled exceptions (`pageerror`) and zero `console.error` events throughout both forward navigation and the reverse round trip.

---

## 3. The 4 Pillars of a Trustworthy, Autonomous System

To make automated testing trustworthy, non-flaky, and capable of running unattended in recurring CI, four architectural pillars are enforced:

### Pillar 1: Pluggable Screen Miner & Autonomous Spoke Classification
To prevent test fragility and hardcoded selectors, the system uses a modular **Screen Miner** (`screen-miner.mjs`). Any screen in the monorepo can be plugged in as an anchor ($S_0$), and the miner autonomously discovers its identity, APCA (WCAG 3.0) lightness contrast ($L_c$), horizontal layout overflow, and interactive affordances:

> [!IMPORTANT]
> **Dual Engine Standard: WCAG 3.0 APCA (Perceptual Quality) & WCAG 2.2 AA (Statutory Shield)**:
> In the single-pass Screen Miner (`screen-miner.mjs`), two complementary standards are evaluated simultaneously:
> 1. **WCAG 3.0 W3C Silver / APCA (0.0.98G-4g)**: Evaluates real human visual perception, spatial frequency, text weight, font size, and polarity awareness across three tiers:
>    - **Bronze Tier**: Headline $|L_c| \ge 35$, Subhead $|L_c| \ge 45$, Body $|L_c| \ge 60$, Controls $|L_c| \ge 30$, Touch $\ge 24\text{px}$, 0 broken ARIA references.
>    - **Silver Tier**: Headline $|L_c| \ge 45$, Subhead $|L_c| \ge 60$, Body $|L_c| \ge 75$, Controls $|L_c| \ge 45$, Touch $\ge 44\text{px}$, 0 placeholder-only inputs.
>    - **Gold Tier**: Headline $|L_c| \ge 60$, Subhead $|L_c| \ge 75$, Body $|L_c| \ge 90$, Controls $|L_c| \ge 60$, Touch $\ge 48\text{px}$, living hints wired.
> 2. **WCAG 2.2 AA Relative Luminance (`(L₁+0.05)/(L₂+0.05)`)**: Evaluated in the exact same DOM pass to provide legal compliance assurance for external automated compliance scanners (Lighthouse, Pa11y, Axe):
>    - Normal text: $\ge 4.5:1$.
>    - Large text / UI controls: $\ge 3.0:1$.
>    - Reports exact pass/fail counts and compliance percentages alongside APCA tiers.

| Spoke Class | Semantic Heuristics & Role | Spoke Purpose & Traversal Handling |
| :--- | :--- | :--- |
| **`PRIMARY_ACTION`** | `type="submit"`, `.primaryBtn`, containing `→` or "enter", "continue", "next", or floor nav (`/self`, `/workspace`) | Primary CTA forward transition. Prioritized in depth traversal. |
| **`NAVIGATION_SPOKE`** | `<a href^="/">`, buttons with `to=`, router links | Sub-route or detail transition. Triggers forward edge and reverse check. |
| **`IN_PAGE_CONTROL`** | `[role="radio"]`, `[role="tab"]`, segmented controls, switches | Local micro-state mutation within the anchor (e.g. wizard step, tab toggle). |
| **`MODAL_TRIGGER`** | `aria-haspopup="dialog"`, `data-modal`, filter/preview buttons | Ephemeral overlay trigger. Opens modal, validates contents, and tests `Escape` dismissal. |
| **`REVERSE_SPOKE`** | Buttons with "Back", `←`, "Cancel", "Close", `[aria-label="Back"]`, `✕` | In-screen return control. Verified to restore parent anchor without page reload. |
| **`DESTRUCTIVE_GATE`** | "Delete", "Sign Out", "Purge", "Reset Everything" | Blacklisted from general crawling unless running in sandboxed teardown specs. |
| **`FOOTER_LINK`** | Legal & external links (`/privacy`, `/terms`, `/guidelines`, `/delete-account`) | Deprioritized to ensure primary user journeys are exhaustively explored first. |

### Pillar 2: The Screen-Anchored Tree Model (Fan-Out & Rewind)
Instead of treating screens as transient waypoints in an opportunistic flat crawler, the architecture defines each screen as a **Root Anchor ($S_0$)**:

1. **Anchor Snapshot**: Capture baseline $S_0$ (URL, DOM hash, active tab, scroll, input values).
2. **Forward Spoke Fan-Out**: For each mined forward spoke, exercise the transition to child state $B$.
3. **Child Quality Audit**: Mine child state $B$ (assert zero console errors, zero 404s, APCA WCAG 3 contrast, zero horizontal overflow).
4. **Reverse Spoke Rewind**: Trigger explicit reverse spoke (`< Back`, `Cancel`, `Escape`, or `page.goBack()`).
5. **Reconstitution Assertion ($S' \cong S_0$)**: Verify the parent anchor is restored in its exact prior state.

### Pillar 3: Canonical State Hashing & Cycle Pruning
Without hashing, a crawler clicking forward and back will loop infinitely. The runner computes a deterministic State Hash:

$$\text{StateHash} = \text{MD5}\Big(\text{pathname} + \text{searchParams} + \text{spokeCount} + \text{themeMode}\Big)$$

- The engine maintains a `VisitedSet<StateHash>`.
- If a forward action lands on an already fully explored state hash, it records the edge in the graph and prunes the redundant branch.

### Pillar 4: Model-Based Testing (MBT) Traversal & Multi-Platform Execution

| Platform | Tier 1: Deterministic CI (Nightly / Pre-Push) | Tier 2: Agentic Interactive (On-Demand) |
| :--- | :--- | :--- |
| **Web (`gurudevi-web`)** | **Pluggable Screen Tree Engine** (`scripts/state-graph-crawler.mjs` + `screen-miner.mjs`): Mines any screen anchor (`--screen=<route>`), tests all spokes forward and backward, asserts reconstitution ($S' \cong S_0$), and generates visual report (`reports/web-state-graph.html`). | **Vercel `agent-browser`**: Fast CDP exploration using compact `@ref` snapshots (`click @e3`, `press Back`). |
| **Mobile (`gurudevi-mobile`)** | **Maestro Round-Trip Flows** (`e2e/roundtrip-explorer.yaml`): Tests tab switching, modal presentation, Android hardware back, and iOS swipe-back. | **Callstack `agent-device`**: Autonomous accessibility driver inspecting native tree and executing bidirectional flows. |

---

## 4. Multi-Platform CLI Tooling Orchestration

| Tool & Command | Platform | Primary Job in the Stack | When It Runs |
| :--- | :--- | :--- | :--- |
| **`pjc.ts`**<br>`tsx scripts/pjc.ts check` | Core Domain | Validates that all declared journeys have continuous step transitions, valid starting steps, and matching route bindings. | Pre-commit / G1 CI |
| **`route-catalog.mjs`**<br>`node scripts/route-catalog.mjs --check` | Core Routing | Ensures all 69 web routes and 39 mobile routes exist in physical files and have registered internal href validators. | Pre-commit / G1 CI |
| **Playwright Graph Crawler**<br>`pnpm --filter gurudevi-web test:tree` | Web SPA | Reads the compiled route/journey graph, navigates every screen, triggers every forward button, tests every `< Back` button, and asserts zero 404s/crashes. | G4 CI / Pre-push |
| **Vercel `agent-browser`**<br>`agent-browser snapshot -i` | Web SPA | Interactive agent verification: takes lightweight `@ref` accessibility snapshots (`@e1`, `@e2`), clicks buttons, and verifies live webviews. | Agent Coding Turns |
| **Maestro CLI**<br>`maestro test e2e/*.yaml` | Expo Mobile | Black-box mobile testing: runs declarative user journeys across tabs, bottom sheets, and native back gestures (immune to RN New Architecture bridge churn). | G5 CI / PR Gate |
| **Callstack `agent-device`**<br>`agent-device open ...` | Expo Mobile | Agentic device automation: dumps native accessibility hierarchy, resolves testIDs, and executes cross-platform gestures. | Agent Coding Turns |

---

## 5. Environment Configuration Standards

Following the deprecation of Next.js in favor of Vite (ADR [docs/decisions/2026-11-12-web-stack-astro-vite.md](docs/decisions/2026-11-12-web-stack-astro-vite.md)), client-facing environment variables must follow platform standards:

| Platform | Canonical Prefix | Example | Deprecated Legacy Alias (Do Not Use in New Code) |
| :--- | :--- | :--- | :--- |
| **Vite Web App** (`gurudevi-web`) | `VITE_*` | `VITE_API_URL`, `VITE_SUPABASE_URL` | `NEXT_PUBLIC_*` |
| **Expo Native** (`gurudevi-mobile`) | `EXPO_PUBLIC_*` | `EXPO_PUBLIC_API_URL` | — |
| **Astro Public** (`gurudevi-public`) | `PUBLIC_*` | `PUBLIC_SITE_URL` | — |

`apps/gurudevi-web/vite.config.ts` maintains backward-compatible defines for legacy scripts during the transition, but all new code must reference canonical platform configuration.

---

## 6. Graduation Gate Alignment

This standard directly operationalizes the monorepo's **G4 (Platform-Real)** and **G5 (Device-Confirmed)** graduation levels defined in [docs/architecture/ui-runtime-testing-standard.md](docs/architecture/ui-runtime-testing-standard.md):

* **G4 (Web Platform-Real)**: The automated Playwright State-Graph Crawler completes the full user journey tree with 100% green status, zero dead clicks, zero 404s, zero console errors, and verified forward-reverse round trips.
* **G5 (Mobile Device-Confirmed)**: The Maestro round-trip flow or Agent-Device crawler executes on an emulator/device binary, verifying accessibility element resolution, native modal dismissals, and hardware/gesture back reconstitution.
