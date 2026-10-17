import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..")); import atlas_paths as _P  # noqa: E402
import json,yaml,collections,re,os
A=_P.ATLAS;d=json.load(open(A+"/v2/capabilities.json"));K=d["capabilities"];COV=d["coverage"]
INV=json.load(open(A+"/v2/inventory.json"));T=json.load(open(A+"/analysis/trace.json"));RT=T["routes"]
ROLES=["teacher","principal","student","parent","admin","founder"];STS=["LIVE","PARTIAL","UI-UNWIRED","BACKEND-ONLY","LOST","UNVERIFIED","PLANNED"]
# ---- reviews per capability
for c in K:
    L=c["layers"];u=c["ui"]
    adv=[]
    if c.get("proc"):adv.append(f"proc {c['proc']} @ {L['api']}")
    if L.get("client",{}).get("valid"):adv.append(f"{len(L['client']['valid'])} served call site(s), e.g. {L['client']['valid'][0]}")
    if u.get("paths"):adv.append(f"UI: {u['paths'][0]}")
    crit_missing=[f"UI states missing: {u['missing']}"] if u.get("missing") else []
    if L.get("client",{}).get("dead"):crit_missing.append(f"dead REST sites: {L['client']['dead'][:2]}")
    over=[]
    if c["status"]=="LIVE" and c["kind"]=="api" and len(L.get("routes",{}))>5:over.append("reached via a large shared import closure; 'reachable' may overstate a real user entry point")
    if c["kind"]=="direct-supabase" and c["status"]=="LIVE":over.append("LIVE but bypasses sanctuary-api and the privacy ledger")
    if c["kind"]=="user-task(doc)":over.append("doc row dated 2026-03-01; re-verified against HEAD only by named identifiers")
    c["reviews"]={"advocate":"; ".join(adv) or "nothing to claim beyond the inventory row",
      "critic":{"noted":c["why"],"missing":"; ".join(crit_missing) or "-","overemphasized":"; ".join(over) or "-"},
      "hostile":f"{c['status']}: {c['why']}. Static analysis only: closure depth ≤6, UI states by regex on screens along the path."}
# ---- capabilities.yaml
yaml.safe_dump({"meta":{"version":"v5","generated":"2026-10-17","basis":"terrain/version-hops @ 50fb1b9e (9 ahead of main 175c036e)","generator":"v2/inventory.py + v2/capabilities.py + v2/render_v2.py",
  "kinds":{"api":"one user task per sanctuary-api procedure (242/39 routers)","direct-supabase":"client .from()/.rpc() per table × read/write","screen-only":"routes with no API/table","user-task(doc)":"role tasks from section-role-gap-matrix.md (2026-03-01), re-verified","i18n-implied":"unused i18n namespaces","doc-intent":"PLANNED task from the docs sweep (v3/docs_*.py), with provenance","lost-screen":"screens deleted in history (any ref) with no surviving basename"},
  "status_values":"LIVE, PARTIAL, UI-UNWIRED, BACKEND-ONLY, LOST, UNVERIFIED, PLANNED (intended in docs, no matching code; source: doc, with provenance)","status_rules":"api: BACKEND-ONLY=no client site; UI-UNWIRED=client exists but no route closure reaches it, or only non-nav routes; PARTIAL=DEAD-CALL (REST only) or every live route has ungated mock or flag default false or missing table; LIVE=served site reached from nav-reachable route with a clean path."},
  "capabilities":K},open(A+"/capabilities.yaml","w"),sort_keys=False,allow_unicode=True,width=220)
# ---- features.yaml: attach capability ids/counts
FY=yaml.safe_load(open(A+"/features.yaml"))
byf=collections.defaultdict(list)
for c in K:byf[c["feature"]].append(c)
for f in FY["features"]:
    cs=byf.get(f["id"],[]);f["capabilities"]={"count":len(cs),"by_status":dict(collections.Counter(c["status"] for c in cs)),"ids":[c["id"] for c in cs]}
