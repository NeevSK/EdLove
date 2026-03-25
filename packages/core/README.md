# @repo/core

## Purpose
`@repo/core` is the platform spine for Gurudevi. It holds shared contracts and infrastructure that every product domain relies on.

## Owns
- auth and session foundations
- tenancy, authority, capabilities, and shared policy contracts
- shared types, API clients, generic hooks, and runtime utilities
- cross-domain primitives that must remain single-source

## Does Not Own
- feature-specific screen composition
- domain UX for self, profile, library, classroom, admin, or people
- web-only shell layout or navigation adapters

## Collaborates With
- every product package through stable contracts
- `apps/gurudevi-mobile` for bootstrapping and navigation wiring only

## Web Placement
Web-specific files are allowed only for infrastructure differences that truly belong to core runtime behavior. Feature screens should never live here.

## App Adapter Rule
The app layer may import `@repo/core` for shared state, hooks, and navigation-safe contracts, but app screens must not own business orchestration by calling low-level core clients directly when a domain package should mediate that work.
