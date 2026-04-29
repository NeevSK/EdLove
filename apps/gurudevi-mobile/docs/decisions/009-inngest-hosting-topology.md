# ADR-009: Inngest Hosting Topology

## Status

Accepted

## Date

2026-04-28

## Context

Gurudevi has:

- a mobile client (`gurudevi-mobile`) running on Expo / Metro / React Navigation
- a web/server-capable app (`gurudevi-marketingWeb`) hosted on Vercel
- shared domain packages in `packages/*`

We need durable background orchestration for cross-domain workflows, retries, and privileged side effects. The team needs a topology that works now on Vercel and stays evolvable as the platform grows.

Two questions drove this decision:

1. Should each package or app instantiate its own Inngest runtime?
2. Should we create a dedicated worker app immediately?

## Decision

We will use the following topology:

- `packages/*` own shared event contracts, payload schemas, and pure domain logic.
- `apps/gurudevi-mobile` is an **emitter shell** only.
- `apps/gurudevi-marketingWeb` is the **current Inngest worker host** and exposes the `serve()` endpoint on Vercel.
- We will not create a dedicated worker app yet.

In other words:

- mobile sends events
- marketing web hosts the Inngest runtime
- shared packages stay runtime-agnostic

## Rationale

### Why not put Inngest in every package?

Because packages are not deployable runtimes. They should not own:

- environment variables
- signing keys
- event transport
- webhook handlers
- privileged orchestration clients

They should own reusable contracts and logic only.

### Why is `marketingWeb` acceptable right now?

Because it is already:

- server-capable
- deployed on Vercel
- able to host an Inngest `serve()` endpoint
- close to the current operational path for deployment and secrets

This gives us the shortest path to a working durable workflow system without introducing another deployment surface prematurely.

### Why not create `gurudevi-worker` now?

A dedicated worker app would help later if we need:

- independent deploy cadence
- stronger operational separation from the public web tier
- heavier workflow load
- migration from Vercel `serve()` to long-running `connect()` workers

We do not yet need that complexity to get value from Inngest.

## Consequences

### Positive

- One clear worker host today
- Simpler Vercel integration and secrets management
- Mobile stays thin and safe
- Cross-app workflows can already work because both web and mobile can emit into the same event system

### Negative

- `marketingWeb` temporarily carries both public-web and orchestration responsibilities
- Without discipline, it can become a dumping ground for unrelated workflows
- Future extraction to a dedicated worker app may still be desirable

## Guardrails

- Do not instantiate `Inngest` in shared packages.
- Do not host durable workers in mobile.
- Keep event contracts in shared packages.
- Keep handlers and privileged side effects in the server shell.
- Revisit this ADR if workflow volume, operational needs, or hosting constraints outgrow the current setup.

## Review Trigger

Re-evaluate this decision when any of the following become true:

- more than one team is regularly changing workflow code
- workflows become a major production dependency
- Vercel runtime limits materially shape workflow design
- orchestration concerns begin to dominate `marketingWeb`
- we decide to move to a long-running worker runtime using Inngest `connect()`
