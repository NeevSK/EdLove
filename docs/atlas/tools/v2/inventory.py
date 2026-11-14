import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..")); import atlas_paths as _P  # noqa: E402
"""Collect every source inventory -> v2/inventory.json (static, main @ HEAD + history)."""
import json,os,re,subprocess
R=_P.REPO;V=os.path.dirname(os.path.abspath(__file__))
sh=lambda c:subprocess.run(c,shell=True,cwd=R,capture_output=True,text=True).stdout
files=sh("git ls-files").split("\n")
inv={}
# screens: route files + package/app screen components
inv["screens"]=sorted(f for f in files if f.endswith(".tsx") and not re.search(r"(test|__tests__|stories)",f) and (re.search(r"Screen(\.web|\.native|\.ios|\.android)?\.tsx$",f) or "/screens/" in f))
# migration tables
tabs={}
for f in files:
    if f.endswith(".sql"):
        for i,l in enumerate(open(os.path.join(R,f),errors="ignore"),1):
            m=re.search(r'create (?:or replace )?(?:materialized )?(?:table|view)\s+(?:if not exists\s+)?(?:"?public"?\.)?"?([a-z_0-9]+)',l,re.I)
            if m: tabs.setdefault(m.group(1).lower(),f"{f}:{i}")
inv["migration_tables"]=tabs
# i18n namespaces
ns={}
for f in ["packages/core/src/logic/i18n/locales/en.json","apps/gurudevi-mobile/src/i18n/locales/en.json"]:
    for k in json.load(open(os.path.join(R,f))): ns.setdefault(k,f)
inv["i18n_namespaces"]=ns
# flags
ff="packages/core/src/store/types/featureFlags.ts";fl={}
for i,l in enumerate(open(os.path.join(R,ff)),1):
    m=re.match(r"\s+(is\w+):\s*(true|false),",l)
    if m: fl[m.group(1)]={"default":m.group(2),"at":f"{ff}:{i}"}
inv["flags"]=fl
# hooks
hk={}
for f in files:
    if re.search(r"\.(ts|tsx)$",f) and f.startswith(("packages/","apps/")) and not re.search(r"test|__tests__|node_modules",f):
        try: s=open(os.path.join(R,f),errors="ignore").read()
        except: continue
        for m in re.finditer(r"export (?:function|const) (use[A-Z]\w*)",s):
            hk.setdefault(m.group(1),f"{f}:{s[:m.start()].count(chr(10))+1}")
inv["hooks"]=hk
# nav entries: tab layouts + workspace dispatch + web nav configs
nav=[]
for f in files:
    if re.search(r"(_layout\.tsx|appNavigation\.ts|routeResolution\.ts|site\.ts|webNav|Sidebar|NavBar|TabBar)",f) and f.startswith("apps/"):
        s=open(os.path.join(R,f),errors="ignore").read()
        for m in re.finditer(r"""(?:href|name|pathname|route)\s*[:=]\s*['"`]([/a-z0-9\-\[\]()_.]+)['"`]""",s):
            nav.append({"target":m.group(1),"at":f"{f}:{s[:m.start()].count(chr(10))+1}"})
inv["nav_entries"]=nav
# docs
inv["docs"]=[f for f in files if f.lower().endswith(".md")]
# history: deleted screen/route files across all refs
dl=sh("git log --all --diff-filter=D --name-only --format='@@%h %ad' --date=format-local:'%Y-%m-%d %H:%M'")
dead={};cur=None
for l in dl.split("\n"):
    if l.startswith("@@"):cur=l[2:]
    elif l.endswith(".tsx") and (re.search(r"Screen(\.web)?\.tsx$",l) or "/app/" in l or "/screens/" in l) and "test" not in l:
        dead.setdefault(l,cur)
alive=set(files);base={os.path.basename(f) for f in files}
inv["deleted_screens"]={f:c for f,c in dead.items() if f not in alive and os.path.basename(f) not in base}
json.dump(inv,open(V+"/inventory.json","w"),indent=1)
for k,v in inv.items():print(k,len(v))
