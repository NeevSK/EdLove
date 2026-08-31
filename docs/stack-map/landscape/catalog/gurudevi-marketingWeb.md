# apps-gurudevi-marketing-web — dependency footprint

> Part of the [Stack Catalog](../stack-map.md) · auto-generated · links point back to the master

Marketing web (gurudevi.edlove.org) — forms, analytics, landings.

## Workspace packages used

| Package | Layer | Purpose |
| :--- | :--- | :--- |
| [@repo/editorial](../stack-map.md#repoeditorial) | domain | Provider-neutral editorial publishing contracts and distribution ledger |
| [@repo/analytics](../stack-map.md#repoanalytics) | domain | Premium analytics engine — student performance insights, GPA calculations, predictive analytics. |
| [@repo/core](../stack-map.md#repocore) | core | Platform spine — shared contracts & infrastructure every domain relies on. |
| [@repo/ui](../stack-map.md#repoui) | ui | Shared design system & shell primitives for the whole product family. |

## External deps (11 direct)

```text
@astrojs/sitemap
@astrojs/svelte
@astrojs/vercel
@supabase/supabase-js
@tailwindcss/vite
astro
inngest
react-native-web
svelte
tailwindcss
typescript
```

## Dev tooling (6)

```text
@repo/eslint-config
@repo/typescript-config
@types/react
eslint
vite-tsconfig-paths
vitest
```

## Coupling notes

Consumer shell: core + ui + analytics + form-builder. Must stay a thin site, never absorb domain logic.

