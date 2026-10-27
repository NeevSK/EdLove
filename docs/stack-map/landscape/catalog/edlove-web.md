# apps-edlove-web — dependency footprint

> Part of the [Stack Catalog](../stack-map.md) · auto-generated · links point back to the master

edlove.org — public face of the EdLove ecosystem.

## Workspace packages used

| Package | Layer | Purpose |
| :--- | :--- | :--- |
| [@repo/editorial](../stack-map.md#repoeditorial) | domain | Provider-neutral editorial publishing contracts and distribution ledger |

## External deps (13 direct)

```text
@astrojs/check
@astrojs/sitemap
@astrojs/starlight
@astrojs/svelte
@intuitui-labs/a11y-gate
@tailwindcss/vite
@types/three
astro
pagefind
svelte
tailwindcss
three
typescript
```

## Dev tooling (5)

```text
@repo/eslint-config
@repo/typescript-config
eslint
vite-tsconfig-paths
vitest
```

## Coupling notes

Editorial-site class: only config deps by design. Zero domain coupling.

