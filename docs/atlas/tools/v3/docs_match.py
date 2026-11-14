"""Classify, dedupe and match doc intents to capabilities.yaml -> v3/intents.json"""
import json,re,os,collections,yaml
from rapidfuzz import fuzz,process
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
V=os.path.dirname(os.path.abspath(__file__));A=os.path.dirname(V)
raw=json.load(open(V+"/intents_raw.json"))
K=[c for c in json.load(open(A+"/v2/capabilities.json"))["capabilities"] if c.get("source")!="doc"]
ENG=re.compile(r"\.(tsx?|js|json|sql|ya?ml|md)\b|\bsrc/|migrat|refactor|lint|eslint|\btsc\b|typescript|\bimports?\b|package|dependenc|bundle|version|\benv\b|doppler|\bci\b|\bbuild\b|\beas\b|jest|coverage|cedar|\brls\b|schema|contract|tailwind|config|deploy|monorepo|\bmcp\b|readme|commit|\bpr\b|webpack|metro|expo-|sdk|zod|powersync|zenstack|orpc|hono|effect|turbo|pnpm|storybook|token|theme|css|style|glass|backdrop|font|icon|animation|component",re.I)
QA=re.compile(r"^(test|verify|check|ensure|confirm|login as|smoke|qa\b)|should not see|screenshot|regression",re.I)
BIZ=re.compile(r"partner|pricing tier|investor|funding|revenue|marketing|campaign|grant|sponsor|business model|go-to-market|brand",re.I)
PROD=re.compile(r"\b(screen|page|view|dashboard|see|track|log|mark|creat|shar|post|attendance|grade|mood|journal|library|communit|message|notif|report|payment|fee|invite|onboard|profile|reward|badge|gift|thuthimal|leave|calendar|event|timetable|assignment|submission|lesson|class(room)?|student|teacher|parent|principal|guardian|school|feed|announce|reflection|goal|wellbeing|sleep|energy|reminder|chat|ai assistant|search|bookmark|collection|resource|quiz|exam|mark(s)?|result|progress|forest|map|scan|pdf|export|qr|claim|enrol|approve|inventory|budget|account|ledger|form|survey|feedback|privacy|consent|delete account|login|sign ?in|sign ?up|password|offline|sync)\w*",re.I)
def cls(x):
    t=x["text"]
    if QA.search(t):return "qa"
    if BIZ.search(t):return "business"
    if PROD.search(t) and not (len(ENG.findall(t))>=2 and x["roles"]==["?"]):return "product"
    if ENG.search(t):return "engineering"
    return "other"
for x in raw:x["class"]=cls(x)
SUPERSEDED=re.compile(r"old_docs|/archive|/old/|_archive|historical|deprecated|superseded|legacy",re.I)
for x in raw:
    x["superseded"]=bool(x["deleted"] or SUPERSEDED.search(x["doc"]) or SUPERSEDED.search(x.get("doc_status") or ""))
norm=lambda t:re.sub(r"\s+"," ",re.sub(r"[`*_✅❌⚠️🔴🟡🟢\[\]()#|—:.-]"," ",t.lower())).strip()
# ---- dedupe product intents into clusters
prod=[x for x in raw if x["class"]=="product"];keys=[norm(x["text"]) for x in prod]
par=list(range(len(prod)))
def f(i):
    while par[i]!=i:par[i]=par[par[i]];i=par[i]
    return i
M=process.cdist(keys,keys,scorer=fuzz.token_set_ratio,score_cutoff=92,workers=8,dtype="uint8")
import numpy as np
ii,jj=np.nonzero(M)
for i,j in zip(ii,jj):
    if i<j and abs(len(keys[i])-len(keys[j]))<max(25,0.4*max(len(keys[i]),len(keys[j]))):par[f(j)]=f(i)
cl=collections.defaultdict(list)
for i in range(len(prod)):cl[f(i)].append(prod[i])
# ---- capability corpus
def ctext(c):
    s=" ".join([c["task"],c["id"],c.get("proc") or "",c["feature"],c["why"]," ".join(os.path.basename(p) for p in c["ui"].get("paths",[])[:4])])
    return re.sub(r"(?<=[a-z])(?=[A-Z])"," ",s).replace("_"," ").replace("-"," ").replace("."," ").replace(":"," ")

