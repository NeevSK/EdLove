#!/usr/bin/env python3
import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)))); import atlas_paths as _P  # noqa: E402
"""Second-stage trace: contract REST paths + Hono-chain client calls + typed oRPC calls + legacy `api.<module>` facade
-> per-route set of reached procedures, supabase tables, powersync use, mock/demo markers. Writes analysis/trace.json."""
import os, re, json, glob, pickle
R = _P.REPO; A = os.path.dirname(os.path.abspath(__file__))
graph, src = pickle.load(open(A + "/graph.pkl", "rb")); G = json.load(open(A + "/graph.json"))
rel = lambda p: os.path.relpath(p, R); ln = lambda s, i: s[:i].count("\n") + 1
# 1. contracts
handler_txt = {k: open(R + "/" + v["file"]).read() for k, v in G["procs"].items()}
contract = {}  # (router, proc) -> (method, path, contractfile:line)
def contract_files_for(rk):
    txt = handler_txt[rk]; fs = set()
    for spec in re.findall(r"from '@repo/core/api/([^']*contract[^']*)'", txt):
        f = R + "/packages/core/src/api/" + spec + ".ts"
        if os.path.exists(f):
            fs.add(f)
            for sub in re.findall(r"from '\./([^']*contract[^']*)'", open(f).read()):
                if os.path.exists(R + "/packages/core/src/api/" + sub + ".ts"): fs.add(R + "/packages/core/src/api/" + sub + ".ts")
    m = re.search(r"implement\((\w+)\)", txt)
    if m and not fs:
        for cf in glob.glob(R + "/packages/core/src/api/*contract*.ts"):
            if re.search(rf"export const {m.group(1)}\b", open(cf).read()): fs.add(cf)
    return fs
for rk, v in G["procs"].items():
    names = dict(v["procedures"])
    for cf in contract_files_for(rk):
        s = open(cf).read()
        for mm in re.finditer(r"^\s{2}(\w+):\s*(?:\{|oc\b|[\w.]*route\()", s, re.M):
            if mm.group(1) not in names or (rk, mm.group(1)) in contract: continue
            body = s[mm.end(): mm.end() + 600]
            me = re.search(r"method:\s*['\"](\w+)['\"]", body); pa = re.search(r"path:\s*['\"]([^'\"]+)['\"]", body)
            if pa: contract[(rk, mm.group(1))] = ((me.group(1).lower() if me else "post"), pa.group(1), f"{rel(cf)}:{ln(s, mm.start())}")
# 2. hono chain regex per path
def chain_re(method, path):
    segs = [x for x in path.strip("/").split("/") if x]
    parts = []
    for sg in segs:
        if sg.startswith(":") or sg.startswith("{"): parts.append(r"\[\s*['\"]:\w+['\"]\s*\]")
        elif re.match(r"^[A-Za-z_$][\w$]*$", sg): parts.append(rf"(?:\.{re.escape(sg)}|\[\s*['\"]{re.escape(sg)}['\"]\s*\])")
        else: parts.append(rf"\[\s*['\"]{re.escape(sg)}['\"]\s*\]")
    return re.compile(r"\.api\s*\)?\s*(?:as\s+any\s*\)\s*)?" + r"\s*".join(parts) + rf"\s*\.\s*\$({method})\b", re.I)
client_files = {f: s for f, s in src.items() if "/apps/sanctuary-api/" not in f and not f.endswith(".contract.ts")}
sites = {}  # "router.proc" -> [file:line]
for (rk, p), (m, path, _) in contract.items():
    rx = chain_re(m, path)
    for f, s in client_files.items():
        if ".api" not in s: continue
        for mm in rx.finditer(s): sites.setdefault(f"{rk}.{p}", []).append(f"{rel(f)}:{ln(s, mm.start())}")
hono_ok = {}
for (rk, p), (m, path, _) in contract.items():
    segs = [x for x in path.strip("/").split("/") if x]
    hono_ok[f"{rk}.{p}"] = (segs == [rk, p])
