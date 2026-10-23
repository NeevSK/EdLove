import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..")); import atlas_paths as _P  # noqa: E402
"""v4 evidence-first verification. Runs after v3/merge_docs.py and before render.
1) apply hand-verified auth/onboarding domain + manual overrides (with evidence)
2) verify every PLANNED doc intent by code search on main + all branches + deleted history (no text similarity)
3) re-check doc CONTRADICTED refs against hostile-checked statuses
4) mark engineering / non-product items as non-capabilities; fix features from evidence."""
import json,pickle,re,os,collections,yaml
A=_P.ATLAS;P=A+"/v2/capabilities.json";V=A+"/v4"
d=json.load(open(P));d["capabilities"]=[c for c in d["capabilities"] if c.get("source")!="manual-v4"];K=d["capabilities"];IX=pickle.load(open(V+"/index.pkl","rb"))
M,RT,I18,BR,HI=IX["main"],IX["routes"],IX["i18n"],IX["branch"],IX["hist"]
T=json.load(open(A+"/analysis/trace.json"))["routes"]
INT={i["iid"]:i for i in json.load(open(A+"/v3/intents.json"))["intents"]}
byid={c["id"]:c for c in K}
def strip(p):return re.sub(r":\d+$","",p.split(" @ ")[-1]) if isinstance(p,str) else ""
# ---- reachability (nav routes) ----
navr=[i for i in T.values() if i["inbound_links"]]
REACH=collections.defaultdict(set)
for i in navr:
    for f in i["closure_files"]:REACH[f].add(i["url"])
UI=re.compile(r"\.tsx$|/hooks/|/screens/|/components/|/app/")
SERVER=re.compile(r"^apps/sanctuary-api/|/supabase/|\.sql$|\.zmodel$|/adapters/|/managers/|/api/")
# ---- file -> caps ----
F2C=collections.defaultdict(set)
for c in K:
    if c.get("source")=="doc":continue
    L=c["layers"];fs=set()
    if isinstance(L.get("api"),str):fs.add(strip(L["api"]))
    cl=L.get("client") or {}
    for s in (cl.get("valid",[])+cl.get("dead",[])) if isinstance(cl,dict) else []:fs.add(strip(s))
    fs|=set(L.get("routes",{}).keys());fs|=set(c["ui"].get("paths",[]))
    for s in L.get("code",[]) or []:fs.add(strip(s))
    for f in fs:
        if f:F2C[f].add(c["id"])
# ---- 1) auth domain ----
AD=yaml.safe_load(open((V.replace("/v4","/v5") if os.path.exists(V.replace("/v4","/v5")+"/auth_domain.yaml") else V)+"/auth_domain.yaml"));log=collections.Counter();corr=[]
def files_in(o):return sorted(set(re.findall(r"((?:apps|packages)/[\w@()\[\]./+-]+?\.(?:tsx?|json|sql|zmodel))",json.dumps(o))))
for a in AD:
    if a["status"]=="engineering":continue
    fl=files_in(a)
    c={"id":a["id"],"kind":"verified-task","source":"manual-v4","feature":"auth-identity" if a["id"].startswith("auth:") else "school-onboarding",
       "task":a["task"],"roles":a.get("roles",[]),"layers":{"schema":"see evidence","api":"see evidence","client":{"valid":[],"dead":[]},"routes":{},"code":fl},
       "ui":{"kind":"verified","needed":["screen"],"existing":["screen"] if a["status"] in("LIVE","PARTIAL") else [],"missing":[] if a["status"] in("LIVE","PARTIAL") else ["screen"],"paths":[f for f in fl if f.endswith(".tsx")][:6]},
       "status":a["status"],"confidence":"high","why":"hand-verified v4: "+(a.get("blocker") or a.get("caveat") or a.get("status_note") or a.get("evidence") or "file:line trace in v4/auth_domain.yaml"),
       "verification":{"method":"manual grep + import trace","terms":[],"hits":fl[:12],"verdict":a["status"],"confidence":"high"},"evidence":{k:v for k,v in a.items() if k not in("id","task","roles","status")}}
    K.append(c);byid[c["id"]]=c;log["auth-added"]+=1
