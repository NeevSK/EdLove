---
title: "Mobile Landscape and Typography Experience Audit"
status: "draft"
created: 2026-08-13
updated: 2026-08-13
author: "Codex"
tags: [gurudevi, mobile, landscape, typography, content, localization, responsive]
---

# Mobile Landscape and Typography Experience Audit

## Verdict

Mobile landscape needs to be treated as a distinct composition mode. The current responsive foundations recognize tablet and web bands, but that does not guarantee a good short-height landscape experience. The typography concern is also real: repeated titles, helper text, status labels, and action chrome can make screens feel crowded even when individual components are reasonable.

## Evidence

- `apps/gurudevi-mobile/src/lib/responsiveShell.ts` distinguishes mobile and native tablet but does not itself define a phone-landscape contract.
- `packages/ui/src/components/layout.ts` provides coarse phone/tablet/desktop breakpoints and grid helpers, but orientation-specific reading order still belongs to each composition.
- The native tab shell combines a global header, content, and bottom tabs; landscape can make the vertical budget unusually tight.
- The imported spacing/type guidance defines a 4dp rhythm, separate content/chrome scales, and localization-safe breakpoint selection. These rules are not yet a complete copy inventory.

## Mobile landscape requirements

- Preserve safe-area insets on both horizontal edges and avoid placing primary actions in hard-to-reach corners.
- Collapse header chrome before shrinking body text. Keep one clear title and one primary action.
- Prefer a main pane plus optional secondary pane for Self history, Library detail, classroom lists, and workspace context.
- Keep one-axis interaction for ordinary phone landscape; reserve richer canvas gestures for tablets and web unless touch targets remain obvious.
- Preserve selection, draft, and scroll position when orientation changes.
- Test keyboard/IME states, modal height, bottom sheets, and error/empty screens at short heights.
- Validate English, Sinhala, and Tamil expansion without clipping or ellipsis that removes meaning.

## Typography and copy findings

The problem is cumulative repetition, not merely bad font files:

- repeated tab/screen/card titles consume the first scan;
- helper text often repeats the action label instead of clarifying a decision;
- status, badge, and navigation labels compete with content;
- long or vague labels force tighter containers and make localization worse;
- operational screens sometimes carry more devotional or explanatory language than the user needs at that moment.

## Recommended type/content rules

1. One visible title per surface; demote duplicates to accessibility metadata or remove them.
2. Maintain separate content and chrome scales; never reduce body text to solve a crowded header.
3. Use concrete action labels and one short explanation near the action.
4. Centralize recurring copy keys and audit near-duplicates across headers, tabs, cards, modals, and empty states.
5. Treat Sinhala/Tamil expansion as a layout input, not a late translation check.
6. Keep expressive language in welcome, hero, and meaningful wellbeing moments; keep daily operational controls direct and quiet.

## Priority actions

- P0: capture portrait and landscape screenshots at supported phone sizes and short heights.
- P1: create an orientation-aware shell contract and test header/content/tab vertical budget.
- P1: run a copy inventory and remove duplicated visible labels.
- P1: define localized type/spacing fixtures for English, Sinhala, and Tamil.
- P2: add landscape-specific compositions for Self, Workspace, Library, and text-entry flows.

## Limits

This is a source-and-document audit, not a runtime screenshot audit. The recommendations must be validated on physical devices and with real localized strings before implementation is considered complete.
