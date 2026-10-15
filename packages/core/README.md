---
title: "@repo/core - The Ecosystem Spine"
status: "active"
created: 2026-03-25
updated: 2026-10-15
author: "EdLove Foundation & Gurudevi Sanctuary"
tags: [packages, core, architecture, offline-first, trust]
---

# @repo/core — The Ecosystem Spine

> **The quiet backbone that ensures education software remains safe, private, and dependable.**

`@repo/core` provides the shared operational foundation for the entire **EdLove** and **Gurudevi** ecosystem. It is designed to lift administrative drudgery from teachers and school stewards while defending learner privacy with local-first data architecture.

---

## 🕊️ Humane Purpose & Core Covenant

In real-world educational environments—particularly in rural and community schools—connectivity can be unpredictable, devices vary widely, and digital surveillance threatens student psychological safety. 

`@repo/core` solves these human challenges:

1. **Uninterrupted Presence (Offline-First)**: A teacher taking attendance or recording learning observations in a classroom without internet never loses work. Actions are stored locally and sync gracefully when connectivity resumes.
2. **Zero Surveillance & Strict Privacy**: We reject behavioral ad tracking, data harvesting, and commercial profiling of minors. Student and educator records belong solely to their educational community.
3. **Multi-Role Clarity**: Educators, school leaders, students, and family members each have clear, role-appropriate boundaries.
4. **Resilience & Grace**: When external networks fail, the system degrades smoothly with clear, human feedback rather than cryptic error screens.

---

## 🧭 What This Domain Houses

* **Identity & Session Foundations**: Dignified, secure sign-in and guest-safe exploration.
* **Offline Resilience & Data Flow**: Queue management and synchronization policies that keep local data in sync with cloud backups.
* **Capabilities & Governance**: Explicit, capability-based permissions ensuring users only see and edit what is appropriate for their educational relationship.
* **Cross-Platform Primitives**: Stable contracts and shared utilities shared seamlessly between browser web and mobile applications.

---

## 🤝 For Contributors & Educators

When adding or adapting capabilities in `@repo/core`:
* **Ask the Human Question**: *"Does this change help an educator focus on teaching, or does it add unnecessary cognitive complexity?"*
* **Preserve Offline Autonomy**: Core logic must never assume a continuous high-speed internet connection.
* **Respect Clear Boundaries**: Visual screen rendering belongs in domain packages (`@repo/classroom`, `@repo/self`, `@repo/ui`) or app shells (`apps/gurudevi-web`, `apps/gurudevi-mobile`), keeping `@repo/core` focused on honest domain logic and reliable contracts.
