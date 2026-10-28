import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..")); import atlas_paths as _P  # noqa: E402
"""Collect every doc: main (.md/.mdx/.txt), the optional EDLOVE_PLAN folder, and docs deleted in any ref. Dates (Asia/Colombo), kind, dedupe. -> v3/docs.json"""
import subprocess,os,re,json,hashlib,collections,random
R=_P.REPO;V=os.path.dirname(os.path.abspath(__file__));env=dict(os.environ,TZ="Asia/Colombo")
sh=lambda c:subprocess.run(c,shell=True,cwd=R,capture_output=True,text=True,env=env,errors="ignore").stdout
EXT=re.compile(r"\.(md|mdx|txt)$",re.I);SKIP=re.compile(r"node_modules|/LICENSE|CHANGELOG\.md$|/\.changeset/|requirements\.txt$|robots\.txt$|/fixtures?/|\.lock\.txt$")
# per-path first/last commit across all refs (one pass)
first,last={},{};cur=None
for l in sh("git log --all --format='@@%h %ad' --date=format-local:'%Y-%m-%d %H:%M' --name-only -M").split("\n"):
    if l.startswith("@@"):cur=l[2:].split(" ",1);continue
    if l and EXT.search(l):
        last.setdefault(l,cur);first[l]=cur
docs=[]
for p in sh("git ls-files").split("\n"):
    if p and EXT.search(p) and not SKIP.search(p):
        docs.append({"path":p,"origin":"main","text":open(os.path.join(R,p),errors="ignore").read()})
for f in sorted(os.path.relpath(os.path.join(dp,x),_P.PLAN) for dp,_,fs in os.walk(_P.PLAN) for x in fs if x.endswith(".md")):
    docs.append({"path":(_P.PLAN+"/")+f,"origin":"plan","text":open((_P.PLAN+"/")+f,errors="ignore").read(),
                 "first":[None,"2026-10-16 (plan file mtime "+subprocess.run(["date","-r",(_P.PLAN+"/")+f,"+%Y-%m-%d %H:%M"],capture_output=True,text=True).stdout.strip()+")"]})
alive={d["path"] for d in docs}
# deleted in any ref: sha of deleting commit per path
dels={};cur=None
for l in sh("git log --all --diff-filter=D --format='@@%H %ad' --date=format-local:'%Y-%m-%d %H:%M' --name-only").split("\n"):
    if l.startswith("@@"):cur=l[2:].split(" ",1);continue
    if l and EXT.search(l) and not SKIP.search(l) and l not in alive and l not in dels:dels[l]=cur
# also docs that only ever lived on non-main branches (added, never on main HEAD, never deleted)
onbranch=sorted(p for p in first if p not in alive and p not in dels and not SKIP.search(p))
for p,(sha,date) in dels.items():
    t=sh(f"git show {sha}^:'{p}'")
    if t:docs.append({"path":p,"origin":"deleted","deleted":[sha[:8],date],"text":t})
for p in onbranch:
    sha=last[p][0];t=sh(f"git show {sha}:'{p}'")
    if t:docs.append({"path":p,"origin":"branch-only","text":t})
for d in docs:
    p=d["path"]
    if p in first:d["first"]=first[p];d["last"]=last[p]
    fm=re.match(r"---\n(.*?)\n---",d["text"],re.S);d["front"]={}
    if fm:
        for l in fm.group(1).split("\n"):
            m=re.match(r"(\w+):\s*\"?(.*?)\"?\s*$",l)
            if m:d["front"][m.group(1)]=m.group(2)
    pl=p.lower()
    d["kind"]=("vendor-skill" if pl.startswith(".agents/") or "/skills/" in pl else
      "content/marketing" if "apps/edlove-web/content" in pl or "marketing" in pl else
      "research" if re.search(r"ed-tech-and-world|stack-map|landscape|research|dossier",pl) else
      "plan" if d["origin"]=="plan" or re.search(r"plan|roadmap|backlog|todo|tasks|next_actions|gap|matrix|spec|prd|requirement|vision|alpha|beta|phase|sprint",pl) else
      "progress/status" if re.search(r"progress|status|report|summary|audit|evolution|current_state",pl) else
      "architecture/dev" if re.search(r"docs/|adr|architecture|readme|guide",pl) else "other")
    norm=re.sub(r"\s+"," ",re.sub(r"---\n.*?\n---","",d["text"],flags=re.S).lower()).strip()
    d["sha1"]=hashlib.sha1(norm.encode()).hexdigest()[:12];d["chars"]=len(norm)
    w=norm.split();d["_sh"]={hash(" ".join(w[i:i+5])) for i in range(0,max(1,len(w)-4))}
# dedupe: exact hash, then minhash-LSH Jaccard>=0.85
random.seed(7);P=(1<<61)-1;A=[(random.randrange(1,P),random.randrange(P)) for _ in range(64)]
for d in docs:d["_mh"]=[min(((a*x+b)%P) for x in d["_sh"]) if d["_sh"] else 0 for a,b in A]
par=list(range(len(docs)))
def f(i):
    while par[i]!=i:par[i]=par[par[i]];i=par[i]
    return i
byhash=collections.defaultdict(list)
for i,d in enumerate(docs):byhash[d["sha1"]].append(i)
for g in byhash.values():
    for j in g[1:]:par[f(j)]=f(g[0])
buckets=collections.defaultdict(list)
for i,d in enumerate(docs):
    if d["chars"]<200:continue
    for b in range(16):buckets[(b,tuple(d["_mh"][b*4:b*4+4]))].append(i)
for g in buckets.values():
    for j in g[1:]:
        a,b=docs[g[0]],docs[j]
        if f(j)!=f(g[0]) and len(a["_sh"]&b["_sh"])/max(1,len(a["_sh"]|b["_sh"]))>=0.85:par[f(j)]=f(g[0])
cl=collections.defaultdict(list)
for i in range(len(docs)):cl[f(i)].append(i)
for root,mem in cl.items():
    # canonical = main over plan over branch over deleted, then latest
    rank={"plan":0,"main":1,"branch-only":2,"deleted":3}
    mem.sort(key=lambda i:(rank[docs[i]["origin"]],-(int(re.sub(r"\D","",(docs[i].get("last") or [0,"0"])[1])[:12] or 0))))
    for i in mem:docs[i]["dup_of"]=None if i==mem[0] else docs[mem[0]]["path"];docs[i]["dup_group"]=len(mem)
for d in docs:d.pop("_sh");d.pop("_mh")
json.dump(docs,open(V+"/docs.json","w"))
c=collections.Counter(d["origin"] for d in docs);print("docs",len(docs),c)
print("canonical",sum(1 for d in docs if not d["dup_of"]),"dups",sum(1 for d in docs if d["dup_of"]))
print(collections.Counter(d["kind"] for d in docs if not d["dup_of"]))