for o in json.load(open(V+"/manual_overrides.json")):
    c=byid.get(o["id"])
    if not c:print("override miss",o["id"]);continue
    if c["status"]!=o["status"]:corr.append({"id":o["id"],"from":c["status"],"to":o["status"],"evidence":o["evidence"]})
    c["status"]=o["status"];c["why"]=f"manual v4 override: {o['evidence']}";c["verification"]={"method":"manual trace","terms":[],"hits":[],"verdict":o["status"],"confidence":"high"}
# auth keyword routing for doc intents (checked before generic search)
AUTHMAP=[(r"forgot password|reset password|password reset|recover(y)? password","auth:password-reset-web"),(r"magic link|\botp\b|passwordless","auth:magic-link"),
 (r"google (sign|log)|oauth","auth:oauth-google"),(r"passkey|webauthn","auth:passkey"),(r"\btotp\b|\bmfa\b|2fa|two.factor","auth:totp-mfa"),
 (r"guest|anonymous","auth:guest-then-link"),(r"sign ?out|log ?out","auth:sign-out"),
 (r"founder.?school.?bond|school.?founder.?bond","onboarding:founder-school-bond"),(r"(creat\w*|setup|set up|bootstrap)\W+(a |the )?school|school (creation|selection/creation)|first principal","onboarding:school-create-first-principal"),
 (r"scan\w*\W+(a |the )?qr|qr scan|qr.?handler|scanner","onboarding:qr-scan"),(r"qr|qrcode","onboarding:invite-qr-generate"),
 (r"invitation welcome","onboarding:invitation-welcome"),(r"(generat|creat|manag)\w*\W+(\w+\W+)?invite|invite (code )?(generat|manag)|invite manager|invites? limit|limited to \d+ \w+ invites","onboarding:invite-generate"),
 (r"invite|invitation|join (a |the )?(school|class)|enrol","onboarding:invite-redeem"),(r"role selection|choose (a |your )?(role|capacity)|capacity|select (a |your )?role","onboarding:role-selection"),
 (r"profile setup|set up (your )?profile|display name","onboarding:profile-setup"),(r"onboard","onboarding:complete"),
 (r"sign ?up|register|registration|create (an )?account","auth:sign-up-email"),(r"sign ?in|log ?in|login|auth screen|authentication","auth:sign-in-password")]
AUTHMAP=[(re.compile(p,re.I),t) for p,t in AUTHMAP]
AUTHX=re.compile(r"\b(jwt|claims?|locally|configure|streams?|powersync|teacher management|captcha|asset ?links|utilities|runtime|sdk|signing|registration of|rls|policy|policies|middleware|service role|edge function)\b",re.I)
# ---- term derivation ----
STOP=set("the a an and or of to for in on with by from as at is are be this that it its into via per all any new add create implement build make use using update fix ensure should can will must not no yes done todo view see show page screen component components feature features flow user users data list item items card modal button".split())
GEN=set("implement implemented created create update view text pressable textinput flatlist scrollview touchableopacity safeareaview image animated usestate useeffect usememo usecallback useref console storage async await promise react native expo github supabase typescript javascript json yaml markdown docs mobile apps packages src null undefined true false string number boolean object array function const export import return pending complete done live partial book reports cached index types type utils util helpers helper config main default props state hooks hook test tests style styles theme button modal card list view screen page data item value error loading user users name title text label icon image link content layout header footer section container wrapper provider context store service api client server route routes params query result results status role roles school class student teacher parent principal admin".split())
SYN={"login":["signin","sign_in"],"signup":["sign_up","register"],"forgot":["reset"],"qr":["qrcode"],"invite":["invitation","invite_code"],"feed":["feed","timeline"],"dm":["directmessage","conversation"],"leaderboard":["leaderboard","ranking"],"timetable":["timetable","schedule"],"poll":["poll","quickpoll"]}
def camel_split(s):return re.sub(r"(?<=[a-z0-9])(?=[A-Z])"," ",s).replace("_"," ").replace("-"," ").lower().split()
def terms_for(text):
    ids,phr,rts,keys=set(),set(),set(),set()
    for b in re.findall(r"`([^`]{2,80})`",text):
        if "/" in b and re.search(r"\.\w{2,4}$",b):b=os.path.basename(b).split(".")[0]
        for t in re.findall(r"[A-Za-z_][A-Za-z0-9_]{3,}",b):
            if t.islower() and "_" not in t and (len(t)<6 or len(M.get(t,()))>15):continue
            if t.lower() not in GEN and not re.fullmatch(r"(TCH|STU|PRN|PAR|ADM)\w*",t):ids.add(t)
        if b.startswith("/") and re.fullmatch(r"/[a-z][\w\-\[\]/:]*",b):rts.add(re.sub(r"/:\w+","/[code]",b).rstrip("/"))
        if re.fullmatch(r"[a-z]+(\.[a-zA-Z_]+){1,4}",b):keys.add(b.lower())
    for t in re.findall(r"\b([A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)+|[a-z]+(?:[A-Z][a-z0-9]+)+|[a-z]+(?:_[a-z0-9]+)+)\b",text):
        if t.lower() not in GEN:ids.add(t)
    for r in re.findall(r"(?<![\w.])(/[a-z][a-z0-9\-]+(?:/[a-z0-9\-\[\]]+)*)",text):rts.add(r)
    plain=re.sub(r"`[^`]*`|<!--.*?-->|\*\*|https?://\S+"," ",text)
    w=[x for x in re.findall(r"[A-Za-z]{3,}",plain.lower()) if x not in STOP]
    for n in (2,3):
        for i in range(len(w)-n+1):phr.add("".join(w[i:i+n]))
    for x in w:
        for s in SYN.get(x,[]):phr.add(s)
    return ids,phr,rts,keys
