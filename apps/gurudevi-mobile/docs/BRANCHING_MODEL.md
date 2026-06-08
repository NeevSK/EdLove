---
title: "Branching model (solo, scalable)"
status: "active"
created: 2026-03-20
updated: 2026-03-20
author: "Naween"
tags: [reorganized]
---

# Branching model (solo, scalable)

This repo uses a pipeline-style branch structure so changes can be promoted through environments with increasing stability.

## Branches and intent

- `main-innovate`: experimentation, prototypes, spikes, new features (allowed to be unstable).
- `main-dev`: active development branch (features integrated, still changing fast).
- `main-QA`: stabilization/testing branch (bug fixes, regression checks, hardening).
- `main-preview`: pre-production preview branch (release candidate validation).
- `main`: production branch.

## Promotion rules (recommended)

- Promote changes forward only: `main-innovate` -> `main-dev` -> `main-QA` -> `main-preview` -> `main`.
- Avoid back-merges from `main` into upstream branches except for critical hotfix sync.
- Tag releases off `main` (e.g., `vX.Y.Z`) and keep a short release note in PR descriptions.

## Practical tips (solo dev)

- Keep each branch deployable: broken builds block promotion.
- Use PRs even when solo (self-review + history + easier rollback).
- Map environments to branches in CI/CD (e.g., preview deployments from `main-preview`, production from `main`).

