# Gurudevi Mobile — Temporal / Flow / Coherence Audit
**The "how things are wired together over time" layer — snapshot 2026-08-31**

This is the audit you actually asked for. The previous document
(`GURUDEVI_MOBILE_FINDINGS_AND_TREATMENTS.md`) looked at *atoms* — which
files exist, which packages are duplicated. You correctly pushed back:
that's not what produces a user's felt experience of the app. A user never
sees "three SQLite engines." They see: *I signed in with Google, but the
app still shows a guest banner.* That's not a parts problem. It's a
**sequence** problem — the parts are individually fine, but what emerges
when they run *together, in time* is wrong.

---

## Part 1 — Naming what you're pointing at

You said you don't know the technical term. Here are the actual ones,
and — worth saying directly — **you already own a version of this
vocabulary**. "Teaning" is built on coupled-oscillator physics: two
systems don't just each have a state, they have a *phase relationship*,
and coherence or dissonance is a property of the coupling, not of either
oscillator alone. That is exactly the lens missing from a parts-list audit
of software. The terms below are the software-engineering and
service-design names for the same move you already make instinctively in
your own theoretical work.

| Term | What it means | Why it's what you meant |
|---|---|---|
| **Temporal coupling** | Two operations must happen in a specific order for the system to behave correctly, but nothing in the code makes that order visible or enforced | This is the formal name for "dep A and dep B are each fine, but the *sequence* they resolve in breaks things" |
| **Race condition** | Two async operations complete in an order that varies run-to-run, and correctness depends on which one "wins" | The mechanism *behind* most temporal coupling bugs |
| **Choreography vs. orchestration** | *Orchestration*: one central authority (e.g. root layout) directs every step in sequence, like a conductor. *Choreography*: parts react to shared events independently, and correct behavior *emerges* from local rules, like dancers responding to each other with no conductor | Names the architectural question "who's actually in charge of what happens when?" — and whether your app is accidentally a mix of both without deciding |
| **Service blueprint** | A UX/design artifact that maps *user-visible actions* on one timeline against *backstage system processes* on a parallel timeline, so you can see where they're out of sync | The tool for exactly "sequential experience, functionality, interaction" you described — front-stage and back-stage on the same clock |
| **Emergence / emergent behavior** | A system property that exists only at the level of interacting parts, not in any single part inspected alone | Your own word, and the correct one — a "guest banner shown to an authenticated user" doesn't live in the auth code or the banner code, it emerges from their timing relationship |

**One more thing worth naming:** your own repo already invented a version
of this. `docs/architecture/DATA_HIGHWAYS_AND_SYNC_BOUNDARIES.md` defines
three "highways" (direct API / PowerSync / local-first queue) precisely so
that *which transport a feature uses* is a deliberate temporal/coherence
decision, not an accident. And
`docs/current_progress/2026-06-26-route-flow-fishbone-analysis.md` is a
genuine instance of exactly this kind of audit — a fishbone (Ishikawa)
root-cause analysis of the auth/onboarding *flow*, not its file list. You
(and an earlier agent session) already did this once, well. It was never
extended past auth/onboarding. That's the gap — not that the skill or
vocabulary was missing, but that it was applied to one flow and never
made a standing practice.

---

## Part 2 — The audit: tracing real sequences

### Case Study 1: Cold boot — orchestration with too many uncoordinated actors

`app/_layout.tsx` fires, independently: Sentry/PostHog (correctly
idle-deferred), Cedar WASM warm-up, a permission-snapshot network call,
font loading, PowerSync connection, and auth-session hydration. This is
**orchestration in name** (one root layout "owns" boot) **but choreography
in practice** — 13 effects fire and each resolves on its own clock, with
no shared sequencing contract between them. Nothing declares "auth must
be trustworthy before permission checks run" as an enforced rule; it's
true only by accident of typical timing.

This is confirmed as a *real, user-reported* symptom, not speculation —
your own `issues_i_saw.md` (07/03/2026 entry) records:

> "google sign in worked in web but name not get synced and profile not
> get updated in db and still see guest user banner in lot of cases. in
> every section."

That's the textbook signature of temporal coupling: auth succeeds, but
something downstream (profile sync, banner state) reads a snapshot taken
*before* the auth result landed, and nothing re-triggers it when auth
catches up.

### Case Study 2: Auth/Onboarding — the one flow that already got this treatment

Your own **Fishbone Analysis** (2026-06-26) diagnosed this exact class of
problem for auth/onboarding specifically:

> "session, profile, and store hydration are resolved asynchronously and
> independently" → "redirect decisions can run before identity state is
> trustworthy" → "UI can briefly believe the user is guest, authenticated,
> or onboarded at the wrong time."

The **Route Flow Proposed Solution** (same date) prescribed: one canonical
route-decision owner, one identity contract, one onboarding state machine.

**Checking whether it held:** a later, independent audit
(`docs/architecture/2026-08-13-auth-gate-deeplink-audit.md`, Aug 13 — 2.5
weeks before this snapshot) confirms the fix landed — route gating is now
"pure decision functions" (`getBootstrapSessionState`,
`getAuthRouteTarget`) enforced centrally in `app/_layout.tsx`. **This is
what "fixed coherence" looks like when it's done**: not "delete a
duplicate file," but "give the sequence a single, explicit owner."

