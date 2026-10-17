#!/usr/bin/env python3
import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)))); import atlas_paths as _P  # noqa: E402
"""Static import graph + API/model/route inventory for EdLove (read-only). Output: analysis/graph.json"""
import os, re, json, glob
R = _P.REPO; OUT = os.path.dirname(os.path.abspath(__file__))
EXT = [".tsx", ".ts", ".web.tsx", ".native.tsx", ".ios.tsx", ".android.tsx", ".web.ts", ".js", ".mjs"]
SKIP = re.compile(r"node_modules|/dist/|/\.next/|/generated/|__tests__|\.test\.|\.spec\.|\.stories\.|/archives?/|/__mocks__/|/e2e/|/tests?/")
files = [f for f in glob.glob(R + "/apps/**/*.*", recursive=True) + glob.glob(R + "/packages/**/*.*", recursive=True)
         if re.search(r"\.(tsx?|mjs|js)$", f) and not SKIP.search(f)]
rel = lambda p: os.path.relpath(p, R)
fileset = set(files)
# package export maps
pkgs = {}
for pj in glob.glob(R + "/packages/*/package.json"):
    d = json.load(open(pj)); base = os.path.dirname(pj); ex = d.get("exports", {})
    m = {}
    if isinstance(ex, dict):
        for k, v in ex.items():
            t = v if isinstance(v, str) else (v.get("import") or v.get("default") or v.get("types")) if isinstance(v, dict) else None
            if isinstance(t, dict): t = t.get("default")
            if t: m[k] = os.path.normpath(os.path.join(base, t))
    pkgs[d["name"]] = (base, m)
def resolve_file(p):
    for cand in [p] + [p + e for e in EXT] + [os.path.join(p, "index" + e) for e in EXT]:
        if cand in fileset: return cand
    return None
def resolve(spec, src):
    if spec.startswith("."): return resolve_file(os.path.normpath(os.path.join(os.path.dirname(src), spec)))
    if spec.startswith("@/"):
        app = re.match(r"(.*/apps/[^/]+)/", src)
        if app:
            for b in ("src", ""):
                r = resolve_file(os.path.join(app.group(1), b, spec[2:]))
                if r: return r
        return None
    m = re.match(r"(@repo/[^/]+)(/(.*))?$", spec)
    if m and m.group(1) in pkgs:
        base, ex = pkgs[m.group(1)]; sub = m.group(3)
        key = "./" + sub if sub else "."
        if key in ex: return resolve_file(ex[key]) or (ex[key] if ex[key] in fileset else None)
        for k, v in ex.items():
            if "*" in k and sub and sub.startswith(k[2:].split("*")[0]):
                r = resolve_file(v.replace("*", sub[len(k[2:].split("*")[0]):]))
                if r: return r
        return resolve_file(os.path.join(base, "src", sub or "index")) or resolve_file(os.path.join(base, sub or "index"))
    return None
IMPST = re.compile(r"""(import|export)\s+(type\s+)?([\s\S]*?)\s*from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)""")
def parse_names(clause):
    clause = clause.strip()
    if clause.startswith("*"): return None  # namespace / export * -> everything
    names = set()
    m = re.match(r"^([A-Za-z_$][\w$]*)\s*(,|$)", clause)
    if m: names.add("default")
    for b in re.findall(r"\{([^}]*)\}", clause):
        for part in b.split(","):
            part = part.strip().replace("type ", "")
            if not part: continue
            names.add(part.split(" as ")[0].strip())
    return names or None
src_cache = {}
for f in files:
    try: src_cache[f] = open(f, encoding="utf-8", errors="ignore").read()
    except Exception: pass
edges = {}   # f -> list of (target, names|None)
for f, s in src_cache.items():
    es = []
    for mm in IMPST.finditer(s):
        if mm.group(2): continue  # type-only
        spec = mm.group(4) or mm.group(5) or mm.group(6)
        r = resolve(spec, f)
        if not r: continue
        names = parse_names(mm.group(3)) if mm.group(4) else None
        es.append((r, names, mm.group(1) == "export"))
    edges[f] = es
