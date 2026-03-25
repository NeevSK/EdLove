# @repo/form-builder

## Purpose
`@repo/form-builder` owns form construction and form rendering experiences that are shared across domains.

## Owns
- builder components and form-rendering primitives
- public-form and builder-specific package screens
- package-local web/native form variants where the browser experience differs

## Does Not Own
- institutional governance logic around who can access a form
- app-level route registration
- unrelated classroom or admin orchestration

## Collaborates With
- `@repo/core` for hydrated form data and API access
- `@repo/ui` for shared sanctuary presentation
- `@repo/scanner-kit` when forms use scan inputs

## Web Placement
Builder and public-form `*.web.tsx` files belong here because they are feature-level web experiences, not app shell concerns.

## App Adapter Rule
The app may keep thin route adapters for form routes, but form UI composition and submission flow should live here.
