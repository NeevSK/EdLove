# UI kit: requirements ledger

Every request Naveen has made for the UI, plus the "intentional UI" and
"aliveness" doctrine (`.agents/skills/intentional-ui-design/`). Each one is
listed with where it lives in code and how far it has got. This is the list
to check work against. The plan
(`2026-10-29-ui-component-system-rebuild-plan.md`, status ledger in section 15)
says what order to work in. The guide (`ui-kit-guide.md`) says how.

Status words:
- **done**: built and tested.
- **foundation**: the engine resolves it and every world inherits it, but not
  every component uses it yet.
- **planned**: has a step number.
- **open**: needs a decision.

Updated 2026-10-30.

## A. Structure

| # | Requirement | Where | Status |
| :--- | :--- | :--- | :--- |
| A1 | Two platform sets, same names and props | `components/native`, `components/web`, `theme/contracts.ts` | done |
| A2 | Looks come from the world engine; fixed scales come from tokens | `theme/`, `tokens/` | done |
| A3 | Hard break from legacy, no facades; deletions need sign-off | `tooling/ui-legacy-ratchet.json`, Phase 4 | done (ratchet); retirement planned |
| A4 | Worlds are open-ended (not 11), easy to add, change or remove | `theme/worlds/<id>/`, registry in `worlds/index.ts`, guide §3.3–3.4 | done: one folder + one registry line; `WorldId` derived; `world.registry` test |
| A5 | One clock; phase styling retired | `theme/scene` `phaseAt` | done |
| A6 | Scene lives in theme | `theme/scene` | done |
| A7 | NativeWind for layout only | AGENTS.md UI kit rules | done |
| A8 | Docs and skills so agents and people can add, upgrade and refine | `ui-kit-guide.md`, `.agents/skills/ui-kit`, this ledger | done |

## B. Components

| # | Requirement | Status |
| :--- | :--- | :--- |
| B1 | Production-grade buttons and controls | done (1.1–1.8): Button, IconButton, Text, Surface, TextField, Chip, Row, Section, Switch, Checkbox, Radio, Select, Menu, Slider, Tabs, Segmented, Dialog, Sheet, Toast, Popover, Tooltip, Progress, Badge, Avatar, Divider, Empty/ErrorState, List, Table, SwipeRow |
| B2 | Layout pieces: Stack, Inline, Grid, Icon | done (both kits); Icon takes the caller's glyph (kit has no icon library) |
| B3 | Cards, tiles, pills, shapes and sizes; horizontal rails; carousels | done: `Card` (tile, wide, square, pill; sm/md/lg), `Rail`, `Carousel` (buttons + swipe, announced, never autoplays) |
| B4 | Grouped settings like Claude or Grok (proximity, one surface per group) | done: `Group` (both kits); boxed Sections render as a Group |
| B5 | Forms, quizzes, assignments, lessons, PDF and file types | in progress (plan §14, "1c design"): `Markdown`, `FileCard`, `DocumentView` with adapters; `Scale`, `ChoiceQuestion`, `PrivacyNote` done; media, file field, recording, timer, playful moments next |
| B7 | Every format behind a port: images, voice, video, PDF, Word, Excel, PowerPoint, Markdown, rich text, slides | ports done for Markdown and documents; library choices open (plan §14) |
| B9 | AI and agent pieces (chat, thinking, tools, approvals, runs, citations, artifacts, privacy) | done on both kits, AG-UI shaped (plan §14 layer 1); screens not yet moved |
| B10 | FAB as a kit piece | done: `ActionFab`, `FabMenu`; `LotusPetalFAB` retires after sign-off |
| B11 | Rich text (Software Mansion Markdown or HTML) | port done; native default Software Mansion `EnrichedMarkdownTextInput`; web editor open |
| B8 | Quizzes, surveys, playful and anonymous forms done well | first pieces done; the form engine evaluates, the kit shows; anonymity said plainly |
| B6 | Todo out of the kit, built on kit pieces | done in the working tree, but someone else's uncommitted work |