DOM={"mood|wellbeing|feeling|emotion":["self-wellbeing"],"journal|diary|fire journal|burn":["self-wellbeing","decision-journal"],"decision":["decision-journal"],
"sleep|energy forecast|reminder|wind.?down|breath":["self-wellbeing"],"attendance|present\\b|absent":["attendance","teacher-attendance"],"grade|gradebook|marks?\\b|score|result":["gradebook"],
"library|resource|collection|bookmark|shelf":["library-browse","library-curation-review"],"curat|verify resource|broken link":["library-curation-review"],
"scan|ocr|pdf|spreadsheet|image to pdf|document scanner":["library-tools"],"community|posts?\\b|feeds?\\b|groups?\\b|comments?\\b|manifesto|upvote|pin(s|ned)?\\b":["community-feed"],
"chat|message|dm\\b|direct message|conversation":["direct-messages","messaging-router"],"notif":["notifications"],"leaves?\\b|leave request":["staff-leave"],"calendar|events?\\b":["calendar-events"],
"pay\\b|payments?|fees?\\b|invoice|receipt|payhere|stripe":["payments"],"budget|accounting|ledger|transaction|cheque":["accounting"],"inventory|stock|resource need":["inventory"],
"reward|badge|points|achievement|streak|gamif":["rewards-energy","growth-ripples"],"thuthimal|gift|gratitude":["thuthimal"],"reflection|reflect":["learning-reflections"],
"goals?\\b":["student-goals"],"assignment|submission|homework|submit work":["assignments"],"lesson|material|curriculum":["lessons-materials"],
"onboard|school setup|join school|invite|invitation|qr|enrol":["school-onboarding","auth-identity"],"profile|avatar|bio|social link":["profile"],"setting|preference|language|accessib":["app-settings"],
"\\bai\\b|assistant|agent|gemini|llm":["ai-assistant","durable-agents"],"maps?\\b|topology|constellation|cosmic":["cosmic-map"],"forest\\b":["school-forest"],"announce":["announcements"],
"privacy|consent|data export|delete account":["privacy-ledger","app-settings"],"forms?\\b|form builder|survey|questionnaire":["form-builder"],"guardian|parent":["guardian-workspace"],
"founder|ecosystem|investor dashboard":["founder-dashboard"],"principal dashboard|school stats|school pulse|staff presence|teacher carousel":["principal-workspace"],
"workforce|payroll|\\bhr\\b|staff management":["workforce"],"tuition|batch|commercial":["tuition-commercial"],"offline|sync":["offline-sync"],
"login|log in|sign ?in|sign ?up|password|auth|account recovery|otp|magic link":["auth-identity"],"echo(es)?\\b":["classroom-echoes"],"missions?\\b":["sacred-missions"],"presence|online status":["presence"],
"editorial|article|blog":["editorial"],"\\bnotes?\\b":["classroom-notes","principal-notes"],"potential|talent":["student-potential"],"longitudinal|student history|student profile":["longitudinal-profile"],
"wisdom|daily content|quote":["daily-wisdom"],"mirror":["warm-mirror"],"classroom|class list|roster|shadow student":["classroom-core"],"academic (year|cycle)|terms?\\b|subjects?\\b|hierarchy":["academic-cycles"],
"atlas|census|school directory":["edlove-atlas-web"],"admin console|audit log|feature registry":["admin-console"],"pricing|plan tier|subscription":["pricing-manifest"],
"timetable|schedule":["~timetable"],"quiz|exam|test paper|assessment":["~assessment","guardian-workspace"],"polls?\\b":["~polls"],"report card|progress report":["~report-cards"],"video call|meeting|zoom":["~video"],
"transport|bus":["~transport"],"canteen|meal":["~canteen"],"library loan|borrow":["~library-loans"]}
DR=[(re.compile(r"\b(?:"+k+")",re.I),v) for k,v in DOM.items()]
def doms(t):return {f for p,v in DR if p.search(t) for f in v}
FEATS={c["feature"] for c in K}
cdom=[]
for c in K:
    if c["feature"] in FEATS and not c["id"].startswith("task:") and not c["feature"].startswith("pkg:"):cdom.append({c["feature"]})
    else:cdom.append(doms(c["task"]+" "+c["id"]))