def defines(f, name):
    s = src_cache.get(f, "")
    if name == "default": return bool(re.search(r"export\s+default\b", s))
    return bool(re.search(rf"export\s+(?:async\s+)?(?:const|let|function\*?|class|enum)\s+{re.escape(name)}\b", s)) or bool(re.search(rf"export\s*\{{[^}}]*\b{re.escape(name)}\b[^}}]*\}}\s*;?\s*$", s, re.M))
def provider(f, name, depth=0):
    """follow barrel re-exports to the file that actually defines `name`"""
    if depth > 8: return {f}
    if defines(f, name): return {f}
    out = set()
    for t, names, is_exp in edges.get(f, ()):
        if not is_exp: continue
        if names is None or name in names or ("default" in (names or ()) ):
            sub = provider(t, name if names is None or name in names else "default", depth + 1)
            if sub: out |= sub
            if names and name in names: break
    return out or ({f} if depth == 0 else set())
graph = {}
for f, es in edges.items():
    deps = set()
    for t, names, is_exp in es:
        if names is None: deps.add(t); continue
        for n in names: deps |= provider(t, n)
    graph[f] = deps
# routers & procedures
router_ts = open(R + "/apps/sanctuary-api/src/core/router.ts").read()
rmap = dict(re.findall(r"^\s+(\w+):\s*(\w+Router),", router_ts, re.M))
procs = {}
for key, sym in rmap.items():
    hf = next((f for f in glob.glob(R + "/apps/sanctuary-api/src/core/handlers/*.ts") if re.search(rf"export const {sym}\b", open(f).read())), None)
    if not hf: continue
    s = open(hf).read(); names = []
    for mm in re.finditer(r"^\s{2}(\w+):\s*impl\.", s, re.M): names.append((mm.group(1), s[:mm.start()].count("\n") + 1))
    procs[key] = {"file": rel(hf), "procedures": names, "zenstack_db": len(re.findall(r"\b(?:context|ctx)\.db\b|\bdb\.\w+\.(?:find|create|update|upsert|delete|count|aggregate)", s)), "raw_sql": len(re.findall(r"queryDatabaseRows|\$queryRaw|\$executeRaw|sql`", s))}
# client call sites: <anything>.<routerKey>.<proc>
calls = {}
for f, s in src_cache.items():
    if "/apps/sanctuary-api/" in f or "/core/src/api/" in f and f.endswith(".contract.ts"): continue
    for key in procs:
        for mm in re.finditer(rf"\b(\w+)\.{key}\.(\w+)\b", s):
            # v5: `api.<module>.<m>` / `<x>API.<m>` are the legacy facade (resolved in trace.py against real facade methods), not typed oRPC
            if mm.group(1) == "api" or mm.group(1).endswith("API"): continue
            p = mm.group(2)
            if p in dict(procs[key]["procedures"]):
                calls.setdefault(f"{key}.{p}", []).append(f"{rel(f)}:{s[:mm.start()].count(chr(10))+1}")
# models
zm = open(R + "/packages/schema/schema.zmodel").read(); models = {}
for mm in re.finditer(r"^model (\w+)\s*\{(.*?)(?=^(?:model|enum|type|view)\s|\Z)", zm, re.M | re.S):
    mp = re.search(r'@@map\("([^"]+)"\)', mm.group(2)); models[mm.group(1)] = {"line": zm[:mm.start()].count("\n") + 1, "table": mp.group(1) if mp else None}
for name, m in models.items():
    camel = name[0].lower() + name[1:]; tbl = m["table"] or re.sub(r"(?<!^)([A-Z])", r"_\1", name).lower()
    m["api_refs"] = sorted({rel(f) for f, s in src_cache.items() if "/sanctuary-api/" in f and (re.search(rf"\.db\.{camel}\b|\b{camel}\.(find|create|update|upsert|delete|count)", s) or re.search(rf"\b{tbl}\b", s))})
    m["client_from_refs"] = sorted({rel(f) for f, s in src_cache.items() if "/sanctuary-api/" not in f and re.search(rf"\.from\(\s*['\"]{tbl}['\"]", s)})
    m["powersync"] = bool(re.search(rf"\b{tbl}\b", src_cache.get(R + "/packages/core/src/adapters/powersync/schema.ts", "")))
