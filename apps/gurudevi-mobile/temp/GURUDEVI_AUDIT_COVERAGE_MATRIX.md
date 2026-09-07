# Gurudevi Audit Coverage Matrix

Snapshot: 2026-09-07

Status meanings:

- **confirmed** — current source contains the reported behavior.
- **lead** — plausible from current source, but needs a focused test or caller
  trace before implementation.
- **refined** — the original claim was too broad; only the narrower statement
  remains actionable.
- **stale/disproven** — current source contradicts the supplied audit claim.
- **unverified** — not yet re-run against current source.

| ID | Area | Source audit | Current status | Evidence / next action |
|---|---|---|---|---|
| GD-001 | React version drift | Mobile Findings | confirmed | Root, app, lockfile, and installed metadata disagree. Reconcile owner/version. |
| GD-002 | React Native version drift | Mobile Findings | confirmed | App declares 0.86.2; lockfile/runtime resolve 0.86.3. Reconcile without Expo fix commands. |
| GD-003 | Stack docs freshness | Context | confirmed | Generated overview predates latest package/mobile changes. Regenerate and review. |
| GD-004 | Native raw `alert()` | Two-Layer | resolved-code | Current native-capable scan has no unqualified `alert()` calls; native `Alert.alert()` usage remains intentional. |
| GD-005 | Gradebook false success | Two-Layer | resolved-code | Gradebook preserves the editor on rejection and shows actionable feedback; focused mutation behavior remains covered by package checks. |
| GD-006 | Mood check-in failure UX | Two-Layer | resolved-code | Native role-specific Self views preserve the picker and show retryable feedback when mood persistence fails. |
| GD-007 | Voice Journal false success | Two-Layer | resolved-code | Voice journaling preserves the entry and exposes retryable feedback when persistence or recording fails; runtime microphone/playback proof remains open. |
| GD-008 | Teacher silent failures | Two-Layer | refined | High-traffic teacher classroom, assignment, observation, echo, attendance, group, and gradebook paths now expose visible failure feedback; remaining lower-traffic handlers need a final caller-by-caller audit. |
| GD-009 | Student silent loads | Two-Layer | resolved-code | Student grades and student profile surfaces now distinguish loading, empty, and failed states and expose retry actions; runtime offline walkthrough remains open. |
| GD-010 | Hardcoded student streak | Two-Layer | resolved-code | Fixed 2026-09-07: removed the fabricated five-day streak; screen now describes unmeasured goal momentum honestly. |
| GD-011 | Settings navigation crash | Two-Layer | resolved-code | Settings navigation is optional and falls back to Expo Router; modal and tab entry paths no longer require an omitted prop. |
| GD-012 | Account-switch feedback | Two-Layer | resolved-code | Current `DeviceAccountManager` catches switch errors, provides haptic error feedback, and shows the failure message. |
| GD-013 | Divergent logout paths | Two-Layer | resolved-code | Fixed 2026-09-07: all live user-facing paths delegate to `deviceAccounts`; the unused divergent purge path was removed and account changes clear React Query data. |
| GD-014 | Unmounted FAB renderer | Two-Layer | resolved-code | `EntryShell` mounts the live `FABProvider` and `LotusPetalFAB`; architecture coverage asserts both mounts. Native runtime visibility remains a release walkthrough item. |
| GD-015 | Logout sequencing semantics | Temporal Flow | resolved-code | Fixed 2026-09-07: one device-account authority defines local sign-out sequencing; device walkthrough remains required. |
| GD-016 | PowerSync coverage | Temporal Flow | refined | Local-only tables are intentional and tested. Verify queue admission, not table-count equality. |
| GD-017 | Native delete confirmation | Two-Layer | resolved-code | Fixed 2026-09-07: `confirmAction` now gates deletion on both web and native; requires device dialog validation. |
| GD-018 | Native clipboard false success | Two-Layer | resolved-code | Fixed 2026-09-07: current dashboard now writes through `coreRuntime.clipboard`, verifies its result, and only then toasts. |
| GD-019 | Soft-failure stuck saving | Two-Layer | resolved-code | Fixed 2026-09-07: calendar and observation saves convert soft failures to visible errors and clear saving in `finally`. |
| GD-020 | Stale analytics polling | Two-Layer | resolved-code | Fixed 2026-09-07: stable loaders prevent effect churn; failed refreshes preserve prior metrics and disclose stale/unavailable live data. Behavior proof is blocked until the admin test harness is repaired. |
| GD-021 | Cold-start effect count | useEffect Analysis | stale framing | Current root layout does not match supplied 13-effect claim. Rebuild startup graph. |
| GD-022 | Auth listener event gap | useEffect Analysis | resolved-code | Fixed 2026-09-07: the auth listener is registered before the asynchronous initial-session request begins. A hook-level race test remains required. |
| GD-023 | Unused lifecycle utilities | useEffect Analysis | stale/disproven | Named utilities have current consumers. Search only remaining truly unused exports. |
| GD-024 | Local Heading duplication | Two-Layer | resolved-code | ClaimInviteModal uses the shared Heading primitive. |
| GD-025 | Auth accessibility | Usability/A11y | resolved-code | Auth controls now expose labels, roles, selected state, and guidance; device screen-reader review remains open. |
| GD-026 | Delete-account accessibility | Usability/A11y | resolved-code | Delete-account modal exposes dialog/control semantics and processing state; device announcement review remains open. |
| GD-027 | Auth recovery grace flow | Usability/A11y | resolved-code | Existing-account recovery switches to login while preserving the entered email; behavior tests cover the handoff. |
| GD-028 | Password guidance | Usability/A11y | resolved-code | Auth exposes password requirements before submission; device typography review remains open. |
| GD-029 | Self content accessibility | Usability/A11y | resolved-code | Voice and mood interactions expose labels, hints, and saving/replay state; remaining content controls need the final screen-by-screen audit. |
| GD-030 | Workspace accessibility/touch targets | Usability/A11y | refined | High-traffic guardian/principal controls now expose semantics; remaining workspace surfaces and device touch-target review remain open. |
| GD-031 | AI assistant paywall route | Mobile Findings | resolved-code | Direct and Self-tab AI routes share the premium-gated route content; native entitlement smoke remains open. |
| GD-032 | SQLite ownership | Mobile Findings | confirmed-risk | `expo-sqlite` has current imports alongside PowerSync backends. |
| GD-033 | Icon package contract | Mobile Findings | confirmed-debt | Direct icon package usage remains outside the bridge. |
| GD-034 | Preview styling dependency | Mobile Findings | confirmed-risk | NativeWind preview is a production dependency alongside CSS engines. |
| GD-035 | Cold-start baseline | Mobile/Temporal | unverified | Measure before inferring or changing boot sequence. |
| GD-036 | Native magic-link callback | Temporal Flow | unverified | Verify current deep-link provider end-to-end. |

## Coverage gaps

The following supplied audit areas still need direct source verification before
the matrix can be called complete:

- full Mood check-in path and `useMoodLogs` implementation;
- all logout callers and React Query cache isolation;
- FAB provider/rendering shell at runtime;
- current source for duplicated Heading usage;
- remaining findings from the usability/accessibility audit;
- line-by-line reconciliation of the temporal-flow and useEffect documents.

These are deliberately left visible rather than silently marked clean.
