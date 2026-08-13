# GlobalHeader — Full Skill Audit

The genuine keystone component of this entire app — 32 confirmed usages across every tab explored so far. Whatever's found here has more real leverage than any single-screen finding in this whole exploration, per `18`'s own keystone-component principle. Audited using `ui-screen-audit`'s full method.

## Stage 0 — Canonicality

Clean. Exactly two files (`GlobalHeader.tsx`, `GlobalHeader.web.tsx`), no orphans, no legacy duplicates found. 32 real, confirmed usages.

## Stage 1 — Spatial, color, token-drift check

**A real, confirmed token-drift violation, on the single most-reused component in the codebase.** `backgroundColor: '#F5EDD6'` and `borderBottomColor: 'rgba(42,35,24,0.08)'` are raw, hand-typed values — not tokens. Lower-risk than the earlier toggle-color finding in one sense (at least it's the same value everywhere, since it's one file used everywhere) — but it's the highest-visibility possible instance of the exact drift pattern `12`'s governance findings already flagged repo-wide.

**A real, more concerning variant of the same drift: `className` (token-based Tailwind utilities) and inline `style={{}}` (raw values — background color, opacity, padding, gap) are mixed *within this single file***, not just file-to-file. This suggests the drift isn't an isolated mistake in one component — it's a general looseness in styling discipline showing up even in the codebase's most central, most-reviewed file.

**Real spatial structure:** a primary row (back-or-menu button, optional avatar, title/subtitle stack, "More" kebab button) sits above a collapsible "secondary actions" row (search, notifications) — height-animated open/closed via `Animated.Value`, hidden by default.

## Stage 2 — Typography, job-count, density

**The primary row is genuinely restrained** — navigation, identity, and a single reveal-more action, roughly matching the established chunk-limit discipline.

**A real job-count concern in the secondary row: Search and Notifications are two unrelated jobs, bundled under one ambiguous "More" toggle.** A person has no way to know, from a plain three-dot icon, whether tapping it reveals search, notifications, both, or something else entirely — this actively hurts discoverability for two genuinely different, frequently-needed actions.

## Stage 3 — Container-job match, clutter check

**A small, well-placed piece of organic warmth already exists: the time-of-day greeting emoji** (🌅 morning / ☀️ afternoon / 🏮 evening), shown only when no explicit title is set. Subtle, conditional, doesn't compete with content — genuinely well-judged restraint, worth naming as a positive example, not just auditing for problems.

