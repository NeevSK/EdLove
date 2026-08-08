# Workspace Tab — UI Operationalization

Second of the per-tab docs following `20-self-tab-ui-operationalization.md`'s method. Workspace turns out to be architecturally the most complex tab in the app, confirming the instinct that prompted this — but the complexity isn't where `16`'s original tier assignment assumed it was.

## Real routing: clean, role-based, using the live Bond model

`app/(tabs)/workspace/index.tsx` is a genuine router-level dispatcher (not a component-level switch like Self's), redirecting by `context.activeBond?.capacity`: founder → `/workspace/founder`, principal → `/workspace/principal`, student → `/workspace/classroom/student/[id]`, guardian → `/workspace/guardian`, and teachers/gradeHeads/sectionHeads default to `/workspace/classroom`. **The dispatcher's own comment explicitly names `gradeHeads`/`sectionHeads` as valid roles that should route correctly** — directly touching the "ghost roles" issue already flagged in memory (registered in CASL, reportedly absent from `composer.ts`). Worth checking whether this router's assumption that these roles work is itself accurate, given that prior known issue.

## The real complexity: this isn't a fixed screen, it's a user-configurable dashboard canvas

**This is a genuinely different UI paradigm from anything else found in this entire exploration.** `ClassroomScreen.tsx` renders `ClassroomWorkspaceCanvas`, backed by `useClassroomWorkspaceSurfaces` (generates the available widgets, gated by `can()`/citizenship/pricing_tier), `useClassroomWorkspaceLayout` (persists per-user arrangement), and `useClassroomWorkspaceInsights`. The layout hook exposes `setSurfaceHidden`, `setSurfacePinned`, `setSurfaceZone` — **teachers can hide, pin, and rearrange their own dashboard.** A parallel family exists for students too (`useStudentWorkspaceCanvas`, `useStudentDashboardSurfaces`), and a separate `useTeacherDashboardSurfaces` defines the actual available widgets, including at least: `temporal-context` ("Move with the day"), `primary-actions` ("Begin, invite, or enter"), `support-tools` ("Secondary utilities"), `pulse` ("A quick read before you enter"), `classroom-registry` ("Your classrooms").

**`temporal-context` as a named, first-class surface is a genuinely nice, direct connection to this exploration's whole temporal-architecture thread** — a dedicated widget for "where am I in time" sitting right alongside the primary action surface, not buried as an afterthought.

## This reframes `16`'s Dense-tier assignment — it wasn't wrong, but it was aimed at the wrong problem

`16-agent-ready-spacing-typography-ia.md` assigned Workspace to "Dense tier: max ~4 logical column-groups," reasoning from an assumption of tabular/admin data density. **That's still correct for the actual gradebook/attendance table screens within Workspace, but it doesn't describe the *canvas* screen itself, which is a widget-arrangement problem, not a data-table problem.** These need to be treated as genuinely separate density questions within the same tab, not one rule covering both.

**The real design problem here is sharper than a static chunk-limit, and it's a direct, concrete application of `17`/`18`'s leverage theory:** because the *user* chooses what's pinned, the system can't guarantee the ~4-chunk rule the way Self's fixed accordion structure does automatically. A teacher could pin all five (or more, as surfaces grow) simultaneously, defeating the chunk limit through their own configuration — the guideline alone can't enforce itself here. **This needs a structural, rule-level intervention, not a design suggestion: cap the number of simultaneously-*pinned* surfaces at the chunk limit (~4) in the layout logic itself**, with anything beyond that living in an accessible-but-not-pinned "more" state. This is a rule-level fix (Meadows' structure tier) precisely because a parameter-level fix (just recommending restraint) is exactly the kind of low-leverage intervention `17` already predicts won't hold under real, independent user choices.

## Correction: earlier file-size claim was wrong, and the full render logic, now properly traced

**Correction:** `ClassroomScreen.tsx` is 186 lines, not the 1279 cited elsewhere in this exploration — that figure belongs to `LibraryScreen.tsx` (`25`), conflated in an earlier pass. `ClassroomScreen.tsx`'s real size was already correctly noted as smaller than web at the top of this doc; only a later cross-reference introduced the error.

**The full, real render logic — one component, three states, decided by `classroomData` alone, never by URL params:**
```
if (loading && !classroomData)        → skeleton
if (classroomData && surfaces.length) → ClassroomWorkspaceCanvas (+ 3 modals)
else                                   → ClassroomList (pick-a-classroom)
```

## A real, concrete bug — found only by tracing the navigation tree from an actual tap to its destination

**Tapping a classroom in `ClassroomList` pushes to `/workspace` carrying `classroomId`/`classroomName` as params — and nothing downstream ever reads them.** `/workspace/index.tsx`'s dispatcher redirects purely by `capacity`, discarding all params. Back at `/workspace/classroom`, `ClassroomScreen` decides its render state from `classroomData` (fetched automatically via `useClassroomRoleData`, entirely independent of any param). **For a teacher with more than one classroom, the practical effect: tapping any classroom in the list produces the same result regardless of which one was tapped** — the UI presents a real choice with no actual effect on what renders next.

**Why this went unnoticed, plausibly:** for a single-classroom teacher, there's only one option in the list, so the discarded selection never matters — the bug is invisible until a teacher genuinely has more than one classroom to choose between.

**This is exactly the class of finding that neither job-counting nor spatial reconstruction alone would catch — it required following one specific tap all the way to its actual destination and checking whether the destination consumes what was sent, not just whether it renders successfully.** Worth adding as an explicit step in `27`'s method: for any navigation call carrying params, confirm the destination actually reads them, not just that the destination exists and renders.

## Full navigation tree, from the tab root

```
/workspace (dispatcher — capacity-based redirect only, never reads params)
├── founder    → /workspace/founder
├── principal  → /workspace/principal
├── student    → /workspace/classroom/student/[id]
├── guardian   → /workspace/guardian
└── teacher/gradeHead/sectionHead (default) → /workspace/classroom
     └── ClassroomScreen (one component, three states)
          ├── loading            → skeleton
          ├── has classroomData  → ClassroomWorkspaceCanvas
          │                         ├── surfaces: temporal-context, primary-actions,
          │                         │   support-tools, pulse, classroom-registry
          │                         └── 3 modals: CreateSchool, CreateClassroom, ClaimInvite
          └── no classroomData   → ClassroomList
                                     └── tap → BROKEN: param discarded, lands back
                                         on the same classroomData-driven state
                                         regardless of which classroom was tapped
```

## Teacher's actual surface content, checked directly — real findings, not container-level

Everything above examined the canvas as a container. Applying the skill properly to what a teacher actually sees inside one surface card (`CanvasSurfaceCard.tsx`, the shared wrapper every surface renders through) surfaced real, concrete issues.

**A genuine, severe finding: every card unconditionally shows a raw debug-style footer.** `"Default zone: {surface.defaultZone} • Default order: {surface.defaultOrder}"` renders on every single surface, always, with no conditional gate. This reads exactly like internal development metadata that leaked into production UI, not a considered design choice — a real teacher has no use for their card's raw default-zone assignment or array index printed as literal text.

**This duplicates information already shown elsewhere, worse than a single instance of noise.** The header also carries an "Order {surface.order + 1}" badge — meaning ordering information appears twice on one card, in two different formats, and neither is likely meaningful to an end user, since visual position already conveys order implicitly. **Recommendation: remove the footer's default-zone/default-order line entirely from production UI; reconsider whether the header's Order badge earns its place either, for the same reason.**

**A styling-methodology drift, confirmed directly, not inferred:** this file uses React Native's `StyleSheet.create`, not the `className`/token-based convention used elsewhere in this codebase (e.g., `BaseSelfView.tsx`). Two different styling systems coexisting is the same class of drift already flagged repo-wide in `12`'s governance findings, here showing up at the styling-methodology level rather than the individual-value level.

**A real placeholder state confirms some surfaces may not have live content wired in yet.** The card falls back to a generic "Renderer-ready surface... this shared card can host the package-owned workspace content when a live screen adopts the canvas renderer" message when no `content` prop is supplied — a legitimate, defensively-designed fallback, but worth checking which of the five named surfaces (`temporal-context`, `primary-actions`, `support-tools`, `pulse`, `classroom-registry`) actually render real content today versus this generic placeholder in production.

**Job-count on the full card is dense, even before content:** kicker (zone+owner) + title + subtitle + up to three badges + optional summary + optional snapshot panel (itself a label plus text) + optional metadata pill row + the content itself + optional actions row + the footer above — a genuinely large number of simultaneous regions for one card, several of which (summary vs. snapshot panel, both preview-style text blocks) risk reading as redundant even if conceptually distinct, without a stronger visual differentiation between them.

## The real teacher screen, finally reached — content, not container or wrapper

**Correction to the chain below, made after a sharp catch: the original tracing skipped a real gating layer.** The precise, fully-confirmed chain is:
```
ClassroomScreen.tsx
  → useClassroomWorkspaceSurfaces (gates: teacherGate vs studentGate)
      → teacherGate renders <TeacherDashboard />
          → TeacherDashboard.tsx calls useTeacherDashboardSurfaces()
              → produces the five surfaces described below
```
Everything found about the five surfaces still holds — this correction adds precision, it doesn't overturn the findings. **A genuine, separate orphan was also confirmed in the same pass: `TeacherClassroomDashboard.tsx` has zero real references outside the package's own public exports** — a real legacy/unused-candidate, distinct from the live `TeacherDashboard.tsx`. This exact confusion (two similarly-named files, one live one orphaned, reachable only by tracing one layer deeper than first assumed) is now a standing check in `ui-screen-audit`'s Stage 0.

Everything below traces the actual `content` passed into each of the five named surfaces, in `useTeacherDashboardSurfaces.tsx` — what a teacher genuinely sees and interacts with.

**A validating discovery: each surface's `summary` text is, in effect, a design philosophy statement written directly into the code by the original developer** — *"The first teacher moves. Everything else should support them, not compete with them"* (`primary-actions`); *"Stats support the registry. They should orient you, not become a competing dashboard"* (`pulse`); *"...quieter than the main classroom workflow"* (`support-tools`). **The restraint principle argued for throughout this whole exploration was already the team's own stated intent.** The real, precise diagnosis isn't "nobody thought about this" — it's that execution partially drifted from an intent that was already correct.

**Where execution matches intent, cited as the internal reference:** `primary-actions` (three `QuickAction` buttons: Create Class, Join Class, Scan QR) and `pulse` (two `StatCard`s: Active Classes, Total Students) are both genuinely restrained, matching their own summaries exactly.

**Where execution drifted — concretely, checkably:** `support-tools` states its intent as "quiet" but renders five full buttons (Admin, Library, Principal Echo, My Echoes, Breathing) in a two-column grid — at or past the ~4-chunk limit already established (`03`), with an odd count leaving the fifth unpaired. Two real consolidation candidates: **"Breathing" is a wellness feature that plausibly belongs inside Self, which already owns wellbeing** — a nice cross-domain instinct, but possibly the same scope-creep pattern found elsewhere; and **"Principal Echo"/"My Echoes" could reasonably collapse into one entry point** with an internal distinction rather than two separate buttons. Fixing this can use `primary-actions` and `pulse`, two surfaces over, as the literal in-codebase reference for what "quiet" already looks like when correctly executed.

**Elevated severity on the earlier navigation-param bug:** `classroom-registry`'s content is literally `ClassroomList` — the exact component with the confirmed discarded-`classroomId`-param bug found earlier — and its own summary describes it as *"the main working lane."* This is not a rare, buried screen; it's the teacher's default, most-used daily surface. The earlier fix recommendation stands unchanged, but its priority should be understood as high, not incidental.

## Mobile size reversal — flagged, not fully resolved

`ClassroomScreen.tsx` (mobile, 185 lines) is larger than `ClassroomScreen.web.tsx` (95 lines) — the opposite of the pattern found in Self and Profile, where web was consistently larger. Initial read of the mobile file suggests the extra length is mostly state-handling verbosity (loading skeletons, three modal components, guest-fallback branching) rather than more visible content — meaning this may not actually contradict the "web shows more, given more room" rule, just reflect different code organization. **Not fully verified** — the web file's actual surface composition wasn't traced with the same depth in this pass.

## Open Questions / Not Yet Resolved

- **Highest priority, newly surfaced:** whether the "Default zone/Default order" footer text is genuinely shown to real users in production, or gated behind a dev-only flag not visible in this file — worth confirming before treating this as confirmed-live rather than a real risk
- Which of the five named surfaces currently render real content versus the generic "Renderer-ready surface" placeholder in production
- Whether summary and snapshot-panel are meant to convey genuinely different things, and if so, whether their current near-identical visual treatment communicates that distinction clearly enough

- Full surface inventory — only five named surfaces confirmed; `useTeacherDashboardSurfaces.tsx` likely defines more beyond what was checked
- Whether a pinned-surface cap already exists in `useClassroomWorkspaceLayout.ts` or needs to be added — not verified
- The student, principal, founder, and guardian workspace views — none checked at this depth yet, and the student canvas (`useStudentWorkspaceCanvas`) is a separate, parallel system worth its own pass
- Direct verification of the mobile/web size-reversal explanation above
- Whether the "ghost roles" (`gradeHead`/`sectionHead`) issue actually manifests here, given the router's explicit assumption they route correctly
