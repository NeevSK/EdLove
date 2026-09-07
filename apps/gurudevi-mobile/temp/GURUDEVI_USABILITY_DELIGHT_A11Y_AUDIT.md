# Gurudevi Mobile — Usability, Delight, Grace & Accessibility Audit
**A third lens, distinct from the functional two-layer audit — snapshot 2026-08-31**

Everything in `GURUDEVI_TWO_LAYER_AUDIT.md` asks "does it work" and "does
it report what happened." This document asks a different question: is
it *good to use* — intuitive, accessible, warm, low-friction. A feature
can pass every check in the other document and still fail every check
in this one. Starting where you asked: the account lifecycle, auth
through delete. Self and Workspace next.

---

## Auth — the one screen every user passes through

### Accessibility: a real, significant gap

`packages/ui/src/screens/AuthScreen.tsx` — 1,023 lines, the universal
entry point to the entire app — has **zero** `accessibilityLabel`,
`accessibilityHint`, or `accessibilityRole` props anywhere in the file.
For comparison, `ProfileScreen.tsx` (checked directly after) has 22.
This isn't "this codebase doesn't do accessibility" — it's specifically
absent from the single screen every user, sighted or not, has to get
through before anything else in the app is reachable. A screen-reader
user relying on default component semantics rather than explicit labels
is the worst-case scenario for exactly this screen.

### A specified moment of grace that was never actually built

`src/features/auth_refinement.feature` — a BDD behavior spec — describes
a genuinely thoughtful intended experience:
> Given I enter an email that already has an account and press Sign Up,
> the system should detect it, show *"You already have an account!
> Switching to login..."*, automatically switch to Login mode, and keep
> my email in the field.

**This isn't what happens.** The actual code, on the same error path:
```js
const guidedMsg = isSignUp
  ? `${baseMsg}. If you already have an account, try logging in instead.`
  : `${baseMsg}. Please check your credentials and connection.`;
showToast({ message: guidedMsg, type: 'error', duration: 5000 });
```
A generic error toast, no automatic mode switch, no preserved email —
the user has to notice the hint, manually tap to switch modes, and
retype their email from scratch. Someone wrote down the delightful
version of this moment and it didn't make it into the shipped code. The
gap between the spec and the implementation is itself useful
information: it tells you exactly what "done" was supposed to look like
for this flow, which most codebases never write down at all.

### Password guidance: reactive, not proactive

No password-strength indicator, no inline requirements shown while
typing — searched for any strength/requirement UI and found none. If
there are password rules, a user only discovers them after submitting
and getting rejected, rather than being guided as they type. A smaller
gap than the two above, but a real one, and an easy one to close
relative to most findings in the other document.

---

## Account Deletion — the most consequential screen in this flow, and where grace actually shows up

### What's genuinely excellent here

`packages/ui/src/components/DeleteAccountModal.tsx` is one of the
better-designed pieces of UX found across either document. Three things
worth naming specifically:

1. **Honest, specific disclosure of data scope** — it doesn't just say
   "your data will be deleted," it tells the user exactly what's
   retained and why: *"School records (attendance, grades, community
   posts) are retained for institutional integrity and cannot be
   removed by individuals."* Most apps don't bother explaining this
   distinction; getting it wrong (or omitting it) is a common source of
   user distrust and support tickets after the fact.
2. **A genuine, warm off-ramp**, in the exact spot most apps only push
   you toward the destructive action: *"Just need a break? You can sign
   out instead - your sanctuary will be waiting for you."* This is real
   grace — it treats "I'm about to delete my account" as potentially an
   impulse rather than always a considered decision, and offers a
   reversible alternative right where the irreversible one lives. It's
   also genuinely on-brand ("sanctuary will be waiting for you") rather
   than a generic dark-pattern-avoidance checkbox.
3. **Clear irreversibility language**, bolded, not buried in a wall of
   legal text.

This is worth holding up as the standard for tone and grace across the
rest of the app — better copy design than most of what's been found
functioning correctly elsewhere.

### What's missing from the same file

**Zero accessibility props** — same gap as Auth, in the single most
consequential, least-reversible modal in the entire account lifecycle.
Worth noting specifically: the confirm button's label changes
dynamically (`"Delete Permanently"` → `"Processing..."`) with no
`accessibilityLiveRegion` or equivalent announcement — a screen-reader
user has no indication the state changed after tapping. For a modal
whose entire purpose is making sure the user understands the
consequences of what they're about to do, that gap matters more here
than almost anywhere else it could occur.

