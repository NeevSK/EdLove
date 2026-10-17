import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..")); import atlas_paths as _P  # noqa: E402
"""Atlas v2: exhaustive capability (user-task) inventory + UI coverage. Static only. -> v2/capabilities.json"""
import json,os,re,pickle,yaml,fnmatch,collections
R=_P.REPO;A=_P.ATLAS;V=A+"/v2"
G=json.load(open(A+"/analysis/graph.json"));T=json.load(open(A+"/analysis/trace.json"))
EDG,_=pickle.load(open(A+"/analysis/graph.pkl","rb"))
FW={k.replace(R+"/",""):[x.replace(R+"/","") for x in v] for k,v in EDG.items()}
INV=json.load(open(V+"/inventory.json"));FM=yaml.safe_load(open(A+"/analysis/feature_map.yaml"))
FEAT={f["id"]:f for f in yaml.safe_load(open(A+"/features.yaml"))["features"]}
src=lambda p:open(os.path.join(R,p),errors="ignore").read() if os.path.isfile(os.path.join(R,p)) else ""
def reach(starts,depth=6):
    seen=set(starts);fr=list(starts)
    for _ in range(depth):
        nx=[]
        for f in fr:
            for t in FW.get(f,[]):
                if t not in seen:seen.add(t);nx.append(t)
        fr=nx
    return seen
# ---------- proc -> feature
PREF={"library.verifyResource":"library-curation-review","erp.getAccounts":"accounting","erp.getTransactions":"accounting","erp.recordTransaction":"accounting",
 "erp.createPaymentIntent":"payments","erp.getInvoices":"payments","erp.getReceipt":"payments","admin.getStaffPresence":"principal-workspace",
 "admin.getTeacherCarousel":"principal-workspace","admin.getSchool":"principal-workspace"}
def feat_of(pk):
    if pk in PREF:return PREF[pk]
    r=pk.split(".")[0]
    for k,v in FM.items():
        if pk in (v.get("procs") or []):return k
    for k,v in FM.items():
        if r in (v.get("routers") or []) and not v.get("procs") and k not in("messaging-router" if r!="messaging" else "direct-messages",):return k
    return {"sync":"offline-sync"}.get(r,"unmapped")
# ---------- nav reachability per route
SAME={"mobile":lambda f:not re.match(r"apps/(gurudevi-web|edlove-web|gurudevi-marketingWeb)/",f),
      "gurudevi-web":lambda f:f.startswith("apps/gurudevi-web/") or (f.startswith("packages/") and ".web." in f),
      "edlove-web":lambda f:f.startswith("apps/edlove-web/")}
TAB={"/library","/workspace","/self","/community","/profile","/"}
DISP={"/workspace/principal","/workspace/founder","/workspace/guardian","/workspace/classroom","/workspace/classroom/[classroomId]","/workspace/classroom/student/[classroomId]","/workspace/commercial/[batchId]"}
RT=T["routes"]
DEVSRC=re.compile(r"(icon-lab|ui-showcase|/labs?/|lab\.tsx|/dev/|__tests__|\.test\.|\.stories\.|/docs/|playground)",re.I)
CODE={f:src(f) for f in FW if f.endswith((".ts",".tsx")) and not re.search(r"__tests__|\.test\.|node_modules",f)}
def dyn_links(url):
    if "[" not in url:return []
    pre=url[:url.index("[")];hits=[]
    pats=[re.compile(re.escape(pre)+r"\$\{"),re.compile(r"pathname:\s*['\"]"+re.escape(url)+r"['\"]"),re.compile(r"['\"]"+re.escape(pre)+r"['\"]\s*\+")]
    for f,t in CODE.items():
        for pt in pats:
            m=pt.search(t)
            if m:hits.append(f"{f}:{t[:m.start()].count(chr(10))+1}");break
    return hits
