---
title: "Account Foundation Journey Matrix"
status: "active"
created: 2026-10-08
owners: [product, identity, web, mobile, quality]
tags: [audit, journeys, onboarding, lifecycle]
---

# Account Foundation Journey Matrix

This is the order for reasoning and evidence. A journey is not release-ready
because one screen renders; its identity, custody, failure, and recovery edges
must be proven.

| Journey | Expected outcome | Current state | Next proof |
|---|---|---|---|
| Visitor → Explore | Can inspect local/sample domain surfaces without implying persistence or participation. | Partially explicit in Self/Workspace/Community; Library is placeholder. | Browser smoke evidence for labeling and no durable writes. |
| Sign up → identity created | One internal account maps to one provider subject. | Multiple seams and duplicate onboarding implementations. | Canonical contract decision, then G0/G1 characterization. |
| Identity created → name + capacity onboarding | User can continue smoothly and role-based entry becomes available. | Required by product decision; implementation paths disagree. | End-to-end web and mobile onboarding runtime evidence. |
| Onboarded user → Self value | Reflection/wellbeing practice works and custody is clear. | Fire Journal/Mood Lotus have strong test-level evidence; runtime unproven. | G3/G4/G5 as applicable, including offline/failure and account ownership. |
| Principal → create school | School entity and owner relationship are durable and recoverable. | Not present in the reviewed Next onboarding/floor path. | Relationship contract and creation journey. |
| Teacher → create or join class | Invitation/official join creates scoped relationship; no client-selected authority. | Workspace consumes scope but does not establish it. | Create/join/invitation contract and cross-platform proof. |
| User → Library action | User can perform one durable/useful read action with correct access. | Authenticated catalog read path exists; Explore is local. | Browser/provider/runtime proof and custody classification. |
| User → Community discovery/participation | Scope-filtered discovery is safe; participation only when membership and moderation are real. | Circle directory exists; focused feed is mock. | Decide whether discovery alone is a release slice; otherwise implement participation contract. |
| Account → deletion request | User receives truthful request status and feedback; final deletion is not implied. | Request boundary is staged; final deletion is blocked. | State/status/feedback contract and support procedure. |

