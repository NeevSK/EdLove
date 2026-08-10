---
title: "React Native Web Sustainability and Gurudevi Web Capability Plan"
status: "active-with-powersync-follow-up"
created: 2026-07-14
updated: 2026-07-14
author: "Naveen"
scribe: "Codex"
tags: [react-native-web, expo, web, notifications, architecture, sustainability]
---

# React Native Web Sustainability and Gurudevi Web Capability Plan

## Decision summary

React Native Web remains the shared rendering compatibility layer for Gurudevi. We will not fork it or replace it immediately. Gurudevi will own browser capabilities that are outside React Native Web’s responsibility, using platform-specific adapters and `.web.*` implementations.

The current evidence is mixed: the project has active contributors and new issues/pull requests, but weak release throughput. The latest published release is `0.21.2` from October 2025, while the open pull-request list contains newer contributions opened in 2026. This is an active proposal pipeline, not a dependable feature-delivery pipeline.

## Implementation status

The Web Push source path is substantially implemented, but the broader
PowerSync web/offline path is not complete. Web Push and offline replication
must be tracked as separate capabilities.

### Completed in this branch

- React Native Web remains at the Expo-compatible shared-rendering boundary; no fork was introduced.
- Gurudevi owns browser capabilities through platform-specific adapters.
- `@repo/core/native/webPush` registers a browser subscription using the Push API and VAPID.
- Notification Settings provides an explicit browser-notification action; permission is never requested automatically.
- `public/sw.js` displays push notifications and routes notification clicks back into the web app.
- Browser subscriptions are stored in `user_push_tokens` with `platform = 'web'`.
- The `send-push` Supabase Edge Function honors global/category push preferences and dispatches web subscriptions through Web Push or native tokens through Expo.
- Sanctuary API dispatches push notifications for new community posts and published grades.
- Expired Web Push registrations are removed after delivery failure.
- Existing RNW shims, web overrides, and tooling fixes remain narrow and documented.

### Static verification completed

- Core TypeScript check passed.
- Sanctuary API TypeScript check passed.
- UI TypeScript check passed.
- Service-worker syntax check passed.
- `git diff --check` passed.
- Web export/build and Playwright were intentionally not run because the web build previously caused an OOM.

## Runtime/deployment checklist

Production configuration for the push path:

- `EXPO_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY` in the web app environment.
- `WEB_PUSH_VAPID_PUBLIC_KEY`, `WEB_PUSH_VAPID_PRIVATE_KEY`, and `WEB_PUSH_VAPID_CONTACT` in the Edge Function environment.
- `PUSH_DISPATCH_SECRET` for the trusted server-to-function caller.
- `SUPABASE_URL` and `PUSH_DISPATCH_SECRET` in the Sanctuary API environment.
- Deploy `apps/gurudevi-mobile/supabase/functions/send-push`.
- Serve the web app over HTTPS; browser Push API and Notifications require a secure context.

Once these values are configured, Web Push still requires a staging delivery
test. PowerSync has a separate completeness audit in
`2026-08-11-powersync-completeness-audit.md`.

## Future direction (not required for current delivery)

### Phase 1: Capability boundary

- Replace the temporary JSON-in-`push_token` representation with a first-class transport schema if delivery scale or analytics requires it.
- Add explicit unsubscribe/resubscribe controls and cleanup on account logout.
- Add endpoint hashing and more detailed delivery telemetry.

### Phase 2: Browser-first product surfaces

- Move SEO/document-heavy routes to direct DOM implementations where beneficial.
- Continue `.web.tsx` overrides for maps, PDF, video, tables, classroom dashboards, and browser navigation.
- Add explicit keyboard and accessibility regression coverage for web primitives.
- Measure bundle size, hydration/startup behavior, scroll performance, and memory.

### Phase 3: Optional extraction

Evaluate a separate web application only if one or more of these become true:

- SSR/SSG or RSC becomes a product requirement.
- SEO becomes a primary acquisition channel.
- RN Web blocks a high-value browser interaction repeatedly.
- Browser bundle or performance costs become unacceptable.
- Expo’s web path no longer supports the required React/RN versions.

Shared domain logic, contracts, authentication, sync, and design tokens should remain reusable if extraction occurs.

## React Native Web risk register

- API gaps: alerts, refresh control, native module loading, some keyboard/accessibility behavior, and scroll edge cases.
- Browser semantics: focus, pointer events, text layout, scrolling, URL history, and permission policies cannot always match mobile.
- Delivery risk: issues and pull requests may remain open for long periods even when contributors are active.
- Framework boundary: React Native Web is not an SSR, SEO, PWA, Web Push, or application-routing framework.
- Patch risk: local patches can drift during upgrades and must remain small, tested, and tied to a specific upstream gap.

## Exit triggers

Reconsider the shared RN Web foundation if:

- an official deprecation or abandonment notice appears;
- a required React or React Native major becomes unsupported;
- security or accessibility defects remain unresolved beyond Gurudevi’s tolerance;
- upstream delivery remains stalled while our required web features accumulate;
- the application needs web architecture that Metro/Expo cannot reasonably provide.

## Verification cadence

Review the React Native Web release page, open issues, pull requests, and Expo compatibility guidance quarterly. Record the review in this document or a dated successor, and do not infer project health from stars, issue count, or PR count alone.
