#!/usr/bin/env python3
import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)))); import atlas_paths as _P  # noqa: E402
"""Per-feature layer evidence from graph.json + trace.json + feature_map.yaml -> analysis/evidence.json"""
import os, re, json, fnmatch, yaml, subprocess
R = _P.REPO; A = os.path.dirname(os.path.abspath(__file__))
G = json.load(open(A + "/graph.json")); T = json.load(open(A + "/trace.json")); FM = yaml.safe_load(open(A + "/feature_map.yaml"))
SCREENS = {  # key screen/hook files to test reachability for (feature -> files)
 "school-forest": ["packages/admin/src/screens/SchoolForestScreen.web.tsx"],
 "admin-console": ["packages/admin/src/screens/AdminRoomShell.tsx", "packages/admin/src/screens/AdminAuditLog.tsx", "packages/admin/src/screens/AdminFeatureRegistry.tsx"],
 "grade-section-head-views": ["packages/admin/src/screens/GradeHeadDashboard.tsx", "packages/admin/src/screens/SectionHeadDashboard.tsx"],
 "academic-cycles": ["packages/admin/src/screens/AcademicCycleManager.tsx", "packages/admin/src/components/principal/HierarchyBuilder.tsx"],
 "staff-leave": ["packages/admin/src/components/principal/LeaveApprovalSection.tsx"],
 "founder-dashboard": ["packages/admin/src/screens/FounderDashboard.tsx", "packages/admin/src/bridge/founderWorkspace.ts"],
 "notifications": ["packages/ui/src/screens/NotificationsScreen.tsx", "packages/core/src/hooks/useNotifications.ts"],
 "student-goals": ["packages/classroom/src/workspace/useStudentDashboardSurfaces.tsx"],
 "student-potential": ["packages/library/src/components/modals/StudentAnalysisModal.tsx"],
 "classroom-echoes": ["packages/classroom/src/components/ClassroomEchoSection.tsx"],
 "inventory": ["packages/classroom/src/components/InventoryView.tsx", "packages/admin/src/components/principal/ResourceNeedsDashboard.tsx"],
 "principal-notes": ["packages/admin/src/components/principal/PrincipalNotes.tsx"],
 "presence": ["packages/community/src/hooks/useCommunityPresence.ts"],
 "warm-mirror": ["packages/self/src/hooks/useWellbeingEnrichment.ts"],
 "decision-journal": ["packages/self/src/api/selfFeatureRepository.ts"],
 "longitudinal-profile": ["packages/classroom/src/screens/StudentProfileScreen.tsx"],
 "privacy-ledger": ["packages/self/src/screens/PrivacyLedgerScreen.tsx"],
 "cosmic-map": ["packages/library/src/hooks/useMappingSync.ts", "packages/library/src/hooks/useTopologyPulse.ts"],
 "sacred-missions": ["packages/community/src/api/sacredMissions.ts"],
 "announcements": ["packages/core/src/api/announcements.ts"],
 "accounting": ["packages/accounting/src/ledger.ts", "packages/accounting/src/budgeting.ts"],
 "workforce": ["packages/workforce/src/WorkforceShell.tsx", "apps/gurudevi-mobile/src/screens/WorkforceRoleScreen.tsx"],
 "payments": ["packages/payments/src/plugins/stripe.ts", "packages/payments/src/plugins/payhere.ts", "apps/gurudevi-mobile/src/screens/DemoFeeScreen.tsx"],
 "ai-assistant": ["apps/gurudevi-mobile/src/routes/AIAssistantRouteContent.tsx"],
 "self-wellbeing": ["packages/self/src/api/self.ts", "packages/self/src/components/VoiceJournaling.tsx"],
 "learning-reflections": ["packages/classroom/src/api/learningReflectionRepository.ts"],
 "classroom-core": ["packages/classroom/src/components/ClassroomList.tsx"],
 "gradebook": ["packages/classroom/src/screens/GradebookScreen.tsx", "packages/classroom/src/hooks/useGradebook.ts"],
 "attendance": ["packages/classroom/src/screens/AttendanceScreen.tsx"],
 "assignments": ["packages/classroom/src/workspace/useStudentDashboardSurfaces.tsx"],
 "guardian-workspace": ["packages/admin/src/guardian/useGuardianWorkspaceData.ts"],
 "tracking-history": ["packages/core/src/hooks/useTracking.ts"],
 "durable-agents": ["apps/gurudevi-mobile/src/screens/DurableAgentsScreen.tsx", "apps/gurudevi-mobile/src/lib/inngest.ts"],
 "rewards-energy": ["packages/core/src/hooks/useRewards.ts"],
 "thuthimal": ["packages/profile/src/components/GiveThuthimalModal.tsx", "packages/profile/src/screens/ThuthimalClaimScreen.tsx"],
 "teacher-attendance": [],
 "messaging-router": ["packages/core/src/api/messaging.ts"],
 "tuition-commercial": [],
 "editorial": [],
}
TAB_ROOTS = {"/library", "/workspace", "/self", "/community", "/profile"}
src = lambda p: open(os.path.join(R, p), encoding="utf-8", errors="ignore").read() if os.path.exists(os.path.join(R, p)) else ""
def is_gated(fileline):
    f, l = fileline.split(" ")[0].rsplit(":", 1); lines = src(f).split("\n"); i = int(l) - 1
    ctx = "\n".join(lines[max(0, i - 4): i + 2])
    return bool(re.search(r"isDemoMode|isDemo\(\)|isGuest|EDLOVE_DEMO|__DEV__|isExplorer", ctx))