def nav(r):
    i=RT[r];ok=SAME.get(i["app"],lambda f:True);ll=[x for x in i["inbound_links"] if ok(x) and not DEVSRC.search(x)]
    if ll:return "Y",ll[:2]
    if i["url"] in TAB:return "Y",["tab/site root"]
    if i["url"] in DISP:return "Y",["role dispatch apps/gurudevi-mobile/src/lib/workspace/routeResolution.ts"]
    dl=[x for x in dyn_links(i["url"]) if ok(x) and not DEVSRC.search(x)]
    if dl:return "Y",["dynamic link "+dl[0]]
    if any(not DEVSRC.search(x) for x in i["inbound_links"]):return "P",["inbound link only from another app: "+i["inbound_links"][0]]
    if i["inbound_links"]:return "P",["inbound link only from dev/test surface: "+i["inbound_links"][0]]
    return "P",["file route registered; no inbound link found"]

def enclosing(site):
    f,l=site.rsplit(":",1);L=CODE.get(f,src(f)).split("\n")
    for i in range(int(l)-1,max(-1,int(l)-60),-1):
        m=re.search(r"^\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::[^{=]+)?\{\s*$|^\s*(\w+)\s*:\s*(?:async\s*)?(?:\(|function)|^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)|^\s*(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?(?:\(|function|\w+\s*=>)",L[i])
        if m:
            n=next(g for g in m.groups() if g)
            if n not in("if","for","while","switch","catch","return","function","async","try"):return n
    return None
REACH={}
def reach_all(r):
    if r not in REACH:REACH[r]=reach([r],40)
    return REACH[r]
GENERIC={"list","create","get","update","delete","remove","data","next","identity","fetchData","query","mutate","run","call","handler","execute","fetch","load","send","save","init","default","then","resolve","record","upsert","getAll","getById","submit","engage","getToday","claim","endorse"}
UIF=lambda g:g.endswith(".tsx") or "/hooks/" in g or re.search(r"/use[A-Z]\w*\.ts$",g)
def facade_obj(f,line):
    L=CODE.get(f,src(f)).split("\n")
    for i in range(int(line)-1,-1,-1):
        m=re.match(r"\s*export\s+(?:const|class)\s+(\w+)",L[i])
        if m:return m.group(1)
    return None
def callpat(name,obj,router):
    if name in GENERIC or len(name)<5:
        q="|".join(re.escape(x) for x in {obj,router,router+"API",router+"Api"} if x)
        return re.compile(r"\b(?:%s)\s*\.\s*%s\s*\("%(q,re.escape(name)),re.I)
    return re.compile(r"\b%s\s*\("%re.escape(name))
def first_hit(pt,files,skip):
    for g in sorted(files):
        if g in skip or g not in CODE or re.search(r"\.contract\.ts$|orpcClient|/__tests__/",g):continue
        for mm in pt.finditer(CODE[g]):
            pre=CODE[g][max(0,mm.start()-25):mm.start()]
            if re.search(r"(function|async|const|let)\s*$|^\s*\w+\s*:\s*$",pre.split("\n")[-1]):continue
            return g,CODE[g][:mm.start()].count("\n")+1
    return None
def caller(r,sites,proc=None):
    """method-level hostile check. LIVE needs a UI file (route/screen/component/hook) reachable from r that invokes the
    client method (qualified by facade object for generic names), directly or through one wrapper layer."""
    R_=reach_all(r);router,pname=proc.split(".")
    for st in sites:
        f,l=st.rsplit(":",1)
        if UIF(f) and f in R_:return f"{st} (call site is UI code)"
        obj=facade_obj(f,l);m=enclosing(st)
        for name in {pname,m} - {None}:
            h=first_hit(callpat(name,obj,router),R_,{f})
            if not h:continue
            g,ln=h
            if UIF(g):return f"{g}:{ln} calls {name}()"
            w=enclosing(f"{g}:{ln}");wo=facade_obj(g,ln)
            if w and w not in GENERIC and len(w)>=5:
                h2=first_hit(callpat(w,wo,router),[x for x in R_ if UIF(x)],{g})
                if h2:return f"{h2[0]}:{h2[1]} calls {w}() > {g}:{ln} calls {name}()"
    return None