transport = {}
for k, ws in sites.items():
    for w in ws: transport[w] = "hono-rest:" + ("served" if hono_ok.get(k) else "NO-SERVER-MOUNT")
for k, v in G["calls"].items():
    sites.setdefault(k, []).extend(v)
    for w in v: transport[w] = "orpc-rpc:served"
# site -> file index
by_file = {}
for k, ws in sites.items():
    for w in ws: by_file.setdefault(R + "/" + w.rsplit(":", 1)[0], set()).add(k)
# 3. facade: api.<module>.<method> -> module file -> method -> procs
idx = src[R + "/packages/core/src/api/index.ts"]
facade = dict(re.findall(r"^\s{2}(\w+):\s*(\w+API)\b", idx, re.M))
sym_file = {}
for f, s in src.items():
    if "/packages/core/src/api/" in f or "/packages/" in f:
        for sym in set(facade.values()):
            if re.search(rf"export const {sym}\b", s): sym_file.setdefault(sym, f)
def methods_of(f):
    s = src.get(f, ""); defs = [(m.start(), m.group(2)) for m in re.finditer(r"^\s{2,4}(async\s+)?(\w+)\s*(?:\(|:\s*(?:async\s*)?\()", s, re.M)]
    out = {}
    for k in by_file.get(f, ()):
        for w in sites[k]:
            fn, l = w.rsplit(":", 1)
            if R + "/" + fn != f: continue
            pos = sum(len(x) + 1 for x in s.split("\n")[: int(l) - 1]); owner = None
            for st, nm in defs:
                if st <= pos: owner = nm
            out.setdefault(owner, set()).add(k)
    return out
facade_methods = {mod: methods_of(sym_file[sym]) for mod, sym in facade.items() if sym in sym_file}
all_syms = {}
for f, s2 in src.items():
    if "/apps/sanctuary-api/" in f: continue
    for m in re.finditer(r"export const (\w+API)\b", s2): all_syms.setdefault(m.group(1), []).append(f)
file_methods = {f: methods_of(f) for fs in all_syms.values() for f in fs}
def sym_lookup(x, sym, meth):
    fs = all_syms.get(sym, []); near = [f for f in fs if f in graph.get(x, ()) or f == x]
    out = set()
    for f in (near or fs): out |= file_methods.get(f, {}).get(meth, set())
    return out

# v5: legacy facade calls to methods the facade object does not define (Proxy returns undefined -> TypeError at runtime)
facade_missing = []
def _defs(f): return set(m.group(2) for m in re.finditer(r"^\s{2,4}(async\s+)?(\w+)\s*(?:\(|:\s*(?:async\s*)?\(|:\s*\w+\()", src.get(f, ""), re.M))
for mod, sym in facade.items():
    cands = set(all_syms.get(sym, [])) | {f for f in src if re.search(rf"/packages/core/src/api/{re.escape(mod)}\.ts$", f)}
    defined = set().union(*[_defs(f) for f in cands]) if cands else set()
    if not defined: continue
    rx = re.compile(rf"\bapi\.{re.escape(mod)}\.(\w+)\s*\(")
    for f, s2 in src.items():
        if "/apps/sanctuary-api/" in f or "__tests__" in f or ".test." in f: continue
        for m in rx.finditer(s2):
            if m.group(1) not in defined: facade_missing.append({"site": f"{rel(f)}:{ln(s2, m.start())}", "call": f"api.{mod}.{m.group(1)}", "facade_files": sorted(rel(x) for x in cands)})
