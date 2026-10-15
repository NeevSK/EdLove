---
title: "@repo/people - The Human Presence Layer"
status: "active"
created: 2026-03-25
updated: 2026-10-15
author: "EdLove Foundation & Gurudevi Sanctuary"
tags: [packages, people, presence, human-care, staff]
---

# @repo/people — The Human Presence Layer

> **Caring for every educator, staff member, and student as a living person in the school community.**

`@repo/people` represents the human layer of an educational institution. It moves beyond seeing people as employee numbers or IDs, ensuring that institutional membership, daily presence, and personal wellbeing are acknowledged and supported with care.

---

## 👥 Core Capabilities

* **School Directory**: A clean, accessible directory of teachers, staff members, mentors, and administrators.
* **Staff Presence & Pulse**: Simple, dignified daily check-ins that give school leaders visibility into staff presence and school-wide energy.
* **Leave Management & Self-Service**: Direct, respectful workflows for staff to request leave, check balances, and coordinate coverage with peers.
* **Guardian & Family Linkages**: Foundational relationships linking learners with their parents, guardians, and support networks.

---

## 🌿 Core Invariants

* **Human Dignity**: Presence data is an operational tool for care, safety, and mutual support—never for punitive biometric surveillance or micromanagement.
* **Clarity of Role**: Shared models from `@repo/core` (`Membership`, `SchoolRole`, `PlatformRole`) are reused rather than inventing fragmented permissions.
* **Separation of Concerns**: Classroom lesson teaching belongs in `@repo/classroom`; official school governance lives in `@repo/admin`; operational job duties belong in `@repo/workforce`.
