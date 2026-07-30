---
title: "Welcome, Auth, Guest, and Onboarding Flow"
status: "superseded"
created: 2026-06-26
updated: 2026-06-26
author: "Naween"
scribe: "Antigravity"
tags: [architecture, navigation, auth, onboarding, guest]
superseded_by: ./2026-07-26-feature-access-local-server-architecture.md
---

# Welcome, Auth, Guest, and Onboarding Flow

> Superseded on 2026-07-26. Public welcome/authentication routes remain, but
> anonymous guest sessions are not an application identity. Use the current
> active-bond and capacity-onboarding contract instead.

This document is the canonical user-flow reference for the public entry path in `gurudevi-mobile`.

It defines how the app should behave for:

- first-time visitors
- anonymous guests
- users who sign up
- returning users who log in
- users who have not yet completed onboarding

This flow is intentionally described from the user perspective first, then mapped to the implementation surfaces.

## Core Intent

The app has one public face: `welcome`.

From there:

- `welcome` is the first screen for any user who is not already inside a completed app session
- `auth` is the account entry screen for sign up and login
- `onboarding` is required for any user who has not yet completed the mandatory first-time setup
- the main app only opens after onboarding is complete

This means the app should never ask a brand-new user to choose a capacity or role before onboarding begins.

Capacity and role are onboarding outputs, not onboarding inputs.

This flow must be isomorphic on mobile and web.

That means the route decision rules, session rules, onboarding rules, and guest/auth behavior are the same on both platforms, even if the layout and visuals differ.

## Canonical Identity Distinction

This app uses two different ideas that must not be confused:

- `citizenship` means how far the user has committed to the system
- `capacity` / `role` means what the user does inside the system

Canonical reading:

- guest / anonymous session = low citizenship, no email required
- signed-up account = higher citizenship
- first-class institutional participation = highest citizenship
- capacity / role is chosen during onboarding, after entry has been established

So:

- guest is a citizenship state
- capacity is a workspace/permission state
- they are not the same thing

## Required Flow

### 1. Public entry

Any user who lands in the app without a completed session should start at `welcome`.

That includes:

- first-time visitors
- users who signed out
- users whose session expired
- users returning after logout

### 2. Guest path

From `welcome`, a user may enter as a guest.

Requirements:

- use Supabase anonymous auth
- do not require email
- treat this as a real guest session, not a fake account shortcut
- after guest entry, route to onboarding

The guest path is for trying the app first, but it still must pass through onboarding before the main app.

### 3. Auth path

From `welcome`, a user may choose `auth`.

`auth` supports both:

- sign up
- login

Rules:

- sign up must route to onboarding if onboarding is not yet completed
- login must route to the main app if onboarding is already completed
- login must route to onboarding if onboarding is not yet completed
- login should not bypass onboarding just because the account already exists

### 4. Onboarding path

Onboarding is mandatory for any new user who has not completed it yet.

The onboarding sequence should behave as follows:

- first steps collect the mandatory identity setup
- capacity / role is selected during onboarding
- the user can skip only the skippable steps
- the mandatory steps are not skippable
- once mandatory steps are complete, the user may continue through the remaining steps or skip them
- if the user skips the optional part, they still enter the main app

### 4a. Dev / sandbox path

Onboarding may also support a developer fast-path through the name field when explicitly enabled by the dev sandbox rules.

Canonical expectations:

- dev entry is still an onboarding path, not a separate public identity model
- the dev shortcut must be opt-in and clearly documented in the onboarding screen
- the dev shortcut may prefill or fast-track capacity and metadata for local or staging use
- the dev shortcut must not weaken the normal production flow

If a dev/sandbox input exists, it belongs inside onboarding because that is already the identity-setup surface.

### 5. App entry

The main app opens only when onboarding is complete.

No public route should continue to show onboarding once the user is fully onboarded.

## Step Model

The onboarding flow has two classes of steps:

- mandatory steps
- skippable steps

Current business rule:

- the first three steps are mandatory
- the remaining steps are skippable

This should remain the canonical rule unless a new decision record explicitly changes it.

## Route Expectations

The route intent should be read this way:

- `/` or the root entry should resolve into the correct state
- `/welcome` is the public landing surface
- `/auth` is the sign up / login surface
- `/onboarding` is the first-time setup surface
- the app shell route should be used only after onboarding is complete

The public routes should not fight each other.

That means:

- `welcome` should not secretly act like a role chooser
- `auth` should not decide capacity
- `onboarding` should not be skipped by login or sign-up success alone

## Guest Session Rules

Guest access should be modeled as:

- Supabase anonymous session
- no email requirement
- no role selection before onboarding
- no assumption that the guest already has a capacity
- no assumption that a guest is an email-based account
- no duplicate anonymous session creation if the user retries the welcome action

## Welcome Error Handling

If the welcome screen cannot complete guest entry or route setup, it should show a toast with guidance instead of failing silently.

Examples of guidance:

- guest sign-in could not complete right now
- check the connection and try again
- if the problem continues, choose login instead

This matters because the welcome button may be tapped multiple times on a slow network.

The welcome action should therefore be idempotent enough to avoid creating multiple Supabase anonymous sessions from repeated taps or retries.

Preferred rule:

- ignore repeated taps while a guest-entry request is in flight
- reuse the current anonymous session when one already exists
- only create a new anonymous session when there is no usable guest session

Guest behavior should be guided by citizenship, not by capacity.

## Recommended Implementation Contract

The following responsibilities should stay separated:

- `welcome` screen: public choice point
- `auth` screen: sign up / login mechanics
- `onboarding` screen: mandatory identity setup and capacity selection
- root layout guard: decides which route family the user belongs to
- auth lifecycle/store: resolves session, onboarding completion, and profile readiness

The root guard should be the single source of truth for route family selection.

The leaf screens should only perform the action they own:

- `welcome` invokes guest or auth entry
- `auth` completes session creation or restoration
- `onboarding` completes the initial profile journey

## Behavioral Rules

- Do not ask for capacity or role before onboarding begins.
- Do not require email for guest access.
- Do not treat guest and role as interchangeable concepts.
- Do not let sign up or login bypass onboarding if onboarding is incomplete.
- Do not let optional onboarding steps block app entry.
- Do not duplicate route decisions in multiple places if a shared helper can own them.

## Existing Documentation Cross-References

This flow sits alongside, but is narrower than, these existing docs:

- [Auth and Onboarding Highway Boundaries](../architecture/AUTH_ONBOARDING_HIGHWAY_BOUNDARIES.md)
- [Navigation Architecture](../navigation-architecture.md)
- [Gurudevi Sanctuary Permission System Architecture](../../../docs/gurudevi-sanctuary-permission-architecture.md)
- [Citizenship & Identity Architecture](../Core/CITIZENSHIP_ARCHITECTURE.md)

Use this document when the question is:

- “What should the user see next?”

Use the boundary and permission docs when the question is:

- “Which layer should own this logic?”
- “What is the authz/citizenship meaning of this state?”