# one more hop: facade method bodies that call other facade objects (e.g. guardianAPI.getGuardianDashboard -> api.guardian.x)
FAC2 = re.compile(r"\b(\w+API)\.(\w+)")
FAC = re.compile(r"\bapi\.(\w+)\.(\w+)")
MOCK = re.compile(r"MOCK_[A-Z_]+|isDemoMode|isDemo\(\)|is_sample|'demo-[\w-]+'|\"demo-[\w-]+\"|'sample-[\w-]+'|Math\.random\(\)\.toString|pi_demo\w*|In real implementation|mock-uri|demo-only|focusedCircleFeedMock")
INFRA = re.compile(r"/packages/(core|ui|library|self|classroom|community|admin|profile)/src/(index|api/index|api/hooks/index|logic/index|hooks/index|screens/index|components/index)\.tsx?$|/packages/core/src/(providers|logic/managers)/|GlobalHeader|AppSettingsScreen|SanctuaryWelcomeScreen|DeviceSecurityCenter|DeviceAccountManager|/packages/ui/src/(primitives|tokens|theme|utils)|/packages/core/src/(store|logic/permissions|monitoring|i18n|utils|platform)/")
def closure(f, depth=12):
    seen = {f}; fr = [f]
    for _ in range(depth):
        nx = []
        for x in fr:
            for d in graph.get(x, ()):
                if d not in seen and not INFRA.search(d): seen.add(d); nx.append(d)
        fr = nx
    return seen
out = {}
for r, info in G["routes"].items():
    cl = closure(R + "/" + r); reached = {}
    for x in cl:
        for k in by_file.get(x, ()): reached.setdefault(k, set()).add(rel(x))
        for mm in FAC2.finditer(src.get(x, "")):
            for k in sym_lookup(x, mm.group(1), mm.group(2)): reached.setdefault(k, set()).add(f"{rel(x)}:{ln(src[x], mm.start())} via {mm.group(1)}.{mm.group(2)}")
        for mm in FAC.finditer(src.get(x, "")):
            for k in facade_methods.get(mm.group(1), {}).get(mm.group(2), ()): reached.setdefault(k, set()).add(f"{rel(x)}:{ln(src[x], mm.start())} via api.{mm.group(1)}.{mm.group(2)}")
    tables = {}
    for x in cl:
        for mm in re.finditer(r"\.from\(\s*['\"]([a-z_]+)['\"]", src.get(x, "")): tables.setdefault(mm.group(1), f"{rel(x)}:{ln(src[x], mm.start())}")
    mocks = sorted({f"{rel(x)}:{ln(src[x], m.start())} {m.group(0)}" for x in cl if x in src for m in MOCK.finditer(src[x])})
    ps = sorted({rel(x) for x in cl if re.search(r"usePowerSync|useQuery\s*\(\s*['\"`]\s*SELECT|powersync/(database|hooks)", src.get(x, ""))})[:5]
    def tr(k, ws):
        kinds = set()
        for w in ws:
            base = w.split(" via ")[0]
            if base in transport: kinds.add(transport[base])
            elif " via " in w: kinds |= {transport[x] for x in sites.get(k, []) if x in transport and x.rsplit(":",1)[0] == base.rsplit(":",1)[0]} or {"facade"}
            else: kinds |= {transport[x] for x in sites.get(k, []) if x.rsplit(":",1)[0] == base}
        return sorted(kinds)
    out[r] = {**info, "procs_reached": {k: {"via": sorted(v)[:3], "transport": tr(k, v)} for k, v in sorted(reached.items())}, "tables": tables, "mocks": mocks[:60], "powersync": ps, "closure_files": sorted(rel(x) for x in cl)}
uncalled = {f"{rk}.{p}": G["procs"][rk]["file"] + ":" + str(l) for rk, v in G["procs"].items() for p, l in v["procedures"] if f"{rk}.{p}" not in sites}
json.dump({"transport": transport, "hono_ok": hono_ok, "contract": {f"{a}.{b}": v for (a, b), v in contract.items()}, "sites": sites, "routes": out, "uncalled": uncalled, "facade_missing": facade_missing, "facade_unused_proxy": not any("createResonantProxy(" in s for f, s in src.items() if not f.endswith("resonantProxy.ts"))}, open(A + "/trace.json", "w"), indent=1)
print("contract-mapped", len(contract), "/", sum(len(v["procedures"]) for v in G["procs"].values()), "| procs with client sites", len(sites), "| uncalled", len(uncalled))