ENG=re.compile(r"\b(github|gitignore|git rm|secret scanning|support\.md|security\.md|codeowners|posthog|sentry|breadcrumb|indexes|scans?\b|refactor|lint|eslint|tsconfig|typescript|unit tests?|e2e|fixtures?|test(s|ing)? (for|use|cover)|storybook|ci\b|github actions|pipeline|bundle size|deploy\w*|docker|monorepo|turbo|pnpm|dependency|dependencies|deprecat\w*|rename|consolidat\w*|move (the )?\w+ (to|into)|migrat\w* (to|from)|codemod|logging|telemetry|retention|cleanup|cache|caching|perf\w*|retry|backoff|pagination|request policy|layoutsizing|appendchild|figma|token budget|env(ironment)? var\w*|permission helper|helper functions?|adapter|repository pattern|barrel|import path|type safety|types? (for|in)|schema validation|zod|debug\w*|developer|documentation|readme|guide\b|docs?\b|component)\b",re.I)
OPS=re.compile(r"\b(blog|launch post|marketing|press|investor|fundrais\w*|hiring|union|partnership|pitch|webinar|social media|newsletter|outreach|grant application|legal|trademark|ambassador)\b",re.I)
USER=re.compile(r"\b(teachers?|students?|parents?|principals?|guardians?|admins?|founders?|users?)\b.{0,40}\b(can|could|should|sees?|views?|creates?|submits?|tracks?|manages?|approves?|joins?|receives?|gets?|records?)\b",re.I)
def ui_like(f):return bool(UI.search(f)) and not SERVER.search(f)
def classify(c,full):
    ids,phr,rts,keys=terms_for(full)
    hits={};tried=[]
    for t in ids:
        k=t.lower();tried.append(t);fs=M.get(k,set())
        if fs and len(fs)<=150:hits[t]=("id",sorted(fs)[:40],len(fs))
    for p in phr:
        fs=M.get(p,set())
        if fs and len(fs)<=60 and len(p)>=8:hits[p]=("phrase",sorted(fs)[:40],len(fs))
    tried+=sorted(phr)[:12]
    for r in rts:
        tried.append(r);fs=RT.get(r,set())|{f for f in T if T[f]["url"]==r}
        if fs:hits[r]=("route",sorted(fs)[:20],len(fs))
    for k in keys:
        tried.append(k)
        if k in I18:hits[k]=("i18n",sorted(I18[k])[:5],len(I18[k]))
    br={t:sorted(BR[t.lower()])[:4] for t in ids if t.lower() in BR}
    hs={t:sorted(HI[t.lower()])[:3] for t in ids if t.lower() in HI}
    return ids,phr,rts,keys,hits,br,hs,tried