**The notification status dot (red/amber/green for error/loading/unread) is appropriately minimal** — one small, clear signal, not stacked with other badges the way earlier findings (Self's icons, the surface card) showed elsewhere.

## Stage 4 — Tappable inventory

Back-or-menu, avatar (if `isSelfView`), More-toggle, Search-toggle (behind More), Notifications-open (behind More), optional custom `rightAction`. A complete, genuinely modest list.

## Stage 5 — Placement-alignment

**A real, worth-flagging misalignment: Notifications — arguably the single most time-sensitive, frequently-checked action in the whole header — is hidden behind an extra tap, while a less time-critical action (avatar → profile) sits directly in the always-visible row.** All the state is already fully wired (`useNotifications`, live unread count, a real-time connection indicator, an urgency-colored dot) — the plumbing clearly anticipated this being important, but the placement buries it. This is worth a deliberate decision, not an accident: most of the apps already cited in this exploration as having "better feeling" (`15`) surface notification access directly and immediately, not behind a secondary menu.

## Stage 6 — Navigation tracing

**A genuine expectation mismatch, worth naming precisely.** The "Menu" button (a hamburger-style icon, `showMenu`) doesn't open a menu at all — `handleOpenDrawer` calls `router.push('/self')`, a hard navigation to a specific tab. A hamburger icon conventionally promises a drawer of options; this delivers a direct jump to one specific destination instead. Either the icon should change to something that doesn't imply "menu of choices" (if the direct-to-Self behavior is intentional), or it should actually open a real menu.

`handleBack`'s fallback (`safeBack('/self')`) and the menu button's destination both default to `/self` — consistent, and plausibly deliberate (Self as the app's "home base"), worth confirming rather than assuming.

## The filigree question — a real, reasoned answer, not a reflexive one

**No — GlobalHeader should not carry organic/filigree decoration, and the reasoning is specific, not just "rules say restraint."** Two things point the same direction: `16` explicitly excludes filigree from Dense-tier screens, and this component renders on *every* tier, including Workspace's dense administrative screens — a persistent decorative element here would be present exactly where it's least appropriate, unavoidably. More fundamentally: filigree's actual power, established throughout this exploration, comes from being a considered, occasional moment — the "spend your boldness in one place" principle. **An element that's always present, on every single screen without exception, cannot be an occasional moment by definition — it would stop being filigree and become wallpaper, undermining the exact restraint that makes the technique work anywhere else.**

**The header already has the right amount and right kind of warmth for a truly global element: the time-of-day greeting emoji.** Subtle, conditional, contextual, never competing with content. This is worth protecting exactly as it is, not expanding — it's already correctly calibrated for a component that appears everywhere, which is a genuinely different calibration than a single Calm-tier screen gets to use.

## Resolution: Search vs. Notifications placement — a real, asymmetric answer

Verified directly: `showSearch` is enabled in exactly one live screen (`LibraryScreen.tsx`) — **search is already effectively contextual, not global**, and its current behind-a-tap treatment is reasonable as-is for the one tab where it matters. **Notifications is the actual, single real problem** — genuinely global (every screen wires `useNotifications`), genuinely time-sensitive, still buried behind an ambiguous "More" toggle. **Concrete fix: replace the "More" kebab with a direct Bell icon** (reusing the already-built colored status dot) in the primary row. If nothing else needs a catch-all menu, "More" can simply be removed rather than persist as a mostly-empty, confusing affordance — one fewer hidden layer for the one thing that actually deserved visibility.

## The hamburger/"Menu"→Self navigation — confirmed intentional, not a bug

Self is the app's home base; the hamburger icon deliberately routes there. Resolved, no longer an open question.

## Web variant — largely consistent structure, one major divergence worth serious attention

**Job-count, layout shape, and the secondary-row collapse pattern all match mobile closely** — same primary row (back/menu, avatar, title, More), same Search/Notifications bundling behind it (inheriting the same fix recommended above).

**A major, significant finding, more consequential than a minor style variance: the web header uses a completely different color register than mobile.** Mobile: warm cream (`#F5EDD6`). Web: a dark navy gradient (`linear-gradient(180deg, rgba(13,17,24,0.96) 0%, rgba(16,20,29,0.94) 100%)`) with a frosted-glass `backdropFilter: blur(16px)`. **This isn't a small variance — it's the opposite visual register, on the single component rendered on every screen, on both platforms.** Worth a direct, deliberate answer: is dark-glass-web / warm-cream-mobile an intentional platform-appropriate choice (web as "app chrome," mobile as warm personal space), or genuine unreconciled drift between two people or sessions who styled each platform independently? Given `13`'s "keep same taste across platforms" principle stated early in this exploration, this deserves resolving explicitly, not left as an accident.

**Another confirmed instance of the type-safety-cut-corner pattern found repeatedly across this codebase:** an `as any` cast on the web header's style object — same recurring pattern as the OCR import, the storage adapter, and `LlmPort`'s return type.

## Footer — checked, correctly scoped, no issue found

`GatewayFooter.web.tsx` is used in exactly three places: `OnboardingScreen.web.tsx`, `AuthScreen.web.tsx`, `WelcomeScreen.web.tsx` — pre-authentication screens only, not the main authenticated app experience. Content is exactly what a gateway footer should have: Privacy, Terms, and Guidelines links. Sensible, deliberate scoping — no footer-creep into every screen, and nothing here needs fixing.

## Open Questions / Not Yet Resolved

- **Highest priority: whether the mobile-warm/web-dark color divergence is intentional or drift** — needs a direct, deliberate answer, not left implicit
- Whether removing "More" entirely (once Notifications is promoted to primary) leaves any other action currently reachable only through it — not fully audited across all 32 usage sites
- Exact visual treatment for the promoted Bell icon (badge style, placement relative to the avatar) — a real design decision, not resolved here