def chain(r,targets,methods=()):
    """Concrete import path route->target file (BFS over real imports). Fallback: a file on the import reach calls a facade method by name."""
    targets=set(targets);par={r:None};q=[r]
    while q:
        n=q.pop(0)
        if n in targets:
            p=[]
            while n:p.append(n);n=par[n]
            return p[::-1]
        for m in FW.get(n,[]):
            if m not in par:par[m]=n;q.append(m)
    for mth in methods:
        pt=re.compile(r"\.%s\("%re.escape(mth))
        for f in par:
            if f in CODE and f not in targets and pt.search(CODE[f]):return [r,"…",f+" (facade call ."+mth+"())"]
    return None
NAV={r:nav(r) for r in RT}
def gated(fl):
    f,l=fl.split(" ")[0].rsplit(":",1);L=src(f).split("\n");i=int(l)-1
    return bool(re.search(r"isDemoMode|isDemo\(\)|isGuest|EDLOVE_DEMO|__DEV__|isExplorer","\n".join(L[max(0,i-4):i+2])))
SCREENS=sorted(set(INV["screens"])|set(RT))
SCREEN_REACH={s:reach([s]) for s in SCREENS}
# ---------- UI-state detection
ST={"loading":r"isLoading|isPending|ActivityIndicator|Skeleton|LoadingState|isFetching|<Loading",
    "empty":r"EmptyState|isEmpty|length\s*===?\s*0|No \w+ yet|emptyText|ListEmptyComponent",
    "error":r"isError|ErrorState|ErrorBoundary|onError|error\s*\?|\{error|errorMessage",
    "offline":r"NetInfo|isOffline|useNetInfo|offline|OfflineBanner|useNetwork",
    "form":r"TextInput|<Input|<Form|onSubmit|useForm|handleSubmit",
    "edit":r"isEditing|editMode|onEdit|handleEdit|initialValues|defaultValues",
    "confirm":r"Alert\.alert|confirm\(|ConfirmDialog|ConfirmModal|onConfirm",
    "success":r"toast|Toast|showSuccess|onSuccess|success",
    "validation":r"zod|z\.object|validate|fieldErrors|errors\.\w+",
    "not-found":r"notFound|not found|NotFound|404",
    "pending":r"isPending|isSubmitting|disabled=\{|mutation\.isPending"}
def states_in(files):
    txt="\n".join(src(f) for f in files);return {k for k,p in ST.items() if re.search(p,txt)}
READ=re.compile(r"^(get|list|fetch|search|preview|count|resolve|identify|check|load|query|my|today)",re.I)
DEL=re.compile(r"^(delete|remove|burn|unendorse|leave|archive)",re.I)
UPD=re.compile(r"^(update|modify|edit|set|select|mark|toggle|rename)",re.I)
ACT=re.compile(r"^(approve|reject|verify|endorse|claim|join|award|engage|report|grade|submit|send|record|log|enroll|complete|initialize|add|fork|upload|sync|moderate|pin|react|respond|handle|accept|capability)",re.I)
def kind(n):
    if READ.match(n):return "list" if re.search(r"(s|List|History|Feed|Timeline|All|Carousel|Presence|Counts|Topology|Stats|Events|Moments|Records|Leaves|Students|Resources|Materials|Assignments|Submissions|Notes|Collections|Conversations|Messages|Gifts|Posts|Groups|Comments|Notifications|Mood|Ledger)$",n) else "detail"
    if DEL.match(n):return "delete"
    if UPD.match(n):return "update"
    if re.match(r"^create",n,re.I):return "create"
    return "action"
NEED={"list":["list","loading","empty","error"],"detail":["detail","loading","error","not-found"],
      "create":["form","validation","pending","success","error"],"update":["edit","validation","pending","success","error"],
      "delete":["confirm","pending","error"],"action":["action-control","pending","error"]}