def main_feature(fs):
    cnt=collections.Counter(byid[x]["feature"] for f in fs for x in F2C.get(f,()))
    return cnt.most_common(1)[0][0] if cnt else None
merged=[];noncap=[];recl=collections.Counter();out=[]
keep=[]
for c in K:
    if c.get("source")!="doc" or c["status"]!="PLANNED":keep.append(c);continue
    iid=c["id"].split(":",1)[1];i=INT.get(iid,{});full=i.get("text",c["task"])
    ids,phr,rts,keys,hits,br,hs,tried=classify(c,full)
    hitfiles=sorted({f for v in hits.values() for f in v[1] if not f.startswith("#")})
    strong=[t for t,v in hits.items() if v[0] in("id","route","i18n")]
    v={"method":"code-search main(3165 files)+19 branches+deleted history; identifiers/routes/i18n/phrase-joins; file->capability map + nav reachability","terms":tried[:20],"hits":{t:{"kind":k,"df":n,"files":fs[:5]} for t,(k,fs,n) in list(hits.items())[:10]}}
    if br:v["branch_hits"]=br
    if hs:v["history_hits"]=hs
    eng=(ENG.search(full) and not USER.search(full)) ; ops=bool(OPS.search(full))
    auth=None
    for rx,tid in AUTHMAP:
        if rx.search(full) and c["feature"] in("auth-identity","school-onboarding","?","ai-assistant","classroom-core","community-feed") :
            auth=tid;break
    tgt=None;verdict=None;conf="low"
    comp=bool(re.search(r"\bcomponents?\b",full,re.I)) and not USER.search(full)
    if auth and AUTHX.search(full):auth=None
    if auth and auth in byid and not eng and not ops:
        tgt=auth;verdict="MERGED";conf="high" if c["feature"] in("auth-identity","school-onboarding") else "medium"
    elif comp:
        verdict="NON-CAPABILITY";v["reason"]="engineering component item, not a user capability";v["engineering_status"]="EXISTS on main" if hitfiles else ("LOST (branch/history only)" if (br or hs) else "not found");conf="high" if hitfiles else "medium"
    elif ops:
        verdict="NON-CAPABILITY";v["reason"]="non-product (ops/marketing/process)";conf="medium"
    else:
        cand=collections.Counter()
        for t,(k,fs,n) in hits.items():
            wt=(3 if k in("id","route") else 1)/max(1,n**0.5)
            for f in fs:
                cs=F2C.get(f,())
                if not cs or len(cs)>8:continue
                for x in cs:cand[x]+=wt/len(cs)
        if strong or len([1 for t,v2 in hits.items() if v2[0]=="phrase"])>=2:
            if cand:
                tgt,score=cand.most_common(1)[0]
                if score<0.3:tgt=None
            if tgt:
                low=[t.lower() for t in hits]
                for x,_ in cand.most_common(5):
                    key=re.sub(r"[^a-z0-9]","",(x+byid[x]["task"]).lower())
                    if any(len(t)>=6 and re.sub(r"[^a-z0-9]","",t) in key for t in low):tgt=x;break
            if tgt:verdict="MERGED";conf="high" if strong else "medium"
            else:
                rf=[f for f in hitfiles if f in REACH]
                if any(ui_like(f) for f in rf):verdict="PARTIAL";v["reason"]="code exists on a nav-reachable route but no capability row covers it; completeness not proven";v["reach"]=sorted({u for f in rf for u in REACH[f]})[:5]
                elif any(ui_like(f) for f in hitfiles):verdict="UI-UNWIRED"
                elif hitfiles:verdict="BACKEND-ONLY"
                conf="high" if strong else "medium"
                if not hitfiles:verdict=None
        if not verdict and (br or hs):verdict="LOST";conf="medium";v["reason"]="identifier exists only on another branch or in deleted history"
        if eng and verdict!="MERGED":
            v["engineering_status"]=verdict or "PLANNED";verdict="NON-CAPABILITY";v["reason"]="engineering/implementation item (component/infra/test/docs), not a user capability";conf="medium" if hits else "low"
        if not verdict:verdict="PLANNED";conf="medium" if (ids or rts) else "low";v["negative"]=f"no hit for {len(tried)} terms on main, branches or history"
    v["verdict"]=verdict;v["confidence"]=conf
    rec={"id":c["id"],"task":c["task"],"from":"PLANNED","to":verdict if verdict!="MERGED" else f"MERGED->{tgt}","verification":v}
    out.append(rec);recl[verdict if verdict!="MERGED" else "MERGED:"+byid[tgt]["status"]]+=1
    if verdict=="MERGED":
        t=byid[tgt];s0=c["provenance"]["sources"][-1]
        t.setdefault("doc_refs",[]).append({"intent":iid,"verdict":"MATCHED(v4-evidence)","sim":None,"src":f"{s0['doc']}:{s0['line']}","claim":i.get("latest_claim"),"note":f"v4 merged by code evidence ({conf}): {', '.join(list(hits)[:4]) or 'auth keyword route'}"})
        merged.append(rec);continue
    if verdict=="NON-CAPABILITY":noncap.append(rec);continue
    c["status"]=verdict;c["verification"]=v;c["confidence"]=conf
    if verdict in("LIVE","PARTIAL"):c["doc_contradiction"]=False
    mf=main_feature(hitfiles)
    if mf and mf!=c["feature"]:c["feature_v3"]=c["feature"];c["feature"]=mf;log["feature-fixed"]+=1
    if verdict!="PLANNED":
        c["ui"]={"kind":"evidence","needed":["screen"],"existing":["screen"] if verdict=="PARTIAL" else [],"missing":[] if verdict=="PARTIAL" else ["screen"],"paths":[f for f in hitfiles if f.endswith(".tsx")][:4]}
        c["layers"]["code"]=hitfiles[:8]
        c["why"]=f"v4 code evidence: {', '.join(list(hits)[:4])}"+(f"; {v.get('reason')}" if v.get("reason") else "")
    else:
        c["why"]=f"v4 negative search: {v['negative']}"
    keep.append(c)
