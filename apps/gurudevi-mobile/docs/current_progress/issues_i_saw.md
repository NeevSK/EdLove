this file is for issues i saw while doing manual testing and should complement/integrate with the tasks do in future and update the progress as well)
(other than not mentioned specifically all changes should apply both mobile and web - web related docs @ "/../docs/web")

## 07/03/2026 (latest - [n])
### 11.50 pm
1. global header is still different colors/hieghts in different sectiuons
2. for principalselfview all feature visible for guest users
3. create demo school with whats avaiable in principal dahsboard and integrate into principalschoolview in guest or newuser screens
4. make sure demo classrrom for teacher and students are what actually developed ofr them.(how to check that??
5. integrate wellbeing related features which also added into teacherselfview into principal self view as well.
6. see whether anything have created for sleep tracker - quality and duration, water reminder, guided breathing for all roles and check whether existing screens/componets
7. userpublicprofilescreen is bad where is linktree/social links thing isnt even there.  (privacy, available details/ edit detail/ public view should be sits around same place. now its different buttons different places). i think isssue is i can't remember the exact name of things yet we have done several items regarding profile now they are scattered.
8. UI in global santuries and how groups are listed are feel like very primitive. need premium modern view. related to all chat or other list sections.

### 10.09 am 
1. bottom nav bar should not be blurd or transparent. solid color. 
2. if keyboard appears in any screen bottom nav bar should be collapsed down. (how to make sure it happen in universal way??)
3. need to standardize global header in different screens for different roles seems it has different colors different naming or conventions, different hights
4.  add toggle switch for publicsocilaprofile in profile section in mobile
5. wcag math for text color vs backgroun color and any other standard libs, packages and utils for accessibility
6. responsivenes for andoid apps in tab than mobile???
7. focusing in signup user experience from now. principal, student, teacher


## 7.36 pm 03/03/2026 (latest - [n -1])  

1. version number increase in abb

2. old issues

3. web and moble. horizontal vs vertialr dissonance 

4. all ui in web

5. colors in mobile UI

6. school community and library dont work for real signed up users.

7. founder capabilities (in classrooom need to have both school and platform capabilities), 

8. glass is fucking bad when its transparent or it shoule blur whats in z -1 screen

9. notifications should have tag about where or what kind it is. may be sorting? or small emoji?

10. self screen wiring. 

11. profile screen improvemets

12. UI menu different ways for library in web

13. web side panel close icon and when side bar open and close 
other parts UI should be responsive

14. side bar innovations, notifications in web

15. founder, admin, developer should have functional library content managemt view in library screen.

16. Web only vs mobile only

17. senty source map still not uploading even not catching.

18.Agent Assigning strategy specially for UI tasks where there are lot of files so they might miss either what i said to do or how i said to do or verification. any effective, productive ways.

19. discerning cqpabilities for me - seens somthing i lacks about tech capability, intellegent need to specific tasks. then difference between taks, doing task by task while front loading. 

20. db uuid package - uuid ossd vs gen4 uuid

21. about black in light theme no any bakcgrounds or something can have black or simialr dark colors 

22. google sign in worked in web but name not get synced and profile not get updated in db and still see guest user banner in lot of cases. in every section.

23. in web if user goes to different link it throws 404  saying no index. now it seems only one way to get to any page is through home page.



## i just checked 5.23 pm 02/03/2026 (latest [n-2] 

1. notification issue seems okay but i dont know whether db exists or just notification drawer hardcoded

2. some old fixes aren't there such as teacher sees learning pattern thing in app thats should be gone fore every self veiw.

3. in pulse dahsboard the background of cards are blackish or shomething harsh which is bad and not align with design

4. in community screen now can't see previouly had chips as feed, groups and DMs and under groups it had my groups and discover group - in relevant names

5. there is rectangle in bottom nav bar which is ugly need to remove it. though it said fixed earlier but it same. 

6. global header in teacherclassroom/student classm is lack not aligned with others

7. colors in principleschoolview and demo screens are blackish need to align with design @design retina

8. there are repeated positive intivations in student classrom and need to add only one at lower. remove other one



## 2.10 pm 02/03/2026 (latest [n-3] - ignore older ones yet they are persistent thoguh they marked as closed. )

1. Brought this up from old ones. 
 1.1 given we have dms and group msgs in group-community section can we abstract screens related both and then import? is that how we do things now?  DRY rule (if we do this seems DMs also easily functionable than waiting. but i dont knw. any thoughts? whats best)
1.2 need to check whether we have wired all related screens from creating groups, groups in my sacntuary or whatever where indivdual is member section and then going inside a group i think it should show chat screen? then group into title bar and after chicking it it brings to group group qr, group info and members etc. where 0wners /admins have member ma as well. these are few thing yet i m just telling. we need to see whether what we have created have wired well, anything abondened and what elseneed to habe fully functional whatspp or telegram like group.  
1.3 creating groups in discovers section should be abale to create groups and generate qr fro group as well and then through qr or group link group should be sharable other than that if that group is public one it should appear in discover groups section. then new users need to requrest to join and admin or ownser should approve. invite or link only groups (private groups) doesnt need to appear in discover groups section.  if we did absration as per 6 seems DMs also easily functionable than waiting. but i dont knw. any thoughts?
1.4 users can see old msgs, delete own while admin can delete others. currectly chat may be thread based or not? need to check.

2. notifications in notification drawer are still hardcoded. need to make dynamic. 

3. after completing onbaordig joureny though i pressed google mail button get unpressable and db db error. 
3.1when new unsigned user comes user should see the signup part in auth screen. now it shows login part of auth screen which may confuse user.
3.2 google account selection should appear. its not apreaded after clicking google mail button.
3.3 i tried to signup using google and then clicked continue as guest and saw these in console.
 ERROR  Error completing onboarding: {"code": "42501", "details": null, "hint": null, "message": "new row violates row-level security policy for table \"users\""}"

 4. Db schema seems not synced. there are few master baslines docs and some migrations are not applied and i have no clue how to deal with all files/misgrations and what needed to make app functional. its like form beginning lot migrations files have created but masterbasline dated at28/02/2026 seems missed some of older things and also newer things.

## 12.40pm 02/03/2026 (closed)
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




## 6.00 pm 28/02/2026 (closed)
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
