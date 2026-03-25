# @repo/scanner-kit

## Purpose
`@repo/scanner-kit` owns scanning, QR, OCR, and code-based capture features that can be reused across the platform.

## Owns
- scanner components and helpers
- reusable QR generation and scan capture flows
- package-local platform variants for scanner-specific behavior

## Does Not Own
- domain-specific workflows triggered after a scan completes
- app shell navigation
- generic profile, library, or classroom rendering

## Collaborates With
- `@repo/core` for payload handling
- `@repo/ui` for shared surface styling
- consuming feature packages that decide what a scan means

## Web Placement
`*.web.tsx` files are allowed when scanner behavior genuinely differs in the browser.

## App Adapter Rule
The app may wire scanner routes and modals, but scanner-specific logic stays here.
