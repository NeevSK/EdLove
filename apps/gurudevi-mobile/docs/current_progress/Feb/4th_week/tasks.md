---
title: "Week 4 Task Checklist (Feb 25, 2026)"
status: "active"
created: 2026-02-25
updated: 2026-03-20
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# Week 4 Task Checklist (Feb 25, 2026)

## 📋 Implementation Plans

Reference detailed implementation plans before starting work:

- **Profile Completion System** (Tasks 2.1.5, 2.2.2, 2.2.3):
  - 📘 Design: `docs/plans/2026-02-25-profile-completion-system-design.md`
  - 📗 Implementation: `docs/plans/2026-02-25-profile-completion-implementation.md` (9 tasks: SSOT manifest, hooks, components, UI updates, avatar upload, celebration)
  - Status: ✅ **In Progress** (execute in separate session with `superpowers:executing-plans`)

- **Living Theme System** (Completed Week 3):
  - 📘 Design: `docs/plans/2026-02-24-living-theme-system-design.md`
  - 📗 Implementation: `docs/plans/2026-02-24-living-theme-system-impl.md`
  - Status: ✅ **Complete** (Living tokens, 6-phase matrix, `useTheme()` hook, feature flags)

- **Week 4 Master Plan** (All remaining tasks):
  - 📗 Full Plan: `docs/plans/2026-02-25-week4-master-implementation-plan.md` (1782 lines, 66 KB)
  - Execution order: P0 (bugs) → P1-P8 (features, polish, infra)
  - Status: 📋 Reference for prioritized execution across all domains

---

## ✅ Task Checklist

1. need to map features/funtions/componets for each role to self and community section. 

2. in profile screen for all roles: 
    2.0 All UI should resposive and aligned with themes and no hardcoding of colors, texts, sizes, padding etc
    2.1 ID card
     ✔️   2.1.1 role in id card should reflect the real userrole now it seems hardcoded as teacher 
     ✔️   2.1.2 remove view, edit profile button from id card
     ✔️  2.1.3 add View/Edit profile button below(outside of ID in the screen of profile screen) ID card. which should bring slowly the fullprofile screen from down.
     ✔️  2.1.4 in ID card it should shown Name, School and Role of user
    ✔️  2.1.5 make the profile completion tracker and the indicator around avatar dynamically functional with profile details - no hardcoding or simpler way of calculating the percentage.
        ✅ Done: PROFILE_SECTIONS manifest (SSOT), useProfileCompletion hook, SanctuaryProgressBar, AvatarDisplay (tap-to-edit), IdentityCard cleanup, ProfileScreen bar, FullProfileScreen bar+celebration (AchievementUnlockOverlay)

    2.2 Fullprofile view
       ✔️ 2.2.1 in fullprofile view everything should be editable inline(without opening new screens) with a pencil icon for start editing and green tick for success.
       ✔️ 2.2.2 add default avatar for all profiles from icons and it should be visible in every related place such as id card, global header in self view.
        ✅ Done: UserAvatar component in @repo/ui (initials + role-emoji fallback). GlobalHeader self-view uses UserAvatar. IdentityCard uses AvatarDisplay (tap-to-edit).
       ✔️ 2.2.3 when ID card opened in full profile view it should center aligned.
        ✅ Done: FullProfileScreen already wraps IdentityCard in <Center> — confirmed present.

   ✔️  2.3 light background color in components
        ✅ Done: IdentityCard — glassLayer uses Theme.colors.glassHighlight (was hardcoded rgba), editButton padding/borderRadius use Theme tokens, identification badge uses Theme.spacing/corners. AchievementGallery — hardcoded #E67E2240 replaced with Template literal from Theme.colors.sanctuarySaffron. SanctuaryStatsCard — marginBottom:2 → Theme.spacing.xs.
   ✔️  2.4 layout animation or on screen artistic drawing
        ✅ Done: ProfileScreen already has FadeInDown staggered animations on all sections (delays 100–750ms) — confirmed already implemented.
   ✔️  2.5 upper and lower padding of text in the stat and achievement card
        ✅ Done: SanctuaryStatsCard and AchievementGallery both already use Theme.spacing.xl (32px) padding — exceeds requirement. marginBottom:2 fixed to Theme.spacing.xs.
   ✔️  2.6 logout modal aligned with design of app + delete account modal redesign
        ✅ Done: LogoutModal created in @repo/ui — sanctuary-themed, saffron accent, data-safe messaging. ProfileScreen wired to LogoutModal (replaces Alert.alert). DeleteAccountModal updated — hardcoded rgba → Theme token template literals, padding → Theme.spacing.md, school-data-retention message added (task 2.6.1).

