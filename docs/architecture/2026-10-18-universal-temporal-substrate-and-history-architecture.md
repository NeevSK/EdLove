---
title: "Universal Temporal Substrate & Intentional History Architecture"
status: "active"
created: 2026-10-18
updated: 2026-10-18
author: "Naveen"
scribe: "Antigravity"
tags: [temporal, architecture, history, event-sourcing, intentional-ui, powersync, sqlite, workbench]
---

# Universal Temporal Substrate & Intentional History Architecture

> **Prime Directive**: Everything that happens inside the application is an immutable, timestamped event. Time is not a cosmetic string flipper (`< Date >`); it is the unified temporal substrate linking **Past** (immutable history/reflection), **Present** (living action/execution), and **Future** (intentional planning) across all Sanctuary domain floors.

---

## 1. Executive Summary & Problem Diagnosis

### The Disconnected Present
In the current implementation ([`apps/gurudevi-web/app/(sanctuary)/self/SelfFloor.tsx`](file:///c:/x/apps/gurudevi-web/app/(sanctuary)/self/SelfFloor.tsx) and [`TemporalHorizon.tsx`](file:///c:/x/apps/gurudevi-web/app/(sanctuary)/components/workbench/TemporalHorizon.tsx)):
1. **The Ghost Navigator**: Stepping back/forward with `< >` alters an isolated calendar string in state. However, primary domain tasks (e.g. Fire Journal) are configured with `temporalBinding: { kind: 'none' }`. Moving the date changes nothing on the floor.
2. **Blind Stepping**: A naked date string conveys zero information topology. The user cannot tell if yesterday has recorded memories, if tomorrow has scheduled classes, or if they are 14 days in the past.
3. **Ontological Flattening**: Yesterday, Today, and Tomorrow are treated as identical editable surfaces. In truth:
   - **Past (History)** is immutable, reflective, and read-only.
   - **Present (Today)** is radiant, actionable, and living.
   - **Future (Horizon)** is intentional, projected, and mutable.

### The Solution: A Simpler, Ubiquitous Temporal Spine
To ensure "nothing escapes and things are viewable", the platform adopts a **Universal Event-Ledger Pattern** in the local substrate (PowerSync / SQLite / ExploreStorage) where every action is recorded as a lightweight timestamped event. When navigating time, the domain floor re-scopes to that temporal window, effortlessly surfacing the living history of that day.

---

## 2. The Triad of Time: Past, Present, Future

```
                         ┌────────────────────────────────────────────────────────┐
                         │                 THE TEMPORAL TRIAD                     │
                         └────────────────────────────────────────────────────────┘
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
        PAST (Review)                 PRESENT (Now)                 FUTURE (Plan)
      • Intent: 'review'            • Intent: 'current'           • Intent: 'plan'
      • Nature: Immutable History   • Nature: Living Action       • Nature: Open Intentions
      • Mutation: Read-only         • Mutation: Active Drafts     • Mutation: Re-orderable
      • Atmosphere: Archival Vellum • Atmosphere: Living Warmth   • Atmosphere: Clear Horizon
      • Question: "What was?"       • Question: "What is now?"    • Question: "What will be?"
```

### The Three Operational Postures
1. **Past (`review`)**:
   - The user is an **Observer & Contemplator**.
   - Input forms (attendance buttons, journal editors) lock into **Certified / Archival Mode**.
   - What renders is the historical record created on that date.
   - Any new interaction is strictly additive (e.g., "Add retrospective reflection *today* about that past day").
2. **Present (`current`)**:
   - The user is an **Actor**.
   - Active input mode: burn journal entries, record roll-call, send messages, mark reading pages.
   - Live synchronization and optimistic UI state are active.
3. **Future (`plan`)**:
   - The user is an **Architect of Intention**.
   - Projected schedules, timetable commitments, curriculum reservations, and mindfulness reminders.

---

## 3. Data & Schema Architecture: "Nothing Escapes"

### 3.1 Tri-Temporal Event Modeling
To keep the schema simple yet impervious to audit disputes or clock-drift, every temporal record separates three timestamps:

| Timestamp Field | Name | Semantics | Mutability |
| :--- | :--- | :--- | :--- |
| `occurred_at` | **Valid Time** | When the human experience or reality occurred (e.g. 2026-10-15 08:30:00). | Fixed at creation. |
| `recorded_at` | **System Time** | When the database wrote the row (`DEFAULT now()`). | Strictly immutable. |
| `target_date` | **Intention Time** | For future intentions, deadlines, or scheduled commitments (`YYYY-MM-DD`). | Mutable until realized. |

### 3.2 The Universal Temporal Event Schema (`TemporalEvent`)
Rather than creating 20 distinct history tables, all domain activity writes to a single append-only event substrate:

```prisma
model TemporalEvent {
  id            String    @id @default(uuid())
  owner_id      String    // User ID, School ID, or Classroom ID
  owner_type    String    // 'user' | 'personal_workspace' | 'school_workspace' | 'group'
  domain        String    // 'self' | 'workspace' | 'community' | 'library'
  event_type    String    // 'mood_pulse' | 'journal_burned' | 'attendance_taken' | 'page_read'
  
  occurred_at   DateTime  // When the event happened in human time
  recorded_at   DateTime  @default(now()) // System write timestamp
  
  decay_class   Int       @default(1) // 0: ephemeral, 1: standard, 2: landmark/permanent
  payload       Json      // Structured event payload
  
  @@allow('create', auth() != null)
  @@allow('read', auth() != null && (owner_id == auth().id || checkReBAC(auth().id, owner_id)))
  @@deny('update', true)  // Invariant: History is immutable
  @@deny('delete', true)
  
  @@index([owner_id, domain, occurred_at])
  @@index([occurred_at])
}
```

### 3.3 The Coral-Band Sync & Storage Strategy
To prevent local SQLite or mobile device memory from being overwhelmed by years of history:
1. **Trailing Window (45 Days)**: The device's local database syncs 100% of high-resolution raw events for the trailing 45 days. Local-first queries are instantaneous and function completely offline.
2. **Pre-computed Rollups (`temporal_rollups`)**: Beyond 45 days, the client stores lightweight weekly/monthly rollups ($< 1\text{ KB}$ per week) containing metric aggregates and 7-day activity density vectors.
3. **On-Demand Deep History**: If a user navigates to an exact day from 2 years ago, the raw event details are streamed on demand from Supabase over HTTPS without permanently bloating the local offline database.

---

## 4. UI / Presentation Architecture: The Intentional Horizon

Following the [`intentional-ui-design`](file:///c:/x/.agents/skills/intentional-ui-design/skill.md) doctrine:
- **No naked `< Date >` arrows**.
- **Visual feedback on where history lives** (Activity Blooms).
- **Clear atmospheric mood** that shifts between Past, Present, and Future.

### 4.1 The 7-Day Living Horizon Ribbon

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [★ Today]   ‹  Mon 12    Tue 13    Wed 14   [★ Thu 15]   Fri 16    Sat 17    Sun 18  ›   [Cal]   │
│                 ·          ··                  ●●●         ○                              [Day▾]│
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Thursday, October 15, 2026  ·  Dawn Sanctuary Atmosphere                                        │
│ Status: Active practice mode  ·  3 moments captured today                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Key Elements:
1. **7-Day Organic Ribbon**: Displays the current week slice around the selected anchor.
2. **Activity Blooms (Density Dots)**:
   - `●` (Saffron Amber): Days with recorded history (burned journal, attendance taken, mood log).
   - `○` (Subtle Ring): Days with future intentions or scheduled commitments.
   - Empty: Quiet rest days.
3. **Intent Badge & Subtitle**:
   - `review`: *"Archival Record · Read Only · 3 entries found"*.
   - `current`: *"Living Practice · Dawn Atmosphere · Active"*.
   - `plan`: *"Future Horizon · 2 scheduled commitments"*.
4. **Leading "Return to Today" Button**: Appears with a gentle glow whenever the active anchor is not Today, snapping the camera back to Present via an organic spring.

---

## 5. Domain Floors Integration Matrix

| Domain | Task Example | `current` Mode (Today) | `review` Mode (Past) | `plan` Mode (Future) |
| :--- | :--- | :--- | :--- | :--- |
| **Self** | Fire Journal & Mood Lotus | Active interactive reflection; fire is lit; burn action writes new event. | Archival view; fire is cool; displays burned journal ashes & mood logs from that exact date. | Intention prompt; set morning mindfulness focus. |
| **Workspace** | Classroom Attendance | Interactive roll-call (Present/Late/Absent); optimistic SQLite writes. | Certified Attendance Ledger; read-only summary; attendance delta vs 30-day baseline. | Scheduled timetable; room reservations; lesson plans. |
| **Community** | Hearth & Circles | Real-time chat & active presence. | Concluded dialogue archive & recorded wisdom transcripts. | Upcoming Gathering calendar; RSVP to communal vigils. |
| **Library** | Resource Reader | Active reading volume with open marginalia. | Historical reading trail; highlighted quotes & notes from past study. | Reading queues; curriculum reserves; seasonal inquiries. |

---

## 6. Implementation Seams & Verification Rules

1. **State Machine (`@repo/core`)**:
   - Promote `DomainTemporalCoordinates` and pure `resolveTemporalCoordinates(anchorDate, scale)` in `packages/core/src/logic/workbench/`.
   - Update `resolveTaskTemporalHorizon(task, domainHorizon)` so that tasks with `follow-domain` receive the full coordinate set (`date`, `intent`, `isPast`, `isToday`, `isFuture`).
2. **Component Upgrades (`apps/gurudevi-web`)**:
   - Upgrade `TemporalHorizon.tsx` to render the 7-day ribbon, activity dots, and dynamic orientation copy.
   - Connect `SelfFloor.tsx` and `WorkspaceFloor.tsx` so tasks follow the domain horizon.
3. **Persistence Layer**:
   - Ensure `selfExplore.ts` / local SQLite writes attach valid `occurred_at` and `recorded_at` timestamps to all journal entries and mood logs.
   - Provide a `loadHistoryForDate(date)` query so that selecting a past day immediately hydrates that day's events.
4. **Anti-Slop & Zero-Regression Guardrail**:
   - Must pass `pnpm run check:anti-slop`.
   - Retain full keyboard accessibility (arrow key navigation for dates).
   - Preserve Explore guest mode and Account authenticated mode without branching regressions.