GROUPS={"staff":{"teacher","principal","admin"},"learner":{"student"},"family":{"parent"},"exec":{"founder"}}
WRITE_ONLY_STAFF=re.compile(r"^(approve|reject|verify|grade|moderate|createCalendar|getPendingLeaves|award)",re.I)
FLAGMAP={"inventory":"isInventoryEnabled","accounting":"isAccountingEnabled","ai-assistant":"isAIAssistantEnabled","guardian-workspace":"isGuardianWorkspaceEnabled",
 "workforce":"isDevelopingWorkforce","form-builder":"isDevelopingFormBuilder","offline-sync":"isPowerSyncEnabled"}
FLAGS=INV["flags"]
def human(n):return re.sub(r"(?<!^)([A-Z])",r" \1",n).lower()
def verbing(n):
    w=human(n).split(" ",1);v=w[0];rest=w[1] if len(w)>1 else ""
    v3={"get":"views","list":"views","fetch":"loads","search":"searches","create":"creates","update":"updates","delete":"deletes","remove":"removes","add":"adds","log":"logs","burn":"burns","approve":"approves","submit":"submits","send":"sends","mark":"marks","toggle":"toggles","claim":"claims","verify":"verifies","grade":"grades","record":"records","enroll":"enrolls","join":"joins","engage":"engages with","report":"reports","fork":"forks","endorse":"endorses","unendorse":"withdraws endorsement of","save":"saves","complete":"completes","initialize":"initializes","award":"awards","check":"checks","preview":"previews","select":"selects","modify":"modifies","identify":"identifies","resolve":"resolves","upload":"uploads","handle":"handles","capability":"bootstraps capability"}.get(v,v+"s")
    return f"{v3} {rest}".strip()
caps=[];C=collections.Counter()
def new(cid,**k):
    k["id"]=cid;caps.append(k);return k
# reverse index: proc -> routes reaching (with transport)
P2R=collections.defaultdict(dict)
for r,i in RT.items():
    for pk,v in i["procs_reached"].items():P2R[pk][r]=v["transport"]
