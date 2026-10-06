---
name: Feature request
about: Propose an enhancement
labels: enhancement
---

## Problem
What user need is unmet? Link `docs/INDEX.md` area if known.

## Proposal
What should change? Note whether it touches DB (needs RLS in `schema.zmodel`), sync (`powersync/sync-config.yaml`), or SaaS (`config/doppler-secrets.json`).

## Alternatives
Edge-case self-host vs hosted? See ADR `docs/decisions/2026-08-25-transparent-hosted-oss.md`.

## Implementation Considerations
- Does this require new dependencies? If so, check Sacred Versions in `AGENTS.md`
- Does this touch authentication, authorization, or data persistence? (See Security Checklist)
- Does this require migration changes? (See Database Governance in cross-domain readiness ADR)
