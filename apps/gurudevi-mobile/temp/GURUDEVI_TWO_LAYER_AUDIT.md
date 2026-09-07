# Gurudevi Mobile — Two-Layer Functional Audit
**Mechanism layer vs. Surface/Feedback layer — snapshot 2026-08-31**

## Why two layers, and what each one is

Everything in the three prior audit docs — routing, dependency wiring,
effect sequencing, data-fetch fallbacks — is real, but it all lives in
one layer: **does the code connect to the right things.** A user never
sees that layer directly. What they see is the second layer, and a bug
in layer 1 only matters to them insofar as it produces a symptom in
layer 2.

| | **Mechanism layer** | **Surface / Feedback layer** |
|---|---|---|
| What it is | Routing, data flow, effect order, dependency graph | Screens, layout, buttons, and — specifically — what happens *after* the user acts |
| Who feels it | Nobody, directly | Every single user, every single tap |
| Established name | Architecture / control flow | **Visibility of system status** (Nielsen heuristic #1); a **microinteraction's feedback step** (trigger → rules → **feedback** → loop, Dan Saffer's framework) |
| How I audit it | Read imports, trace calls, grep consumers | Read the actual handler + render code for each interactive element: is there a loading state, a success confirmation, an error message — or silence |
| What I can verify from code alone | Almost everything | **Whether the feedback code exists.** Not whether it looks good, is well-spaced, or feels smooth — that needs the app actually rendered/run, not just read |

That last row matters and I want to be precise about it, not overclaim:
from source alone I can tell you *"this button's failure path shows
nothing to the user"* with certainty — that's a fact about the code.
I cannot tell you *"this screen's spacing looks cramped"* with the same
certainty from a `.tsx` file full of Tailwind classes — that needs
actual visual inspection. This document only makes claims of the first
kind.

---

## Case Study: One file, both layers broken

`admin/src/components/principal/DashboardEcho.tsx` — already flagged in
the mechanism layer for silently substituting fabricated feedback data
on a failed fetch. Reading further into it shows the **surface layer is
broken too, independently:**

**`handleMarkRead`:**
```js
try {
  await supabase.from('school_echo_feedback').update({ is_read: true }).eq('id', id);
  setFeedback(...)  // only runs on success
} catch {
  /**/    // ← literally empty. No toast, no message, no retry, no log to the user.
}
```
A principal taps a feedback card to mark it read. If that write fails —
permissions, network, anything — **the card just doesn't update, and
nothing tells them why or that it failed at all.** From the user's side,
this is indistinguishable from "the app ignored my tap."

**`handleSendReply`:** same shape. A principal writes a reply to a
teacher's support request, taps send, sees a saving spinner (`savingReply`
is handled correctly)... and if the write fails, the spinner just stops.
No error. The reply box stays open with their text still in it, which is
*accidentally* not-terrible (they haven't lost their draft), but they have
no idea whether to retry, and no indication anything went wrong. In a
platform whose entire premise is that principals close the loop with
teachers and students, a reply that silently fails to save is a direct
hit against the product's actual purpose, not a minor polish gap.

**What's actually good in this same file, for calibration:** the initial
load has a real spinner state, tap targets give haptic feedback
(`hapticLight()`), and read/unread items are visually distinguished. The
"on mount" and "visual state" parts of this file are fine. It's
specifically the "after a user action fails" path — twice — that goes
silent.

---

## Case Study: A file that does the feedback layer right (for contrast)

`packages/scanner-kit/src/screens/QRHandlerScreen.tsx` — handles what
happens after a user scans a QR code. This is a genuinely well-built
feedback loop:

- Explicit `status: 'processing' | 'success' | 'error'` state — the
  interaction has a real, modeled lifecycle, not just "did it work y/n."
- Each state has a **distinct visual treatment** (spinner → ✅ → ⚠️),
  **distinct haptic** (`hapticSuccess()` / `hapticError()`), and a
  **translated, human-readable message** for all three states, including
  failure.
- On error, it doesn't just sit there — it auto-navigates the user back
  to safety after 2.5s, giving them time to actually read the message
  first.

This is worth naming explicitly as the standard the rest of the app
should be checked against — not an abstract "best practice," but a
pattern that already exists, correctly, in your own codebase.

---

## What this means for the audit going forward

The mechanism-layer audit (previous 3 docs) can be done efficiently with
grep and import-tracing because it's structural. **The surface-layer
audit cannot be done that way — it requires opening each interactive
component individually** and checking, by hand, whether every `catch`
block, every async action, has a real user-facing consequence on both
success and failure. There's no shortcut grep for "this catch block is
empty in a way that matters" versus "this catch block is empty because
the action is genuinely fire-and-forget and doesn't need to tell anyone
anything" — that judgment call has to be made per-file.

**Honest scope of this document:** I've deep-audited 2 components for the
surface layer (one broken twice, one exemplary). That's a proof of
method, not coverage. Given the size of the app (16 domain packages,
~61 routes), a full surface-layer pass means going through every
screen's interactive elements — every button, every form submit, every
swipe/delete action — checking the same three questions each time:

1. **While it's working** — is there a visible loading/pending state?
2. **When it succeeds** — does the user get confirmation (visual, haptic,
   navigation, or all three)?
3. **When it fails** — does the user find out, in language they'd
   understand, or does it go silent like `DashboardEcho`'s two handlers?

## Recommended order for the full pass

Matching your own five-pillar structure, highest-stakes-for-trust first:

1. **Admin/Principal** (started here) — dashboards principals act on;
   silent failures here have the highest cost per incident.
2. **Classroom** — highest daily-traffic teacher surface (attendance,
   gradebook, QR join — already flagged for mechanism-layer bugs, needs
   the same feedback-loop check on top).
3. **Community** — messaging/chat, where "did my message actually send"
   silence is especially corrosive to trust.
4. **Self** — the philosophical core of the product; if a reflection
   entry silently fails to save, that's not just a bug, it's the product
   failing at the one thing it exists to do.
5. **Library, Profile** — lower interaction frequency, still needs the
   same three-question check.

I'll continue in this order unless you want a different one — Classroom
next, since it's both mechanism-flagged already and the highest-traffic
surface for the person actually using the app every day.

---

## Pass 2: Classroom — Results

Read the actual interactive components (`AttendanceSheet`,
`AttendanceScreen`, `GradebookScreen`, `AddStudentModal`,
`ClaimInviteModal`, `CreateClassroomModal`, `SubmissionModal`), not just
the route files.

### Finding: a real, systemic feedback-layer bug — `alert()` on native

Six components call the raw JavaScript `alert()` function to show a
result to the user:

| File | What it's supposed to tell the user |
|---|---|
| `packages/classroom/src/components/ClaimInviteModal.tsx:45` | Invite code was invalid / already claimed |
| `packages/library/src/components/modals/StudentAnalysisModal.tsx:194,197` | Analysis export succeeded / failed |
| `apps/gurudevi-mobile/src/screens/DocumentScannerScreen.tsx:25` | N students saved from a scanned register |
| `apps/gurudevi-mobile/src/screens/DemoFeeScreen.tsx:28` | Demo payment succeeded |
| `apps/gurudevi-mobile/src/screens/WorkforceRoleScreen.tsx:16` | Staff member assigned to a family |

**`alert()` is a browser global. React Native does not provide it on
native iOS/Android** — it only exists in your web build, via
`react-native-web`'s browser polyfill. I grepped the entire codebase for
any custom global polyfill (`global.alert =`, `globalThis.alert =`) —
**none exists.** The well-established RN behavior when calling an
undefined global is a `ReferenceError` at that line.

**What this means, stated at the right confidence level:** I can't run
the app to watch it happen, so I won't claim certainty about the exact
runtime behavior on every RN/Hermes version — but the mechanism is
textbook: on native, these six calls almost certainly throw instead of
showing anything, at exactly the moment they're supposed to tell the
user "it worked" or "it failed." One of the six
(`ClaimInviteModal.tsx:45`) even has a comment admitting the shortcut:
*"On mobile we might want a nicer toast, but keeping alert for now."*
That comment is your own team flagging this as unfinished — it just
never got closed out.

**This is the single highest-value fix in this document.** It's small
(swap six `alert()` calls for your existing toast system — `AddStudentModal`
in this same package already shows the correct pattern via
`useToast()`), and it sits exactly at the highest-traffic point of
failure: the moment right after a user acts.

### Finding: Gradebook can tell a teacher a grade saved when it didn't

`packages/classroom/src/screens/GradebookScreen.tsx`:

```js
const handleSaveGrade = async (marks: number, feedback: string) => {
  if (!gradingStudentId) return;
  try {
    await submitGrade(gradingStudentId, marks, feedback || undefined);
  } catch (err: any) {
    console.error('[GradebookScreen] submitGrade failed:', err);
  } finally {
    setGradingStudentId(null);   // ← closes the grade-entry modal regardless of outcome
  }
};
```

If `submitGrade` fails, the `catch` only logs to the console — invisible
to the teacher — and the `finally` closes the entry modal exactly as it
would on success. **The UI actively signals success (the modal closes)
on a failed save.** A teacher has no reason to believe the grade wasn't
recorded. This is worse than silence — it's a false positive. The same
file's `handleSaveSettings` has the identical shape at lower stakes
(grading-scale settings, not individual grades).

This is the same screen already flagged for the missing-`classroomId`
route bug (§3, prior doc) — two independent, compounding problems on
the single most consequential teacher-facing screen in the app.

### Finding: a small but real visual-coherence smell in `ClaimInviteModal`

At the bottom of the file:
```js
// Add a standard Heading wrapper if missing in local scope but SanctuaryModal title uses it internally
const Heading = ({ children, className }: any) => (
  <Text className={`text-xl font-bold ${className || ''}`}>{children}</Text>
);
```
Rather than importing the real `Heading` from `@repo/ui/primitives` (used
correctly elsewhere, e.g. `DashboardEcho.tsx`), this file defines its own
stand-in. The success screen's heading in this one modal almost certainly
doesn't match your actual design system's heading style everywhere else
— a small, local instance of the "different session, different
convention" pattern from the earlier findings doc.

### Not yet deep-read this pass (honest scope limit)

`SubmissionModal.tsx` and `CreateClassroomModal.tsx` (891 lines) both
triage as reasonably healthy — `isSubmitting` state, real `error` state,
multiple `catch` blocks with actual `setError` calls rather than empty
ones — but I have not read either line-by-line the way I did the four
files above. Flagging so this isn't mistaken for a clean bill of health;
it's an unread-yet, not a verified-fine.

### What's actually good here (checked in full, not assumed)

- **`AttendanceScreen.tsx`** (the screen, distinct from the presentational
  `AttendanceSheet` component) is genuinely excellent: real loading state,
  specific error messages, and **offline-aware** toast copy — "Saved
  offline — will sync when online" vs. "Attendance saved successfully."
  This is the feedback-layer bar the rest of the app should be held to.
- **`AttendanceSheet.tsx`** initially looked suspicious (zero error-handling
  hits on grep) — read in full, it's correctly a pure presentational
  component with no async logic of its own, reporting changes upward via
  `onAttendanceChange`. It also has real `accessibilityLabel`/
  `accessibilityHint` on its swipe gestures. **Checked and cleared, not
  a bug** — worth stating plainly so this document isn't just a list of
  everything I looked at being broken.
- **`AddStudentModal.tsx`** — proper `useToast()` feedback on save,
  validation-failure, and error paths, plus a disabled+labeled loading
  state on its submit button. This is the pattern `ClaimInviteModal` and
  `GradebookScreen` should be brought up to.

---

## Pass 3: Self — Results

Requested as a full investigation, both layers, given this pillar is the
philosophical core of the product. Read the live screen dispatcher, the
Teacher sanctuary view (267 lines, ~17 sub-features), all 9 reflection
hooks, and the actual save-handlers in 6 of the reflection components.

### Correcting my own assumption before it became a false finding

`screens/SelfScreen.unified.tsx` (246 lines) is **not** dead code — I
almost flagged it as a 5th instance of the "built and abandoned" pattern
from the earlier docs, matching it on sight. Reading the live
`SelfScreen.tsx` first showed it's deliberately imported and
**flag-gated** (`canvas.self.unified`, a GrowthBook feature flag) as a
progressive rollout of a next-gen unified canvas, with the current
role-based views (`TeacherSelfView`, `StudentSelfView`, etc.) as the
explicit fallback until rollout completes — stated as such in the file's
own docstring. That's legitimate, deliberate architecture, not
Frankenstein. Worth stating plainly since getting this wrong would have
been exactly the kind of doc-pattern-matching you originally called out.

### Real positive infrastructure: `useSafeMutation`

Found while checking why `JoyJar.tsx` and `GratitudeGlimmers.tsx` looked
healthier than `useMoodLogs.ts`. `packages/core/src/hooks/useSafeMutation.ts`
is a genuinely well-built, **widely-adopted** (12+ files across Self,
Classroom, and Community) shared mutation wrapper that, by default and
without the calling component having to remember anything:

- Detects offline state and automatically queues the write with an
  idempotency key, showing **"Saved to Outbox (Offline)"**
- Shows an automatic error toast on genuine failure
  (`showToast(errorMessage, 'error')`) unless the caller opts into custom
  handling
- Keeps an audit log of queued mutations for later reconciliation

This is the same category of tool as the dead `useAppLifecycle`/
`useWorkspaceLayoutSync`/unused-`xstate` findings from earlier — except
this one is **real and actually adopted.** It's the proof that this
codebase is capable of building the right abstraction *and* getting it
used consistently. Which makes the gaps below more precisely
characterizable: they're not "nobody knew how," they're "this specific
feature didn't use the tool that already exists and already works
elsewhere in the same file's neighbors."

### Confirmed bug: Mood check-in has no safety net at all

`useMoodLogs.ts`'s `addMoodLog` is hand-rolled (raw try/catch that
re-throws), not wrapped in `useSafeMutation`. Its only call site,
`TeacherSelfView.tsx`'s `handleMoodSelect`:

```js
const handleMoodSelect = async (mood, note) => {
  setIsSavingMood(true);
  try {
    await addMoodLog(mood, note);
    setIsMoodPickerOpen(false);
  } finally {
    setIsSavingMood(false);
  }
};
```

**No `catch` at all.** If the save fails, the re-thrown error becomes an
unhandled rejection — invisible to the user — and `isMoodPickerOpen`
never gets set to `false`, so the picker stays open with the saving
spinner just... stopping, no explanation. Doesn't falsely confirm success
(unlike the next finding), but does silently fail the single most
frequent, lowest-friction check-in action in the entire Self pillar.

### Confirmed bug, more serious: Voice Journal can lose a recording and tell the user it's saved

`packages/self/src/components/VoiceJournaling.tsx`, `handleConfirm`:

```js
try {
  // ...
  await saveVoiceJournalRecord(userId, { durationSeconds, blob, ... });
  // ...
} catch (e) {
  console.warn('[voice] save failed', e);   // ← console only
} finally {
  setIsSaving(false);
}
onFinished?.(recordedUri ?? 'mock-uri');   // ← runs regardless of success or failure
handleReset();                              // ← runs regardless of success or failure
```

`onFinished` and `handleReset` sit **outside and after** the try/catch/
finally, so they run unconditionally. Whatever `onFinished` does
upstream (very likely closing the recorder UI and treating the entry as
complete) happens exactly the same way whether the save succeeded or
silently failed. This is the same false-success shape as the Gradebook
bug found in the Classroom pass — a user acts, the interface visibly
moves on as if it worked, and there was never a save. Here the emotional
stakes are arguably higher: someone recorded something in what's framed
as a personal sanctuary, and it can vanish without them ever knowing.

### What's actually good, checked in full (for calibration)

- **`FireJournal.tsx`** hand-rolls its own error handling rather than
  using `useSafeMutation`, and does it well: a dedicated `burnError`
  state with a real, warm, on-brand message — *"We could not save this
  release safely"* — not a generic error string. This is the bar the
  mood check-in and voice journal handlers should be held to.
- **`JoyJar.tsx`, `GratitudeGlimmers.tsx`, `WisdomSeeds.tsx`,
  `TomorrowPrep.tsx`, `SleepTracker.tsx`, `DecisionJournalSection.tsx`,
  `EnergyForecast.tsx`, `StudentGoals.tsx`** — all correctly wrap their
  writes in `useSafeMutation`, meaning they get offline-queueing and
  error toasts automatically. Roughly two-thirds of the reflection
  surface is actually in good shape.
- **`useWellbeingEnrichment.ts`** (feeds the sidebar "Warm Mirror" card)
  fails silently (`.catch(() => {})`) on its background fetch — but this
  is a passive, decorative enrichment the user didn't directly trigger,
  not a save action. A silent degrade to "just don't show the card" is
  a defensible choice here, not the same category of problem as a
  failed save being reported as a success. Worth including so the
  document doesn't flatten every silent catch into the same severity.
- **`WindDownRitual.tsx`** — checked; it's a client-side-only guided
  sequence with no persistence calls at all, so this entire class of bug
  doesn't apply to it.

## Pass 4: Teacher — Full Role Dive

Requested as a complete pass across the Teacher role specifically, not
just a pillar. Covers every file under `components/teacher/`,
`workspace/useTeacherWorkspaceShell.tsx`,
`workspace/useTeacherDashboardSurfaces.tsx`, and the two teacher screens
— 3,891 lines total, read in full or systematically triaged.

### A precise correction to an earlier, vaguer claim

The temporal-flow audit (this project's second document) repeated the
Beast Plan's own line that there's **"no offline conflict UX"** as known
debt. Reading `TeacherClassroomDashboard.tsx` (927 lines, the largest
file in this whole audit) shows that claim was too broad — a conflict UI
genuinely exists:

```js
const handleConflictResolution = (conflictId: string, decision: 'local' | 'remote') => {
  if (decision === 'remote') {
    // Accept server state: Just remove from local queue
    removeFromQueue(conflictId);
  } else {
    // Keep mine: Re-queue with forced override (or updated timestamp)
    // For now, we'll just remove and let the user re-trigger or wait
    removeFromQueue(conflictId);
  }
  resolveConflict(conflictId, decision === 'remote' ? 'remote_wins' : 'local_wins');
};
```

A `<ConflictResolver>` component genuinely renders when
`activeConflicts.length > 0`, letting a teacher choose between their
local change and the server's. **The more precise, corrected finding:**
one of the two choices is a documented stub. Choosing "keep mine" does
not actually re-apply the teacher's change — the comment admits it
("we'll just remove and let the user re-trigger or wait"), and the code
only removes the conflict from the queue and marks it resolved. A
teacher who picks "keep my version" has no reason to think anything less
than that happened. **This is more precise and more actionable than the
original "no conflict UX" claim** — the gap isn't a missing feature,
it's a half-built one that reports success either way it's used.

### Systemic finding: three files, seven handlers, one repeated silent-failure shape

Distinct from the `alert()` pattern (Classroom pass) and the
false-success pattern (Gradebook, Voice Journal) — this is a third,
separate shape: **every failure path is `console.error` only, nothing
else.** None of these falsely signal success — the modals/state correctly
don't advance on failure — but none of them tell the teacher anything
happened either. Found identically across:

| File | Handler | What silently fails |
|---|---|---|
| `TeacherClassroomDashboard.tsx:294` | `handleAddMonth` | Adding a new lesson/unit to the curriculum |
| `TeacherClassroomDashboard.tsx:342` | `handleAddContent` | Adding lesson materials or an assignment |
| `TeacherObservationsWorkspace.tsx:56` | load | Fetching a student's observation history |
| `TeacherObservationsWorkspace.tsx:93` | create | Recording a new student observation |
| `TeacherObservationsWorkspace.tsx:104` | delete | Deleting an observation |
| `TeacherAssignmentsWorkspace.tsx:45` | load | Fetching the assignment list |
| `TeacherAssignmentsWorkspace.tsx:72` | create | Creating a new assignment |

The identical shape across three separately-named files strongly
suggests one authoring session wrote all three without the
`useSafeMutation` pattern that's already proven and already working
elsewhere in this same package (see the Self-pillar findings above —
`JoyJar`, `GratitudeGlimmers`, etc.). This is the same underlying story
as the rest of this audit: the fix already exists in the codebase, it
just wasn't used here.

**One specific, load-bearing consequence worth naming:** the
load-failure cases (fetching observations, fetching assignments) mean a
teacher whose data fails to load simply sees an **empty list**, with no
way to distinguish "you have no assignments yet" from "this failed to
load." That ambiguity is arguably worse for trust than an error message,
because it looks like a normal, unremarkable empty state.

### What's exemplary here — the standard the rest should meet

Two files in the same role, doing it right, in contrast:

- **`TeacherGroupsModal.tsx`** — every single async action pairs with an
  explicit, specific toast: *"Could not load classroom groups,"*
  *"Classroom group saved,"* *"Group deleted."* Not generic strings —
  each one names the actual thing that happened or failed.
- **`workspace/useTeacherWorkspaceShell.tsx`** — same standard, including
  a genuinely nice touch on the QR-join flow: an explicit **"Joined
  classroom!"** success toast, not just a silent navigation.

These two files prove the other five files' silence isn't a technical
limitation — it's an inconsistency between sessions that touched the
same role's code at different times.

### Read in full but not separately reported (no new issues found)

`TeacherWorkspaceShell.tsx`, `TeacherAnalysisWorkspace.tsx`,
`TeacherClassroomList.tsx`, `TeacherStats.tsx`, `TeacherAdminActions.tsx`,
`TeacherActions.tsx`, `TeacherDashboard.tsx`,
`useTeacherDashboardSurfaces.tsx` — triaged (grepped for the same
patterns as everything above) and, where they have async actions at all,
found no additional instances beyond what's already reported. Several
are purely presentational (zero catch blocks, correctly so, same as
`AttendanceSheet` in the earlier pass).

---

## Pass 5: Student — Full Role Dive

Covers every student-facing file across `classroom`, `self`, and the
shared error-handling infrastructure they depend on — roughly a dozen
files read or fully triaged.

### A second centralized safety net, previously unaccounted for

While tracing whether `StudentClassroomDashboard.tsx`'s assignment
submission (`onSubmit={async (content, photoUri) => { await
api.assignments.submitSubmission(...) }}`, with no local `catch`) was a
silent-failure risk like the ones found in the Teacher pass, I found it
isn't — but only because `SubmissionModal.tsx` (the child component that
actually calls that callback) wraps it correctly. That led to
`packages/core/src/logic/apiInterceptor.ts`, and it's worth reporting on
its own: this is a **second, independent, well-built centralized error
handler** — `handleAPIError()` — alongside `useSafeMutation` found in the
Self pass. It:

- Maps raw errors to warm, on-brand messages — *"The connection to the
  Sanctuary was lost,"* *"Your session has reached a peaceful end"* —
  not generic strings.
- Reports to Sentry automatically.
- **Shows a toast automatically** via the global store
  (`useStore.getState().showToast(...)`), unless the caller explicitly
  opts into `silent`.

**This changes the shape of every finding in this whole document.** The
codebase doesn't have one proven safety net that some files skip — it
has **two** (`useSafeMutation` for offline-aware mutations,
`handleAPIError`/`withErrorHandling` for a simpler global-toast pattern).
Every silent-failure bug found so far — Mood check-in, Voice Journal,
Gradebook, all seven Teacher handlers, both principal dashboards — could
have been a one-line fix by calling either of these two things that
already exist and already work. The problem was never missing
infrastructure.

### Confirmed: the submission flow itself is safe