# ===== B: one capability per API procedure
for rk,p in sorted(G["procs"].items()):
    for name,line in p["procedures"]:
        pk=f"{rk}.{name}";fid=feat_of(pk);F=FEAT.get(fid,{})
        roles=list(F.get("roles",["?"]))
        if WRITE_ONLY_STAFF.match(name):roles=[x for x in roles if x not in("student","parent")] or roles
        sites=T["sites"].get(pk,[]);tr={s:T["transport"].get(s,"?") for s in sites}
        served=[s for s,t in tr.items() if "served" in t];dead=[s for s,t in tr.items() if "NO-SERVER" in t]
        routes=P2R.get(pk,{});navr={r:NAV[r] for r in routes}
        live0=[r for r in routes if NAV[r][0]=="Y" and any("served" in t for t in routes[r])]
        served_files={s.rsplit(":",1)[0] for s in served}
        CH={r:chain(r,served_files,(name,)) for r in live0}
        CALL={r:caller(r,served,pk) for r in live0 if CH[r]}
        for r in list(CH):
            if CH[r] and not CALL.get(r):CH[r]=None
        live_routes=[r for r in live0 if CH[r]]
        hub_only=[r for r in live0 if not CH[r]]
        dead_routes=[r for r in routes if all("NO-SERVER" in t for t in routes[r])]
        site_files={s.rsplit(":",1)[0] for s in sites}
        scr=sorted({s for r in routes for s in SCREENS if s in set(RT[r]["closure_files"])|{r} and SCREEN_REACH[s]&site_files})
        hooks=sorted(h for h,at in INV["hooks"].items() if reach([at.rsplit(":",1)[0]],3)&site_files)[:8]
        mocks=sorted({m for r in routes for m in RT[r]["mocks"] if not re.search(r"/(test|__tests__|mocks?)/",m) and m.split(":")[0] in set(scr)|site_files|{INV["hooks"][h].rsplit(":",1)[0] for h in hooks}})
        ung=[m for m in mocks if not gated(m)]
        def rmocks(r):
            fs={x for x in SCREENS if x in set(RT[r]["closure_files"])|{r} and SCREEN_REACH[x]&site_files}|site_files
            return [m for m in RT[r]["mocks"] if m.split(":")[0] in fs and not re.search(r"/(test|__tests__|mocks?)/",m) and not gated(m)]
        clean=[r for r in live_routes if not rmocks(r)]
        if clean:ung=[]
        models=[m for m,mm in G["models"].items() if p["file"] in mm["api_refs"]]
        k=kind(name);need=list(NEED[k]);
        ps=any(G["models"][m]["powersync"] for m in models) and k!="detail"
        if ps:need.append("offline")
        rg={g for g,s in GROUPS.items() if s&set(roles)}
        variants=[f"variant:{g}" for g in sorted(rg)] if len(rg)>1 else []
        have=states_in(scr+[h2 for h in hooks for h2 in [INV["hooks"][h].rsplit(":",1)[0]]]) if scr else set()
        if scr:have|={"list","detail","action-control"}&set(need)
        vh=[]
        for v in variants:
            g=v.split(":")[1];urls=[RT[r]["url"] for r in live_routes]
            rolepath={"family":"guardian","exec":"founder","learner":"student","staff":""}[g]
            if live_routes and (g=="staff" or any(rolepath in u for u in urls) or any(not u.startswith("/workspace") for u in urls)):vh.append(v)
        needed=need+variants;existing=[s for s in need if s in have]+vh
        flag=FLAGMAP.get(fid);flagoff=flag and FLAGS.get(flag,{}).get("default")=="false"
        if not sites:st="BACKEND-ONLY";why="no client call site"
        elif not routes:st="UI-UNWIRED";why="client/hook exists but no route closure reaches it"
        elif not live_routes and dead_routes and not served:st="PARTIAL";why="DEAD-CALL: only Hono REST sites (no server mount since e383ef01)"
        elif not live_routes and hub_only:st="UI-UNWIRED";why="hostile: no nav-reachable route both imports the served client module and invokes this method (module imported, method never called from UI)"
        elif not live_routes:st="UI-UNWIRED";why="reached only from routes without inbound nav or via unserved transport"
        elif ung or flagoff:st="PARTIAL";why=("ungated mock: "+", ".join(ung[:2]) if ung else "")+(f" flag {flag} default false" if flagoff else "")
        else:
            st="LIVE";r0=next((r for r in (clean or live_routes) if CH.get(r)),live_routes[0])
            why=f"served oRPC site; nav {NAV[r0][1][0]}; chain "+" > ".join(x.split("/")[-1] for x in CH[r0])+f"; caller {CALL[r0]}"
        if fid in("guardian-workspace",) and st=="LIVE":st="PARTIAL";why+="; feature blocked by missing guardian tables"
        new(f"{fid}:{rk}.{name}",kind="api",feature=fid,task=" / ".join(f"{r} {verbing(name)}" for r in roles),roles=roles,proc=pk,
            layers={"schema":[f"{m} @ packages/schema/schema.zmodel:{G['models'][m]['line']}" for m in models][:4] or "NA",
                    "api":f"{p['file']}:{line}","client":{"valid":served[:4],"dead":dead[:4]},"hook":hooks,"screens":scr[:8],
                    "routes":{r:{"url":RT[r]["url"],"nav":NAV[r][0],"transport":sorted(set(routes[r]))} for r in list(routes)[:8]},
                    "real_data":"Y" if served and live_routes and not ung else ("MOCK" if ung else ("DEAD" if dead and not served else "N")),"mocks":mocks[:6]},
            ui={"kind":k,"needed":needed,"existing":existing,"missing":[x for x in needed if x not in existing],"paths":scr[:8]},
            flag=flag,status=st,why=why)
