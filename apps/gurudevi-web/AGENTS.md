<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Gurudevi web rules

- `gurudevi.app` is the public web origin; `sanctuary.gurudevi.app` is the future authenticated origin.
- Keep public routes under `app/(marketing)` and protected product routes under `app/(sanctuary)`.
- Build web UI with semantic HTML and browser-native behavior. Do not import React Native UI components or React Native Web into this app.
- Share only platform-neutral contracts, validation, repositories, and design tokens with `gurudevi-mobile`.
- Design from the 360-430 px browser viewport upward. Desktop enhancement must not alter the primary phone journey.
- Every changed user journey needs browser evidence before it can replace a Metro web route.
