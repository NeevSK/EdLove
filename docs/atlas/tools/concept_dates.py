#!/usr/bin/env python3
import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)))); import atlas_paths as _P  # noqa: E402
"""Earliest add on main of any file whose basename (minus ext/platform suffix) matches a feature's concept symbol."""
import subprocess, os, re, json
R=_P.REPO; A=os.path.dirname(os.path.abspath(__file__))
CONCEPT={"library-browse":["LibraryScreen"],"library-curation-review":["CuratorReviewScreen"],"library-tools":["DocumentScanner","OCRScreen"],"cosmic-map":["MapScreen","useMappingSync"],
"self-wellbeing":["SelfScreen","MoodTracker","ThoughtRecord"],"decision-journal":["DecisionJournal"],"learning-reflections":["LearningReflection","learningReflectionRepository"],"daily-wisdom":["DailyContentCard","WisdomSeeds"],
"warm-mirror":["warmMirror","useWellbeingEnrichment"],"privacy-ledger":["PrivacyLedgerScreen"],"community-feed":["CommunityScreen"],"direct-messages":["DirectMessageScreen","ChatScreen"],"presence":["useCommunityPresence","presence"],
"sacred-missions":["sacredMissions","SacredMissions"],"announcements":["announcements"],"classroom-core":["ClassroomScreen","ClassroomList"],"attendance":["AttendanceScreen"],"gradebook":["GradebookScreen"],"assignments":["assignments"],
"student-potential":["studentPotential","StudentAnalysisModal"],"longitudinal-profile":["StudentProfileScreen","longitudinal"],"classroom-echoes":["echo","ClassroomEchoSection"],"inventory":["InventoryView","ResourceNeedsDashboard"],
"principal-workspace":["PrincipalSchoolView","PrincipalDashboard"],"principal-notes":["PrincipalNotes"],"staff-leave":["LeaveApprovalSection","staffManagement"],"academic-cycles":["AcademicCycleManager","CyclesView"],
"school-onboarding":["OnboardingScreen","InvitationWelcomeScreen"],"guardian-workspace":["GuardianDashboard"],"founder-dashboard":["FounderSchoolView","FounderDashboard"],"school-forest":["SchoolForestScreen","schoolForest"],
"admin-console":["AdminDashboard","AdminAuditLog"],"editorial":["editorial"],"form-builder":["FormBuilder","PublicFormScreen"],"thuthimal":["ThuthimalClaimScreen","thuthimal"],"rewards-energy":["useRewards","rewards"],
"payments":["payhere","stripe","DemoFeeScreen"],"accounting":["ledger","budgeting"],"tuition-commercial":["CommercialBatch"],"workforce":["WorkforceShell","WorkforceRoleScreen"],"notifications":["NotificationsScreen"],
"profile":["ProfileScreen"],"ai-assistant":["AIAssistantScreen"],"durable-agents":["DurableAgentsScreen","inngest"],"tracking-history":["useTracking"],"auth-identity":["AuthScreen"],"app-settings":["AppSettingsScreen"],
"lessons-materials":["LessonFeed","lessonRepository"],"classroom-notes":["classroomNotes","ClassroomNotes"],"growth-ripples":["growth.adapter","ImpactRipples"],"calendar-events":["InstitutionalCalendar"],"grade-section-head-views":["GradeHeadView","SectionHeadView"]}
out=subprocess.run(["git","-C",R,"log","origin/main","--diff-filter=A","--name-only","--format=@%h|%ad","--date=format-local:%Y-%m-%d %H:%M"],capture_output=True,text=True,env={**os.environ,"TZ":"Asia/Colombo"}).stdout
first={}; cur=None
for l in out.splitlines():
    if l.startswith("@"): cur=l[1:].split("|"); continue
    if not l.strip() or "node_modules" in l or l.endswith(".md"): continue
    b=re.sub(r"(\.(web|native|ios|android))?\.(tsx?|mjs|js)$","",os.path.basename(l))
    first[b]=(cur[1],cur[0],l)  # log is newest-first, so last write wins = earliest
res={}
for fid,names in CONCEPT.items():
    hits=[first[n] for n in names if n in first]
    if hits: d,s,p=min(hits); res[fid]={"date":d,"sha":s,"path":p}
json.dump(res,open(A+"/concept_dates.json","w"),indent=1); print(len(res))