# ===== C: route capabilities not covered by any proc (static/local/direct supabase)
covered_routes={r for c in caps for r in c["layers"]["routes"]}
for r,i in sorted(RT.items()):
    tabs=list(i["tables"])
    if r in covered_routes:continue
    fid=next((k for k,v in FM.items() for pat in v.get("routes",[]) if fnmatch.fnmatchcase(r,pat)),"unmapped")
    F=FEAT.get(fid,{});roles=F.get("roles",["?"])
    ung=[m for m in i["mocks"] if not re.search(r"/(test|__tests__|mocks?)/",m) and not gated(m)]
    if True:
        has=states_in([r]+i["imports_direct"])
        st="LIVE" if NAV[r][0]=="Y" and not ung and (i["api_calls"]==[] ) else ("PARTIAL" if NAV[r][0]=="Y" else "UI-UNWIRED")
        new(f"{fid}:route{i['url']}",kind="screen-only",feature=fid,task=" / ".join(f"{x} opens {i['url']}" for x in roles),roles=roles,
            layers={"schema":"NA","api":"NA","client":{"valid":[],"dead":[]},"routes":{r:{"url":i["url"],"nav":NAV[r][0]}},"real_data":"MOCK" if ung else "NA","mocks":ung[:4]},
            ui={"kind":"screen","needed":["screen"],"existing":["screen"],"missing":[],"paths":[r]},status=st,
            why=f"no API/table; nav {NAV[r][0]}"+(f"; ungated mock {ung[:1]}" if ung else ""))

# ===== D: direct Supabase table/RPC access (repo-wide scan, grouped per table x read/write)
SUP=collections.defaultdict(list)
for f in FW:
    if not f.endswith((".ts",".tsx")) or re.search(r"test|__tests__|/mocks?/|apps/sanctuary-api/|supabase/functions",f):continue
    t=src(f)
    for m in re.finditer(r"""\.(from|rpc)\(\s*['"`]([a-z_0-9]+)['"`]\s*\)([\s\S]{0,160})""",t):
        if m.group(1)=="from":
            op="write" if re.match(r"\s*\.(insert|update|upsert|delete)",m.group(3)) else "read"
        else:op="rpc"
        SUP[(m.group(2),op)].append(f"{f}:{t[:m.start()].count(chr(10))+1}")
T2F={}
for k,v in FM.items():
    for mname in v.get("models",[]):
        if mname in G["models"]:T2F.setdefault(G["models"][mname]["table"],k)
CL={r:set(i["closure_files"])|{r} for r,i in RT.items()}
for (tb,op),sites in sorted(SUP.items()):
    sf={x.rsplit(":",1)[0] for x in sites}
    rts=[r for r in RT if CL[r]&sf];live=[r for r in rts if NAV[r][0]=="Y" and chain(r,sf)]
    fid=T2F.get(tb) or next((k for k,v in FM.items() for r in rts for pat in v.get("routes",[]) if fnmatch.fnmatchcase(r,pat)),None) or "pkg:"+"/".join(sorted({x.split("/")[1] for x in sf})[:2])
    F=FEAT.get(fid,{});roles=F.get("roles",["?"])
    ztab={mm["table"] for mm in G["models"].values()};mig=tb in INV["migration_tables"]
    schema=("zmodel" if tb in ztab else f"migration {INV['migration_tables'][tb]}" if mig else ("rpc" if op=="rpc" else "MISSING: no zmodel model and no CREATE TABLE in any migration"))
    if op=="rpc":
        fn=any(re.search(r"function\s+(public\.)?%s\b"%tb,src(f)) for f in [x for x in INV.get("sqlfiles",[])]) 
    need=["list","loading","empty","error"] if op=="read" else ["form","pending","success","error"]
    scr=sorted({s for r in rts for s in SCREENS if s in CL[r] and SCREEN_REACH[s]&sf})[:8]
    have=(states_in(scr)|({"list","form"}&set(need))) if scr else set()
    if schema.startswith("MISSING"):st,why="PARTIAL","MISSING-TABLE: "+schema
    elif not rts:st,why="UI-UNWIRED","direct Supabase site not in any route closure"
    elif not live:st,why="UI-UNWIRED","only reached from routes without inbound nav"
    else:st,why="LIVE","direct Supabase from nav-reachable route (bypasses API/privacy ledger)"
    new(f"{fid}:supabase.{op}:{tb}",kind="direct-supabase",feature=fid,task=" / ".join(f"{x} {'reads' if op=='read' else 'writes' if op=='write' else 'calls rpc'} {tb.replace('_',' ')}" for x in roles),roles=roles,
        layers={"schema":schema,"api":"direct Supabase (no sanctuary-api procedure)","client":{"valid":sites[:4],"dead":[]},"screens":scr,
                "routes":{r:{"url":RT[r]["url"],"nav":NAV[r][0]} for r in rts[:8]},"real_data":"N" if schema.startswith("MISSING") else "Y"},
        ui={"kind":"list" if op=="read" else "create","needed":need,"existing":[x for x in need if x in have],"missing":[x for x in need if x not in have],"paths":scr},
        status=st,why=why)