# routes
routes = {}
for f in files:
    r = rel(f)
    if r.startswith("apps/gurudevi-mobile/app/") and not re.search(r"_layout|\+", r):
        u = "/" + re.sub(r"\((\w+)\)/", "", r[len("apps/gurudevi-mobile/app/"):]); u = re.sub(r"(/index)?(\.web|\.native)?\.tsx?$", "", u) or "/"
        routes[r] = {"app": "mobile", "url": u or "/"}
    elif re.match(r"apps/(gurudevi-web|edlove-web|gurudevi-marketingWeb)/app/.*/?page\.tsx$", r):
        app = r.split("/")[1]; u = "/" + re.sub(r"\([^)]*\)/", "", r.split("/app/", 1)[1]); u = re.sub(r"/?page\.tsx$", "", u) or "/"
        routes[r] = {"app": app, "url": u or "/"}
# nav links (string literals that look like app paths)
LINK = re.compile(r"""(?:href|pathname|push|replace|navigate|router\.\w+)\s*[=:(]\s*\{?\s*[`'"](/[^`'"\s?]*)""")
links = {}
for f, s in src_cache.items():
    for mm in LINK.finditer(s):
        links.setdefault(mm.group(1).rstrip("/") or "/", []).append(f"{rel(f)}:{s[:mm.start()].count(chr(10))+1}")
def match_links(url):
    pat = "^" + re.sub(r"\\\[[^\]]+\\\]", r"[^/]+", re.escape(url)) + "$"
    hits = []
    for l, w in links.items():
        if re.match(pat, l) or (("$" in l or "{" in l) and re.match("^" + re.escape(re.sub(r"\[.*", "", url)), l)): hits += w
    return hits
MOCK = re.compile(r"MOCK_\w+|\bmock\w*\b|demo-\w+|'demo'|isDemoMode|is_sample|sample-school|Math\.random\(\)|pi_demo|In real implementation|fake\w*", re.I)
INFRA = re.compile(r"/packages/(core|ui|library|self|classroom|community|admin|profile)/src/(index|api/index|api/hooks/index|logic/index|hooks/index|screens/index|components/index)\.tsx?$|/packages/core/src/(providers|logic/managers)/|GlobalHeader|AppSettingsScreen|SanctuaryWelcomeScreen|DeviceSecurityCenter|DeviceAccountManager|/packages/ui/src/(primitives|tokens|theme|utils|components/(ErrorBoundary|BrandPulse|GlobalHeader))|/packages/core/src/(store|logic/permissions|providers|monitoring|i18n|utils|platform)/|/packages/core/src/logic/index")
def closure(f, depth=10):
    seen = {f}; fr = [f]
    for _ in range(depth):
        nx = []
        for x in fr:
            for d in graph.get(x, ()):
                if d not in seen and not INFRA.search(d): seen.add(d); nx.append(d)
        fr = nx
    return seen
for r, info in routes.items():
    f = os.path.join(R, r); cl = closure(f)
    info["closure_size"] = len(cl)
    info["api_calls"] = sorted({c for c, ws in calls.items() for w in ws if os.path.join(R, w.rsplit(":", 1)[0]) in cl})
    info["from_tables"] = sorted({t for x in cl for t in re.findall(r"\.from\(\s*['\"]([a-z_]+)['\"]", src_cache.get(x, ""))})
    info["mock_markers"] = sorted({f"{rel(x)}:{src_cache[x][:m.start()].count(chr(10))+1}:{m.group(0)}" for x in cl if x in src_cache and "/test" not in x for m in MOCK.finditer(src_cache[x])})[:40]
    info["inbound_links"] = match_links(info["url"])[:10]
    info["imports_direct"] = sorted(rel(d) for d in graph.get(f, ()))
import pickle; pickle.dump((graph, src_cache), open(OUT + "/graph.pkl", "wb"))
json.dump({"procs": procs, "calls": calls, "models": models, "routes": routes, "file_count": len(files)}, open(OUT + "/graph.json", "w"), indent=1)
print(len(files), "files;", sum(len(p["procedures"]) for p in procs.values()), "procedures;", len(models), "models;", len(routes), "routes;", len(calls), "called procs")