FY["meta"]["version"]="v2";FY["meta"]["capabilities_file"]="capabilities.yaml"
yaml.safe_dump(FY,open(A+"/features.yaml","w"),sort_keys=False,allow_unicode=True,width=200)
# ---- totals
st=collections.Counter(c["status"] for c in K)
rs={r:collections.Counter(c["status"] for c in K if r in c["roles"]) for r in ROLES}
kinds=collections.Counter(c["kind"] for c in K)
KB=[c for c in K if c["status"]!="PLANNED"];uin=sum(len(c["ui"]["needed"]) for c in KB);uie=sum(len(c["ui"]["existing"]) for c in KB);uim=sum(len(c["ui"]["missing"]) for c in KB);npl=sum(1 for c in K if c["status"]=="PLANNED")
api=[c for c in K if c["kind"]=="api"];pw=sum(1 for c in api if c["status"]=="LIVE");pui=sum(1 for c in api if c["layers"]["routes"]);
SC=COV["screens"];scn=len(SC)
wired={p for c in K if c["status"] in("LIVE","PARTIAL") for p in c["ui"].get("paths",[])}
realapi={p for c in K if c["status"]=="LIVE" and c["kind"] in("api","direct-supabase") for p in c["ui"].get("paths",[])}
navP=[r for r in RT if not any(c for c in K if r in c["layers"].get("routes",{}) and c["layers"]["routes"][r].get("nav")=="Y")]
dash=["## Totals dashboard (terrain/version-hops @ 50fb1b9e, static)","",f"**Capabilities: {len(K)}.** "+", ".join(f"{k} {v}" for k,v in kinds.items()),"",
"| status | count |","|---|---|"]+[f"| {s} | {st.get(s,0)} |" for s in STS]+["",
"### By role (a capability can list several roles)","","| role | "+" | ".join(STS)+" | total |","|---|"+"---|"*(len(STS)+1)]+[f"| {r} | "+" | ".join(str(rs[r].get(s,0)) for s in STS)+f" | {sum(rs[r].values())} |" for r in ROLES]+["",
"### UI states / screens","",f"- UI states needed, summed over code-derived capabilities: **{uin}**. Existing: **{uie}**. Missing: **{uim}**. On top of that, {npl} PLANNED doc intents each need at least one screen.",
f"- Screen files (route files plus Screen components across apps/packages): **{scn}**.",
f"  - On the path of a LIVE/PARTIAL capability (wired): **{len(wired&set(SC))}**.",
f"  - Showing real API data (path of a LIVE api/direct capability): **{len(realapi&set(SC))}**.",
f"  - Coverage tiers: "+", ".join(f"{k} {v}" for k,v in collections.Counter(SC.values()).items()),
f"- Procedures: **{len(api)}**. With UI reaching them: **{pui}**. Without UI: **{len(api)-pui}**. LIVE: **{pw}**. BACKEND-ONLY (no client site): **{sum(1 for c in api if c['status']=='BACKEND-ONLY')}**. DEAD-CALL: **{sum(1 for c in api if 'DEAD' in c['why'])}**.",
"",
"### Coverage proof (every inventory item maps to ≥1 capability or is listed as an orphan in UI_COVERAGE.md)","",
"| source | total | tiers |","|---|---|---|"]
for k in ["models","migration_tables","screens","hooks","i18n"]:
    dash.append(f"| {k} | {len(COV[k])} | "+", ".join(f"{a} {b}" for a,b in collections.Counter(COV[k].values()).items())+" |")