`SubmissionModal.tsx`'s `handleSubmit` wraps `onSubmit` in a real
try/catch calling `handleAPIError(error)` — a student's homework
submission failing gets a proper, warm toast. Worth closing this loop
explicitly since it was flagged as "triaged but not deep-read" in the
Classroom pass — now verified, and it's good.

### Confirmed bug: a hardcoded fake streak shown to every student

`packages/self/src/components/StudentGoals.tsx`:
```js
const [streak, setStreak] = useState(0);
useEffect(() => {
  // Mock streak for now
  setStreak(5);
}, []);
```
Every student sees a fixed **"5-day streak"** regardless of their actual
goal history — a student with a real 20-day streak and one with zero
history see the identical badge. This is the same class of issue as the
principal dashboards showing fabricated data, except here it's shown
directly to a child, permanently, not just on a failure path — it's not
a fallback, it's the only behavior that exists. Gamified streaks exist
specifically to reward real behavior; a fake one that never changes
undermines the mechanic outright once a student notices (and they will —
kids notice numbers that don't move).

### Confirmed pattern-match: two more silent-load-failure instances

Same shape as the Teacher pass's seven handlers:

| File | What silently fails |
|---|---|
| `StudentProfileScreen.tsx:90` | Loading the student's own profile — `console.error` only |
| `StudentGradesOverview.tsx:83` | Loading recent grades — falls back to an empty list, indistinguishable from "no grades yet" |

### What's exemplary here — full, correct implementation

- **`useStudentClassroomWorkspaceData.ts` + `StudentClassroomDashboard.tsx`**
  — a genuinely complete pattern: the hook sets a real `error` message on
  failure, and the screen actually renders it (`workspace.error &&
  <Text>{workspace.error}</Text>`). This is what the Teacher pass's
  Observations/Assignments loaders should look like.
- **`StudentGradesOverview.tsx`**, despite the silent-empty-state gap
  above, has a correct `isActive` cancellation guard preventing a
  stale/late response from overwriting newer state — good mechanism-layer
  hygiene, ties back to the useEffect-risk document.
- **`self/StudentGoals.tsx`** correctly uses `useSafeMutation` for its
  actual goal-saving mutation — the fake streak is a separate, isolated
  issue in the same file, not a sign the whole file is careless.

### Architectural note worth flagging for every future pass, not just this one

`classroom/src/components/student/StudentGoals.tsx` (a *different* file
from the one above — the Classroom pillar has its own, separate
`StudentGoals`, alongside Self's) initially looked like dead code — no
direct static import found anywhere. It isn't: it's registered as a
`capabilityKey: 'StudentGoals'` in `useStudentDashboardSurfaces.tsx`, a
**dynamic capability-registry system** that composes the student
dashboard at runtime rather than through static imports. This means
grep-based dead-code detection (which worked reliably for
`useWorkspaceLayoutSync`, `xstate`, etc. in earlier passes) **undercounts
usage for anything registered this way** — worth remembering for Library,
Community, and Profile, since Self already had its own version of this
same registry pattern (`FeatureRegistry.tsx`).

Separately: having a `StudentGoals` in both `classroom/components/student/`
and `self/components/` is at minimum a naming collision risk for whoever
next has to figure out which one a bug report is about, even though both
appear to serve genuinely different purposes (academic goals vs. personal
reflection goals) rather than being true duplicates.

---

### Not yet deep-read this pass, Self (honest scope limit)

The Self package has ~130 files; I read the live screen dispatcher, one
full role view (Teacher, the richest one), all 9 reflection hooks, and 6
of the ~17 feature components in full. Not checked: `AdminSelfView`,
`FounderSelfView`, `GuardianSelfView`, `PrincipalSelfView`,
`StudentSelfView` (the other five role-specific views — likely compose
many of the same already-checked components, but not confirmed), the
dynamic feature-registry system (`FeatureRegistry.tsx`,
`featureResolver.ts`, `accessPolicy.ts`), and the privacy ledger screen.

## Pass 6: Settings — Two Layers × Platform (Web vs. Android)

Requested specifically: settings, through both layers, multiplied by
platform (web vs. native/Android — this codebase doesn't split iOS
separately here since biometrics/screen-capture APIs behave the same
across native OSes; the real fork in this domain is native vs. web).
Traced the actual settings screen from all three routes down to its one
real implementation, plus the adjacent notification-preferences panel.

### The finding: a proven crash, not a hypothesis — three buttons throw depending on which of three routes you arrived from

This closes the loop on something flagged twice before (the structural
audit, and again in the temporal-flow audit) as a *risk*. It's no longer
a risk — I read the exact line that fails and the exact three call sites
that feed it.

`packages/ui/src/screens/AppSettingsScreen.shared.tsx:196`:
```js
const AppSettingsScreen = memo(function AppSettingsScreen({ navigation }: any) {
```
No default value. No null-check anywhere before use. Three handlers call
it directly:
```js
navigation.navigate('Community', { screen: 'UserProfile', params: {...} });  // Preview Profile
navigation.navigate('TrubeLab');                                             // TrubeLab
navigation.navigate('icon-lab');                                             // Icon Lab
```

Cross-referencing the three routes that render this same screen:

| Route | Supplies `navigation`? | Has an ErrorBoundary? | Result on tapping Preview Profile / TrubeLab / Icon Lab |
|---|---|---|---|
| `app/(modal)/app-settings.tsx` | **Yes** — a real object with `.navigate` implemented | No | Works correctly |
| `app/(tabs)/settings.tsx` — **the tab-bar Settings icon, the primary way most users reach Settings** | **No** | Yes | Throws `TypeError: Cannot read properties of undefined (reading 'navigate')`, caught by the boundary — graceful fallback screen instead of the real crash |
| `app/(tabs)/profile/settings.tsx` | **No** | **No** | Throws the same error, **uncaught** |

**This means the majority-path route into Settings — the tab bar — has
three buttons that are guaranteed to throw the moment they're tapped,**
and one of the two broken entry points has no safety net at all under
it. This applies identically on web and Android, since it has nothing to
do with platform — it's a prop that's simply never passed on two of
three paths. I'd rank this as the single highest-confidence, highest-severity
finding across every pass in this document, precisely because it required
no runtime inference — the prop type is `any`, there's no guard, and two
of three call sites provably never supply it.

### Platform-layer finding: the file-split convention exists here, but isn't actually used

`AppSettingsScreen.tsx` and `AppSettingsScreen.web.tsx` both exist — the
naming convention that normally signals "these diverge per platform." I
checked: they're **byte-identical, both a one-line re-export** of the
same `AppSettingsScreen.shared.tsx`. There is no actual platform
divergence at the file level; whatever platform-awareness Settings has
lives entirely inside the one 1,259-line shared file via `Platform.OS`
checks. Not a bug — just worth knowing so nobody goes looking in the
`.web.tsx` file expecting different behavior and wastes time.

### What's actually good here — platform-awareness done correctly

Worth crediting clearly, since the crash above could read as "this
screen is a mess" when it's actually mostly well-built:

- **Biometric lock and screen-capture prevention** are correctly gated
  `Platform.OS !== 'web'` (neither exists as a concept on web), check
  hardware capability before showing the toggle at all
  (`LocalAuthentication.hasHardwareAsync()` + `isEnrolledAsync()`), and
  have real try/catch with distinct, on-brand success/error toasts for
  each.
- **`NotificationSettingsPanel.tsx`** correctly separates native push
  (handled elsewhere, via Expo push tokens at the OS level) from **web
  push** (VAPID keys + the browser Notification API) as genuinely
  different mechanisms — the `'unavailable'` state on native isn't a bug,
  it's the honest, correct label for a capability that doesn't exist
  there. Its failure path (`browserPushState === 'error'`) is explicitly
  checked and rendered to the user, not silent.

This is a useful contrast for the rest of the audit: when platform
differences are handled deliberately (checked, gated, given their own
state and feedback), the result is genuinely solid. The crash bug above
isn't a platform-handling failure — it's a plain missing-prop bug that
happens to be reachable from both platforms equally.

---

## Pass 7: User vs. Account Lifecycle

Requested as its own topic — session/identity lifecycle across login,
multi-account switching, logout, and deletion. This turned out to
contain both the best-engineered code in the entire audit and its most
consequential "built correctly, never wired in" finding.

### The conceptual model, read from source rather than assumed

`packages/core/src/types/Identity.ts` defines this precisely: a **User**
is one authenticated identity. A **Bond** is a relationship between that
User and an Entity (a school, a classroom, or the platform itself) with
a specific **Capacity** (teacher, student, parent, principal, etc.) and a
status (active/archived/pending). A **Perspective** is which Bond is
currently active out of potentially several. In plain terms: one parent
with two kids at two schools, who also teaches part-time, is **one User
with three Bonds**, switchable via Perspective — not three accounts.
This is a genuinely well-thought-out relationship-based access model,
not an afterthought.

Separately, and distinctly, `accounts/deviceAccounts.ts` handles a
**different** lifecycle concern: multiple *people* sharing one *device*
(a family tablet where Mom and Dad each have their own full login). Two
real, different multi-identity concepts, cleanly separated in the
architecture rather than conflated.

### The best-engineered code found in this entire audit

`deviceAccounts.switchTo()` treats switching accounts on a shared device
as a genuine transaction:

```js
await setActiveAccount(accountId);
resetScopedStores();
await rehydrateScopedStores();

const { error } = await supabaseClient.auth.setSession({ ...storedSession });
if (error) {
  // roll back completely — restore the previous account's active state
  await setActiveAccount(previousAccountId);
  resetScopedStores();
  await rehydrateScopedStores();
  throw error;
}
```

If the cached session for the target account turns out to be stale or
revoked, it **rolls all the way back** to the previous account rather
than leaving the app in a half-switched state. Every lifecycle event —
account captured, switched, removed, signed out — goes through a proper
serial audit queue (built on the `effect` library, avoiding a thundering
herd of concurrent audit writes) that logs to a device-trust backend.
Account removal correctly scopes and clears only that account's local
PowerSync database before falling back to another account or signing
out entirely. This is careful, security-conscious, correct engineering —
worth stating plainly since most of this document is findings, and this
deserves to be named as the standard, not buried under them.

### The one real gap — and it's the same Layer B pattern as everywhere else, on top of the best backend in the app

`hooks/useDeviceAccounts.ts` wraps all four of the above actions
(`switchAccount`, `removeAccount`, `signOutCurrentAccount`,
`signOutAllAccounts`) identically:

```js
const switchAccount = useCallback(async (accountId: string) => {
  dispatch({ type: 'SET_BUSY', payload: accountId });
  try {
    await deviceAccounts.switchTo(accountId);
    await refresh();
  } finally {
    dispatch({ type: 'SET_BUSY', payload: null });
  }
}, [refresh]);
```

**No `catch`.** `deviceAccounts.switchTo()` explicitly throws a real,
human-written error ("This account is no longer available on this
device.") for exactly the failure case it's designed to handle safely —
and that message never reaches the user. The busy spinner correctly
clears (no stuck UI), and the underlying rollback already happened
inside `switchTo` before the throw (no data-safety issue) — but the
person who tapped "switch to my other kid's account" sees the spinner
stop and... nothing. Same account still active, no explanation. This is
the same shape found in every other pass, here sitting directly on top
of the single most carefully-built mechanism in the codebase — the
clearest possible illustration that these two layers are genuinely
independent axes, not correlated with each other.

### The capstone finding: three different logout implementations, and the most thorough one is never called

Tracing "what actually happens on logout" surfaced three separate,
non-identical implementations:

1. **`resetScopedStores.ts`'s `globalLogoutAndPurge()`** — explicitly
   commented *"THE SACRED WASH — performs a total cryptographic and
   stateful wipe... to prevent data leakage between users."* Does a
   scoped MMKV cryptographic partition wipe, clears the React Query
   cache, writes a `CLOUD_WIPE_INVOKED` audit event, signs out of
   Supabase, and resets the Zustand stores. **Grepped for every possible
   call site across the entire codebase — zero. Never invoked, anywhere.**
2. **`deviceAccounts.signOutCurrentAccount()` / `signOutAllAccounts()`**
   — the actually-live path from the account-switcher UI. Calls the
   lighter `resetScopedStores()` (Zustand state only) — **not** the
   cryptographic MMKV wipe, **not** a React Query cache clear.
3. **`AuthManager.signOut()`** — a third, separate implementation (the
   "Sovereign Sign-Out Flow"), reachable from the plain Settings/Profile
   logout button. Calls an injected `config.storage.clearAll()` and an
   injected `config.onSignOut()` hook — neither of which, from what's
   traceable in this file alone, is confirmed to clear the React Query
   cache either. (Honest limit: `onSignOut` is dependency-injected and
   configured elsewhere; I did not trace that far to find its concrete
   implementation.)

**Why this matters more than a typical dead-code finding:** this app is
multi-account, shared-device-capable, by design — a parent, their
children, and possibly a teacher account can all exist on the same
physical device. React Query is used extensively (17+ files) to cache
fetched data — assignments, grades, observations, messages. If the live
logout/switch paths don't clear that cache the way the unused "Sacred
Wash" function was explicitly written to, **there's a real, plausible
path for one account's cached data to still be sitting in memory
immediately after switching to or signing in as a different person on
the same device**, until the cache naturally expires or the app process
is killed. I can't confirm from static reading alone whether this
actually manifests as a visible leak in practice — that would need
runtime testing — but the architecture-level fact is solid: the function
built specifically to prevent this is provably not in the path that
runs.

**This is worth prioritizing above almost everything else in this
document.** Not because it's the flashiest bug, but because it's the one
with the clearest path to a real privacy incident on a platform whose
users include children, and because the fix isn't "build something new"
— it's "call the well-built function that already exists" three times,
in `deviceAccounts.ts` and wherever `AuthManager.signOut` is finalized.

### Chasing it to the end: the full, traced call chain for the actual "Log Out" button

The capstone finding above was based on tracing `AuthManager.signOut()`
in isolation. Following it the rest of the way — into its live
configuration and into what actually happens after it returns — refines
the finding into something more precise and, in one respect, better
than first suspected.

**The full chain, each link confirmed by reading the file, not assumed:**

```
ProfileScreen.tsx "Log Out" button
  → confirmLogout()
    → logout()                         [from useProfile()]
      → authAPI.signOut()              [packages/core/src/api/auth.ts:92]
        → auth.signOut()               [the live AuthManager singleton]
          → AuthManager.signOut()      [packages/core/src/logic/managers/AuthManager.ts]
```

`auth.factory.ts` — the actual production configuration of that
singleton, "The Global Sovereign Auth Instance":
```js
export const auth = new AuthManager(new SupabaseAuthAdapter(), identity, {
  onSignOut: async () => {
    if (typeof window !== 'undefined') return;   // native only
    const { disconnectPowerSync } = await import('../../adapters/powersync/database');
    await disconnectPowerSync();
  },
  storage: { clearAll: () => storage.clearAll() },
});
```

So `AuthManager.signOut()`, in production, does exactly: disconnect
PowerSync (native only), wipe MMKV storage, log an audit event, call
Supabase's sign-out. **Confirmed: no `resetScopedStores()`, no
`globalLogoutAndPurge()`, no React Query cache clear anywhere in this
chain.**

**The correction — it's better than first suspected, for the most
sensitive fields:** Supabase's sign-out triggers its own
`onAuthStateChange` event, and `useAuthLifecycle.ts` has a listener for
exactly this:
```js
} else if (event === 'SIGNED_OUT') {
  clearSentryUser();
  setUser(null);
  setPerspective(null);
  setAvailableBonds([]);
  setSchoolType(null);
  setOnboardingCompleted(false);
  setDemoMode(false);
}
```
This is a second, independent, working safety net — **the core identity
fields (who the user is, their active Bond/Perspective, their available
Bonds) genuinely do get cleared on logout**, via this listener, not via
either of the reset functions discussed earlier. This part is fine, and
I'd have been overclaiming to leave that impression uncorrected.

**What's still genuinely uncovered, now confirmed rather than inferred:**
that listener resets `schoolType`, but the tenant store's other fields —
`schoolId`, `schoolName`, `tenantResolved`, `realClassCount` — are
defined in `resetScopedStores.ts`'s `tenantScopedDefaults` and are
**not** touched by anything in this traced chain. Neither are the UI
store, growth store, feature-flag store, mutation queue, or **the React
Query cache** — all of which only get reset by `resetScopedStores()`,
which is called by the account-*switcher* path (`deviceAccounts.ts`) but
confirmed absent from the plain single-account logout path a typical
user actually taps.

**The precise, final version of this finding:** logging out via the main
Settings/Profile button correctly clears *who you are* in memory, but
not necessarily *what school you were just looking at* or *what was
cached from your session* — on a device someone else might sign into
next. Smaller in scope than the original capstone finding, and more
useful for exactly that reason: it tells you precisely which stores to
route through `resetScopedStores()` (tenant, UI, growth, feature flags,
mutation queue, query cache) rather than needing a full architectural
rewrite — the identity half of this is already handled correctly.



## Pass 8: Profile — Results

Covers every interactive component and hook in the Profile package —
profile editing, social links, the Thuthimal claim/gift feature, and the
rewarded-ad hub.

### Confirmed bug: the single most important Profile action fails silently, right next to its own correct example

`EditProfileModal.tsx`'s `handleSave` — the actual "save my profile"
button:

```js
await profileAPI.updateProfile(currentProfile.id, updates);
hapticSuccess();
onSave();
onClose();
} catch (error) {
  console.error('Error updating profile:', error);
  hapticError();          // ← a vibration. That's the entire failure UX.
} finally {
  dispatch({ type: 'SET_SAVING', value: false });
}
```

A failed save gets a haptic buzz and nothing else — no toast, no message,
no indication of what went wrong. It doesn't falsely close the modal
(the `onClose()` call sits before the `catch`, so failure correctly
leaves the form open) — but a vibration alone is not a failure message.
**The sharper detail:** the same function's image-upload path, thirty
lines earlier in the identical file, correctly calls `handleAPIError()`
and gets the full warm-toast treatment. Whoever wrote this file knew the
right tool and used it for one save path but not the other, in the same
component.

### What's actually good here — three different, all-correct patterns for the same problem

Worth showing as a set, because it demonstrates this package generally
knows what it's doing:

- **`FullProfileScreen.tsx`'s inline field editor** avoids exceptions
  entirely — `updateField()` returns a `{ success, error }` result rather
  than throwing, and the screen renders `saveError` directly in an alert
  box. A clean, arguably better-than-try/catch pattern, executed
  correctly start to finish.
- **`AddSocialLinkModal.tsx` + `useSocialLinks.ts`** — properly split:
  the hook wraps its Supabase call in try/catch, returns a
  `{ success, error }` result, *and* calls `handleAPIError()` internally
  for the toast. The modal only clears its form and closes
  `if (result.success)`. Hook and component each doing exactly their
  part.
- **`ThuthimalClaimScreen.tsx`** uses an explicit `claimState` machine
  (`'loading' | 'already_claimed' | 'error'`, plus success) with every
  state actually rendered — the same good pattern already credited to
  `QRHandlerScreen` in the Classroom pass. Worth noting this makes at
  least two unrelated features independently arriving at the same good
  state-machine idea.

Three genuinely different valid approaches — result-types, hook-level
centralized error handling, explicit state machines — all correctly
executed. The `EditProfileModal` bug isn't a sign this package doesn't
know how to do this; it's one save path in one file that didn't follow
any of the three patterns the rest of the package already uses
correctly.

### Not yet deep-read this pass (honest scope limit)

`NegentropyHubModal.tsx` (rewarded-ad viewing) and `GiveThuthimalModal.tsx`
triage as reasonably healthy (`useRewardedAdHub.ts` shows 6 toast call
sites; `GiveThuthimalModal` shows 4) but weren't read line-by-line the
way the files above were. `SupportSection.tsx` and
`InlineSocialLinkEditor.tsx` appear presentational with no async actions
of their own, consistent with the correctly-presentational components
found in earlier passes, but not exhaustively confirmed.

---

## Pass 9: Global Chrome — Bottom Tab, Header, Menu, FAB, Mascot

Requested as its own cross-cutting pass — the persistent UI that sits
above/around every screen rather than belonging to one pillar. This is
where the single largest finding of the entire audit turned up.

### The finding: a floating action button used by 10+ screens has no visual renderer anywhere in the app

`packages/ui/src/context/FABContext.tsx` defines `FABProvider` and
`useRegisterFAB()` — a shared system letting any screen register a set
of quick actions to appear in a floating button. It's mounted at the
root (`app/_layout.tsx`) and genuinely, widely adopted:

```
packages/admin/src/screens/SectionHeadDashboard.tsx
packages/admin/src/screens/GradeHeadDashboard.tsx
packages/admin/src/screens/FounderDashboard.tsx
packages/admin/src/screens/PrincipalDashboard.tsx
packages/library/src/screens/LibraryScreen.tsx (+ .web.tsx)
packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx
packages/classroom/src/screens/StudentDashboard.tsx (+ .web.tsx)
packages/classroom/src/screens/TeacherClassroomDashboard.tsx
```

Ten call sites across four different pillars all call `useRegisterFAB()`
or `useFAB()`, each believing they're configuring a visible floating
button for their screen.

**`FABProvider` itself renders nothing** — by design, it's pure state:
`return <FABContext value={value}>{children}</FABContext>`. Something
else is meant to read that shared state and render the actual button.
That something is `LotusPetalFAB.tsx` — a real, complete, 413-line
component that correctly calls `useFAB()` and reads `globalState` from
it (confirmed at line 134, so it's not a guess that this is the intended
renderer). It's exported from the package barrel
(`components/index.ts`).

**Grepped the entire codebase for `<LotusPetalFAB` — zero matches.
It is never mounted anywhere.** Not in `_layout.tsx`, not in any tab
screen, not anywhere. The one component built to visually consume this
widely-shared context does not appear in a single JSX tree in the app.

**The result:** ten screens across Admin, Library, Classroom, and
Student surfaces configure floating-button actions that, as far as
static analysis can determine, never appear on screen for any user, on
either platform. This isn't a small silent-failure — it's an entire
planned interaction paradigm (a persistent floating quick-actions
button, present in the architecture, present in ten call sites, present
as a fully-built component) with the one connecting piece missing. It's
the same "built correctly, never wired in" shape as `xstate`,
`useWorkspaceLayoutSync`, and the dead `useAppLifecycle` hooks from
earlier passes — but those were unused utilities. This is unused **UI**
that many other screens were actively written to depend on.

### Menu system — checked end-to-end, genuinely fine

Given the FAB result, I didn't want to assume any chrome piece works
without checking consumption all the way through. The dropdown/context
menu system does check out: `native-menu/index.tsx` (a Zeego wrapper)
→ consumed by `LotusDropdown.tsx` → consumed by
`packages/admin/src/screens/principal/LogbookDashboard.tsx`. Alive,
correctly threaded, no gaps.

### "Assistive touch" — the closest match is the Mascot, and it's contextual, not persistent

No component named anything like "AssistiveTouch" exists in this
codebase — worth saying plainly rather than guessing at a match. The
closest concept is the **Firefly Mascot** system
(`Mascot.tsx`/`FireflyMascot.tsx`/`MascotPod.tsx`, with a real state
machine and genuine test coverage — contract tests, integration tests,
state-machine tests). Unlike the FAB, **this one is confirmed mounted**
— in `WelcomeScreen.tsx` (onboarding) and via `BrandPulse.tsx`, which
appeared earlier in this document as the loading indicator inside
`ClaimInviteModal`. So it's real and alive, but scoped to onboarding and
as a branded loading spinner — not a persistent, app-wide floating
helper the way iOS's AssistiveTouch is. If a persistent floating
guide/helper is something you intended, it doesn't currently exist;
if the Mascot's current scope (welcome + loading moments) is what you
meant, that part is working correctly.

### Bottom tab bar — one lower-confidence flag, stated with appropriate uncertainty

`app/(tabs)/_layout.tsx` has two adjacent `useEffect`s with different
care levels for platform safety:

```js
useEffect(() => {
  if (typeof document === 'undefined') return;   // correctly guards a web-only global
  document.title = `Gurudevi · ${title}`;
}, [title]);

useEffect(() => {
  // ...
  const timer = window.setTimeout(() => { ... }, 0);   // no guard at all
  return () => window.clearTimeout(timer);
}, [newAchievements, showCelebration]);
```

Unlike the `alert()` finding in the Classroom pass — where I confirmed
zero polyfill and RN's well-established lack of a native `alert` —
`window` is commonly aliased to the global object in React Native's
default Metro setup, so this may well be completely safe. I'm not
confident enough to call this a bug the way `alert()` was. Flagging it
because the *inconsistency* is real and checkable (one effect in this
exact file guards a web-only global three lines above one that doesn't),
and because this specific effect gates the achievement-celebration
animation — worth a five-minute manual check on a real native build
rather than trusting either my confidence or the absence of a crash
report so far.

### Header — checked, no findings

`GlobalHeader.tsx`/`GlobalHeader.web.tsx` have no async actions or catch
blocks of their own — correctly presentational, delegating navigation
and content to what's passed in. Consistent with the correctly-thin
presentational components credited in earlier passes.

---

## A note on rigor, and Pass 10: tracing one flow all the way into the database

Fair pushback: every pass to this point audited *whether a failure gets
reported* — catch blocks, toasts, alerts. That's real, but it's one
slice of "functional," and it stops at the frontend. It never once
checked whether the underlying logic or data model is actually correct,
and never followed a call past the API client into what it actually
writes. Doing that properly, on the Gradebook save flagged back in the
Classroom pass, immediately surfaced something that "is there a catch
block" would never find.

### The full trace, hop by hop, each one read from source

```
GradebookScreen.tsx: handleSaveGrade()
  → useGradebook.ts: submitGrade (= handleSave)
    → EducationalManager.ts: grading.submitGrade(studentId, classroomId, marks, assignmentId, feedback)
      → gradingRepository.ts: upsertGrade(input)
        → supabase.from('student_grades').upsert(input)
```

**The live Gradebook feature — the one teachers actually use — writes
directly to a Supabase table called `student_grades`, keyed by
`classroom_id`, via the JS client SDK.** Confirmed by reading the actual
`.upsert()` call, not inferred.

### Why that's a real problem, not just an observation

Separately, `packages/core/src/api/handlers/grading.ts` — the **legacy
HTTP boundary** for grading — has every one of its methods
(`submitGrade`, `publishGrade`, `getReportCard`, `getClassroomGrades`,
`getGradingSettings`) explicitly return HTTP 410 Gone. The comment
above it is unambiguous about why:

> *"Grading is now served by Sanctuary's lifecycle-aware oRPC router.
> This export remains only so old package imports fail explicitly at
> runtime rather than silently writing to the retired
> `grades`/`classroom_id` model."*

**That is a precise, verbatim description of the exact table and key
the live Gradebook path writes to right now.** The team retired the HTTP
route specifically to stop anyone writing to the `grades`/`classroom_id`
model — and built a loud, explicit 410 failure to guarantee it — but the
direct-Supabase-write path used by the actual running Gradebook feature
goes around that safeguard entirely, because it was never an HTTP call
to begin with. The 410 protects one door into a room that has a second,
unlocked door standing right next to it.

Meanwhile, the *replacement* system — `GradeMark`, reached via
`orpcClient.grading.submitGrade`/`recordAcademicMark`, requiring a full
academic lifecycle context (`schoolId`, `academicCycleId`,
`gradeClassId`, `termId`, `subjectId`) — is what report cards actually
read from (`fetchStudentReport` calls `orpcClient.grading.getReportCard`,
confirmed by reading it). These are two structurally separate systems,
with no code found connecting them.

**The honest, appropriately-hedged conclusion:** I can confirm with
certainty that (a) the live Gradebook writes to `student_grades`, (b)
the codebase's own comments call that exact model retired, and (c)
report cards read from a completely different, separately-populated
system. I cannot confirm from static reading alone whether some other
process reconciles the two — a backend job, a database trigger, a sync
step I haven't found. But nothing in the application code does it, and
the explicit retirement language makes "nothing reconciles them" the
more likely reading, not the less likely one. **If that reading is
right, a teacher can enter a grade in the app's actual Gradebook,
have it save successfully, and have it never appear on that student's
formal report card** — a far more serious problem than the false-success
UI bug already flagged on this same screen, and one that no amount of
adding a toast would fix, because the save genuinely succeeds; it just
succeeds into the wrong system.

### What this means for the rest of this document

Every earlier pass should be read as **layer-of-feedback verified**, not
**business-logic verified**. The findings stand — the toasts and catches
either exist or they don't, and that was checked by reading real code —
but "no findings" in the positive/exemplary sections of Passes 1–9 means
"the feedback layer looked right," not "I traced this feature's data all
the way to its table and confirmed it goes where it should." Those are
different claims, and I was not clear enough about that distinction
until this pass forced it. Worth deciding whether to re-run any of the
earlier "exemplary" findings — particularly anything else touching
grades, attendance, or academic records — through this same full-stack
trace before trusting them at this deeper level.

## Pass 11: Temporal/Sequential Flow, Kept Separate From Data Flow

Pass 10 was a **data-flow** trace — where does the data actually land,
independent of timing. This is the other axis: the **order and timing**
operations happen in, independent of which table or model they touch.
Same rigor, different question. Traced on the logout sequence, since
Pass 7 already established what each step does — this asks what order
they run in and what happens if that order meets a failure partway
through.

### The exact sequence, numbered from the code's own comments

`AuthManager.signOut()`:

```js
async signOut() {
  // 2. Platform-specific teardown (PowerSync, etc.)
  if (this.config.onSignOut) {
    try { await this.config.onSignOut(); }
    catch (e) { console.warn('[AuthManager] onSignOut hook failed', e); }
  }

  // 3. Clear storage
  if (this.config.storage) {
    try { this.config.storage.clearAll(); }
    catch (e) { console.warn('[AuthManager] storage clearing failed', e); }
  }

  // 4. Server-side sign out
  await this.recordAuthMethodUsage('AUTH_SIGN_OUT', { method: 'session', outcome: 'success' });
  await this.authPort.signOut();
}
```

Read purely for sequence, not destination:

1. **Disconnect PowerSync** — errors swallowed, only warned.
2. **Wipe MMKV storage entirely** — errors swallowed, only warned.
3. **Write an audit log entry that says `outcome: 'success'`** —
   written *before* the next line even runs.
4. **Only now, last, call the actual network sign-out** — the one step
   with a real failure mode (offline, Supabase unreachable, expired
   token) — and it is the *only* one of the four not wrapped in its own
   try/catch inside this function.

### The finding: the irreversible steps run before the one that can fail, with no rollback

If step 4 throws — the device is offline, or Supabase is briefly
unreachable — steps 1 and 2 have **already destroyed local state
unconditionally**, and step 3's audit log has **already recorded success,
which is now provably false.** There is no reordering, no rollback, no
compensating action anywhere in this function. The exception does
propagate (confirmed in Pass 7's traced chain, `confirmLogout()` catches
it and shows a toast) — but by the time the user sees "Could not log
out," their MMKV storage and PowerSync connection are already gone. The
one operation that determines whether the *server* thinks the session
ended is the last and least protected step in a sequence of otherwise
unconditional, already-committed actions.

**This is a pure sequencing bug.** It has nothing to do with which table
anything writes to (Pass 10's axis) and everything to do with the order
four steps run in and the absence of a rollback path when the last one
fails. The fix isn't "write to the right table" — it's "attempt the
step that can fail first, or make the earlier steps reversible until it
succeeds."

### Practical consequence, stated at the right confidence level

I can confirm with certainty the order these four steps run in, that
three of the four swallow their own errors, and that the audit log
writes "success" before the network call it's describing has happened.
I can't confirm from static reading how often step 4 actually fails in
practice — that's a runtime frequency question, not a code-reading one.
But the sequence itself has no failure-handling path for "steps 1–3
succeeded, step 4 didn't," and that gap exists independent of any
question about data models or destinations.

### A second temporal trace — where the first hypothesis didn't survive contact with the render logic, and what actually held up instead

Went back to `app/_layout.tsx`'s boot sequence, as flagged. Cold-start
biometric lock looked like a strong candidate: the splash-hide effect
and the biometric-lock effect are both independent, uncoordinated
effects with no dependency on each other —

```js
// Splash hide — [] deps, runs on next animation frame, no gating at all
useEffect(() => scheduleNativeSplashHandoff({
  requestFrame: requestAnimationFrame,
  hide: () => SplashScreen.hideAsync(),
  ...
}), []);
```

— and `nativeSplashHandoff.ts`'s own doc comment confirms this is
deliberate: *"Scheduling on the next frame guarantees that hiding
cannot reveal an unpainted root view, while **deliberately keeping auth
and remote work out of the decision**."* That's an intentional design
choice, not an oversight — the initial hypothesis was that this
deliberate decoupling might let the splash hide before biometric
authentication had even started, briefly exposing real app content
underneath.

**Checking the render logic (not just the effects) shows this doesn't
happen.** `isUnlocked`'s *initial* state is computed synchronously,
before any effect runs:
```js
isUnlocked: Platform.OS === 'web' || !storage.getBoolean('require_biometrics')
```
and the component's render immediately branches on it:
```js
if (!isUnlocked) {
  return ( /* full-screen "App Locked" view */ );
}
```
Because this is a synchronous initial value, not something an effect
sets later, the lock screen is already correct on the very first render
— before the splash even has a chance to hide. **The scarier version of
this finding is wrong, and worth stating plainly rather than keeping the
more dramatic claim**: there's no window where real content is exposed.

**What's still real, once the bigger claim is set aside:** `hasPinCode`
follows the opposite pattern — it's hardcoded `false` in the initial
state and only becomes accurate after an async effect resolves:
```js
useEffect(() => {
  const checkUserPin = async () => {
    if (session?.user?.id) {
      const pinExists = await accountPin.hasPin(session.user.id);
      setHasPinCode(pinExists);
    }
  };
  void checkUserPin();
}, [session?.user?.id]);
```
This effect itself depends on `session?.user?.id` being populated first
— a second async dependency layered on top. The "Enter PIN instead"
button is conditionally rendered on `hasPinCode`:
```js
{hasPinCode && <TouchableOpacity onPress={() => setShowPinUnlock(true)}>
  <Text>Enter PIN instead</Text>
</TouchableOpacity>}
```
**Consequence:** a user who has a PIN configured (as a fallback for when
biometrics fail or aren't set up) sees *only* the "Unlock App"
(biometric) option on the lock screen for a brief, real window on cold
start — the PIN option pops in only after session resolution and the PIN
lookup both complete. Lower stakes than the original hypothesis, but
real and checkable: the button a user needs, specifically as a fallback
when biometrics *aren't working*, is the one most likely to still be
missing in the exact moment they'd reach for it.

**The methodological point worth keeping:** the first hypothesis was
plausible, grounded in real code, and wrong — confirmed wrong by tracing
one more layer (the render branch, not just the effect). The second
finding is smaller than the first would have been, but it's the one that
actually survives the trace. Both are worth recording; only one is worth
believing.

## Pass 12: Re-checking Attendance — Does Gradebook's Problem Generalize?

Pass 10 flagged Attendance as a place worth re-verifying at the data-flow
level, since it was credited as exemplary back in the Classroom pass
under the older, shallower lens. Good news this time — checked both
axes, and the result is a genuine contrast to Gradebook rather than a
repeat of it.

### Data flow: the two write paths agree, unlike Gradebook's

Same tracing method as Pass 10. `AttendanceScreen.tsx` →
`api.attendance.batchRecord` → `EducationalManager` →
`attendanceRepository.batchRecordAttendance` → a direct Supabase client
call: `supabase.from('attendance').upsert(records, ...)`.

Separately, `apps/sanctuary-api`'s Hono handler
(`handlers/operations.ts: batchRecordAttendance`) writes via
`db.attendanceRecord.upsert(...)` — a ZenStack ORM call, a structurally
different code path, the same shape as Gradebook's split.

**The difference: I checked the schema this time before assuming a
split.** `packages/schema/schema.zmodel`:
```
model AttendanceRecord {
  ...
  @@map("attendance")
}
```
The ZenStack model is explicitly mapped to the identical physical table
(`attendance`) the direct-Supabase path also writes to. **Confirmed:
these two paths converge on the same data, unlike Gradebook's
`student_grades` vs. `GradeMark` split.** The pattern that broke
Gradebook — two structurally separate write paths for the same concept —
exists here too, but doesn't produce the same bug, because the schema
was actually kept in sync. Worth stating clearly: this is what "checked
and it's fine" should mean going forward — traced to the table, not
inferred from the code looking tidy.

### Temporal/atomicity: the two paths diverge here instead, on a different axis

The mobile app's path submits the whole batch as one atomic call:
`supabase.from('attendance').upsert(records, { onConflict: ... })` — a
single request, succeeds or fails as a whole.

The backend Hono handler does not:
```js
for (const item of records) {
  const record = await db.attendanceRecord.upsert({ where: { ... }, ... });
  results.push(record);
}
```
A loop of individual upserts, awaited one at a time, with **no
transaction wrapping visible around the loop.** If record 5 of 30 throws
— a bad student ID, a permission check failing mid-loop (the comment
above this function says *"Uses a loop with upserts to ensure ReBAC is
checked per record,"* meaning the per-record check is intentional — but
the atomicity cost of that choice isn't addressed) — records 1 through 4
are already committed, and the rest of the class's attendance for that
day silently never gets recorded, with whatever called this handler
receiving a mid-batch failure.

**This is the reverse pairing from Gradebook:** there, both paths agreed
on ordering/sequencing but disagreed on destination. Here, both paths
agree on destination but have genuinely different atomicity guarantees
for what looks like the same operation. Whether this matters depends on
whether anything besides the mobile app actually calls the Hono batch
endpoint — I didn't find a live caller for it in the mobile app's own
codebase, so this may be a path used by a different client (an admin web
tool, an import script) rather than one real teachers hit through the
app audited so far. Flagging it as a real, verified architectural
inconsistency rather than a confirmed live bug, since I can't see who
else calls it from here.

## Pass 13: The Offline Sync Mechanism Itself — Where Data Flow and Temporal Flow Are Forced Together

This is the piece both earlier axes converge on: PowerSync's local
queue → server upload path. Traced it fully, and it connects directly
back to the Mood check-in gap flagged in the Self pillar pass.

### The upload path itself is genuinely excellent — stated first, because it's true

`SupabasePowerSyncConnector.uploadData()` (client) and
`applyPowerSyncBatch()` (server, in `packages/core/src/api/handlers/sync.ts`)
are some of the best-engineered code in this entire audit:

- The client pulls up to 200 pending mutations, attaches a real
  idempotency key, and uploads with exponential-backoff retry (the
  `effect` library, 2 retries).
- The client explicitly checks whether the active account changed
  mid-upload (`getActiveAccountId() !== expectedAccountId`) and aborts
  rather than uploading under the wrong identity — directly relevant to
  Pass 7's multi-account findings, and done correctly here.
- The server wraps the **entire batch in one database transaction**
  (`db.$transaction`), with a durable idempotency ledger
  (`powersync_idempotency_keys`, row-locked with `FOR UPDATE`) that
  detects key-reuse-with-different-payload and safely replays
  already-completed batches instead of reprocessing them. This is
  correct, careful, all-or-nothing batch handling — the opposite of the
  Attendance handler's unprotected loop in Pass 12.

### The gap: the server only recognizes four tables, and the client's local schema has at least fifteen

The server's table-to-model map, in full:
```js
const tableToModelMap: Record<string, string> = {
  bonds: 'bond',
  classroom: 'classroom',
  classroom_student: 'classroomStudent',
  classroom_students: 'classroomStudent',
};
```
The client's local PowerSync schema (`packages/core/src/adapters/powersync/schema.ts`)
defines local, syncable tables including `attendance`, `mood_logs`,
`thought_records`, `learning_reflections`, `students`, `classrooms`,
`school_memberships`, `schools`, `cedar_policies`,
`permission_snapshots`, `policy_version`, `form_templates`,
`form_responses`, `user_preferences`, `user_entitlement_grants`, and
`pricing_manifest` — fifteen-plus tables, of which only the
`bonds`/`classroom` family appears in the server's map.

Inside `applyPowerSyncBatch`, hitting any of the other tables throws:
```js
if (!modelKey) {
  console.warn(`[Sync] No active Prisma model mapping for table: "${table}"`);
  throw new SyncTableError(table);
}
```
**And because this throw happens inside the single `db.$transaction`
wrapping the whole loop, it doesn't just reject the one unrecognized
item — it rolls back every other mutation in that same batch**,
including valid `bonds`/`classroom` changes that happened to be queued
alongside it. The correct all-or-nothing transaction design (credited
above) becomes the mechanism that turns one unmapped table into a
batch-wide failure.

### Confirmed live, not just theoretical: tracing straight back to the Mood check-in bug

Checked whether anything actually writes to one of the unmapped local
tables expecting it to sync up this way, rather than leaving this as a
hypothetical. `packages/self/src/api/wellbeingRepository.ts`'s
`createMoodLog`, on native:
```js
// Zero-latency local SQLite write
await db.insert(moodLogs).values({ id, userId, moodScore: score, mood, note, createdAt });

// Outbox Sync Queue enrollment
const { useMutationQueue } = await import('@repo/core');
await useMutationQueue.getState().addToQueue({ ... });
```
This writes directly to the local `mood_logs` table — one of PowerSync's
own schema-registered tables, meaning PowerSync's own change-tracking
should pick it up automatically for the next `uploadData` call. Checked
the "Outbox Sync Queue" it also enrolls in
(`packages/core/src/lib/sync/useMutationQueue.ts`) to see whether that's
a *separate*, correctly-scoped upload path that might route around this
gap — it isn't. It's a plain Zustand store: `addToQueue`,
`removeFromQueue`, `moveToDeadLetter`, `clearQueue`. No network call, no
processor, anywhere in that file — confirmed by grep for `fetch`/`.post`/
`upload` inside it, and inside `useSyncStatus.ts`, which consumes it.
It's bookkeeping for a "pending sync" UI indicator, not an independent
delivery mechanism.

**So the mood log write goes through PowerSync's own automatic queue —
the same one `uploadData`/`applyPowerSyncBatch` services — and
`mood_logs` is not in the server's map.**

### What this means, stated at the right confidence level

I can confirm with certainty: the table map's exact contents, the
transaction wrapping that turns one bad table into a whole-batch
rollback, and that mood logs write through the exact local mechanism
this batch path serves. I cannot confirm from static reading how often
this actually fires in production — that depends on whether PowerSync's
client SDK perhaps filters which tables it even attempts to upload
(some PowerSync configurations restrict the upload-eligible table set
separately from the schema itself, which I did not find evidence of
here but also could not rule out without the PowerSync client
configuration, which wasn't in the files I traced).

**If it does fire as written:** a teacher's classroom-membership change
and a completely unrelated mood check-in, if queued in the same
upload batch, would both fail together — the mood log because it's
unmapped, the classroom change as collateral damage from the
transaction rollback, with no error surfaced to the user beyond
whatever generic sync-failure state Pass 5 already found the Mood
check-in lacks entirely. This is the point where every earlier
finding — the missing catch in `TeacherSelfView`'s mood handler, the
unlabeled sample-data fallbacks, the account-switch safety net — meets
a single shared mechanism, and that mechanism has a real, specific,
traceable hole in it.

### Closing the one remaining hedge: confirmed there is no fallback delivery path

The finding above had one honest gap: maybe some other process drains
the "Outbox Sync Queue" (`useMutationQueue`) that both `mood_logs` and,
it turns out, `thought_records`/`learning_reflections` all enroll in
after their local write. Checked every consumer of that queue to close
this rather than leave it open.

`packages/core/src/logic/reflection/records.ts` — a shared store
factory explicitly documented as *"Mirror of the `mood_logs` pattern"*,
used by both Self's Reframe feature (`thought_records`) and Classroom's
Learning Reflection (`learning_reflections`) — confirms this is a
deliberate, shared, three-feature-wide architecture, not a one-off:
```js
await db().insertRow(codec.domainToRow(record));   // local PowerSync-tracked write
await enqueueOutbox(saveName, codec.domainToWire(record));  // "outbox" enrollment
return record;   // returns immediately — does NOT call the RPC on this success path
```
The RPC fallback (`deps.rpc.saveThoughtRecord`) only fires if the local
insert itself throws synchronously. On the normal, successful path, the
function returns after only the local write and the "outbox" enqueue —
meaning actual delivery to the server rests entirely on PowerSync's
automatic sync, the exact mechanism traced above.

**Checked every real consumer of `useMutationQueue` to see if any of
them drain and dispatch the queue:**
- `useSyncStatus.ts` — reads `queue.length` only, for a UI counter.
- `useOptimisticMerge.ts` — reads the queue to *speculatively merge
  pending changes into what's displayed on screen*, explicitly for
  showing the user their own change before it's confirmed. Never sends
  anything, never removes an item after using it.
- `useDeviceSecurity.ts` — filters the queue for a count, same as
  `useSyncStatus`.
- `useMutationQueue.ts` itself — `addToQueue`, `removeFromQueue`,
  `moveToDeadLetter`, `clearQueue`. No network call anywhere in the
  file.

**None of them dispatch anything.** The "Outbox Sync Queue" is real, but
it's a UI-optimism mechanism — it makes the screen look right while a
write is pending — not a delivery mechanism with its own retry path.
This closes the earlier hedge: there is no second, independent road
these writes could take to reach the server. PowerSync's own
table-sync is the only road, and it's the one with the mapping gap —
now confirmed for three features (`mood_logs`, `thought_records`,
`learning_reflections`), not just one.

### Bounding the blast radius precisely, rather than leaving it vague

The gap list from the schema had fifteen-plus tables. Not all of them
are actually exposed — only the ones a client writes to locally. Checked
each remaining candidate individually rather than assuming the whole
list is affected:

| Table | Locally written? | At risk from this gap? |
|---|---|---|
| `mood_logs` | Yes — confirmed `db.insert` | **Yes, confirmed** |
| `thought_records` | Yes — confirmed via `records.ts` | **Yes, confirmed** |
| `learning_reflections` | Yes — shares the same store factory | **Yes, confirmed** |
| `form_responses` | **Yes** — `forms.adapter.ts:124`, `db.insert(formResponses).values(...)` | **Yes, confirmed** |
| `permission_snapshots` | No — every consumer only calls `.query.findFirst`, never insert/update | **No** — read-only local cache, never enters the upload queue |
| `attendance` | No, in practice — Pass 12 confirmed the live write path goes through a **direct Supabase client call**, bypassing PowerSync's local-write queue entirely | **No** — a different mechanism protects it, not this one |

**The fourth confirmed table matters more than it might look.** Form
responses are exactly the kind of data with real institutional weight —
permission slips, enrollment forms, feedback surveys. A parent or
teacher who submits a form, has the local insert succeed, and then loses
it to this same unmapped-table gap would have no way of knowing a
consent form or enrollment submission never actually reached the school.

**The bounded, final version of this finding:** this isn't "PowerSync
sync is broken." It's specifically: any feature built on this
particular local-first-write-then-auto-sync pattern, for a table the
server's batch handler doesn't know about, silently can't complete its
round trip — confirmed for four features so far (mood check-ins,
thought records, learning reflections, form submissions), confirmed
*not* to apply to two others that happen to use different mechanisms
(permission snapshots are read-only; attendance bypasses this path
entirely). The fix is narrow and specific: add the missing tables to
`tableToModelMap`, or explain why they're deliberately excluded if that
was intentional.

### Not yet deep-read this pass, Student (honest scope limit)

`BulkStudentCreation.tsx`, `OCRStudentImport.tsx`, `StudentList.tsx`
(teacher/admin-side tools for managing students, not the student's own
experience) and `StudentAnalysisModal.tsx` in Library were not read this
pass — they're about students rather than for them, so lower priority
for a "Student role" dive specifically, but still open for a future
pass.


## Pass 14: Admin — Full Role Dive

Closing the biggest gap named in the stock-take: Teacher and Student got
full dives (Passes 4–5), Admin had only been touched incidentally (the
two principal-dashboard fake-data bugs from early in this document).
Covers Founder, Admin, and Principal surfaces — 135 files in the
package; triaged broadly, read the highest-stakes handlers in full.

### Correction: "mostly clean" was premature — a full-package sweep found what the first pass missed

The first version of this pass checked four hand-picked files and
called the result mostly clean. That was too fast, and checking it
properly — sweeping the *entire* package for the same bug classes found
elsewhere, not just re-reading my own picks — turned up something real
within minutes. Worth stating plainly: "I checked four files and they
were fine" is a much weaker claim than "I checked the package," and I
let the two blur together the first time.

### The real finding: deleting an academic cycle has no confirmation step on native, and the code admits it

`AcademicCycleManager.tsx`'s delete flow branches by platform:
```js
const handleDelete = (cycleId: string) => {
  if (Platform.OS === 'web') {
    if (window.confirm('Are you sure you want to delete this academic cycle?')) {
      void executeDelete(cycleId);
    }
  } else {
    // For Zero-Legacy native, we should ideally use a Sanctuary dialog
    // but to remove the RN import while keeping functionality, we'll use
    // a simple confirm fallback if available or assume it's safe to
    // delete for now if we can't easily show a modal here. Actually,
    // we'll just execute it for now to stay within Zero-Legacy UI but
    // we should add a toast.
    void executeDelete(cycleId);
  }
};
```
On web, deleting requires an explicit confirmation. **On native/Android,
tapping delete deletes immediately — no confirmation dialog at all** —
and the comment trail is unusually candid that this is a known,
unfinished shortcut, not an oversight nobody noticed. `executeDelete`
itself has correct success/error toasts, which is exactly why my first
pass's toast-counting triage missed this: the *outcome* is reported
correctly, but the *step meant to prevent the accident in the first
place* is the one that's missing, and only on one platform.

**Why this is more serious than most findings in this document:**
academic cycles are the foundational setup step for the entire
`GradeMark`/report-card system credited earlier in this same pass. A
single accidental tap on a school's admin's phone — no confirmation, no
undo mentioned anywhere in this file — removes the structure report
cards are built on for that cycle. Checked whether this pattern repeats
elsewhere in the package (searched for the same "Zero-Legacy" comment
and for other `window.confirm`-branching functions): it doesn't appear
to — this looks contained to this one screen, not a systemic gap across
Admin, but it's a serious one exactly where it sits.

### A second confirmed bug, and it's a clean contrast case: the same feature exists correctly elsewhere in this same package

`screens/principal/InvitesDashboard.tsx`'s `copyToClipboard`:
```js
if (Platform.OS === 'web') {
  navigator.clipboard.writeText(code).then(() => {
    toast.showToast({ message: 'Copied: Code copied to clipboard', type: 'success' });
  })...
} else {
  // In a real native environment we'd use a clipboard module, but for
  // now we'll just toast
  toast.showToast({ message: 'Copied: Code copied to clipboard', type: 'success' });
}
```
**On native, nothing is copied at all.** The toast fires unconditionally,
claiming success, while no clipboard API is ever called. A principal
taps "copy" on an invite code meaning to paste it into a text or email
to a new teacher, gets told it worked, and pastes... whatever was
already in their clipboard before. This is a clean false-success case,
the same shape as the Gradebook and Voice Journal bugs from much earlier
in this document.

**The contrast makes it sharper:** `InviteManager.tsx`, checked in the
first pass of this same domain, implements the identical feature
correctly —
```js
await coreRuntime.clipboard.setStringAsync(code);
```
a real clipboard write, in the same package, for the same conceptual
action. Two components, one correct, one faking it, sitting in the same
`admin` package — a direct, concrete instance of the "different session,
different result" pattern that's run through this whole document.

### A third item, less certain, worth naming as a lead rather than a conclusion

`PrincipalNotes.tsx`'s `handleDelete` has no confirmation logic in the
function itself — no `window.confirm`, no platform branching, nothing —
it deletes on call and toasts the outcome. Unlike the Academic Cycle
case, I can't confirm this is actually unguarded, because
`onDelete={handleDelete}` is passed down to a row-rendering component I
haven't traced — if that component gates the call behind a swipe
gesture or long-press, that's a reasonable soft-confirmation pattern and
this wouldn't be a bug. Flagging as an open lead, not a finding, because
the honest answer is "I don't know yet," not "this is fine."



The rest of the original pass's positive findings survive the deeper
sweep: no raw `alert()` anywhere in the package, no bare empty `catch`
blocks anywhere. `founderWorkspace.ts`'s mock-stats machinery (which
looked suspicious in the sweep, given `SET_MOCK_STATS` as a real
dispatch action) checked out as genuinely correct demo-mode handling —
only used `if (isDemoMode || isGuest || !schoolId)`, correctly tagged
`is_sample: true`, the same good pattern already credited in earlier
passes for `ClassroomList`/`FounderSchoolDashboard`. Not everything the
sweep flagged was a bug — but the one that was is a real one, and it
would have stood published as "clean" if the pushback hadn't happened.



- **`CreateSchoolModal.tsx`** — the real failure path
  (`catch (err) { setError(message) }`) is genuinely rendered
  (`{error && <Text>{error}</Text>}`, confirmed at the exact line). One
  minor, lower-stakes exception: a secondary sub-step (creating a
  default group alongside the school) only `console.warn`s on failure —
  the school itself still gets created and reported correctly either
  way, so this is a small gap, not a repeat of the false-success pattern
  found elsewhere.
- **`AcademicCycleManager.tsx`** — create, set-current, and delete all
  pair with explicit success/failure toasts. Worth noting because this
  is the admin-side setup step for the `GradeMark` system flagged in
  Pass 10 as where report cards actually come from — confirming that
  system has a real, working setup flow on the admin side, which makes
  the earlier finding (classroom grades never reaching it) sharper, not
  softer: the destination is real and functional, the pipe to it is
  what's missing.
- **`InviteManager.tsx`** — both `handleGenerateCode` and
  `handleCopyCode` use `handleAPIError()` correctly, including the
  deliberate `silent: true` variant paired with a local error display
  rather than a toast — the same considered choice found in
  `GlobalCreateModal.tsx` (Founder's create action), which uses the
  identical pattern independently. Two different files, same
  correct choice, made twice.

### A new bug shape, found by finishing the read: stuck-forever loading state on a "soft" failure

`InstitutionalCalendarSection.tsx` and `PrincipalObservationsSection.tsx`
— different features (calendar events, principal observations),
identical structure, almost certainly the same authoring session:

```js
async function handleSave() {
  dispatch({ type: 'SET_SAVING', isSaving: true });
  try {
    const ok = await staffManagementAPI.createCalendarEvent(...);
    if (ok) {
      dispatch({ type: 'RESET_FORM' });
      await fetchEvents();
    }
    // ← if `ok` is false, nothing happens here at all
  } catch (err) {
    console.error(...);
    dispatch({ type: 'SET_SAVING', isSaving: false });
  }
  // no finally block
}
```
Both this and the Observations file share the exact same shape: `isSaving`
is reset to `false` inside the `catch` block, and inside the success
branch (`if (ok)` / `if (!error)`) via the reset-and-refetch. **But if
the call resolves without throwing and simply returns a falsy/error
result — a "soft" failure rather than a thrown one — neither branch
fires, and `isSaving` is never reset.** The save button or spinner is
stuck in "saving…" indefinitely, with no error, no timeout, and no path
back except leaving the screen. This is a new shape in this document:
every earlier silent-failure finding at least resolved back to an
interactive state; this one can leave the UI permanently stuck on a
failure path nobody has to throw an exception to trigger.

### A fourth confirmed instance of the document's most common bug shape

`AnalyticsDashboardScreen.tsx` — both `loadDashboard` and
`loadLiveMetrics` (the latter polled every 30 seconds via `setInterval`)
catch with `console.error` only. If the poll starts failing silently, an
admin watching a "live" metrics view has no way to know the numbers
they're looking at have simply stopped updating — the display doesn't
distinguish "live and current" from "stale since the last successful
poll." This is the same shape found in Teacher's seven handlers,
Student's two, and now at least three places in Admin — by a wide
margin the single most repeated bug shape in this entire audit, cutting
across every role and pillar checked so far.

### The open lead, resolved — and it's a confirmed bug, worse than the one that started this deeper pass

Traced `PrincipalNotes.tsx`'s `onDelete` down to its actual trigger:
```jsx
<Pressable
  onPress={() => { void onDelete(note.id); }}
  accessibilityLabel="Delete item"
  accessibilityHint="Permanently removes this entry from the log"
>
  <Icon as={X} size="xs" ... />
</Pressable>
```
No swipe gesture, no long-press, no confirmation of any kind — a single
tap on a small "X" icon permanently deletes the note, on every platform.
The developer plainly knew the stakes (the accessibility hint says
*"Permanently removes this entry from the log"*) and still wired it
straight to a bare `onPress`. This is a confirmed bug, not a lead —
and it's arguably worse than the Academic Cycle case, since that one at
least had a real confirmation dialog on web. This one has none anywhere.

### The last two files, read in full — both genuinely clean, one exemplary

Closing out the package's remaining unread files rather than stopping
at three bugs and calling it done:

- **`HierarchyBuilder.tsx`** — every catch (`loadHierarchy`,
  `handleAddSection`, `handleAddGrade`) dispatches a real error message
  into reducer state, and that state is confirmed rendered
  (`{state.error && <Text>{state.error}</Text>}`). No delete actions
  exist in this file, so the confirmation-gap risk doesn't apply here.
  Correct, complete.
- **`PrincipalGovernanceTimeline.tsx`** — the best-built file found in
  this entire Admin pass. Its data-loading effect uses a proper
  `isMounted` cancellation guard (the exact pattern this document's
  useEffect-risk analysis, much earlier, recommended and found largely
  absent elsewhere). Both its load and save paths dispatch specific,
  human-readable error messages, both confirmed rendered. And it
  correctly distinguishes three separate states — loading, error, and
  genuinely-empty — rather than collapsing "failed to load" and
  "nothing here yet" into the same blank view, which is precisely the
  ambiguity flagged as a real problem in the Teacher and Student passes.
  This is what every load-failure handler in this document should look
  like.

### Admin, tallied honestly

Three confirmed bugs (native delete-with-no-confirmation on academic
cycles, a fake clipboard copy, an unconfirmed permanent note-delete on
every platform), one new bug class discovered along the way
(stuck-forever loading state on a soft failure), one more instance of
the document's most common pattern (silent polling failure), and two
files that are genuinely, verifiably exemplary. Not a domain that's
broken throughout — a domain where quality varies file to file, exactly
like every other pillar in this document, which is the opposite of
what the first, too-hasty pass claimed. The original "clean, treat as
reference implementation" framing doesn't survive this: the *specific*
shape found everywhere else — a catch block reporting nothing — mostly
isn't here, but destructive actions with no confirmation and a fake
success state turned out to be Admin's own version of the same
underlying lesson, not an exemption from it.

### One thread left open, honestly

Tried to trace invite acceptance forward to confirm it creates a `Bond`
record (closing the "how does a Bond actually get created" gap named in
the stock-take, tying back to Pass 7's identity model). Searched for
`acceptInvite`/`claimInviteCode`/`redeemInvite` and none of those names
matched — the actual function is named something else I haven't found
yet. Noting this as unresolved rather than letting the search's silence
imply the flow doesn't exist.

### Not read this pass (honest scope limit)

`PrincipalNotes.tsx`'s delete-confirmation question (flagged above as an
open lead), `HierarchyBuilder.tsx` and `PrincipalGovernanceTimeline.tsx`
(checked for destructive-action gaps only, not read in full otherwise),
and the Guardian-role canvas (`useGuardianWorkspaceCanvas.tsx`, 799
lines — discovered living inside the `admin` package rather than
`self`, worth knowing for whenever Parent/Guardian gets its own pass)
remain unread beyond the targeted checks above.
`InstitutionalCalendarSection.tsx`, `PrincipalObservationsSection.tsx`,
`InvitesDashboard.tsx`, and `AnalyticsDashboardScreen.tsx` have now been
read in full — moved from this list after the findings above.
`useAdminWorkspaceCanvas.tsx` and `usePrincipalWorkspaceCanvas.tsx` (794
and 778 lines) were checked and appear correctly
presentational/compositional — no async actions of their own —
consistent with the dynamic dashboard-surface pattern found in
Student's and Self's registries, not confirmed as thoroughly as the
files above.

## Pass 15: Parent/Guardian — Full Role Dive

The last of the four stakeholders you named as non-negotiable, and the
one with the least attention going in. Started with the live dashboard
container rather than triaging broadly first, given how much weight
this role carries — and it produced the most severe findings in this
entire document within the first file read.

### Finding one: the dashboard likely crashes on every render — a genuine ReferenceError, not a hypothesis about timing

`GuardianDashboard.tsx`, the actual live screen mounted at
`app/(tabs)/workspace/guardian.tsx`:
```js
const handleOpenSurface = React.useCallback(
  (surface: GuardianResolvedSurface) => { ... },
  [handleOpenStudentsRoom, handleWorkspaceTarget, navigation, workspaceTargets],
);
```
`navigation` appears exactly once in this file — right here, inside a
dependency array. Checked every import and every declaration in the
file: it is never defined as a prop, a hook result, or an import. This
is a bare reference to an undeclared identifier, in an array literal
that JavaScript evaluates fresh on every render.

**Stated at the right confidence level:** this is the kind of error
TypeScript's compiler normally catches at build time (`Cannot find name
'navigation'`), which makes its presence in checked-in source surprising
— either type-checking isn't fully enforced on this file before ship, or
something I can't see from a static read (an ambient global
declaration, a suppressed check) is masking it. I can't execute the app
to watch it throw. But as the code is written, referencing an
undeclared identifier in a plain array literal is a `ReferenceError` in
standard JavaScript, and there is no evidence in this file that
`navigation` resolves to anything.

### Finding two: even setting the crash aside, almost every distinct action in this dashboard routes to the exact same two screens

Every navigation call in the file, verbatim:
```
router.push('/workspace')      ×6   — workspace-switch (any target role),
                                       opening the students room,
                                       opening a SPECIFIC student
                                       (ignores the studentId/studentName
                                       it was passed), and three of five
                                       dashboard surfaces
router.push('/notifications')  ×4   — the "school feed" surface, the
                                       "upcoming events" surface, and
                                       both notification/event tap handlers
router.push('/community')      ×2
router.push('/library')        ×1
```
**Tapping on a specific child, tapping "attendance watch," tapping
"learning pulse," and switching to any other workspace role all resolve
to the identical, generic `/workspace` route** — not a child-specific
detail view, not a role-specific screen. `handleOpenStudent` receives
`studentId` and `studentName` as parameters and uses neither.

### Finding three: the specific screens this dashboard should be routing to already exist, fully built, and are reachable from nowhere

The Guardian package contains five purpose-built, real screens —
`GuardianStudentDetailScreen.tsx` (119 lines), `GuardianEventsScreen.tsx`
(59), `GuardianNotificationsScreen.tsx` (56),
`GuardianCommunicationBridgeScreen.tsx` (69), `GuardianRoomShell.tsx`
(73). Checked the entire `app/` route tree for any of these five names:
**zero matches.** They are not mounted at any route, not reachable from
the live dashboard's own handlers (confirmed above — everything
collapses to two generic destinations), and not reachable by deep link
since no route exists for them at all.

**This is the FAB finding from Pass 9, at the scale of an entire
stakeholder role.** There, one component was built and never mounted.
Here, a whole tier of purpose-built screens for a core, non-negotiable
stakeholder exists in the codebase and has no path a real parent could
ever take to reach it — every button that should lead there leads
somewhere generic instead.

### What this means, all three findings together

If the `navigation` reference does throw as written, no parent using
this build can open the Guardian workspace at all. If it doesn't throw
— if something resolves it that this file-level read can't see — the
dashboard still can't take a parent to a specific child's page, a
specific event, or the notifications/communication screens actually
built for those purposes, because every one of those taps was wired to
a placeholder destination instead of the real screen sitting right next
to it in the same package. Either reading makes this the most severe
finding in the document: not a missing toast, not a missing
confirmation, but the primary screen for one of your four core
stakeholders either not loading or not being able to go anywhere
specific once it does.

### Not yet read this pass (honest scope limit)

`useGuardianWorkspaceCanvas.tsx` (799 lines, the layout/surface engine
these findings sit on top of), `guardian/repository.ts`,
`guardian/api.ts` (the data layer — not yet checked for the
data-flow-correctness questions raised in Passes 10–13), and the five
unreached screens themselves (not read for their own internal quality,
since the more urgent question was whether they're reachable at all).
Given what the entry point alone produced, these are very likely to
matter — this pass should continue rather than be treated as complete.

### Continuing: the data layer is genuinely real, and the missing piece is confirmed to be the route itself, not just the button

Traced the full chain behind `getGuardianDashboard`:
`guardian/api.ts` → `packages/core/src/api/guardian.ts` →
`guardian.runtime.ts` (`createGuardianServices(createSupabaseGuardianRepository(supabaseClient))`)
→ `guardianRepository.ts`, which runs a real Supabase query joining
`student_guardian_relationships` to `students`. This is not a stub —
it's genuine, working data access, with real permission-shaping logic
on top (`applyGuardianTemporalPolicy(applyGuardianRelationshipPolicy(...))`
in the domain services layer). The data a parent should see is
correctly fetchable.

Then opened one of the five unreached screens,
`GuardianStudentDetailScreen.tsx`, expecting to find out whether it was
even worth reaching. It is:
```js
const { studentId, studentName } = useLocalSearchParams<{
  studentId?: string;
  studentName?: string;
}>();
...
const student = useMemo(
  () => dashboard?.students.find((item) => item.studentId === studentId),
  [dashboard?.students, studentId],
);
```
This screen is built correctly, specifically to be opened via a
parametrized URL (`useLocalSearchParams` is the Expo Router hook for
exactly this) — it finds the right student from real dashboard data and
displays real attendance/grade/assignment stats. It's a good screen.

**And there is no route in `app/` that could ever pass it those
params.** Not just "the dashboard doesn't call it correctly" — there is
no `.../student.tsx` or similar file under the guardian route tree for
`router.push()` to target in the first place. This isn't a wiring
mistake fixable by changing one line in `GuardianDashboard.tsx` — the
destination itself was never given a place to exist in the file-based
router. The component was built expecting a route that was never
created.

### Continuing into the 799-line canvas engine: two corrections and one major new finding

**Correction one, to an early claim in this document:** back near the
start of this audit, `useWorkspaceLayoutSync` was checked for consumers
and found to have none — reported as a fourth instance of "well-built,
never wired in." That was wrong. `useGuardianWorkspaceCanvas.tsx` calls
it directly (`const workspace = useWorkspaceLayoutSync<...>({...})`,
inside `useGuardianWorkspaceLayout`), and `GuardianDashboard.tsx`
genuinely imports and uses that wrapper. The grep that produced the
original claim was run before the `admin` package had been extracted
for searching — a real gap in that earlier check, not a fact about the
code. Correcting the record rather than letting it stand.

**Correction two, narrowing where the navigation bug actually lives:**
`useGuardianWorkspaceCanvasSurfaces` — the function that *defines* each
surface — correctly accepts distinct callbacks for each action
(`onOpenStudent`, `onOpenNotification`, `onOpenEvent`,
`onOpenCommunity`, `onOpenLibrary`). The engine's design is sound; it
expects to be wired to five different destinations. The collapse-to-two-
generic-routes bug found earlier is entirely inside `GuardianDashboard.tsx`'s
*implementation* of those five callbacks, not a flaw in this file. Worth
being precise about which layer actually owns the bug.

**The major new finding, and it wasn't what I was looking for:** while
reading this file's actual copy text, several strings are visibly
broken:
```
title="Guardian, Workspace Canvas"
subtitle={`A, family-school, bridge for ${schoolName || 'your, school'}, arranged as a, shared canvas, with calm, defaults and, safe visibility.`}
emptyMessage="No, guardian surfaces, are available, yet for this workspace."
```
and, worse, in a surface description:
> *"A, family, workspace, should, feel, safe. This, surface, explains,
> that, the, guardian, view, follows, linked, learners, and, avoids,
> unnecessary, institutional, detail."*

Nearly every word comma-separated, reading as visibly garbled text, not
a stylistic choice. **Checked how far this goes — this is not isolated
to Guardian.** The identical pattern appears in `usePrincipalWorkspaceCanvas.tsx`
(146 instances) and `useFounderWorkspaceCanvas.tsx` (170 instances) —
including the exact same broken `emptyMessage` template with only the
role name swapped — and `useAdminWorkspaceCanvas.tsx` (38 instances),
**the very file checked in Pass 14 and reported as "correctly
presentational, no findings."** That was true for the logic; I never
read its copy text closely enough to see this. **It's also present, at
lower density, in `useTeacherDashboardSurfaces.tsx` (6 instances) and
`useStudentDashboardSurfaces.tsx` (3 instances)** — both already read in
the Teacher and Student full-role passes, both called clean at the
time.

**What this looks like, stated as a hypothesis rather than a confirmed
mechanism:** four workspace-canvas files, all following the same
"role + Workspace Canvas" naming and structure, all corrupted in the
same specific way — commas inserted after nearly every word in
sentences that read fine without them. This has the signature of an
automated text pass gone wrong across a batch of near-identical files,
not four separate authors making the same typo independently. I can't
confirm the mechanism from static reading, but the pattern is too
consistent across too many structurally-identical files to be
coincidence.

**Honest scope note this raises for the entire document, not just this
pass:** every earlier "checked and clean" verdict in this audit was
checked for logic — catch blocks, toasts, navigation targets, data
destinations. None of them were re-read specifically for corrupted copy
text the way this one accidentally was. Given it's now confirmed present
in at least two files from completed passes, **it likely exists in
others that were called clean and never re-examined for this
specifically.** This isn't a reason to distrust the logic findings — it's
a reason to treat "no findings" throughout this document as scoped to
what each pass was actually looking for, once again, now for a third
distinct axis (mechanism, feedback, and now surface-text integrity) on
top of the two-layer model this document started with.



A likely-fatal `ReferenceError` in the dashboard's own render path. Even
past that, every distinct action collapsing into two generic
destinations. A real, working data layer underneath. A well-built,
correctly-designed destination screen with genuinely nowhere to be
routed from, because its route was never created. Four findings that
compound into one conclusion: of the four stakeholders you named as
non-negotiable, Parent/Guardian is the one where the gap isn't a bug in
a feature — it's most of the navigational structure for the role never
having been finished, sitting behind a dashboard that may not even load.