d["capabilities"]=keep
# ---- 3) CONTRADICTED re-check ----
cx=collections.Counter();cxr=[]
for c in keep:
    for r in c.get("doc_refs",[]):
        if r["verdict"]!="CONTRADICTED":continue
        done=(r.get("claim") or "")in("done","implemented","live")
        s=c["status"]
        if done and s=="LIVE":res="RESOLVED (doc says done; hostile check LIVE)"
        elif done:res=f"CONFIRMED (doc says done; code {s})"
        elif s=="LIVE":res="CONFIRMED-STALE-DOC (doc says not done; code LIVE)"
        else:res=f"RESOLVED (doc not-done; code {s})"
        r["v4"]=res;cx[res.split(" ")[0]]+=1;cxr.append({"cap":c["id"],"intent":r["intent"],"result":res})
        if res.startswith("RESOLVED"):pass
    if c.get("doc_contradiction") and not any(r.get("v4","").startswith("CONFIRMED") for r in c.get("doc_refs",[])) and c.get("source")!="doc":c["doc_contradiction"]=False
pc=sum(1 for r in out if INT.get(r["id"].split(":",1)[1],{}).get("verdict")=="CONTRADICTED")
json.dump(d,open(P,"w"),indent=1)
json.dump({"planned":out,"corrections":corr,"contradicted":cxr,"counts":{"planned_reclass":recl,"contradicted":cx,"planned_contradicted_rechecked":pc,**log}},open(V+"/verification.json","w"),indent=1,default=list)
yaml.safe_dump([{"id":r["id"],"task":r["task"],"reason":r["verification"].get("reason"),"engineering_status":r["verification"].get("engineering_status"),"terms":r["verification"]["terms"][:8]} for r in noncap],open(A+"/NON_CAPABILITIES.yaml","w"),sort_keys=False,allow_unicode=True,width=200)
print(dict(recl),dict(cx),dict(log),len(corr))
