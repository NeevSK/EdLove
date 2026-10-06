# gurudevi-web — dependency footprint

> Part of the [Stack Catalog](../stack-map.md) · auto-generated · links point back to the master

Canonical browser Gurudevi — unified Next.js 16 application for public marketing and authenticated sanctuary journeys.

## Workspace packages used

| Package | Layer | Purpose |
| :--- | :--- | :--- |
| [@repo/core](../stack-map.md#repocore) | core | Platform spine — shared contracts & infrastructure every domain relies on. |
| [@repo/self](../stack-map.md#repoself) | domain | Personal sanctuary — inner-life, growth, journaling, wellbeing, role-shaped self-work. |
| [@repo/ui](../stack-map.md#repoui) | ui | Shared design system & shell primitives for the whole product family. |

## External deps (5 direct)

```text
@orpc/client
@supabase/ssr
next
react
react-dom
```

## Dev tooling (16)

```text
@playwright/test
@repo/eslint-config
@repo/typescript-config
@tailwindcss/postcss
@testing-library/react
@testing-library/user-event
@types/node
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

