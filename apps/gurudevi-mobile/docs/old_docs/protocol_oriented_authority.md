---
title: "Protocol-Oriented Authority (POA): The Gurudevi Architectural \"True North\""
status: "active"
created: 2026-03-30
updated: 2026-07-24
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

> **Superseded** � kept for historical reference.
> See active docs at docs/INDEX.md.
# Protocol-Oriented Authority (POA): The Gurudevi Architectural "True North"

## 1. The Philosophical Shift
Traditional architectures rely on **Static Hierarchy**:
- *Screen A* imports *Component B*.
- *Component B* checks `if (user.role === 'principal')`.

**The Problem**: This creates a "Spaghetti of Permission". If you add a new role (e.g., "Section Head") or a new package (e.g., "Workforce"), you have to touch every screen.

**The Solution (POA)**: We move from "Who are you?" to **"What is the Purpose (Intent)?"**.
The UI does not ask for a component; it expresses an **Intent**. The Ecosystem (Core) resolves that intent by finding a **Vow** that is **Authorized** for the current context.

---

## 2. Core Mechanics: Intent, Protocol, and Vow

### A. The Intent (The "What")
An `Intent` is a semantic placeholder in the UI. It represents a functional goal.
- `institutional.briefing`: "I need the morning situational summary for this school."
- `classroom.holistic_insights`: "I need human-centered data about this specific class."

### B. The Protocol (The "Contract")
The `Protocol` defines the data requirements (props) and the expected result. It lives in `@repo/core`.

### C. The Vow (The "Fulfillment")
A `Vow` is a package’s commitment to satisfy an intent. 
- `@repo/people` vows to fulfill `institutional.briefing` by rendering the `PrincipalPulse` widget.
- **Authorization is baked in**: The Vow only fulfills the intent if the user's current capabilities allow it.

---

## 3. Why This is "Architecturally Elegant"

### 1. Decoupled Sovereignty
The `classroom` package never imports from `admin` or `people`. It is "Sovereign". It only depends on the **Protocols** in `@repo/core`. This eliminates circular dependencies permanently.

### 2. Late Binding (The SAP/Enterprise Pattern)
In systems like **SAP (Business Add-Ins / BADIs)**, the core system provides "Hooks" that modules plug into. 
- **The POA Advantage**: Our system is more dynamic. We don't just "hook in"; we **negotiate**. If a school has a custom "Special Education" package, that package can register a higher-priority Vow for `classroom.insights`, effectively overriding the default behavior without touching core code.

### 3. Infinite Scalability
As we add `@repo/workforce`, `@repo/payments`, or `@repo/accounting`, these packages simply "Vow" to fulfill existing Intents. The Dashboards we built today will automatically show new features as those packages are added to the workspace.

### 4. Policy-First Security
Security is no longer a checklist in a component. It is the **gatekeeper of resolution**. If a user isn't authorized, the `Intent` resolves to nothing. The UI remains clean, and the logic remains safe.

---

## 5. Granularity: "Intent" vs. "Standard Component"

A common question in POA design is: *When should a UI element be an Intent?*

### The Decision Matrix

| Criterion | Use an `Intent` | Use a Standard Component |
| :--- | :--- | :--- |
| **Authority Variance** | Requirement changes by role/permissions. | Always visible/identical for all users. |
| **Domain Logic** | Heavy domain logic or data fetching. | Presentation-only or ubiquitous utility. |
| **Extensibility** | Expected to be overridden or swapped. | Core, stable part of the application shell. |
| **Decoupling** | Must be package-sovereign (cross-repo). | Internal to a single package/module. |

### Practical Guidelines:
1.  **Search Bars & Headers**: Typically stay as **Components**. While important, they often represent the "stage" rather than the "actors." You only turn these into Intents if you need to radically swap the search provider (e.g., Global Search vs. Local Filter) via POA.
2.  **Stat Cards & Action Buttons**: These are the prime candidates for **Fine-Grained Intents**. Each card represents a distinct piece of authority. Disabling "Performance Resonance" while keeping "Attendance" should be a POA decision, not a shell change.
3.  **Complex Widgets**: (e.g., `ClassroomList`) These should almost always be **Coarse Intents**. They encapsulate a whole functional unit that can be swapped or customized.

### The "Trade-off" Rule:
**Flexibility vs. Boilerplate**: High granularity (many intents) provides maximum control but increases the number of Vows to register. We aim for a "Sweet Spot" where any UI element that represents an **Optional Power** or a **Restricted View** is an Intent. Everything else stays as a standard component for developer efficiency.

---

## 6. Way Forward: The "Ecology" Vision
...

By starting "Upstream" in `@repo/core`, we ensure the platform grows like an **Ecology**, not a building. 

- **Holarchic Growth**: New layers (Workforce, Stakeholders) don't burden current layers.
- **Cybernetic Feedback**: The `Intent` system allows us to easily inject "Echoes" or "Feedback Loops" into any dashboard by simply registering a Vow for a `pulse` intent.

This is the most modern, future-proof way to handle a multi-tenant, multi-role ERP without it collapsing under its own weight. 

**Conclusion**: We have moved from building a "Product" to orchestrating a "Protocol".