---

## Pattern forming after just these two screens

Copy, tone, and flow-design grace are handled thoughtfully in at least
one place (Delete Account) and specified-but-unbuilt in another (Auth's
existing-account handling). Accessibility is close to entirely absent
from both of the highest-stakes screens in this lifecycle, while a
different screen in the same lifecycle (Profile) has real coverage. This
mirrors the functional document's throughline exactly, on a different
axis: quality isn't uniform across the app, it's uniform *within
whichever file someone actually finished*.

## Not yet covered in this lifecycle

Sign-out flow itself, onboarding (the screens between signup and first
real use), and the biometric/PIN lock screens from the boot-sequence
work in the other document — not yet checked through this
usability/accessibility lens specifically, only the functional one.
Self and Workspace are next, per your direction, before circling back
to these if useful.

---

## Self — the philosophical core, and a precise split between chrome and content

### The precise shape of the accessibility gap, not a blanket claim

First check looked damning: `TeacherSelfView.tsx`, `FireJournal.tsx`,
`JoyJar.tsx`, `GratitudeGlimmers.tsx`, `MoodLotus.tsx` — the five
components already read in full for the functional audit — all came
back at zero `accessibilityLabel`/`accessibilityHint` props. But the
package-wide count (51 across 72 component files) didn't match a
blanket "Self has none" claim, so I found where the coverage actually
is instead of stopping at the scarier-sounding number.

**It's concentrated in exactly two files: `SelfNavigator.tsx` (7 props)
and `SelfCanvas.tsx`/`SelfCanvas.web.tsx` (6 and 4).** Both are shell/
navigation-chrome components — the wrapper that arranges which feature
cards appear, not the feature cards themselves. **The precise finding:
the navigational structure around the Self pillar is accessible; the
actual reflective content inside it — the mood picker, the journal, the
gratitude and joy entries, the voice recording — is not.** A screen-reader
user could likely navigate *to* the Self tab and move between its
sections, and then find themselves unable to tell what a mood icon
represents, what a journal entry's save button does, or what state a
recording is in.

### A genuine positive, worth crediting on its own axis

Motion sensitivity is handled better than label-based accessibility.
`useAccessibility.ts` and its consumers
(`BreathingLoader`, `CelebrationOverlay`, `PressableScale`,
`SelfNavigator`, `SanctuaryToast`, `BrandPulse`) check the system's
reduced-motion preference and appear to respect it across several of
the app's most animation-heavy components — exactly the ones you'd
want checking this first, given how much this app leans on motion and
haptics for its "care" feel. Two different accessibility dimensions,
two different levels of attention: someone clearly built reduced-motion
support deliberately; screen-reader labeling on feature content reads
like it was never specifically considered.

---

## Workspace — the same gap, now consistent across every role's primary daily screen

Checked the highest-traffic dashboard/shell file for each role already
covered functionally in the other document: `TeacherWorkspaceShell.tsx`,
`TeacherClassroomDashboard.tsx` (927 lines — the single largest file in
either document), `StudentClassroomDashboard.tsx`, and
`GuardianDashboard.tsx`.

**All four: zero accessibility props.** The one exception found across
this entire pass, in either audit, is `AttendanceSheet.tsx` — already
credited in the functional document for its real `accessibilityLabel`/
`accessibilityHint` on its swipe gestures — which now reads less like a
representative example and more like the single outlier proving how
consistent the gap is everywhere else. Also checked for `hitSlop`
(expanding a small tappable icon's actual touch area beyond its visual
bounds — a standard, cheap mobile-usability practice) across all of
these files: zero usages found anywhere in the workspace layer.

**The pattern across this whole document, stated plainly:** navigation
chrome and shell-level components tend to have some accessibility
attention (`SelfNavigator`, `SelfCanvas`); the actual screens people
spend their time in — the dashboards, the reflection tools, the
workspace surfaces — consistently don't. That's a specific, actionable
finding: whatever review or checklist caught the chrome layer never
extended to the content layer, in every role checked so far.

## Not yet covered

Community and Library (already deprioritized in the functional audit),
the onboarding flow, and a deeper look at color-only information (mood
icons, status indicators) for colorblind accessibility specifically —
none checked yet through this lens.



