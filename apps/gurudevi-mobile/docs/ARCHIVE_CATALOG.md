# Archive Catalog

The former `apps/gurudevi-mobile/archives/` folder (removed from tracking on 2026-08-24)
held ~28,000 lines of retired screens and modules kept as an **idea bank**. This page is
the map: what each area was, why it was retired, and which capabilities are worth mining
when building the real thing.

> **Recovering actual code:** every file remains in git history.
> `git log --all --oneline -- "apps/gurudevi-mobile/archives/<path>"` then
> `git show <commit>:apps/gurudevi-mobile/archives/<path>` — or browse the pre-removal
> tree. A local mirror also lives at `C:\projects\gurudevi-attic\`.

| Area | Lines | What it was | Worth mining for |
|---|---:|---|---|
| `classroom/` | 12,015 | Pre-`@repo/classroom` monolith era: principal dashboards (PulseDashboard, MorningSituationalBrief, CurriculumPulse, HierarchyBuilder, ManagementStation, InviteManager), founder/grade-head/section-head dashboards, attendance, gradebook, timetable web screens | Principal cockpit concepts (situational brief, institutional calendar, resource-needs dashboard); role-scoped dashboard layouts (founder vs grade-head vs section-head); academic-cycle manager |
| `screens/` | 3,672 | Oldest flat-screen generation (ClassroomScreen, CommunityScreen, TrubeLabScreen.archive…) superseded by domain folders | TrubeLabScreen shows how trube-art canvases were embedded in a product surface (relevant now that trube-art is its own repo) |
| `onboarding/` | 2,522 | Welcome / invite-code / invitation-welcome flows before the PDPA-era redesign | Invite-code entry UX and invitation deep-link handling patterns |
| `auth/` | 1,425 | Old AuthScreen (native + web variants) prior to current auth stack | Web/native split-screen layout conventions used across the old UI |
| `profile/` | 1,394 | FullProfileScreen, ProfileScreen (+web), **ThuthimalClaimScreen** | Thuthimal gift-claim flow: QR-triggered one-time token claim that upgrades a user to Pro with celebration UX — reusable for any gift/voucher/redeem feature |
| `settings/` | 1,227 | AppSettingsScreen (native + web) | Settings information architecture before domain-package split |
| `navigation/` | 980 | TabNavigator pair from the react-navigation tab era | Tab structure decisions that carried into expo-router routes |
| `people/` | 911 | Old package-shaped people module: staff API/types (StaffPresenceSummary, StudentAttendancePulse, TeacherCarouselItem), presence widgets | Staff-presence pulse widget design; staff leave DTO shapes |
| `navigation-legacy/` | 792 | Per-domain stack navigators (Classroom, Community, Founder, Guardian, Library, Principal, Profile, Self) + `useAppEntryGate`, `navigationRef` | Entry-gate logic (public-root route sets, session gating); role-based navigator composition map — useful as a route-inventory reference when designing expo-router guards |
| `packages/` | 532 | Archived copies of `scanner-kit` QR code (QRBuilder/QRPayload/QRResolver) | Historical QR payload format evolution |
| `ai/` | 690 | AIAssistantScreen (native + web) before `@repo/ai` existed | Assistant conversation UI patterns |
| `community/` | 381 | Re-export shims to `@repo/community` (proves this folder predates the package extraction) | Nothing — shims only; live code is in `packages/community` |
| `misc/` | 355 | NotificationsScreen (web), QRHandlerScreen, SelfScreen (+web) | QRHandler routing/dispatch table for scanned payload types |
| `library/` | 21 | Re-export shims to the library package | Nothing — shims only |
| `components/` | 58 | TrubeBackdrop.archive.tsx | Example of wrapping trube-art backdrop in RN surfaces |

Root files:

- `App.legacy.tsx` (~500 lines) — pre-expo-router root component: polyfills,
  CSS interop setup, legacy provider stack. Reference for how providers were ordered.
- `multiAccountDraft.archive.ts` (~300 lines) — multi-account identity draft
  (AsyncStorage + SecureStore + zustand persist + react-query cache swap). The most
  complete multi-account-switching design in the repo's history — mine if/when
  multi-account ships for real.
- `metro.config.backup.js` — older metro config snapshot. Superseded by live config.
