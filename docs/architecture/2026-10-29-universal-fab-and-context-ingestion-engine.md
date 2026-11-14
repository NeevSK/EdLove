---
title: "Universal LotusPetalFAB & Policy-Driven AI Context Ingestion Engine"
status: "active"
created: 2026-10-29
updated: 2026-10-29
author: "Naveen"
scribe: "Antigravity"
tags: [ai, fab, context-ingestion, privacy, self, workspace, library, community]
---

# Universal LotusPetalFAB & Policy-Driven AI Context Ingestion Engine

> **CANONICAL SPECIFICATION**  
> **Date:** October 29, 2026  
> **Scope:** `@repo/core/ai/contextRegistry`, `LotusPetalFAB` (`@repo/ui`), `useAIAgent` & `AIScreen` (`@repo/ai`), `Orchestrator` (`apps/sanctuary-api`), and the 4 Sanctuary Places (`Self`, `Workspace`, `Library`, `Community`).

---

## 1. Architectural Problem Statement

1. **The FAB Hijack & Invisibility Problem:**
   - Previously, `SelfScreen` did not register `useRegisterFAB`, leaving `LotusPetalFAB` invisible on the `Self` tab.
   - Meanwhile, `Workspace`, `Library`, and `Community` registered a single `onPress` callback (e.g., "+ Add Resource" or "+ Create Post") with `actions: []`, which hijacked the entire FAB tap and prevented users from summoning the AI Companion from `LotusPetalFAB`.
2. **All-or-Nothing Context Blindness:**
   - Treating `Self` as a monolithic black box prevented the LLM from seeing helpful `today`-zone signals (such as **Personal Goals, Study Rhythm, Reminders, or Mindful Minutes**), while `Library` and `Community` had no standardized seam to pass the currently viewed book, resource, or circle into the AI Companion.
3. **Community Dual-Door Requirement:**
   - In `Community`, users need both a **1-tap AI Companion button** on the main Community surface (`Feed` / `Circles`), a **pinned AI Assistant thread** in `DirectMessagesListScreen`, and **FAB spin-up** supporting both persistent Mentor DM and contextual post/circle assistance.

---

## 2. The 4-Tier Context Policy Registry (`@repo/core/ai/contextRegistry`)

Every piece of contextual data published by a domain screen is tagged with an explicit **`AIContextSlotId`** and governed by a **`ContextSensitivityTier`**:

| Sensitivity Tier | Policy Rule | Canonical Slots |
| :--- | :--- | :--- |
| **Tier 0: `always_safe`** | Always permitted in normal chat | `platform.active_tab`, `platform.user_role`, `platform.moon_phase` |
| **Tier 1: `configurable_default_on`** | Enabled by default; runtime-toggleable per slot via `setSlotEnabled(slotId, boolean)` | • **Self (`today` zone):** `self.goals_and_reminders`, `self.study_rhythm`, `self.mindful_pulse`, `self.active_spaces`, `self.orientation_seeds`<br>• **Workspace:** `workspace.active_classroom`, `workspace.coordination_gaps`, `workspace.timetable_summary`<br>• **Library:** `library.active_resource`, `library.search_filter`<br>• **Community:** `community.active_mode`, `community.active_circle` |
| **Tier 2: `explicit_attach_only`** | Blocked unless the user explicitly attaches the item (`explicitlyAttached: true`) | `self.tomorrow_prep_draft`, `self.thought_reframe_card`, `community.post_draft` |
| **Tier 3: `sacred_never_ingest`** | **Hard Code Veto** on both client and server (`Orchestrator.ts`) — cannot be enabled even by config override | `self.fire_journal`, `self.voice_journal`, `admin.safeguarding_cases`, `auth.raw_credentials` |

---

## 3. End-to-End Data Flow

```mermaid
flowchart LR
    subgraph Domains ["4 Sanctuary Places"]
        S["🪷 Self (Goals, Rhythm, Mindful Pulse)"]
        W["🏫 Workspace (Classrooms, Gaps)"]
        L["📚 Library (Selected Book, Shelf, Query)"]
        C["💬 Community (Mode, Circle, Mentor DM)"]
    end

    subgraph CoreEngine ["@repo/core/ai/contextRegistry"]
        STORE["useAIContextStore"]
        GATE["sanitizeContextEnvelope()<br/>Enforces Tiers 0–3 + 2,000-char cap"]
    end

    subgraph ClientUI ["@repo/ui & @repo/ai"]
        FAB["LotusPetalFAB<br/>Merges Domain Action + AI Companion Actions"]
        AISCREEN["AIScreen.tsx<br/>Shows Active Context Pill + [✕ Detach]"]
    end

    subgraph Server ["apps/sanctuary-api"]
        ORCH["Orchestrator.ts<br/>Server-Side Tier 3 Veto + Prompt Injection"]
    end

    S & W & L & C -->|usePublishAIContext| STORE --> GATE
    FAB --> AISCREEN
    GATE --> AISCREEN --> ORCH
```