**But the same audit found a new instance of the identical class of bug,
one layer over:** magic-link sign-in configures a redirect
(`gurudevi://auth/callback`) but — at least as of that audit's first
pass — nothing on native was consuming the callback, meaning the
*declared* flow and the *wired* flow disagreed. (The doc notes a same-day
fix mounting `DeepLinkProvider`; worth verifying on your current local
copy whether magic-link completion actually works end-to-end now, since
this is exactly the kind of thing that looks fixed in a commit message and
isn't fixed in the lived sequence.)

**Reusable lesson:** this flow got better specifically *because* someone
traced it as a sequence, not as a file list. The fix that held
(centralizing route decisions) is a choreography→orchestration move —
picking one conductor. The bug that's still uncertain (deep link wiring)
is the opposite failure — a step that's *declared* but not actually
*connected* into the sequence.

### Case Study 3: QR classroom join — temporal coupling done right

Worth naming a positive example, because it shows the fix pattern you
want more of. `ACTIVE_TASKS.md` (T0.4) documents a real race condition:
teachers and students both joining a classroom via QR could race on who
"owns" the classroom record. The fix:

> Teachers/staff → only set `teacher_id` when column IS NULL; uses
> `.is('teacher_id', null)` filter so concurrent claims are atomic
> (last-write-wins on empty only)

This is temporal coupling made *safe* rather than removed — the ordering
of two simultaneous joins is allowed to vary, but the outcome is
guaranteed correct regardless of which arrives first. That's the target
shape for the boot-sequence problem in Case Study 1 too: you may not be
able to make Cedar/permissions/auth resolve in a fixed order, but you can
make the *outcome* correct no matter which finishes first (e.g., the guest
banner reads a reactive auth-state selector instead of a snapshot taken at
mount time).

### Case Study 4: The "three highways" mixing silently

Your own Data Highways doc lays down a rule: *"if a feature spans more
than one highway, split it into smaller steps... every new feature must
declare its highway during design review."* The structural audit (doc 1,
§2.1) found **three SQLite engines** present. Read through *this* lens,
that's not "dependency bloat" — it's a **highway-boundary violation risk**:
if any feature quietly reads from `expo-sqlite` directly instead of
through the declared PowerSync highway, two screens could show
*different, both "locally true," but mutually inconsistent* data —
because they're not even watching the same store. That's an emergent bug
that would be nearly impossible to find by reading either screen's code in
isolation; it only shows up by tracing which store each one actually
talks to, over time, as data changes.

**Action:** grep every direct `expo-sqlite` import against the Highway doc's
own rule ("PowerSync should never be the only path for app entry" / "do
not use SQLite as the universal source of truth") and classify each
usage as compliant or a boundary violation.

### Case Study 5: Offline sync — the gap the team already flagged, framed correctly

Beast Master Plan §3 lists *"no offline conflict UX"* as debt under
Workspace. Named in this vocabulary: this is an **unresolved choreography
gap** — when a device goes offline, makes changes, then reconnects, two
independent timelines (local queue, server state) have to reconcile, and
right now there's no defined behavior for what the user *sees* while that
reconciliation happens or if it conflicts. This is squarely a
service-blueprint gap: the backstage process (sync reconciliation) has no
declared frontstage counterpart (a UI state for "reconciling," "conflict,
pick a version," etc).

---

## Part 3 — What to actually do with this

**You don't need a new methodology.** You already produced one good
instance of it (the Fishbone Analysis) and a set of standing rules for one
dimension of it (Data Highways). The gap is that both are scoped to
auth/onboarding and sync-transport respectively — never generalized into
a standing practice applied to every major flow.

**Concrete next step:** pick the flows that matter most for alpha and
write one **fishbone + sequence trace** per flow, in the same format your
own June 26 docs already used (confirmed code behavior / confirmed docs
behavior / inferred failure modes → root causes → proposed solution).
Candidates, roughly in order of user-facing importance:

1. **Cold boot → first interactive screen** (Case Study 1 — partially done implicitly by Beast Plan, but never as an explicit fishbone)
2. **Offline write → reconnect → reconciliation** (Case Study 5 — flagged as debt, never traced)
3. **QR join / invite flows beyond classroom** (group join, thuthimal claim, invite links) — the classroom case got the atomic-guard treatment; verify the others did too
4. **Notification → deep link → landing screen** — declared in `app.json`, needs the same "declared vs. wired" check the Aug 13 audit did for magic links

**A lighter-weight companion tool for each:** a **sequence diagram**
(literally the UML term — a diagram with actors/components as vertical
lanes and time flowing downward, showing exactly when each one sends or
receives something). This is the artifact that makes temporal coupling
*visible* before it ships, rather than discovered later as a bug report
like the guest-banner one. It's the same shape as a service blueprint but
lighter — you don't need design tooling, a markdown table with "T0, T1,
T2…" rows per actor does the job, and it's the format your own
`beast-baseline.md` is already halfway toward with its "Before Table."

**The reframe in one sentence:** stop asking "does this screen have a
bug," and ask "does this *sequence* have a single, traceable owner for
its ordering" — for the sequences that don't, that's your Frankenstein,
not the file tree.
