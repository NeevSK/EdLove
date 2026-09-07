# apps-gurudevi-marketing-web — dependency footprint

> Part of the [Stack Catalog](../stack-map.md) · auto-generated · links point back to the master

Marketing web (gurudevi.edlove.org) — forms, analytics, landings.

## Workspace packages used

| Package | Layer | Purpose |
| :--- | :--- | :--- |
| [@repo/editorial](../stack-map.md#repoeditorial) | domain | Provider-neutral editorial publishing contracts and distribution ledger |

## External deps (8 direct)

```text
@astrojs/sitemap
@astrojs/svelte
@astrojs/vercel
@tailwindcss/vite
astro
svelte
tailwindcss
typescript
```

## Dev tooling (7)

```text
@astrojs/check
@repo/eslint-config
@repo/typescript-config
@types/react
eslint
vite-tsconfig-paths
vitest
```

## Coupling notes

Consumer shell: core + ui + analytics + form-builder. Must stay a thin site, never absorb domain logic.

