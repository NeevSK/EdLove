"""Extract intended capabilities/tasks/requirements from canonical docs -> v3/intents.json"""
import json,re,os,collections
V=os.path.dirname(os.path.abspath(__file__));docs=json.load(open(V+"/docs.json"))
ROLE={"teacher":r"teachers?|educators?|class teacher","principal":r"principals?|head ?teachers?|school leaders?|grade heads?|section heads?|vice principal",
 "student":r"students?|learners?|pupils?|child(ren)?(?! attendance)","parent":r"parents?|guardians?|famil(y|ies)","admin":r"admins?|administrators?|moderators?|curators?|staff admin",
 "founder":r"founders?|naveen|ecosystem|investor"}
DONE=re.compile(r"✅|\[x\]|\b(done|fixed|shipped|completed?|implemented|live|wired|works)\b",re.I)
NOTDONE=re.compile(r"❌|⚠️|\[ \]|\b(todo|future|planned|not (yet )?(built|wired|implemented)|missing|coming soon|placeholder|mock|stub|gap|roadmap|post-alpha|backlog)\b",re.I)
PRI=re.compile(r"\b(P[0-3])\b|\bTier ?([0-5])\b|\bPhase ?([0-9])\b|\b(critical|high|medium|low) priority\b|\bpriority:? ?(high|medium|low|critical)\b",re.I)
INTENT_H=re.compile(r"(roadmap|todo|to-do|next|planned|backlog|requirement|feature|phase|tier|gap|should|user (stories|tasks)|capabilit|scope|milestone|must|wishlist|future|mvp|alpha|beta|deliverable|acceptance|spec)",re.I)
VERB=re.compile(r"^(add|allow|build|create|enable|implement|let|log|view|see|track|send|submit|approve|record|manage|show|support|wire|write|integrate|generate|export|import|share|invite|browse|search|post|publish|pay|book|schedule|notify|review|grade|mark|upload|download|connect|sync|display|edit|delete|configure|assign|monitor|claim|give|join|create|onboard|offer|provide|launch|ship|migrate|replace|expose|unify|surface)\b",re.I)
STORY=re.compile(r"\bas an? ([\w -]{3,30}?),? i (want|need|can|should)\b(.*)",re.I)
ABLE=re.compile(r"\b(should|must|will|can|needs? to|wants? to|be able to)\b",re.I)
NOISE=re.compile(r"^(\||-|\*|\d+\.)?\s*(npm|pnpm|git|cd|export|import|const|let|function|```)|http|^\s*$")
out=[]
for d in docs:
    if d.get("dup_of") or d["kind"] in("vendor-skill","content/marketing","research"):continue
    lines=d["text"].split("\n");head="";inh=False;inc=False;thead=""
    for i,l in enumerate(lines,1):
        if l.strip().startswith("```"):inc=not inc;continue
        if inc:continue
        m=re.match(r"#+\s+(.*)",l)
        if m:head=m.group(1);inh=bool(INTENT_H.search(head));continue
        s=l.strip()
        if s.startswith("|") and re.match(r"^\|[\s:-]+\|",s):continue
        if s.startswith("|") and i<len(lines) and re.match(r"^\s*\|[\s:|-]+\|\s*$",lines[i] if i<len(lines) else ""):thead=s;continue
        kind=None;text=None
        sm=STORY.search(s)
        if sm:kind,text="user-story",s
        elif re.match(r"^[-*]\s*\[( |x|X)\]\s+",s):kind,text="checkbox",re.sub(r"^[-*]\s*\[( |x|X)\]\s+","",s)
        elif s.startswith("|"):
            cells=[c.strip() for c in s.strip("|").split("|")]
            if len(cells)>=2 and (INTENT_H.search(thead) or inh or re.search(r"should|wired|status|gap|feature|task",thead,re.I)):
                body=[c for c in cells if not re.fullmatch(r"\d+|[#\-✅❌⚠️ ]*",c)]
                if body and len(body[0])>8:kind,text="table-row",body[0]+(" — "+" | ".join(body[1:3]) if len(body)>1 else "")
        elif inh and re.match(r"^([-*]|\d+\.)\s+",s):
            t=re.sub(r"^([-*]|\d+\.)\s+","",s);tt=re.sub(r"[*_`]","",t)
            if VERB.match(tt) or ABLE.search(tt) or re.search(r"\b(screen|page|view|dashboard|flow|feature|report|workspace)\b",tt,re.I):kind,text="list-item",t
        elif ABLE.search(s) and any(re.search(r"\b(%s)\b"%p,s,re.I) for p in ROLE.values()) and re.search(r"\b(be able to|should be able|can now|must be able|will be able|wants? to)\b",s,re.I):kind,text="sentence",s
        if not kind or NOISE.search(text or "") or len(text)<12 or len(text)>400:continue
        roles=[r for r,p in ROLE.items() if re.search(r"\b(%s)\b"%p,text+" "+head,re.I)]
        pm=PRI.search(text+" "+head)
        claim="done" if (DONE.search(text) and not NOTDONE.search(text)) or re.match(r"^[-*]\s*\[(x|X)\]",s) else "not-done" if NOTDONE.search(text) or re.match(r"^[-*]\s*\[ \]",s) else "intent"
        out.append({"doc":d["path"],"line":i,"origin":d["origin"],"kind_doc":d["kind"],"heading":head[:120],"form":kind,"text":re.sub(r"\s+"," ",text)[:300],
            "roles":roles or ["?"],"priority":pm.group(0) if pm else None,"claim":claim,
            "doc_date":(d["front"].get("updated") or d["front"].get("created") or d["front"].get("date") or (d.get("first") or [None,None])[1] or "")[:16],"doc_last_commit":(d.get("last") or [None,None])[1],"date_basis":"front-matter" if (d["front"].get("updated") or d["front"].get("created") or d["front"].get("date")) else "first-commit","doc_first":(d.get("first") or [None,None])[1],
            "doc_status":d["front"].get("status"),"deleted":d.get("deleted")})
json.dump(out,open(V+"/intents_raw.json","w"))
print(len(out),collections.Counter(o["form"] for o in out),collections.Counter(o["claim"] for o in out))
print(collections.Counter(r for o in out for r in o["roles"]))