CT=[ctext(c) for c in K];vec=TfidfVectorizer(stop_words="english",ngram_range=(1,2),min_df=1,sublinear_tf=True)
X=vec.fit_transform(CT)
FSTAT={f["id"]:f["status"] for f in yaml.safe_load(open(A+"/features.yaml"))["features"]}
VERBS='add|allow|build|create|enable|implement|let|log|view|see|track|send|submit|approve|record|manage|show|support|integrate|generate|export|share|invite|browse|search|post|publish|pay|book|schedule|notify|review|grade|mark|upload|download|connect|display|edit|delete|configure|assign|monitor|claim|give|join|onboard|offer|provide|capture|celebrate|plan|reflect|write|read|listen|play|ask|chat|message|vote|rate|comment'
intents=[]
for n,(root,mem) in enumerate(cl.items()):
    mem.sort(key=lambda x:x["doc_date"] or "")
    rep=max(mem,key=lambda x:len(x["text"]))
    roles=sorted({r for x in mem for r in x["roles"] if r!="?"}) or ["?"]
    live_src=[x for x in mem if not x["superseded"]];latest=(live_src or mem)[-1]
    claims={x["claim"] for x in mem}
    txt=rep["text"]+" "+rep["heading"];D=doms(rep["text"]) or doms(rep["heading"])
    q=vec.transform([re.sub(r"(?<=[a-z])(?=[A-Z])"," ",txt)]);sims=linear_kernel(q,X).ravel()
    cand=[t for t in range(len(K)) if cdom[t]&D] if D else []
    cand.sort(key=lambda t:-(sims[t]+(0.05 if roles!=["?"] and set(roles)&set(K[t]["roles"]) else 0)))
    best=[(K[t]["id"],round(float(sims[t]),3),K[t]["status"]) for t in cand[:3]]
    real={f for f in D if not f.startswith("~")}
    pr=next((x["priority"] for x in reversed(mem) if x["priority"]),None)
    rec={"iid":f"intent-{n:05d}","text":rep["text"],"roles":roles,"priority":pr,"domains":sorted(D),
         "sources":[{"doc":x["doc"],"line":x["line"],"date":x["doc_date"],"claim":x["claim"],"superseded":x["superseded"],"origin":x["origin"]} for x in mem][:12],
         "n_sources":len(mem),"first_date":mem[0]["doc_date"],"last_date":mem[-1]["doc_date"],"latest_claim":latest["claim"],
         "all_superseded":not live_src,"docs_disagree":len(claims&{"done","not-done"})==2 and len({x["doc"] for x in mem})>1,"best":best}
    tasklike=(roles!=["?"] or re.match(r"^\W*(%s)"%VERBS,re.sub(r"[`*_]","",rep["text"]),re.I) or re.search(r"\b[A-Z]{3}-[A-Z]{3}-\d{3}\b|\*\*UI\*\*|be able to|should (be able|see|have)",rep["text"])) and len(ENG.findall(rep["text"]))<2
    rec["tasklike"]=bool(tasklike)
    recent=bool(live_src) and (latest["doc_date"] or "")>="2026-06-01"
    if not D and not tasklike:rec.update(match="UNCLASSIFIED",verdict="UNCLASSIFIED")
    elif best and best[0][1]>=0.22:
        rec.update(match="MATCHED-capability",sim=best[0][1],cap=best[0][0],cap_status=best[0][2])
    elif not tasklike:rec.update(match="AREA-ONLY-NOT-TASK",verdict="UNCLASSIFIED",area=sorted(real))
    else:rec.update(match="NEW",verdict="NEW",area=sorted(D))
    if "cap_status" in rec:
        rec["verdict"]=("CONTRADICTED" if rec["cap_status"] in("PARTIAL","UI-UNWIRED","BACKEND-ONLY","LOST") else "CLAIM-UNVERIFIED" if rec["cap_status"]=="UNVERIFIED" else "MATCHED") if latest["claim"]=="done" else "MATCHED"
        rec["confidence"]="high" if rec["sim"]>=0.30 else "medium"
    if rec["verdict"]=="NEW":
        if latest["claim"]=="done":rec["verdict"]="CONTRADICTED";rec["contradiction"]="doc claims built; no matching capability in code"
        rec["confidence"]="high" if recent and (rec["n_sources"]>1 or pr) else "low"
        rec["likely_wanted"]=recent and not rec["all_superseded"]
    intents.append(rec)
MANUAL=json.load(open(V+"/manual_checks.json"))
for r in intents:
    for k,v in MANUAL.items():
        if k.lower() in r["text"].lower() and r["verdict"] in("CONTRADICTED","CLAIM-UNVERIFIED","MATCHED"):
            r["manual_check"]=v["note"]
            if v.get("verdict"):r["verdict"]=v["verdict"]
json.dump({"intents":intents,"nonproduct":collections.Counter(x["class"] for x in raw),"raw_n":len(raw),
  "nonproduct_samples":{k:[{"text":x["text"][:160],"doc":x["doc"],"line":x["line"]} for x in raw if x["class"]==k][:40] for k in("engineering","qa","business","other")},
  "engineering_raw":[{"text":x["text"][:200],"doc":x["doc"],"line":x["line"],"date":x["doc_date"],"claim":x["claim"],"superseded":x["superseded"]} for x in raw if x["class"]=="engineering"]},
  open(V+"/intents.json","w"))
print("raw",len(raw),collections.Counter(x["class"] for x in raw));print("product intents (deduped)",len(intents))
print(collections.Counter(i["verdict"] for i in intents),collections.Counter(i["match"] for i in intents))
print(collections.Counter(d for i in intents if i["verdict"]=="NEW" for d in i["domains"]).most_common(15))