✔️ 3. Horizontal chips/carousal, buttons design - DRY accross sections: architect
    ✅ Done: SanctuaryChip, HorizontalChipRow, SanctuaryCarousel in @repo/ui. CommunityScreen chips migrated to HorizontalChipRow (also fixes 10.3.2 VirtualizedList warning).

4. libaray
    4.1 content types: movies, circular, stories, shortnotes,midmaps etc
    4.2 content upload, download, share, save, etc
    4.3 feedback loops or reactions, uptoves etc
    4.4 content sync with permision or when shared in personal library in classroom section for all users in proper way.
    4.5 Need to collect, curate content for library as defaultss


5. community section
    5.1 feed screen
        5.1.1 when posting nudging and afforance for education related things through tags. need at least 1 tag for post to be posted. and should be related to a group

    5.2 groups screen
     ✔️   5.2.1 create group button should be visible to all roles in discover tab
     ✔️   5.2.2 infra for groups including group creation, group details, group members, group posts etc, chat screen etc
     ✔️   5.2.3 cybernetic principals from phylosophy docs
    5.2.4 implement group chat screens, full functionality etc:- architect [whatspp kind]
    5.2.5 repairs for broken feedback loops, nudges and affordances in betweens/all across parents, studnts, teachers, principal

6. Global Header
    6.1 profile avatar and space between text in self section
    6.2 subtext other than heading - needed?

7. Notification Screen
    7.1 real notifications - remove hardcoded
    7.2 

8. Self section
    8.1 default view change
    8.2 mood checker change
    8.3 reorganize

9. Classroom section(analyze exisitng system vs improvements)
    9.1 time table for teachers and students bring from selfscreen
    9.2 notes per classrom for teacers / official journals
    9.3 multi year studentt data support and class changes in every year
    9.4 ocr and files and functionality
    9.5 marking for assignments,assessments and the grading system
    9.6 attendance for class, periods, generalize to principal
    9.7 resources needed for each role
    9.8 linking feedback loop and community groups because interconnected and interelated
    9.9 change default screen content in teacherdashbaord.tsx       
    9.10 admin and letters/report support
    9.11 no blocking in classroomscreen.tsx: show demo and what was there previously. check can find old screen? if guest user nudge to profile creation or play with sample school or classroom; if regisered still need to add nic or index or relevant details check them in background and nudge or redirect to updateprofile with proper info if needed.
    9.12 sclool/classrom creation flow and qr generation, qr join
    9.13 classroom persoanal library vs public library and bidirectional flow

10. Error handling
    10.1 need to handle errors gracefull and proactively everywhere in app
    10.2 error msg should informing and nudging to neccessary actions
    10.3 exisitng errors:
       10.3.1  ERROR  useNavigationState error — 
       ✔️ 10.3.2  ERROR  VirtualizedLists should never be nested inside plain ScrollViews — ✅ Fixed: CommunityScreen chips migrated from ScrollView → HorizontalChipRow (FlatList-backed).

11. QA and testing
    11.1 unit + BDD + E2E
    11.2 accessbility, localization, performance, security

12. CI/CD and Production
    12.1 expo dev build
    12.2 app bundle
    12.3 app store/app gallery submission - closed testing

13. Welcome, Auth
    13.1 UI design for onboarding and auth screen
    13.2 phone nu,ber auth vs email, magic link
    13.3 gms vs huaweims

14. LotuspetalFAB vs FABs per sections

15. Theme,UI, UX, animation, layout, spacing, padding, font sizes, colors, etc
    15.1 

16. Getting user feedback

17. sentry and posthog
