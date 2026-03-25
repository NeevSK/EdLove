# @repo/ui

## Purpose
`@repo/ui` is the shared sanctuary design system and shell primitive layer for Gurudevi.

## Owns
- design tokens, surfaces, layout primitives, modals, headers, and shared interaction components
- global style systems and reusable shell primitives
- cross-domain UI that is not owned by one business package

## Does Not Own
- domain-specific workflows
- product orchestration or feature data loading
- route registration and app navigation policy

## Collaborates With
- every product package
- `apps/gurudevi-mobile` for shell composition and root providers

## Web Placement
`*.web.tsx` files are appropriate here for shared presentation primitives, browser-only shell helpers, and cross-domain components reused by multiple domains.

## App Adapter Rule
The app can compose UI primitives freely, but any business behavior layered on top of them belongs in a domain package.