# ===== A: doc user tasks (section-role gap matrix, 2026-03-01), re-verified against HEAD
GM="apps/gurudevi-mobile/docs/current_progress/March/1st_week/section-role-gap-matrix.md";sec=role=None
idx={os.path.splitext(os.path.basename(f))[0].split(".")[0]:f for f in FW}
hookfile={h:a.rsplit(":",1)[0] for h,a in INV["hooks"].items()}
for ln,l in enumerate(open(os.path.join(R,GM)),1):
    m=re.match(r"## (\w+) Section",l);sec=m.group(1).lower() if m else sec
    m=re.match(r"### (.+?) — should",l);role=m.group(1).lower() if m else role
    m=re.match(r"\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.*?)\s*\|\s*$",l)
    if not(sec and role and m):continue
    n,task,wired,gap=m.groups();ids=re.findall(r"`(\w+)`",wired+" "+gap)
    files=sorted({hookfile.get(x) or idx.get(x) for x in ids if hookfile.get(x) or idx.get(x)})
    roles=["teacher","student","principal"] if role.startswith("all") else [role]
    procs=sorted({pk for c in caps if c["kind"]=="api" for pk in [c["proc"]] if set(f.rsplit(":",1)[0] for f in c["layers"]["client"]["valid"]+c["layers"]["client"]["dead"])&reach(files,4)}) if files else []
    rts=[r for r in RT if set(files)&set(RT[r]["closure_files"]+[r])]
    live=[r for r in rts if NAV[r][0]=="Y" and chain(r,files)]
    pc=[c for c in caps if c.get("proc") in procs]
    if not files:st,why="UNVERIFIED","no named component/hook resolves at HEAD (renamed or never built)"
    elif not rts:st,why="UI-UNWIRED","named code exists but no route closure includes it"
    elif pc and all(c["status"]=="PARTIAL" and "DEAD" in c["why"] for c in pc):st,why="PARTIAL","named code reached but its calls are dead REST"
    elif live and (not pc or any(c["status"]=="LIVE" for c in pc)):st,why="LIVE","named code in nav-reachable route; calls served or direct"
    else:st,why="PARTIAL","reachable but calls not served/unreached"
    new(f"task:{sec}:{role.split()[0]}:{n}",kind="user-task(doc)",feature=sec,task=f"{'/'.join(roles)}: {task}",roles=roles,
        source=f"{GM}:{ln}",doc_2026_03_01={"wired":wired[:160],"gap":gap[:160]},
        layers={"code":files,"procs":procs[:10],"routes":{r:{"url":RT[r]["url"],"nav":NAV[r][0]} for r in rts[:6]}},
        ui={"kind":"task","needed":["screen"],"existing":["screen"] if live else [],"missing":[] if live else ["screen"],"paths":rts[:6]},status=st,why=why)
