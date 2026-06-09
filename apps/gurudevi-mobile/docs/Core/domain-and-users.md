---
title: "Domain Context and User Roles"
status: "active"
created: 2026-06-09
updated: 2026-06-09
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, domain, users]
---

# Domain Context and User Roles

This document defines the core product identity, industry domain context, and user structures for the Gurudevi project.

---

## 1. Industry & Domain Context (The "Why")

Gurudevi is an **Education Ecology Support System** designed specifically for schools, teachers, and their broader community. It rejects generic corporate business paradigms in favor of supporting the human relationships that form an education system.

For a deep grounding in our concentric circles model, holarchies, and autopoiesis theory, see [Educational Ecology and Philosophy](./educational-ecology-philosophy.md).

---

## 2. User Roles & The Perspectives Framework

Gurudevi employs a hybrid authorization model utilizing **Cedar-style Relationship-Based Access Control (ReBAC)** and Attribute-Based Access Control (ABAC). Users are not locked into a single fixed role; instead, they act through distinct **Bonds**.

### Navigation & Perspective Vocabulary
* **User (`user.uuid`)**: The physical person using the device.
* **Personal Sanctuary (`personalSanctuary.uuid`)**: The user-owned personal workspace space created upon onboarding.
* **Bond**: A stored relationship fact connecting a user to a specific entity (such as a school, section, or classroom).
* **Available Bonds (`availableBonds`)**: The set of all relationship facts the user has access to.
* **Active Perspective**: The selected identity lens for the current session (e.g. looking at the system as a Principal vs. as a Parent).
* **Active Bond (`activeBond`)**: The active relationship mapping that drives the current session's permissions, school IDs, and UI configuration.
* **Capacity**: The human-readable role label (e.g., Principal, Teacher, Student) derived dynamically from the active bond.

---

## 3. Core Roles and Capacities

All roles navgiate the same database reality, but they view it through specialized screens and data boundaries:

| Capacity | Scope of Visibility | Core Responsibilities |
| :--- | :--- | :--- |
| **Founder** | Full multi-school environment. | Institutional setup, configuration, global school health. |
| **Principal** | School-wide aggregated context. | Leadership dashboard, aggregated wellbeing patterns, announcement publishing. |
| **Section Head** | Assigned section (e.g., Primary, Secondary). | Section dashboard, lesson plan templates, teacher coordination. |
| **Grade Head** | Assigned grade level. | Grade-level progress, shared lesson repository. |
| **Teacher** | Assigned classroom and students. | Lesson planning, attendance recording, grading, wellness sensing. |
| **Student** | Personal learning space and assigned classroom. | Viewing lessons, self-wellness tracking (Self space), scanning check-ins. |
| **Guardian** | Linked student's progress and school communications. | Student updates, announcements, teacher communication. |

---

## 4. Multi-Tenant Row-Level Security (RLS)

Every school's operational data is strictly isolated within the same PostgreSQL database using **Supabase RLS**.
* Every operational query must join or filter by `school_id`.
* Aggregated wellness patterns are visible to leadership (Principals), but individual private reflection data (Self space journaling) remains locked to the user and is never accessible via RLS policies to other roles.