dash+= [f"| procs | {len(COV['procs'])} | every proc is one api capability (by construction) |",
f"| flags | {len(COV['flags'])} | mapped to feature: {sum(1 for v in COV['flags'].values() if v['feature'])}; default false: {sum(1 for v in COV['flags'].values() if v['default']=='false')} |",
f"| nav entries | {len(COV['nav_entries'])} | literal nav targets in layouts/nav configs (inbound links per route used for nav status) |",
f"| docs | {len(INV['docs'])} md files | role tasks parsed from section-role-gap-matrix.md (120); other docs/plan files not parsed into tasks (see caveats) |",
f"| history | {len(INV['deleted_screens'])} deleted screens | lost-screen capabilities |"]
# ---- UI_COVERAGE.md
U=["# UI coverage (atlas v2)","","Generated by v2/render_v2.py from capabilities.yaml.","",
"> Rules: UI states come from a template per kind:"," > - list: list, loading, empty, error"," > - detail: detail, loading, error, not-found"," > - create: form, validation, pending, success, error"," > - update: edit, validation, pending, success, error"," > - delete: confirm, pending, error"," > - action: action-control, pending, error"," >"," > Extra needs:"," > - offline, if a mapped model is PowerSync-synced;"," > - variant:<group>, if roles span more than one of staff, learner, family or exec. A shared non-workspace screen counts as covering every group.",""," > A state counts as existing if a regex matches a screen file on the path from route to call site. These are heuristics, so treat counts as ±.",""]+dash+["","## Capabilities","","| id | task | roles | kind | status | needed | existing | missing | UI paths | why |","|---|---|---|---|---|---|---|---|---|---|"]
for c in sorted(K,key=lambda c:(c["feature"],c["id"])):
    u=c["ui"];U.append(f"| {c['id']} | {c['task'][:90]} | {','.join(c['roles'])} | {c['kind']} | {c['status']} | {len(u['needed'])} | {len(u['existing'])} | {', '.join(u['missing'])} | {'<br>'.join(u.get('paths',[])[:2])} | {c['why'][:120]} |")
U+=["","## Orphans"]
for k in ["models","migration_tables","screens","hooks","i18n"]:
    o=sorted(x for x,v in COV[k].items() if str(v).startswith("ORPHAN"));U+=["",f"### {k}: {len(o)} orphan","",", ".join(f"`{x}` ({COV[k][x]})" if k in("screens","hooks") else f"`{x}`" for x in o)]
open(A+"/UI_COVERAGE.md","w").write("\n".join(U)+"\n")
# ---- TODO_MASTER
todo=[]
def add(ms,eff,role,val,title,files,dep="",cap=""):todo.append(dict(milestone=ms,effort=eff,role=role,value=val,title=title,files=files,depends=dep,cap=cap))
add("M0","S","all","critical","Rotate the Gemini key exposed in commit b56f62af and the Inngest key, then decide on a history purge (needs Naveen's approval)",["config/env (pass-1)"])
add("M1","S","all","critical","Re-add the REST mounts removed in e383ef01 as a stopgap (restores all DEAD-CALL capabilities at once)",["apps/sanctuary-api/src/core/app.ts ~L949-985"])
add("M1","S","all","high","Add a route-resolution test: every client path must resolve to a mounted route",["apps/sanctuary-api/src/__tests__/"])
dead=collections.defaultdict(set)
for c in api:
    for s in c["layers"]["client"]["dead"]:dead[s.rsplit(":",1)[0]].add(c["proc"])
