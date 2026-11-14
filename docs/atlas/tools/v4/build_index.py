import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..")); import atlas_paths as _P  # noqa: E402
"""Evidence index for v4 verification: identifier tokens on main (file-level) and on every other branch, plus deleted-file names in history."""
import subprocess,re,os,pickle,collections
S=_P.REPO;O=_P.ATLAS+"/v4/index.pkl"
def g(*a):return subprocess.run(["git","-C",S,*a],capture_output=True,text=True,errors="ignore").stdout
EXT=re.compile(r"\.(tsx?|jsx?|sql|zmodel|prisma)$");TOK=re.compile(r"[A-Za-z_][A-Za-z0-9_]{3,}")
ROUTE=re.compile(r"['\"`](/[a-z0-9\-\[\]/()]+)['\"`]")
files=[f for f in g("ls-files").split("\n") if EXT.search(f) and "node_modules" not in f]
main=collections.defaultdict(set);routes=collections.defaultdict(set);i18n=collections.defaultdict(set)
for f in files:
    try:t=open(os.path.join(S,f),errors="ignore").read()
    except Exception:continue
    for k in set(TOK.findall(t)):main[k.lower()].add(f)
    for r in set(ROUTE.findall(t)):routes[r.rstrip('/')].add(f)
    base=re.sub(r"\W","",os.path.basename(f).split('.')[0]).lower();main[base].add(f)
for f in g("ls-files","*/locales/en.json").split():
    import json
    def walk(d,p=""):
        for k,v in d.items():
            q=f"{p}.{k}" if p else k
            if isinstance(v,dict):walk(v,q)
            else:i18n[q.lower()].add(f);i18n[str(v).lower()[:80]].add(f+"#"+q)
    try:walk(json.load(open(os.path.join(S,f))))
    except Exception:pass
br=[b.strip() for b in g("for-each-ref","--format=%(refname:short)","refs/remotes","refs/heads").split() if b.strip() and not b.endswith("HEAD")]
head=g("rev-parse","HEAD").strip();branch=collections.defaultdict(set)
for b in br:
    if g("rev-parse",b).strip()==head:continue
    out=g("grep","-h","-o","-I","-E","[A-Za-z_][A-Za-z0-9_]{3,}",b,"--","*.ts","*.tsx","*.sql","*.zmodel")
    for k in set(out.split()):
        k=k.lower()
        if k not in main:branch[k].add(b)
hist=collections.defaultdict(set)
for f in set(g("log","--all","--diff-filter=D","--name-only","--format=").split()):
    if EXT.search(f):
        base=re.sub(r"\W","",os.path.basename(f).split('.')[0]).lower()
        if base not in main:hist[base].add(f)
pickle.dump({"main":dict(main),"routes":dict(routes),"i18n":dict(i18n),"branch":dict(branch),"hist":dict(hist),"branches":br,"nfiles":len(files)},open(O,"wb"))
print(len(files),len(main),len(routes),len(i18n),len(br),len(branch),len(hist))
