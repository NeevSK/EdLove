---
title: "The 4 Concentric Spheres of the Sanctuary Companion: Holistic Architecture & Hostile Critic Blueprint"
status: "active"
created: 2026-10-29
updated: 2026-10-29
author: "Naveen"
scribe: "Antigravity"
tags: [ai, companion, agent, mcp, orpc, personalization, pedagogy, world-search, hexagonal]
---

# The 4 Concentric Spheres of the Sanctuary Companion: Holistic Architecture & Hostile Critic Blueprint

> **Architectural Posture:** Senior Solution Architect + Ruthless Pragmatic Hostile Critic  
> **Scope:** Unifying Personalization/Memory, Age-Appropriate Pedagogy, Platform Self-Awareness, Local + DB Sandboxed MCP Execution, and World-Facing Search into a single Hexagonal Companion Engine across `@repo/core`, `apps/sanctuary-api`, and `@repo/ai`.

---

## 1. The Holistic Vision: Four Concentric Spheres of Awareness

An AI inside Gurudevi cannot be a generic chatbot bolted onto a corner button, nor can it be an unguarded database script. It is a **Sanctuary Companion** that operates across **four concentric spheres of awareness**:

1. **Sphere 1: Knowing the Person (`UserPersonaOverview` & `AgePedagogyBand`):**
   - Role/capacity (`student`, `teacher`, `principal`, `guardian`, `founder`), age/grade band (`early_years_6_9`, `middle_years_10_13`, `adolescent_14_18`, `adult_educator`, `adult_leader`, `adult_guardian`), preferred language (`en`, `si`, `ta`), `orientationSeeds`, and opt-in `companionMemories`.
2. **Sphere 2: Knowing the Platform (`PlatformCapabilityManifest`):**
   - Structured awareness of what Gurudevi is, the 4 Sanctuary Places (`Self / Sadhana`, `Workspace`, `Library`, `Community`), role-filtered features, and deep-link navigation routes so the companion can guide users across the platform.
3. **Sphere 3: Knowing the Current Context & Data (`Local Envelope` + `SanctuaryMcpBridgePort`):**
   - **Fast Local Push:** `SanitizedAIContextEnvelope` from device state (`AIContextRegistry`), governed by the 4-Tier Sensitivity Policy and Tier 3 Sacred Privacy Veto.
   - **On-Demand Server Pull:** Read-only oRPC v2 MCP tool discovery and invocation (`SanctuaryMcpBridgePort`) scoped to the user's JWT and Cedar permissions.
   - **Sandboxed Actuation:** Mutations never execute silently from chat; they create quarantined proposal drafts (`durable_agent_runs`) requiring explicit human promotion.
4. **Sphere 4: Pointing Towards the World (`WorldSearchPort`):**
   - Hexagonal world search port (`SafeEducationalWorldSearchAdapter`) with Exa/Tavily support and zero-key fallback to **Wikipedia + OpenAlex Scholarly Commons**, filtered for age appropriateness and formatted with verifiable citations.

---

## 2. Developmental & Persona Lens Matrix (`AgePedagogyBand`)

| Persona / Age Band (`AgePedagogyBand`) | Target Cohort | Pedagogical & Conversational Posture | Sentence & Vocabulary Calibration | Safety & Assessment Guardrail |
| :--- | :--- | :--- | :--- | :--- |
| **`early_years_6_9`** | Grades 1–4 (Ages 6–9) | Playful wonder, concrete analogies (nature, trees, everyday life), 1 tiny step at a time. | Short, warm sentences (max 2–3 sentences). Simple words. Encouraging curiosity. | Strict child-safe filter; zero external unmoderated links; gentle hints only. |
| **`middle_years_10_13`** | Grades 5–8 (Ages 10–13) | Guided discovery, "why" and "how" connections, building study habits and confidence. | Clear, structured explanations with relatable examples. | Socratic scaffolding; checks understanding before giving formulas. |
| **`adolescent_14_18`** | Grades 9–13 (O/L & A/L, Ages 14–18) | Intellectual respect, exam-prep rigor, critical thinking, stress/rhythm balance, deeper synthesis. | Full academic vocabulary, structured breakdowns, syllabus-aligned reasoning. | Strict active-assessment honesty gate; teaches method and mark-scheme logic rather than doing homework for them. |
| **`adult_educator`** | Teachers, Section/Grade Heads | Peer-to-peer professional colleague. Lifts administrative drudgery; co-designs lessons, rubrics, and interventions. | Concise, actionable, high-signal professional prose. | Protects teacher authority; frames student insights nurturingly without deficit labels. |
| **`adult_leader`** | Principals, Founders, Admins | Systems-level ecological thinker. Synthesizes school-wide flows, morale, coverage gaps, and institutional rhythm. | Strategic, calm, forest-and-trees synthesis. | Enforces Sanctuary Soul Covenant (never turns Self wellbeing data into staff surveillance). |
| **`adult_guardian`** | Parents & Guardians | Warm family partner. Translates school progress into supportive home conversations without anxiety or ranking pressure. | Accessible, reassuring, respectful of home life. | Shows only guardian-authorized student snapshots; avoids comparative rankings. |
