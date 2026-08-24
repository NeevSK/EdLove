---
title: "@repo/form-builder"
status: "active"
created: 2026-03-25
updated: 2026-05-22
author: "Naveen"
scribe: "opencode"
tags: [packages, form-builder]
---

# @repo/form-builder

This package is an internal Gurudevi feature host, not the publishable artifact.

The publishable, sovereign boundary is `@intuitui-labs/form-builder-engine`.

## Role
- app-facing builder and renderer compositions
- Gurudevi-specific screens and route integrations
- UI wiring that consumes the engine and repo-local design system packages

## Not the public contract
- storage adapters
- validation state model
- schema runtime
- form hydration logic
- analytics primitives

## Rule
If code needs to be reused outside this monorepo, it belongs in `packages/form-builder-engine` or in a separate adapter package.
