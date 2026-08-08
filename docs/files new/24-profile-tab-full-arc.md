# Profile Tab — UI Operationalization & Full Arc

Third application of the method established in `20`, extended through `22`'s full arc (protect → creative synthesis → mechanics → technical guidance). Builds on and corrects parts of `14-profile-domain-exploration.md`.

## Dispatching — a third, distinct pattern, and it's the correct one for this tab

Self dispatches via internal capacity-switch; Workspace via router-level redirect. **Profile has no role branching at all** — `index.tsx` is a plain `Platform.OS` check, nothing else. This is correct, not an oversight: having a profile is role-agnostic, true uniformly across citizenship tiers and capacities, unlike Self and Workspace where the actual *content* genuinely varies by role. Worth naming as a positive pattern — not every tab needs role dispatch, and Profile choosing not to have it is the right call, confirmed by checking real code rather than assumed.

## Real composition — leaner than feared, but missing a structural protection Self has

Confirmed: `IdentityCard`/`IdentitySection` (containing `ThuthimalBadge`), `StatsSection` (implemented as `LivingJourneyPanel`), `SupportSection`, `AppExperienceSection`, `NotificationSettingsPanel` — roughly seven distinct pieces, organized into clearly named sections. **This resolves `14`'s original growth-metaphor-stacking concern in Profile's own screen the same way `20` resolved it for Self** — no Bhumi/Banyan/River/Crystal pile-up found in the actual composition.

**A real, new finding this pass surfaces: unlike Self, there is no accordion or progressive-disclosure structure here — this is a static stack.** Seven sections is close to, and arguably over, `16`'s ~4-chunk working-memory guidance, and without Self's disclosure mechanism protecting it automatically, this screen doesn't have the same structural safeguard. **This is the actual, concrete thing worth fixing here** — not consolidating metaphors (already resolved), but considering whether Profile should adopt the same section/accordion pattern Self already uses successfully, given it's already proven to work in this exact codebase.

## What to protect

The named-section organization itself (`IdentitySection`, `StatsSection`, `SupportSection`, `AppExperienceSection`) is a real, legible IA — each section has a clear, singular purpose. This is worth keeping regardless of whether disclosure gets added; the fix is presentation (collapse/expand), not restructuring the section boundaries themselves.

## Creative synthesis — building on, not repeating, `14`'s existing recommendations

`14` already correctly proposed reinforcement-gating for Thuthimal badges (Pattern 5 — solidify only after repeated recognition, not one gift) and relative-to-self framing for growth stats (Pattern 2 — "grown since you joined," never "more complete than others"). Those stand; this pass adds what wasn't yet covered:

**Whether `StatsSection`/`LivingJourneyPanel`'s content is live-updating or purely historical determines which transition rule applies.** If it's a snapshot computed once per load (most likely, given it's summarizing history), no special transition handling is needed. If any part of it updates in real time while the screen is open, `22`'s instant-not-animated rule for system-driven changes applies directly — the same reasoning, correctly reused rather than re-derived.

**The `NotificationSettingsPanel`'s placement inside Profile is worth a second look given `19`'s findings.** `19-notifications-settings.md` established `AppSettingsScreen.shared.tsx` as the exemplar convergence pattern and flagged real behavioral-policy gaps (reinforcement-gating, decay, batching) at the notification-delivery level. Since the panel lives directly in Profile's composition, any UI-level indication of *why* a notification category matters (e.g., surfacing the quiet-hours/category state clearly) belongs here, at the point of configuration — worth designing this panel and `19`'s policy layer together rather than as separate concerns that happen to share a screen.

## Mechanics — mobile vs. web, connecting to the already-established rule

`14` found `ProfileScreen.web.tsx` (986 lines) substantially larger than mobile (593 lines), with real, non-superficial additions (`ContactLinktree`, `QRCodeGenerator`, `StaffPresencePulse`, `CitizenGate`) already recommended for mobile convergence. **This pass adds the specific mechanism**: if Profile adopts Self's accordion pattern, the same "web promotes a few headline items to flat, always-visible placement while mobile keeps the full set behind disclosure" rule found in `20` applies here too — likely `IdentitySection` and `StatsSection` as the promoted headline items on web (highest emotional/identity weight, matching `18`'s leverage logic), with `SupportSection`/`AppExperienceSection`/notification settings behind disclosure on both platforms.

## Technical guidance

**Adopting disclosure:** reuse the exact section/feature structure already proven in Self (`{ id, title, accentColor, features: [...] }`) rather than inventing a new pattern — this is a direct, low-risk port of working code, not a new build.

**Keystone check, not yet verified:** confirm whether `IdentitySection`, `StatsSection`, `SupportSection`, and `AppExperienceSection` already share one underlying section-wrapper component. If they do, that wrapper is the keystone fix for adding disclosure — modify it once, every section inherits collapse/expand behavior automatically. If they don't currently share one, creating that shared wrapper is the actual first implementation step, before disclosure itself.

**Mobile/web convergence, concretely:** per `19`'s exemplar, refactor toward one `.shared.tsx` implementation with platform-specific promotion logic (which sections render flat vs. behind disclosure) rather than the current fully-separate `.tsx`/`.web.tsx` files — the same recommendation `14` made, now with a proven, real reference pattern to copy rather than an abstract instruction.

## Open Questions / Not Yet Resolved

- Whether any part of `StatsSection`/`LivingJourneyPanel` is genuinely live-updating (determines whether the instant-transition rule applies)
- Whether the four named sections already share a common wrapper component — not verified in this pass
- `IdentityCard` specifically (appears separately from `IdentitySection` in the composition) — its exact relationship to `IdentitySection` wasn't traced
- Web's actual current promoted-vs-disclosed split, if any exists today, versus the recommendation above — `14` found web larger overall but didn't check whether it already uses partial disclosure internally
