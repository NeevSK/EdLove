---
title: "oRPC and cross-platform build boundary repair"
status: "active"
created: 2026-10-27
updated: 2026-10-27
author: "Naveen"
scribe: "Codex"
tags: [orpc, hermes, nextjs, boundaries, verification]
---

# oRPC and cross-platform build boundary repair

Follow-up to the [Verger and World integration](2026-10-27-verger-world-upstream-integration.md).
Both previously failing production bundle commands now succeed without changing
any dependency version, patching node_modules, disabling Hermes, removing routes,
or relaxing a check.

## Version and upstream findings

On 2026-10-27, npm reports `beta: 2.0.0-beta.46` and `latest: 1.16.1` for
`@orpc/server`, `@orpc/client`, `@orpc/contract`, and `@orpc/tanstack-query`.
The installed cohort is already beta.46. The
[official beta.46 release](https://github.com/middleapi/orpc/releases/tag/v2.0.0-beta.46)
is dated October 24. A stable v1 tag is not an upgrade for this v2 application;
no newer published v2 beta was found. The `next` tag points to
`0.0.0-next.47dbd93`, not a later v2 beta.

Consulted the official [Expo adapter](https://orpc.dev/docs/adapters/expo) and
[runtime requirements](https://orpc.dev/docs/requirements), the installed server
and client ESM exports, and the version-matched Next 16.4.2 documentation under
`apps/gurudevi-web/node_modules/next/dist/docs`. The Next
[server/client guidance](https://nextjs.org/docs/app/getting-started/server-and-client-components)
supports an explicit client boundary for stateful map UI.

## Causes and minimal fixes

| Failure | Actual seam | Repair and retained behavior |
| --- | --- | --- |
| Hermes rejects rest-array destructuring in an async arrow | `selfCanvasStore` imports the legacy idempotency module; its error import loaded `@orpc/server` and the unsupported server client-factory expression. | Import `ORPCError` from `@orpc/client` in idempotency and audit logging. Installed server code re-exports this exact class from client. Tests verify identity, required-key failure, cross-account conflict, cached replay and retry behavior. No error handling or implementation was removed. |
| Next loads React Native UI from workforce | The workforce root barrel also exports WorkforceShell and its RN primitives. | WorkforceFloor imports the existing service and types through their leaf exports. The service object, storage keys, forms, review actions and fallback state remain. |
| Next rejects hooks in LibraryMapFloor | The module lacked its client directive. | Add `'use client'`; keep its request, filters, topology, node selection and fallback. |
| Next reaches PostgreSQL code from FounderFloor | `api/client` loads school orchestration, the global educational factory, profile factory and ZenStack/database dynamic imports. | Use the existing school repository with the same shared Supabase client, empty search query, limit, validation and directory mapping. SchoolSchema still parses every row; the existing rejection/empty fallback and unmount guard remain. No new transport, credential, API or repository implementation was added. |

The original school search method delegates directly to
`educational.institutions.search`, which calls the same repository search. Its
temporal proxy does not intercept `searchSchools`: that rule matches `select`
or names beginning `get`, and the result is an ordinary array. The new browser
path therefore retains the original query and validation without bringing the
unused global managers into the browser.

## rn-terrain support and its limits

Used the repository bridge to run:

- `compass @orpc/server`, `context @orpc/server`, and installed package affordance
  inspection for server and client.
- `radar:upstream @orpc/server`, which agrees with npm: stable 1.16.1, preview
  2.0.0-beta.46, no nightly.
- Import audit for core's lib subtree: no findings. Browser app audit also ran;
  its re-export-based symbol findings are diagnostics, not compiler proof.
- `audit:seams` and the repository `audit-seams.mjs`: existing warnings were
  retained; no fatal seam failure was reported.
- Package policy gate: `QUARANTINE_HOLD` because its catalog could not find
  client beta.46. This is not a green gate; npm, the cohort manifests, installed
  ESM and declarations independently establish the actual version.
- Hermes verification command: reported `Engine: Sovereign Fallback`. That
  result was not accepted as real compiler evidence. The installed Windows
  Hermes compiler was then run on the exact async-arrow expression and failed
  with exit 2 and `invalid destructuring target`. The full repaired Android
  export subsequently compiles with that same Hermes compiler.

Tool logs are in `reports/orpc-terrain-*.log` and
`reports/orpc-terrain-*.json`. The exact compiler reproduction is
`reports/orpc-hermes-rest-repro.js` and its output is
`reports/orpc-hermes-real-before.log`.

## Verification

| Evidence | Result | What it does not prove |
| --- | --- | --- |
| G4 / Next 16.4.2 Turbopack production build | Successful compilation, TypeScript and 97/97 static page generation. | Authenticated production traffic or visual/device correctness. |
| G4 / Metro and actual Hermes Android export | 7,479 modules bundled; native bytecode exported to `.expo/orpc-boundary-check`, including a 30 MB HBC bundle. | Gradle/APK linking, native sensor execution or physical-device behavior. |
| G0 / TypeScript 7.1 beta | Core, mobile and web typechecks succeed. Rebuilt verger-core declarations first because core's composite configuration references its dist declarations. | Runtime or ABI correctness. |
| G1 / Vitest core boundary engine | 26 checks across idempotency, account-bound transport and canonical profile-write suites. | Real network/database execution. |
| G1/G3 / jsdom Vitest | 14 checks across Founder school fallback/validation and existing Verger browser integration suites. | Production browser rendering or real server authorization. |
| G1 / workforce Vitest | Four service checks succeed. | Native UI, real persistence or production workforce operations. |
| G0 / evidence classifier and seam sentinel | Test-evidence classifier succeeds; seam sentinel completes with existing warnings. | No waiver for broader quality findings. |

Logs: `reports/orpc-fix-web-build.log`, `orpc-fix-android-export.log`,
`orpc-fix-core-types.log`, `orpc-fix-web-types.log`,
`orpc-fix-mobile-types.log`, `orpc-fix-boundary-tests.log`,
`orpc-fix-web-tests.log`, `orpc-fix-workforce-tests.log`.

These are bounded regression checks, not a claim that no regression is possible.
No new G5 evidence was produced. The larger dirty checkout's color ratchet,
aislop and remaining deprecation findings are recorded separately; their budgets
and rules have not been changed. The index, HEAD and remote branch are untouched.
