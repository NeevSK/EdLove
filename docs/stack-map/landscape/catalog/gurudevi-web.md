# gurudevi-web — dependency footprint

> Part of the [Stack Catalog](../stack-map.md) · auto-generated · links point back to the master

Canonical browser Gurudevi — unified Next.js 16 application for public marketing and authenticated sanctuary journeys.

## Workspace packages used

| Package | Layer | Purpose |
| :--- | :--- | :--- |
| [@repo/core](../stack-map.md#repocore) | core | Platform spine — shared contracts & infrastructure every domain relies on. |
| [@repo/self](../stack-map.md#repoself) | domain | Personal sanctuary — inner-life, growth, journaling, wellbeing, role-shaped self-work. |
| [@repo/ui](../stack-map.md#repoui) | ui | Shared design system & shell primitives for the whole product family. |
| [@repo/verger-react](../stack-map.md#repoverger-react) | domain | Verger's React bindings, for any React platform: hooks over the process's verger (no provider) and the long-task observer. |
| [@repo/verger-web](../stack-map.md#repoverger-web) | domain | Verger in the browser: the browser platform (device facts from the navigator), its device signals (network, battery), a localStorage store, and the VergerBrowser shell for React web apps. |
| [@repo/workforce](../stack-map.md#repoworkforce) | domain | Future non-academic & job-structure domain — school-wide operations beyond classrooms. |

## External deps (9 direct)

```text
@orpc/client
@supabase/ssr
@tanstack/react-pacer
@tanstack/react-query
lucide-react
next
qrcode
react
react-dom
```

## Dev tooling (17)

```text
@playwright/test
@repo/eslint-config
@repo/typescript-config
@tailwindcss/postcss
@testing-library/react
@testing-library/user-event
@types/node
@types/qrcode
@types/react
@types/react-dom
dotenv
eslint
msw
postcss
tailwindcss
typescript
vitest
```

## Coupling notes

Primary web target. Built browser-native; accepts only browser-safe, platform-neutral domain contracts.