routes = T["routes"]; ev = {}
for fid, spec in FM.items():
    rfiles = sorted({r for r in routes for pat in spec.get("routes", []) if fnmatch.fnmatchcase(r, pat)})
    e = {"routes": [], "schema": [], "api": [], "client_sites": {}, "screens_reachable": {}, "data": {}}
    for m in spec.get("models", []):
        mm = G["models"].get(m); 
        if mm: e["schema"].append({"model": m, "at": f"packages/schema/schema.zmodel:{mm['line']}", "table": mm["table"], "server_refs": mm["api_refs"][:3], "client_from": mm["client_from_refs"][:3], "powersync": mm["powersync"]})
    procs_filter = set(spec.get("procs", []))
    for rk in spec.get("routers", []):
        p = G["procs"].get(rk)
        if not p: continue
        for name, line in p["procedures"]:
            key = f"{rk}.{name}"
            if procs_filter and key not in procs_filter: continue
            sites = T["sites"].get(key, [])
            kinds = sorted({T["transport"].get(s, "?") for s in sites})
            e["api"].append({"proc": key, "at": f"{p['file']}:{line}", "contract": (T["contract"].get(key) or [None, None, None])[1], "client_sites": sites[:3], "transport": kinds or ["NO-CLIENT"]})
    for r in rfiles:
        i = routes[r]
        own = {k: v for k, v in i["procs_reached"].items() if k.split(".")[0] in spec.get("routers", []) and (not procs_filter or k in procs_filter)}
        mtables = {x["table"] for x in e["schema"]}
        mocks = [m for m in i["mocks"] if not re.search(r"/(test|__tests__|mocks?)/", m)]
        e["routes"].append({"route": r, "url": i["url"], "app": i["app"], "entry_imports": i["imports_direct"][:4],
            "inbound_links": i["inbound_links"][:4], "tab_root": i["url"] in TAB_ROOTS,
            "feature_procs_reached": own, "feature_tables_direct": {t: v for t, v in i["tables"].items() if t in mtables},
            "powersync": i["powersync"][:3], "mock_markers": [{"at": m, "gated": is_gated(m)} for m in mocks][:12], "closure_size": i["closure_size"]})
    for sf in SCREENS.get(fid, []):
        e["screens_reachable"][sf] = {"exists": os.path.exists(os.path.join(R, sf)), "routes": sorted(r for r, i in routes.items() if sf in i["closure_files"])[:6]}
    ev[fid] = e
json.dump(ev, open(A + "/evidence.json", "w"), indent=1)
# compact print
for fid, e in ev.items():
    served = [a["proc"] for a in e["api"] if any("served" in t for t in a["transport"])]
    broken = [a["proc"] for a in e["api"] if a["transport"] and all("NO-SERVER" in t or t == "NO-CLIENT" for t in a["transport"]) and "NO-CLIENT" not in a["transport"]]
    nocl = [a["proc"] for a in e["api"] if a["transport"] == ["NO-CLIENT"]]
    rr = [(x["url"], len(x["inbound_links"]) or ("tab" if x["tab_root"] else 0), len(x["feature_procs_reached"]), len(x["feature_tables_direct"]), bool(x["powersync"]), sum(1 for m in x["mock_markers"] if not m["gated"])) for x in e["routes"]]
    sr = {os.path.basename(k): len(v["routes"]) for k, v in e["screens_reachable"].items()}
    print(f"{fid}: models={len(e['schema'])} api={len(e['api'])} served={len(served)} broken={len(broken)} noclient={len(nocl)} | routes(url,links,procs,tables,ps,ungatedmock)={rr} | screens->routes={sr}")
