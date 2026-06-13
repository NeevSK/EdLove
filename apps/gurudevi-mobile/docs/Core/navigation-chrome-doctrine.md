# Navigation Chrome Doctrine

Status: active
Date: 2026-06-13

This doctrine combines two design instincts:

- **Christopher Alexander for structure and function**
- **Jony Ive for soul, restraint, and finish**

The result should be a living navigation system that is structurally clear, emotionally calm, and selectively expressive.

## Core Principle

Do not treat chrome as a permanent layer of UI furniture.

Treat chrome as:

- structural guidance when needed
- contextual support when relevant
- a hidden or collapsed layer when not needed
- a pinnable preference when the user wants permanence

The default state should be quiet. The user should reveal more only when the situation calls for it.

## Alexander Layer

Alexander gives the rules for:

- place
- hierarchy
- orientation
- recurring user patterns
- natural transitions between surfaces

In practice, this means:

- every screen should know what kind of place it is
- the user should always know where they are
- navigation should fit the task, not fight it
- persistent controls should exist only when they serve a real recurring need
- pinned controls should be user-chosen, not system-forced

## Ive Layer

Ive gives the rules for:

- restraint
- precision
- softness of interaction
- emotional clarity
- graceful disappearance of unnecessary detail

In practice, this means:

- chrome should feel light, not bureaucratic
- controls should be beautifully quiet until needed
- hidden state should still feel polished and intentional
- reveal behavior should feel natural, not like a workaround

## Chrome Policy

Use this ordering:

1. Essential orientation
2. Primary action
3. Secondary contextual actions
4. Overflow actions
5. Pinned actions

If something does not belong to the first two layers, it should usually not be permanently visible.

## Mobile Policy

Mobile should feel unmistakably native.

- keep the persistent bar compact
- avoid dashboard-style control clusters at the top of every tab
- collapse secondary actions into overflow or contextual panels
- prefer one dominant task per screen
- preserve easy access to pinned actions without forcing them into the visual foreground

## Web Policy

Web should feel page-like, not like a stretched phone.

- keep page structure visible
- make secondary actions discoverable through hover, menus, or section controls
- let users pin what they use often
- preserve stronger hierarchy and composition
- use wider space for readability, not just more chrome

## Pinned Controls

Pinned controls are the bridge between hidden-by-default chrome and persistent utility.

Rules:

- controls can be hidden initially
- users can pin the controls they need often
- pinned state should persist per surface or role when appropriate
- the system should remember user preference instead of forcing one density for everyone

## Design Language

The chrome should feel:

- calm
- intentional
- legible
- living
- restrained
- trustable

It should never feel like:

- a cluttered admin console
- a generic SaaS dashboard
- a toolbar pasted on top of content
- a web layout pretending to be native
- a native screen trying to act like a desktop app

## Implementation Direction

This doctrine should shape:

- shared header anatomy
- overflow/pin interactions
- web vs native shell behavior
- top-level tab layout
- workspace surface density

The next implementation step is not to remove chrome everywhere.
It is to make chrome progressive, contextual, and user-steered.