# ===== E: i18n namespaces / flags with no code use
code="\n".join(src(f) for f in FW if f.endswith((".ts",".tsx")) and not f.endswith(".json"))
orph_i18n=[]
for ns,f in INV["i18n_namespaces"].items():
    if not re.search(r"""['"`]%s\.""" % re.escape(ns),code) and not re.search(r"keyPrefix:\s*['\"]%s['\"]|useTranslation\(['\"]%s"%(re.escape(ns),re.escape(ns)),code):orph_i18n.append(ns)
for ns in orph_i18n:
    new(f"i18n:{ns}",kind="i18n-implied",feature="?",task=f"copy exists for '{ns}' but no t('{ns}.*') usage",roles=[],layers={"i18n":INV["i18n_namespaces"][ns]},
        ui={"kind":"screen","needed":["screen"],"existing":[],"missing":["screen"],"paths":[]},status="UI-UNWIRED",why="i18n namespace unused in code (static grep)")
# ===== F: LOST (deleted screens, all refs)
for f,c in sorted(INV["deleted_screens"].items()):
    new(f"lost:{f}",kind="lost-screen",feature="lost",task=f"(deleted) {os.path.basename(f)}",roles=[],layers={"last":c,"path":f},
        ui={"kind":"screen","needed":[],"existing":[],"missing":[],"paths":[]},status="LOST",why=f"deleted in {c}")
# ---------- coverage proof
cov={}
used_models={m.split(" @")[0] for c in caps if isinstance(c["layers"].get("schema"),list) for m in c["layers"]["schema"]}
used_tables={c["id"].split(":")[-1] for c in caps if c["kind"]=="direct-supabase"}
cov["models"]={m:("covered" if m in used_models or mm["table"] in used_tables else "server-ref-only" if mm["api_refs"] else "ORPHAN") for m,mm in G["models"].items()}
ztab={mm["table"] for mm in G["models"].values()}
cov["migration_tables"]={t:("zmodel" if t in ztab else "covered-direct" if t in used_tables else "ORPHAN") for t in INV["migration_tables"]}
cov["procs"]={c["proc"]:c["status"] for c in caps if c["kind"]=="api"}
on_path={s for c in caps for s in c["ui"].get("paths",[])}|{s for c in caps for s in c["layers"].get("screens",[])}
allclos=set().union(*[set(i["closure_files"]) for i in RT.values()])
caproutes={r for c in caps for r in (c["layers"].get("routes") or {})}
near=set().union(*[reach([r],3) for r in caproutes])
cov["screens"]={s:("capability" if s in on_path else "capability-route(depth<=3)" if s in near else "ORPHAN-unrouted" if s not in allclos else "ORPHAN-deep-in-closure") for s in SCREENS}
hooked={h for c in caps for h in c["layers"].get("hook",[])}
HC=collections.Counter(re.findall(r"\b(use[A-Z]\w*)\b",code))
cov["hooks"]={h:("capability" if h in hooked else "capability-route(depth<=3)" if INV["hooks"][h].rsplit(":",1)[0] in near else "ORPHAN-unused" if HC[h]<=1 else "ORPHAN-not-near-route") for h in INV["hooks"]}
cov["i18n"]={ns:("ORPHAN" if ns in orph_i18n else "used") for ns in INV["i18n_namespaces"]}
cov["flags"]={k:{"default":v["default"],"feature":next((f for f,x in FLAGMAP.items() if x==k),None),"at":v["at"]} for k,v in FLAGS.items()}
cov["nav_entries"]={e["at"]:e["target"] for e in INV["nav_entries"]}
# NOTE: v2/post_tables.py tiers server/edge refs afterwards
json.dump({"capabilities":caps,"coverage":cov},open(V+"/capabilities.json","w"),indent=1)
print(len(caps),collections.Counter(c["kind"] for c in caps));print(collections.Counter(c["status"] for c in caps))
for k,v in cov.items():
    if k not in("procs","flags","nav_entries"):print(k,collections.Counter(v.values()))