## C. Space, accessibility, contrast

| # | Requirement | Status |
| :--- | :--- | :--- |
| C1 | Spacing as relations: inside, between, group, section | done: `tokens/space.ts` (`gapFor`), used by Stack, Inline and Group; other components to adopt |
| C2 | Space-aware components that adapt to their container | done: Grid, wide Card, Row (`useContainerWidth` native, CSS grid / container queries web) |
| C3 | System accessibility settings feed the world (high contrast, reduce transparency, font scale) | done: `WorldAccess` in `resolveWorld`, `useSystemAccess` (Android high text contrast, iOS darker colours and reduce transparency), web `prefers-contrast` / `prefers-reduced-transparency`; font scale through `gapFor`. Web adjusts the base inks only; recipe colours already resolved to hex stay standard there |
| C4 | Contrast checked on every recipe pair, not just tokens | done: `recipe.contrast.test.ts` (every pair, 132 themes); it found and fixed checkbox edges, gradient labels, the photo veil and the selected ring |
| C5 | Roles, names, 44pt targets, a non-gesture path for every gesture | done (kit tests) |

## D. Feedback and aliveness

| # | Requirement | Where | Status |
| :--- | :--- | :--- | :--- |
| D1 | One feedback grammar: components name the event, the world picks the haptic | `theme/feedback.ts`, `useFeedback` | done (native); web has no haptics |
| D2 | Press motion in the world's scale and spring | `usePressMotion`, `--w-press` | done |
| D3 | Errors shake once, without relying on colour | `useErrorFeedback`, `gd-shake` | done (TextField, Select) |
| D4 | Living light: colour, brightness and edges answer state | `material.states`, `useLivingStyle`, `ChipPaint`, `--w-light-*` | done in TextField, Button, Card, Checkbox, Chip, Tabs, Row; Switch is the platform switch (animates itself) |
| D5 | Light from within vs outer glow | `material.light` | foundation (resolved, not yet drawn differently) |
| D6 | Variation inside a surface: warmer centre, cooler edge | `material.wash`, `surface.raised.wash` | done: raised Surface, Group, Card (RN 0.88 radial-gradient; CSS on web) |
| D7 | Shadows tinted by the world, never neutral black in light mode | `material.shadow` | done (raised surfaces) |
| D8 | Grain or vellum texture | `material.grain`, `--w-grain` | foundation (0 everywhere); needs one texture asset per platform |
| D9 | Detail gathered at meaningful moments, not everywhere | `material.detail` | foundation; ornaments to read it |
| D10 | Time-based colour drift (phase tint) | `phaseTokens` | done |
| D11 | Motion level and reduced motion always respected | `useWorldMotion().animates`, CSS media queries | done |
| D12 | Waiting signs and perches (alive loading) | `Waiting`, `WaitingSign`, `Perch` | done |

## E. Inspection and evidence

| # | Requirement | Status |
| :--- | :--- | :--- |
| E1 | A component tree to inspect (like Flutter's) | done: every export named in DevTools, `gd-<name>` classes on web (tests on both sets); the galleries (1.9) are the visual tree |
| E2 | Galleries on both platforms (every component, every world) | planned 1.9 |
| E3 | Evidence levels G4 (browser) and G5 (device) | planned with 1.9 |
| E4 | rn-terrain and verified installed APIs only | done (skill "APIs verified" list) |

## F. Set aside on purpose

These were weighed and left out, so they don't come back without a reason:
- RN Web / Expo web for new UI (being retired).
- Reanimated `contrastColor` (it only returns white or black; worlds use `inkOn`).
- Autoplaying carousels.
- Overlay or wrapper views for runtime concerns (memory rule).
- New `phase-*` classes and `worldBridge` reads.

## G. Open decisions

- Security: `apps/sanctuary-api/src/ai/routes.ts` lets the request choose its role. Not UI work; it needs a fix decision.
- Which world first gets `grain` > 0 and `response: 'vivid'`. This is a taste call, best made in the gallery.
