---
title: "UI Kit Gallery: guidance for whoever builds it"
status: "guidance"
created: 2026-10-31
author: "Naveen"
scribe: "Claude"
tags: [ui, kit, gallery, evidence, a11y]
---

# UI Kit Gallery: guidance for whoever builds it

The kit (`@repo/ui/components/native`, `@repo/ui/components/web`) is tested to
G1 (unit tests). A gallery is how it reaches G4 (real browser) and G5 (real
device). It is not built yet by decision; this page is what a person or an
agent needs to build it well when the time comes.

## What it must show

- **Every kit export** from both barrels (the naming tests in
  `components/native/__tests__/inspector.test.tsx` and
  `apps/gurudevi-web/tests/unit/kit/webKitNames.test.tsx` list the shared
  ones). Read the barrel, don't hand-copy a list, so new pieces appear.
- **Every state** of each piece: rest, pressed or hover, focused, disabled,
  loading, empty, error, success; for agent pieces streaming, stopped,
  failed, pending, submitting, accepted, expired; for capture pieces denied
  and unavailable.
- **Every theme:** a switcher for world (all of `WORLD_IDS`), mode
  (light, dark), phase (six) and access (`contrast: more`,
  `transparency: reduced`). On native use `WorldScope` with `world`, `phase`,
  `mode`; on web `WorldScope` from `@repo/ui/theme/web`.
- **Every language:** en, si, ta, passing each piece's `labels`.
- **Narrow and wide:** 320, 360, 430 px phones; 768 tablet; 1280 desktop
  (space-aware pieces change shape: `Grid`, wide `Card`, `Row`).

## Where it lives

- Native: a route under `apps/gurudevi-mobile/app/(dev)/kit` that only
  development builds include. Web: `apps/gurudevi-web/app/(sanctuary)/kit`
  behind the same development flag. Neither ships to people.
- Compose kit pieces only. No new components in the gallery: if something is
  missing, it is missing from the kit.
- Fake adapters for capture (`MediaAdapters` with `capture` ports that
  return ok, cancelled and denied) so every branch can be shown without a
  real camera; a "real" toggle switches to the app's registered adapters.

## What to check there (and record in the status ledger)

- Contrast by eye in the worlds where the guard was tight (Wewa and Ratna
  light: gradient buttons; any world: photo veil, unchecked checkboxes).
- Motion: press scale and light, living edges, shake on error; with reduced
  motion on, nothing moves and colours jump.
- Screen readers (VoiceOver, TalkBack, NVDA): every control named; a
  streaming message announced once; counts and errors announced politely.
- Performance on a 2 GB Android: `MessageList` with 500 messages and one
  streaming; `List` with 1,000 rows; no frame drops on press.
- Keyboard on web: every control reachable and visible on focus; Enter and
  Shift+Enter in the composer; arrow keys in radio groups and scales.

Record each check as evidence with its level, for example
`G5 Pixel 4a, Android 15, Wewa dark dusk: MessageList 500 items, 0 dropped frames.`
