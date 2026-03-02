this file is for issues i saw while doing manual testing and should complement/integrate with the tasks do in future and update the progress as well
(changes we do need to apply both webfiles and mobile files if neccessary)

## 12.40pm 02/03/2026
1. ✅ bottom nav bar fixed — removed harsh borderTopWidth rectangle; BlurView now uses Glass Protocol values (≤12 day / 40 dark) via isDark flag. TemporalGlass is the sole visual boundary.

2. ✅ Teacher + Student + Principal SelfViews now default to PulseDashboard (Entry Hall). 'pulse' added as first CORE_FEATURES item; old PrincipalSelfView 'pulse' case renamed 'schoolPulse'. Code duplication noted — BaseSelfLayout extraction is a future architectural task.

3. ✅ Community Hearth presence CORRECTED — students see student count (peer solidarity: "my peers are here"); teachers/section_heads/grade_heads see educator count (professional solidarity: "fellow educators are present"); principals see full school count (oversight). Dual-channel: `presence:self:{role}` (self-tracking) vs `presence:students|educators|school` (watching). `last_seen_at` updated on subscribe.

4. auth nav verified: ProfileScreen, QRHandlerScreen, ThuthimalClaimScreen all navigate('Auth') correctly. WelcomeScreen uses showAuth state flag (not navigate) — working as designed. No change needed.

5. ✅ pnpm lockfile — resolved externally by user.
   ✅ web build fixed — AppContent was missing `return` statement; stray `</GestureHandlerRootView>` removed. Web bundle now passes Metro bundler without adjacent-JSX error (was line 532).

  530 |     </ToastProvider>
  531 |   </SafeAreaProvider>
> 532 |     </GestureHandlerRootView >
      |     ^
  533 |   );
  534 | }
  535 |


6. given we have dms and group msgs in community sections can we abstract screens related both and then import? is that how we do things now?  DRY rule

7. need to check whether we have wired all related things to creating groups in discoverscetion and then within groups. 
8. if we did absration as per 6 seems DMs also easily functionable than waiting. but i dont knw. any thoughts?




## 6.00 pm 28/02/2026
1. ✅ Learning journey banner — no dedicated LearningJourney component bleeds between roles. ClassroomScreen role-gates strictly: principal→PrincipalSchoolView, teacher→TeacherDashboard, student→StudentDashboard. No cross-role banner leakage confirmed.

2. ✅ Global header colors — `GlobalHeader` uses `text.primary`/`text.secondary` from `useTheme()` which maps to current theme tokens. Already themed correctly — no hardcoded colors found.

3. ✅ Modals audit done — CreateClassroomModal, CreateGroupModal, ReportPostModal all use consistent gluestack modal patterns. TeacherAdminWidget admin sheet uses slideup Modal (acceptable). No ugly un-themed modal found. Pattern is already the PositiveInvitation+gluestack baseline.

4. ✅ Screen theme alignment — PositiveInvitation, RoleInitialState, SelfViews all use theme tokens (colors.action, colors.secondary, Theme.colors.sanctuarySaffron). No rogue hardcoded hex found in scoped files.

5. ✅ Principal component placement — PrincipalSchoolView (Classroom tab): school stats, hierarchy builder, invite manager, teacher carousel, student pulse — all correct. PrincipalSelfView: energy forecast, decision journal, mood — all self-care. Boundary is clean.

6. ✅ Library empty description fixed — PositiveInvitation context='library' now reads "A Public Space for Knowledge" + "shared commons" language. The old "Your personal library awaits" / "Save resources... treasury" text is gone.

7. ✅ PulseDashboard default — fixed in 12.40pm entry above.

8. ✅ Principal school demo corrected — RoleInitialState 'principal' case now: title "Establish Your School", CTA "Create My School" → SchoolCreation screen. Demo sample items are school-level: "Preview a Demo School", "School Health Patterns", "Staff Management Guide".

9. ✅ Community group creation UI — GroupsScreen has dashed "Found a New Circle" button in Galaxy sub-tab. CreateGroupModal is wired and fires fetchGroups() on success. Navigation to GroupDetails is live.

10. ✅ Guest community simplification — Guests now see only: CommunityHearth + PositiveInvitation "Your Community Awaits" with "Sign In / Sign Up" CTA → Auth screen. Full feed/tabs/FAB are gated behind isGuest check.
