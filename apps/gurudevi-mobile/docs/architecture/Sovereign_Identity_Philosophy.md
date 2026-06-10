---
title: "Sovereign Identity Philosophy"
status: "active"
created: 2026-05-06
updated: 2026-05-16
author: "Naween"
tags: [reorganized]
---

# Sovereign Identity Philosophy

## 1. The Core Doctrine
Identity is a **Union**, not a **Selection**. 

In the legacy RBAC model, a user "switched roles" (e.g., from Teacher to Parent). This created a fragmented experience where abilities were toggled like a switch. In the **Sovereign Union** model, a user is simultaneously the sum of all their relationships (Bonds).

## 2. Theoretical Background (Zanzibar-Inspired)
Our architecture is inspired by Google's **Zanzibar** global authorization system. 
*   **Relationship-Based Access Control (ReBAC):** Access is derived from the graph of relationships between users and objects.
*   **Decoupling:** Identity (Who I am) is decoupled from Authority (What I can do) and Perspective (What I am looking at).

## 3. Key Concepts
*   **Bond:** A relationship between a User and an Entity (e.g., School, Classroom).
*   **Capacity:** The functional capacity within a Bond (e.g., Teacher, Student).
*   **Perspective:** The UI focus. Even though you *are* a Teacher and a Parent, you may choose to *focus* on your School right now.

## 4. Architectural Implementation
*   **AuthStore:** Maintains the `bonds` array (The Reality) and `activeBond` (The Focus).
*   **usePermissions:** Consumes the `bonds` and `activeBond` to build a unified **CASL Ability**.
*   **Composer:** Iterates through ALL bonds to create a mathematical union of your powers.

## 5. Terrain vs. Map: The Gurudevi Experience
To build a successful sanctuary, our "Map" (Architecture) must respect the "Terrain" (User Reality).

### A. The User as a Soul
The user is not a "User ID". They are a person seeking growth. 
*   **The Reality:** Everyone has a "Self" (Wellbeing/Growth) regardless of their job.
*   **The Map:** The **Self Tab** is the center anchor and is always present via the **Personal Workspace**.

### B. The Anchor (Primary Identity)
*   **The Reality:** Onboarding is where the user "orients" themselves. Choosing "Teacher" isn't just a setting; it's a declaration of who they are at their core.
*   **The Map:** We capture this as the **Primary Capacity**. It sets the "vibe" (labels, defaults) for the app experience.

### C. Union vs. Focus
*   **Union (Who you are):** You are simultaneously all your roles. You should see Parent groups and Teacher groups in the **Community Tab** without switching.
*   **Focus (What you see):** When in the **Classroom Tab**, you "focus" on a specific school to see its classes, but you don't lose your global identity.

## 6. Future-Ready Architecture
By moving to a ReBAC model, we enable:
*   **Unified Message Bus:** Authorization checks for background jobs (e.g., "Can this user receive this push notification?") become simple graph queries.
*   **Cross-Tenant Interaction:** A user can interact with multiple schools or communities seamlessly.
## 7. Sovereign History (Temporal Identity)
Identity is not just a "Point in Time"; it is a "Journey." 

### A. The Aged Bond
A Bond represents a relationship that has a lifecycle:
*   **Active:** The user is currently participating in the entity (e.g., teaching this year).
*   **Archived:** The relationship has concluded (e.g., taught here last year). The bond is preserved as a "Historical Key."
*   **Pending:** The relationship is being established (e.g., waiting for onboarding approval).

### B. Access to the Past
By preserving **Archived Bonds**, we enable:
*   **For Students:** A unified "Academic Record" spanning multiple schools and years.
*   **For Teachers:** A "Teaching Portfolio" that automatically aggregates their past class materials and impact.
*   **For the Sanctuary:** A "No-Loss" memory where "Schools Changed" doesn't mean "Identity Deleted."

### C. Capability vs. History
*   **Capabilities (Active):** Grant "Manage" and "Edit" powers.
*   **History (Archived):** Grant "Read" and "Audit" powers to ensure the user always owns their past data.
