import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..")); import atlas_paths as _P  # noqa: E402
"""v5 overlay (terrain/version-hops @ 50fb1b9e): hand-verified attendance rows, dead legacy-facade calls, touched-by-branch flags."""
import json,yaml,re,subprocess,collections,os
A=_P.ATLAS;P=A+"/v2/capabilities.json";S=_P.REPO
d=json.load(open(P));d["capabilities"]=[c for c in d["capabilities"] if c.get("source") not in("manual-v5","facade-v5")];K=d["capabilities"];byid={c["id"]:c for c in K}
T=json.load(open(A+"/analysis/trace.json"))
def files_in(o):return sorted(set(re.findall(r"((?:apps|packages|powersync)/[\w@()\[\]./+-]+?\.(?:tsx?|json|sql|zmodel|yaml))",json.dumps(o))))
log=collections.Counter()
for a in yaml.safe_load(open(A+"/v5/attendance_domain.yaml")):
    fl=files_in(a)
    K.append({"id":a["id"],"kind":"verified-task","source":"manual-v5","feature":"attendance","task":a["task"],"roles":a["roles"],
      "layers":{"schema":"daily_attendance (20260813010000:203)","api":"apps/sanctuary-api/src/core/handlers/attendance.ts","client":{"valid":[],"dead":[]},"routes":{},"code":fl},
      "ui":{"kind":"verified","needed":["screen"],"existing":["screen"] if a["status"] in("LIVE","PARTIAL") else [],"missing":[],"paths":[f for f in fl if f.endswith(".tsx")][:4]},
      "status":a["status"],"confidence":"high","why":"hand-verified v5: "+(a.get("blocker") or a.get("note") or ""),
      "verification":{"method":"manual grep + import trace @50fb1b9e","terms":["getClassroomAttendanceSnapshot","batchRecord","gradeClassId","daily_attendance"],"hits":fl[:10],"verdict":a["status"],"confidence":"high"},
      "evidence":{k:v for k,v in a.items() if k not in("id","task","roles","status")}});log["attendance-rows"]+=1
# dead legacy-facade calls (api.<module>.<method> where the facade object defines no such method)
grp=collections.defaultdict(list)
for x in T.get("facade_missing",[]):grp[x["call"]].append(x["site"])
for call,sites in sorted(grp.items()):
    cid="facade:"+call
    K.append({"id":cid,"kind":"dead-facade-call","source":"facade-v5","feature":{"attendance":"attendance","grading":"gradebook","resources":"lessons-materials","classrooms":"classroom-core","identity":"classroom-core"}.get(call.split(".")[1],"classroom-core"),
      "task":f"UI calls {call}(), which the facade does not define","roles":["teacher","principal"],
      "layers":{"schema":"NA","api":"NA","client":{"valid":[],"dead":sites},"routes":{},"code":[s.rsplit(':',1)[0] for s in sites]},
      "ui":{"kind":"call-site","needed":["screen"],"existing":["screen"],"missing":[],"paths":sorted({s.rsplit(':',1)[0] for s in sites})[:4]},
      "status":"PARTIAL","confidence":"high","why":f"DEAD-CALL: legacy facade has no method {call.split('.')[-1]} (Proxy returns undefined -> TypeError); sites {', '.join(sites[:4])}"});log["dead-facade"]+=1
ov={"school-onboarding:attendance.batchRecord":None}
for c in K:
    if c.get("proc") in("attendance.batchRecord",) and c["status"]=="LIVE":
        c["status"]="PARTIAL";c["why"]="v5 manual: only typed caller apps/gurudevi-web/lib/workspace/attendance.ts:468 sends a legacy classrooms.id as gradeClassId, so the server returns CONFLICT (handlers/attendance.ts:51-56,124-133). The mobile AttendanceScreen call is a dead facade call.";log["batchRecord-downgraded"]+=1
# touched by the 9 branch commits
ch=set(subprocess.run(["git","-C",S,"diff","--name-only","175c036e","50fb1b9e"],capture_output=True,text=True).stdout.split())
def cfiles(c):
    L=c["layers"];fs=set(L.get("routes",{}).keys())|set(c["ui"].get("paths",[]))
    if isinstance(L.get("api"),str):fs.add(L["api"].split(" @ ")[-1].rsplit(":",1)[0])
    cl=L.get("client") or {}
    for s in (cl.get("valid",[])+cl.get("dead",[])):fs.add(s.rsplit(":",1)[0])
    for s in L.get("code",[]) or []:fs.add(s.rsplit(":",1)[0])
    return fs
for c in K:
    if c.get("source")=="doc" and c["status"]=="PLANNED":continue
    if cfiles(c)&ch:c["touched_v5"]=True;log["touched"]+=1
json.dump(d,open(P,"w"),indent=1);print(dict(log))
