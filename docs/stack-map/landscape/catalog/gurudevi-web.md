# gurudevi-web — dependency footprint

> Part of the [Stack Catalog](../stack-map.md) · auto-generated · links point back to the master

Canonical browser Gurudevi — one Next.js application for public and authenticated journeys.

## Workspace packages used

| Package | Layer | Purpose |
| :--- | :--- | :--- |
| [@repo/ui](../stack-map.md#repoui) | ui | Shared design system & shell primitives for the whole product family. |

## External deps (3 direct)

```text
next
react
react-dom
```

## Dev tooling (10)

```text
@repo/eslint-config
@repo/typescript-config
@tailwindcss/postcss
@types/node
@types/react
@types/react-dom
eslint
postcss
tailwindcss
typescript
```

## Coupling notes

Migration foundation. Do not import React Native UI; accept only browser-safe, platform-neutral domain contracts.