for f,ps in sorted(dead.items()):add("M1","S" if len(ps)<=3 else "M","/".join(sorted({r for c in api if c['proc'] in ps for r in c['roles']})),"high",f"Migrate {len(ps)} Hono REST call(s) to orpcClient: {', '.join(sorted(ps))}",[f],"M1 stopgap optional",",".join(sorted(ps)))
mt=sorted({c["id"].split(":")[-1]:c for c in K if "MISSING-TABLE" in c["why"]}.items())
for t,c in mt:add("M2","M","/".join(c["roles"]),"high" if c["feature"] in("guardian-workspace","self-wellbeing") else "med",f"Missing table `{t}`: write a migration and zmodel model, or repoint the code",c["layers"]["client"]["valid"][:3]+["apps/gurudevi-mobile/supabase/migrations/","packages/schema/schema.zmodel"],"",c["id"])
add("M2","S","parent","high","Route the `parent` capacity to the guardian workspace and add an `admin` destination",["apps/gurudevi-mobile/src/lib/workspace/routeResolution.ts"])
for c in api:
    if c["status"]=="UI-UNWIRED":add("M3","S" if c["layers"]["hook"] else "M","/".join(c["roles"]),"med",f"Mount {c['proc']} in a nav-reachable screen (client/hook exists, no route reaches it)",(c["layers"]["hook"][:2] or c["layers"]["client"]["valid"][:2]),"M1",c["id"])
    elif c["status"]=="BACKEND-ONLY":add("M3","M","/".join(c["roles"]),"low",f"Build UI for {c['proc']} or delete the procedure (no client call site)",[c["layers"]["api"]],"",c["id"])
for r in sorted(navP):
    if RT[r]["url"] not in ("/",) :add("M3","S","-","med",f"Add an inbound nav entry for {RT[r]['url']} (route registered, no inbound link)",[r])
mk=collections.defaultdict(set)
for c in K:
    if "ungated mock" in c["why"]:
        for m in re.findall(r"([\w/().\[\]-]+\.tsx?:\d+)",c["why"]):mk[m].add(c["id"])
for m,ids in sorted(mk.items()):add("M4","S","-","high",f"Gate or remove the ungated mock/fallback at {m} (affects {len(ids)} capabilities)",[m.rsplit(':',1)[0]],"M1")
for k,v in COV["flags"].items():
    if v["default"]=="false":add("M4","S","-","med",f"Decide on flag {k} (default false; feature {v['feature'] or 'unmapped'}): enable, keep beta, or remove",[v["at"]])
for c in K:
    if c["ui"]["missing"] and c["status"] in("LIVE","PARTIAL") and c["kind"]!="user-task(doc)":
        miss=[x for x in c["ui"]["missing"] if not x.startswith("variant")];var=[x for x in c["ui"]["missing"] if x.startswith("variant")]
        if miss:add("M5","S","/".join(c["roles"]),"med",f"{c['id']}: add UI states {miss}",c["ui"]["paths"][:2] or c["layers"]["client"]["valid"][:1],"M1",c["id"])
        if var:add("M5","M","/".join(c["roles"]),"med",f"{c['id']}: role variants needed {var}",c["ui"]["paths"][:2],"M2",c["id"])
for c in K:
    if c["kind"]=="direct-supabase" and c["status"]=="UI-UNWIRED":add("M6","S","/".join(c["roles"]),"low",f"Unreached direct Supabase access {c['id']}: wire it or delete it",c["layers"]["client"]["valid"][:2],"",c["id"])
for k,lab in [("screens","screen"),("models","model"),("hooks","hook"),("i18n","i18n namespace")]:
    for x,v in sorted(COV[k].items()):
        if str(v).startswith("ORPHAN") and v!="ORPHAN-deep-in-closure":add("M6","S" if k!="models" else "M","-","low",f"Orphan {lab} `{x}` ({v}): wire it or delete it",[INV["hooks"][x] if k=="hooks" else x if k=="screens" else "packages/schema/schema.zmodel" if k=="models" else INV["i18n_namespaces"][x]])
for c in K:
    if c["kind"]=="user-task(doc)" and c["status"]!="LIVE":add("M7","M","/".join(c["roles"]),"high" if c["status"]=="UNVERIFIED" else "med",f"Doc task not LIVE ({c['status']}): {c['task'][:110]}",c["layers"]["code"][:2] or [c["source"]],"M1",c["id"])
