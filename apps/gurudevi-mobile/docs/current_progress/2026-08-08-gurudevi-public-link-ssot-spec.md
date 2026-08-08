---
title: "Gurudevi Public Link and Consent Source-of-Truth Specification"
status: "active"
created: 2026-08-08
updated: 2026-08-08
author: "Codex"
tags: [gurudevi, links, privacy, consent, mobile, web]
---

# Gurudevi Public Link and Consent Source-of-Truth Specification

## Blast Zone

AMBER: shared UI and public-link utilities. No database, router shell, native directory, or authorization policy changes.

## Reuses

- `packages/ui/src/utils/urls.ts` for public Gurudevi destinations and support contacts.
- `packages/core/src/store/useConsentStore.ts` for the existing mobile consent state.
- `apps/gurudevi-mobile/src/components/PDPAConsentModal.tsx` for the existing consent gate.

## Contract

- The Gurudevi marketing site is the canonical public home for Privacy Policy, Terms of Use, support, and community boundaries.
- Mobile and web welcome/footer surfaces must expose the same policy destinations and explain that optional analytics requires consent.
- Product routes, QR routes, and share URLs must use configurable public URL constants rather than repeated domain literals.
- External policy links open with the existing safe external-link behavior.

## Does Not

- Does not change Expo base-path hosting, native Android/iOS files, database schema, authentication, authorization, or telemetry event design.
- Does not treat legal draft language as final legal advice.

## Verification

- Run mobile/shared type-checks.
- Search user-facing source for old Gurudevi domains and support email literals.
- Confirm marketing build remains successful.
