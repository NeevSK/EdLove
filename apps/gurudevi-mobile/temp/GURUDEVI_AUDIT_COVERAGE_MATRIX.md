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
| GD-004 | Native raw `alert()` | Two-Layer | confirmed | Unqualified calls remain in native-capable files. Replace with shared feedback. |
| GD-005 | Gradebook false success | Two-Layer | confirmed | Catch logs only; `finally` closes modal. Add failure UX and regression test. |
| GD-006 | Mood check-in failure UX | Two-Layer | confirmed | Hook logs/rethrows; TeacherSelfView has no catch. |
| GD-007 | Voice Journal false success | Two-Layer | confirmed | Completion/reset occur after try/catch regardless of save result. |
| GD-008 | Teacher silent failures | Two-Layer | confirmed | Multiple current handlers log only. Add shared error feedback. |
| GD-009 | Student silent loads | Two-Layer | confirmed | Profile logs only; grades converts failure to empty list. |
| GD-010 | Hardcoded student streak | Two-Layer | resolved-code | Fixed 2026-09-07: removed the fabricated five-day streak; screen now describes unmeasured goal momentum honestly. |
| GD-011 | Settings navigation crash | Two-Layer | confirmed | Tab route omits required navigation; shared component calls `.navigate`. |
| GD-012 | Account-switch feedback | Two-Layer | resolved-code | Current `DeviceAccountManager` catches switch errors, provides haptic error feedback, and shows the failure message. |
| GD-013 | Divergent logout paths | Two-Layer | resolved-code | Fixed 2026-09-07: all live user-facing paths delegate to `deviceAccounts`; the unused divergent purge path was removed and account changes clear React Query data. |
| GD-014 | Unmounted FAB renderer | Two-Layer | confirmed-static | Registration calls exist; no JSX mount found for `LotusPetalFAB`. Verify runtime shell. |
| GD-015 | Logout sequencing semantics | Temporal Flow | resolved-code | Fixed 2026-09-07: one device-account authority defines local sign-out sequencing; device walkthrough remains required. |
| GD-016 | PowerSync coverage | Temporal Flow | refined | Local-only tables are intentional and tested. Verify queue admission, not table-count equality. |
| GD-017 | Native delete confirmation | Two-Layer | resolved-code | Fixed 2026-09-07: `confirmAction` now gates deletion on both web and native; requires device dialog validation. |
| GD-018 | Native clipboard false success | Two-Layer | resolved-code | Fixed 2026-09-07: current dashboard now writes through `coreRuntime.clipboard`, verifies its result, and only then toasts. |
| GD-019 | Soft-failure stuck saving | Two-Layer | resolved-code | Fixed 2026-09-07: calendar and observation saves convert soft failures to visible errors and clear saving in `finally`. |
| GD-020 | Stale analytics polling | Two-Layer | resolved-code | Fixed 2026-09-07: stable loaders prevent effect churn; failed refreshes preserve prior metrics and disclose stale/unavailable live data. Behavior proof is blocked until the admin test harness is repaired. |
| GD-021 | Cold-start effect count | useEffect Analysis | stale framing | Current root layout does not match supplied 13-effect claim. Rebuild startup graph. |
| GD-022 | Auth listener event gap | useEffect Analysis | resolved-code | Fixed 2026-09-07: the auth listener is registered before the asynchronous initial-session request begins. A hook-level race test remains required. |
| GD-023 | Unused lifecycle utilities | useEffect Analysis | stale/disproven | Named utilities have current consumers. Search only remaining truly unused exports. |
| GD-024 | Local Heading duplication | Two-Layer | confirmed | ClaimInviteModal still defines a local `any` Heading wrapper. |
| GD-025 | Auth accessibility | Usability/A11y | confirmed | Current AuthScreen has zero explicit accessibility semantics. |
| GD-026 | Delete-account accessibility | Usability/A11y | confirmed | Current modal has zero explicit semantics/live-state announcement. |
| GD-027 | Auth recovery grace flow | Usability/A11y | confirmed | BDD requires auto-switch/preserved email; current code shows generic toast. |
| GD-028 | Password guidance | Usability/A11y | confirmed-static | No inline strength/requirements guidance found in current AuthScreen. |
| GD-029 | Self content accessibility | Usability/A11y | confirmed | Audited content components lack explicit semantics; shell has some. |
| GD-030 | Workspace accessibility/touch targets | Usability/A11y | confirmed-static | Checked dashboards contain Pressables without explicit semantics/hitSlop. |
| GD-031 | AI assistant paywall route | Mobile Findings | confirmed | Tab route bypasses gated wrapper and re-exports raw screen. |
| GD-032 | SQLite ownership | Mobile Findings | confirmed-risk | `expo-sqlite` has current imports alongside PowerSync backends. |
| GD-033 | Icon package contract | Mobile Findings | confirmed-debt | Direct icon package usage remains outside the bridge. |
| GD-034 | Preview styling dependency | Mobile Findings | confirmed-risk | NativeWind preview is a production dependency alongside CSS engines. |
| GD-035 | Cold-start baseline | Mobile/Temporal | unverified | Measure before inferring or changing boot sequence. |
| GD-036 | Native magic-link callback | Temporal Flow | unverified | Verify current deep-link provider end-to-end. |

## Coverage gaps

The following supplied audit areas still need direct source verification before
the matrix can be called complete:

- full Mood check-in path and `useMoodLogs` implementation;
- student profile/grades error rendering;
- all logout callers and React Query cache isolation;
- FAB provider/rendering shell at runtime;
- current source for duplicated Heading usage;
- remaining findings from the usability/accessibility audit;
- line-by-line reconciliation of the temporal-flow and useEffect documents.

These are deliberately left visible rather than silently marked clean.