for c in K:
    if c["kind"]=="dead-facade-call":add("M1","S","/".join(c["roles"]),"high",f"Dead legacy-facade call {c['id'][7:]}(): add the wrapper (map to typed orpcClient) or repoint the caller",c["layers"]["client"]["dead"][:3],"",c["id"])
    if c["kind"]=="verified-task" and c["status"]!="LIVE" and (c.get("evidence") or {}).get("blocker"):add("M1" if c["feature"]=="attendance" else "M7","M","/".join(c["roles"]),"high",f"{c['id']}: {c['evidence']['blocker']}",c["layers"].get("code",[])[:3],"",c["id"])
for r,(cnt) in [("parent",0),("admin",0),("founder",0)]:add("M7","M",r,"high",f"Write the {r} user-task list. The gap matrix only covers teacher/student/principal; draft it from the procs/routes already tagged {r}",["docs (new)"])
for c in K:
    if c["status"]=="PLANNED" and c.get("likely_wanted"):
        pv=c["provenance"];s0=pv["sources"][-1]
        add("M8","M","/".join(c["roles"]) or "?","high" if pv.get("priority") else "med",("[LOW-CONFIDENCE] " if c.get("confidence")!="high" else "")+("[DOC CLAIMS BUILT] " if c.get("doc_contradiction") else "")+f"PLANNED: {c['task'][:120]}",[f"{s0['doc']}:{s0['line']}"],"M1",c["id"])
for c in K:
    if c.get("doc_contradiction") and c["status"]!="PLANNED":
        rr=[x for x in c.get("doc_refs",[]) if x["verdict"]=="CONTRADICTED" and not str(x.get("v4","")).startswith("RESOLVED")]
        if not rr and c.get("provenance"):s0=c["provenance"]["sources"][-1];rr=[{"src":f"{s0['doc']}:{s0['line']}","note":"v4: doc claims built; code evidence shows "+c["status"]}]
        if not rr:continue
        r=rr[0]
        add("M7","S","/".join(c["roles"]),"med",f"Reconcile the docs claim with the code: {c['id']} is {c['status']} but {r['src']} says done"+(f" ({r['note']})" if r.get("note") else ""),[r["src"]],"",c["id"])
order=["M0","M1","M2","M3","M4","M5","M6","M7","M8"];MSN={"M0":"Safety","M1":"Restore transport (e383ef01)","M2":"Schema & role dispatch","M3":"Wiring & navigation","M4":"Mocks & flags","M5":"UI states & role variants","M6":"Hygiene / orphans","M7":"Task gaps (docs-claimed, missing roles, doc/code contradictions)","M8":"PLANNED doc intents likely still wanted (recent, non-superseded docs)"}
TM=["# TODO master (atlas v2)","","Generated by v2/render_v2.py. Work milestones in order; each item lists effort (S/M/L), role, value, files and dependency.",""]
TM+=["| milestone | items | S | M | L |","|---|---|---|---|---|"]
for m in order:
    it=[t for t in todo if t["milestone"]==m];e=collections.Counter(t["effort"] for t in it);TM.append(f"| {m} {MSN[m]} | {len(it)} | {e.get('S',0)} | {e.get('M',0)} | {e.get('L',0)} |")
TM.append(f"| **total** | {len(todo)} | | | |")
for m in order:
    TM+=["",f"## {m} — {MSN[m]}","","| # | effort | role | value | item | files | depends |","|---|---|---|---|---|---|---|"]
    for i,t in enumerate([t for t in todo if t["milestone"]==m],1):TM.append(f"| {m}.{i} | {t['effort']} | {t['role']} | {t['value']} | {t['title']} | {'<br>'.join(map(str,t['files'][:3]))} | {t['depends']} |")
open(A+"/TODO_MASTER.md","w").write("\n".join(TM)+"\n")
json.dump(todo,open(A+"/v2/todo.json","w"),indent=1)
open(A+"/v2/dashboard.md","w").write("\n".join(dash)+"\n")
print("\n".join(dash));print("TODO",len(todo),collections.Counter(t["milestone"] for t in todo))
