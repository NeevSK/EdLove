"""The links graph: one unbroken chain from reality to the screen, with every gap named.

Reads, never writes, the sources of each layer:
  reality      ontology/reality/reality.yaml            forms and their levels
  ontology     ontology/gurudevi.yaml                   classes, slots, enums, transitions
  links        ontology/links/links.yaml                the hand-written joins (see that file)
  data         packages/schema/schema.zmodel            models, fields, tables (@@map)
  landscape    ontology/landscape/landscape.yaml        subdomain -> models
  api          apps/sanctuary-api/src/modules/catalog.ts, core/router.ts and the handler
               files it calls                           capabilities, modules, tables touched
  cards        docs/architecture/domains/**             one card per module
  policy       packages/policies/src/policies/**.cedar  resources and capacities
               packages/policies/src/authorizationAuthorities.json   resource -> table
  screens      packages/*/src/constants/*Registry.ts     features and their subjects
  conformance  reports/capability-conformance.json     with --conformance: the API's own report
                                                        (contract, handler, evidence, clients)

Writes ontology/links/out/graph.json and links.md. Deterministic: sorted, no clock, no
line numbers in the graph.

Usage (repo root):
  python -I ontology/scripts/links.py build [--root DIR] [--out DIR] [--conformance]
  python -I ontology/scripts/links.py check          build, then fail on a gap count above
                                                     its ceiling in tooling/ratchet.json
  python -I ontology/scripts/links.py update         lower the ceilings to today's counts
                                     [--raise]      or set them to today's counts (new scope)
  python -I ontology/scripts/links.py impact NODE [--graph FILE]
  python -I ontology/scripts/links.py ripple BASE.json HEAD.json
"""

import json
import re
import sys
from collections import defaultdict, deque
from pathlib import Path

import yaml

GAP_CODES = [
    "LINK_BROKEN",  # a link names something that does not exist
    "CLASS_NOT_STORED",  # an ontology class with no table
    "SLOT_NOT_STORED",  # a slot with no column (match: missing, or not written)
    "SLOT_DIFFERS",  # a column that stores something else
    "VALUES_DIFFER",  # a value the code uses that the ontology lacks, or the reverse
    "VALUE_SPELLINGS",  # one word spelt more than one way across the code
    "TRANSITION_NOT_BUILT",  # an ontology change no capability carries out
    "CAPABILITY_UNANCHORED",  # a capability with no place in links.yaml
    "CAPABILITY_DIFFERS",  # a capability that does something other than its transition
    "CAPABILITY_TOUCHES_UNMODELLED",  # a capability writes a table no class is stored in
    "TABLE_NO_CLASS",  # a table no ontology class is stored in (also_in counts)
    "TABLE_NOT_PLACED",  # a table in no landscape subdomain
    "TABLE_NOT_IN_SCHEMA",  # a table the code reads or writes that schema.zmodel lacks
    "MODULE_NO_CARD",  # an API module with no card
    "POLICY_RESOURCE_UNKNOWN",  # a Cedar resource with no table
    "FEATURE_NO_CAPABILITY",  # a screen feature that names no capability
]
HARD = {"LINK_BROKEN"}  # never allowed, whatever the ceiling


# ---------------------------------------------------------------------------------------
# Graph
# ---------------------------------------------------------------------------------------
class Graph:
    def __init__(self):
        self.nodes: dict[str, dict] = {}
        self.edges: set[tuple[str, str, str]] = set()
        self.gaps: list[dict] = []

    def node(self, nid: str, **attrs):
        n = self.nodes.setdefault(nid, {"layer": nid.split(":", 1)[0]})
        n.update({k: v for k, v in attrs.items() if v is not None})
        return nid

    def edge(self, src: str, rel: str, dst: str):
        """src shapes dst: a change to src can ripple to dst."""
        self.edges.add((src, rel, dst))

    def gap(self, code: str, node: str, detail: str):
        self.gaps.append({"code": code, "node": node, "detail": detail})

    def to_json(self) -> dict:
        return {
            "nodes": {k: self.nodes[k] for k in sorted(self.nodes)},
            "edges": [list(e) for e in sorted(self.edges)],
            "gaps": sorted(self.gaps, key=lambda g: (g["code"], g["node"], g["detail"])),
        }


def ann(obj: dict, key: str):
    v = (obj.get("annotations") or {}).get(key)
    return v.get("value") if isinstance(v, dict) and "value" in v else v


# ---------------------------------------------------------------------------------------
# Readers
# ---------------------------------------------------------------------------------------
def read_zmodel(text: str) -> dict:
    models = {}
    for m in re.finditer(r"^model (\w+)\s*\{", text, re.M):
        name, body = m.group(1), text[m.end() : match_close(text, m.end() - 1, "{", "}")]
        table = re.search(r'@@map\("([^"]+)"\)', body)
        fields = {}
        for line in body.splitlines():
            f = re.match(r"\s+(\w+)\s+(\w+)(\??)(\[\])?(.*)$", line)
            if not f or f.group(1).startswith("@@") or f.group(4) or "@relation" in line:
                continue
            rest = f.group(5)
            comment = rest.split("//", 1)[1].strip() if "//" in rest else ""
            default = re.search(r'@default\("([^"]*)"\)', rest)
            fields[f.group(1)] = {
                "type": f.group(2),
                "optional": bool(f.group(3)),
                "comment": comment,
                "default": default.group(1) if default else None,
            }
        models[name] = {
            "table": table.group(1) if table else name,
            "fields": fields,
            "rules": len(re.findall(r"@@(allow|deny)\(", body)),
        }
    return models


def field_values(field: dict) -> list[str]:
    """Values a String column takes, from its comment (`// a, b, c`) or its default."""
    words = []
    head = re.split(r"[(;.]", field["comment"], maxsplit=1)[0] if field["comment"] else ""
    for w in head.split(","):
        w = w.strip().strip("'\"")
        if re.fullmatch(r"[a-z][a-z_]*", w):
            words.append(w)
    if not words and field["default"]:
        words = [field["default"]]
    return words


def match_close(text: str, i: int, open_c: str, close_c: str) -> int:
    """Index of the bracket closing the one at i; skips strings, templates and comments."""
    depth, j, n = 0, i, len(text)
    while j < n:
        c = text[j]
        if c in "'\"`":
            k = j + 1
            while k < n and text[k] != c:
                k += 2 if text[k] == "\\" else 1
            j = k + 1
            continue
        if text.startswith("//", j):
            j = text.find("\n", j)
            j = n if j < 0 else j
            continue
        if text.startswith("/*", j):
            j = text.find("*/", j) + 2
            continue
        if c == open_c:
            depth += 1
        elif c == close_c:
            depth -= 1
            if depth == 0:
                return j
        j += 1
    return n


def function_bodies(text: str) -> dict[str, str]:
    """name -> body of every `function name(...) {...}` in a TypeScript file."""
    out = {}
    for m in re.finditer(r"\bfunction\s+(\w+)\s*(<[^(]*>)?\s*\(", text):
        params_end = match_close(text, m.end() - 1, "(", ")")
        j, angle = params_end + 1, 0
        while j < len(text):
            if text[j] == "<":
                angle += 1
            elif text[j] == ">" and text[j - 1] != "=":
                angle -= 1
            elif text[j] == "{" and angle <= 0 and text[params_end + 1 : j].strip()[-1:] != ":":
                break
            elif text[j] == "{" and angle > 0:
                j = match_close(text, j, "{", "}")
            j += 1
        end = match_close(text, j, "{", "}")
        out.setdefault(m.group(1), text[j : end + 1])
    return out


SQL = re.compile(r"\b(FROM|JOIN|INTO|UPDATE)\s+public\.(\w+)(\()?", re.I)


def sql_touches(body: str) -> set[tuple[str, str]]:
    out = set()
    for verb, name, call in SQL.findall(body):
        if call and verb.upper() == "FROM":
            out.add(("calls_db_function", name))
        else:
            out.add(("writes" if verb.upper() in ("INTO", "UPDATE") else "reads", name))
    return out


def read_capabilities(text: str) -> list[dict]:
    caps = []
    for m in re.finditer(
        r"name:\s*'([\w.]+)',\s*module:\s*'([\w.]+)',\s*kind:\s*'(query|command)'", text
    ):
        caps.append({"name": m.group(1), "module": m.group(2), "kind": m.group(3)})
    return caps


def read_modules(text: str) -> list[str]:
    plat = re.search(r"platformModules\b[^=]*=\s*\[(.*?)\]", text, re.S)
    names = re.findall(r"name:\s*'([\w]+)'", plat.group(1)) if plat else []
    doms = re.search(r"export const domains\b[^=]*=\s*\{(.*?)\n\}", text, re.S)
    if doms:
        for d, subs in re.findall(r"(\w+):\s*\[([^\]]*)\]", doms.group(1)):
            names += [f"{d}.{s}" for s in re.findall(r"'([\w-]+)'", subs)]
    return names


def router_calls(router: str) -> dict[str, set[str]]:
    """capability -> function names its handler calls (security.<fn> or a bare fn)."""
    out = {}
    for m in re.finditer(r"api\.([\w.]+)\.handler\(", router):
        end = match_close(router, m.end() - 1, "(", ")")
        body = router[m.end() : end]
        names = set(re.findall(r"security\.(\w+)\(", body))
        names |= {n for n in re.findall(r"\b([a-z]\w+)\(", body) if n not in ("asAccount", "handler")}
        names |= set(re.findall(r",\s*([a-z]\w+)\s*\)", body))  # asAccount(ctx, sig, fn)
        out[m.group(1)] = names
    return out


def zod_values(text: str, name: str) -> list[str]:
    m = re.search(rf"\b{name}\s*=\s*(?:z\.enum\()?\[(.*?)\]", text, re.S)
    return re.findall(r"'([\w-]+)'", m.group(1)) if m else []


def read_registry(text: str) -> list[dict]:
    feats = []
    starts = [m.start() for m in re.finditer(r"\n  [\w'-]+:\s*\{\n\s+id:\s*'", text)]
    for a, b in zip(starts, starts[1:] + [len(text)]):
        chunk = text[a:b]
        fid = re.search(r"id:\s*'([\w-]+)'", chunk).group(1)
        subj = re.search(r"capabilityRequirement:\s*\{[^}]*subject:\s*'(\w+)'", chunk)
        pkg = re.search(r"ownerPackage:\s*'([\w-]+)'", chunk)
        tab = re.search(r"tabDomain:\s*'([\w-]+)'", chunk)
        caps = re.findall(r"capability:\s*'([\w.]+)'", chunk)
        feats.append(
            {
                "id": fid,
                "subject": subj.group(1) if subj else None,
                "package": pkg.group(1) if pkg else None,
                "tab": tab.group(1) if tab else None,
                "capabilities": caps,
            }
        )
    return feats


def norm_word(w: str) -> str:
    return re.sub(r"[_\-\s]", "", w).lower()


# ---------------------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------------------
def build(root: Path, with_conformance: bool = False) -> Graph:
    g = Graph()
    od = root / "ontology"
    reality = yaml.safe_load((od / "reality/reality.yaml").read_text())
    onto = yaml.safe_load((od / "gurudevi.yaml").read_text())
    links = yaml.safe_load((od / "links/links.yaml").read_text())
    models = read_zmodel((root / "packages/schema/schema.zmodel").read_text())
    landscape = yaml.safe_load((od / "landscape/landscape.yaml").read_text())
    api = root / "apps/sanctuary-api/src"
    catalog = (api / "modules/catalog.ts").read_text()

    # Reality forms and levels
    forms = {n: c for n, c in reality["classes"].items() if ann(c, "requires") is not None}
    for n, c in reality["classes"].items():
        lvl = ann(c, "level")
        g.node(f"reality:{n}", level=lvl, description=c.get("description", "").strip()[:160])
        if lvl is not None:
            g.edge(g.node(f"level:L{lvl}"), "holds", f"reality:{n}")

    # Ontology
    oclasses = onto.get("classes", {})
    oslots = {**(reality.get("slots") or {}), **(onto.get("slots") or {})}
    enums = onto.get("enums", {})
    allc = {**reality["classes"], **oclasses}

    def lineage(n):
        out = []
        while n:
            out.append(n)
            n = allc.get(n, {}).get("is_a")
        return out

    def class_slots(n):
        s = []
        for a in reversed(lineage(n)):
            c = allc.get(a, {})
            for m in c.get("mixins") or []:
                s += allc.get(m, {}).get("slots") or []
            s += c.get("slots") or []
        return list(dict.fromkeys(s))

    for e, ed in enums.items():
        g.node(f"enum:{e}", values=sorted(ed.get("permissible_values") or {}))
    for cn, c in oclasses.items():
        cid = g.node(f"class:{cn}", ufo=ann(c, "ufo"))
        for a in lineage(cn):
            for m in allc.get(a, {}).get("mixins") or []:
                if m in forms or m == "Bitemporal":
                    g.edge(f"reality:{m}", "takes_form", cid)
        if c.get("is_a"):
            g.edge(f"class:{c['is_a']}", "is_a", cid)
        for s in class_slots(cn):
            sid = g.node(f"slot:{cn}.{s}")
            g.edge(sid, "part_of", cid)
            rng = ((c.get("slot_usage") or {}).get(s) or {}).get("range") or oslots.get(s, {}).get("range")
            if rng in enums:
                g.edge(f"enum:{rng}", "values_of", sid)
            elif rng in oclasses:
                g.edge(f"class:{rng}", "range_of", sid)
        lc = ann(c, "lifecycle") or {}
        create = lc.get("create") or []
        steps = (create if isinstance(create, list) else [create]) + (lc.get("transitions") or [])
        for t in steps:
            tid = g.node(f"transition:{t['id']}", who=t.get("who"), internal=t.get("internal"))
            g.edge(cid, "changes_by", tid)

    # Data: models, fields, tables
    table_model = {}
    for mn, m in models.items():
        mid = g.node(f"model:{mn}", rules=m["rules"])
        tid = g.node(f"table:{m['table']}")
        table_model[m["table"]] = mn
        g.edge(mid, "stored_as", tid)
        for fn in m["fields"]:
            g.edge(g.node(f"field:{mn}.{fn}"), "part_of", mid)

    # Links: class -> model, slot -> field
    stored = defaultdict(set)  # model -> classes
    for cn, lk in (links.get("classes") or {}).items():
        cid = f"class:{cn}"
        if cid not in g.nodes:
            g.gap("LINK_BROKEN", cid, "links.yaml names a class the ontology does not have")
            continue
        for st in lk.get("stored_in") or []:
            mn = st["model"]
            if mn not in models:
                g.gap("LINK_BROKEN", cid, f"stored_in names model {mn}, not in schema.zmodel")
                continue
            g.edge(cid, f"stored_in:{st.get('match', 'exact')}", f"model:{mn}")
            stored[mn].add(cn)
            smap = st.get("slots") or {}
            for s in class_slots(cn):
                sid = f"slot:{cn}.{s}"
                sl = smap.get(s)
                if sl is None or sl.get("match") == "missing":
                    why = (sl or {}).get("why") or "no column written in links.yaml"
                    g.gap("SLOT_NOT_STORED", sid, f"{mn}: {why}")
                    continue
                f = sl.get("field")
                if f not in models[mn]["fields"]:
                    g.gap("LINK_BROKEN", sid, f"names field {mn}.{f}, not in schema.zmodel")
                    continue
                g.edge(sid, f"stored_as:{sl.get('match', 'exact')}", f"field:{mn}.{f}")
                if sl.get("match") == "differs":
                    g.gap("SLOT_DIFFERS", sid, f"{mn}.{f}: {sl.get('why', '')}")
            for s in smap:
                if s not in class_slots(cn):
                    g.gap("LINK_BROKEN", f"class:{cn}", f"links.yaml maps slot {s}, not a slot of {cn}")
        for mn in lk.get("also_in") or []:
            if mn not in models:
                g.gap("LINK_BROKEN", cid, f"also_in names model {mn}, not in schema.zmodel")
                continue
            g.edge(cid, "also_in", f"model:{mn}")
            stored[mn].add(cn)
        if not lk.get("stored_in"):
            g.gap("CLASS_NOT_STORED", cid, "no stored_in in links.yaml")
    for cn in oclasses:
        if cn not in (links.get("classes") or {}):
            g.gap("CLASS_NOT_STORED", f"class:{cn}", "not in links.yaml")
    for mn, m in sorted(models.items()):
        if mn not in stored:
            g.gap("TABLE_NO_CLASS", f"model:{mn}", f"table {m['table']}")

    # Landscape: subdomain -> models
    placed = set()
    for dom in (landscape.get("domains") or {}).values():
        for sd, s in (dom.get("subdomains") or {}).items():
            sid = g.node(f"subdomain:{sd}", title=s.get("title"))
            for mn in s.get("models") or []:
                if mn in models:
                    g.edge(sid, "owns", f"model:{mn}")
                    placed.add(mn)
                else:
                    g.gap("LINK_BROKEN", sid, f"landscape names model {mn}, not in schema.zmodel")
    for mn in sorted(set(models) - placed):
        g.gap("TABLE_NOT_PLACED", f"model:{mn}", "in no landscape subdomain")

    # API: modules, capabilities, handlers, tables touched
    caps = read_capabilities(catalog)
    for mod in read_modules(catalog) + sorted({c["module"] for c in caps}):
        mid = g.node(f"module:{mod}")
        dom, _, sub = mod.partition(".")
        card = (
            f"docs/architecture/domains/{dom}/{sub}.md"
            if sub
            else f"docs/architecture/domains/platform/{mod}.md"
        )
        if (root / card).exists():
            g.edge(mid, "described_in", g.node(f"card:{card}"))
        elif any(c["module"] == mod for c in caps):
            g.gap("MODULE_NO_CARD", mid, card)
        if f"subdomain:{mod}" in g.nodes:
            g.edge(f"subdomain:{mod}", "is", mid)
    bodies, by_file, sql_consts = {}, defaultdict(dict), {}
    for f in sorted(api.rglob("*.ts")):
        if ".test." in f.name or "__tests__" in f.parts:
            continue
        text = f.read_text()
        for name, body in function_bodies(text).items():
            bodies.setdefault(name, (str(f.relative_to(root)), body))
            by_file[str(f.relative_to(root))][name] = body
        # SQL held in a const and passed by name (e.g. `const activeBondsQuery = \`...\``)
        for m in re.finditer(r"\bconst (\w+) = (`[^`]*`|'[^']*')", text):
            if "public." in m.group(2):
                sql_consts[m.group(1)] = (str(f.relative_to(root)), m.group(2))
    calls = router_calls((api / "core/router.ts").read_text())

    def touches(fn, seen, path=None):
        """Tables a handler function reaches; follows calls within its own file only."""
        if path is None:
            if fn not in bodies:
                return set(), set()
            path = bodies[fn][0]
        if (path, fn) in seen or fn not in by_file[path]:
            return set(), set()
        seen.add((path, fn))
        body = by_file[path][fn]
        t, files = sql_touches(body), {path}
        for const in set(re.findall(r"\b(\w+)\b", body)) & set(sql_consts):
            if sql_consts[const][0] == path:
                t |= sql_touches(sql_consts[const][1])
        for inner in set(re.findall(r"\b([a-z]\w+)\(", body)) & set(by_file[path]):
            t2, f2 = touches(inner, seen, path)
            t |= t2
            files |= f2
        return t, files

    fn_cache = {}

    def db_functions():
        """Postgres functions: name -> tables touched, from the latest migration defining it."""
        if not fn_cache:
            mig = sorted((root / "apps/gurudevi-mobile/supabase/migrations").glob("*.sql"))
            for f in mig:
                text = f.read_text(errors="replace")
                for m in re.finditer(r"create\s+(?:or\s+replace\s+)?function\s+public\.(\w+)", text, re.I):
                    tag = re.search(r"\$(\w*)\$", text[m.end() :])
                    if not tag:
                        continue
                    a = m.end() + tag.end()
                    b = text.find(tag.group(0), a)
                    body = text[a : b if b > 0 else len(text)]
                    fn_cache[m.group(1)] = sql_touches(re.sub(r"delete\s+from", "UPDATE", body, flags=re.I))
            fn_cache.setdefault("", set())
        return fn_cache

    trans_links = defaultdict(list)
    for c in caps:
        cid = g.node(f"capability:{c['name']}", kind=c["kind"])
        g.edge(cid, "in", f"module:{c['module']}")
        seen, t, files = set(), set(), set()
        for fn in sorted(calls.get(c["name"], set())):
            t2, f2 = touches(fn, seen)
            t |= t2
            files |= f2
        for path in sorted(files):
            g.edge(cid, "handled_in", g.node(f"code:{path}"))
        for rel, name in sorted(t):
            if rel == "calls_db_function":
                g.edge(g.node(f"dbfn:{name}"), "used_by", cid)
                for rel2, name2 in sorted(db_functions().get(name, set())):
                    if rel2 != "calls_db_function":
                        if name2 not in table_model and f"table:{name2}" not in g.nodes:
                            g.gap("TABLE_NOT_IN_SCHEMA", f"table:{name2}", "used by a Postgres function, absent from schema.zmodel")
                        g.node(f"table:{name2}")
                        g.edge(f"table:{name2}", f"{rel2}_by", f"dbfn:{name}")
                continue
            tid = f"table:{name}"
            if name not in table_model:
                if tid not in g.nodes:
                    g.gap("TABLE_NOT_IN_SCHEMA", tid, "read or written by the API, absent from schema.zmodel")
                g.node(tid, note="not in schema.zmodel")
            g.edge(tid, f"{rel}_by", cid)
            if rel == "writes" and not stored.get(table_model.get(name, "")):
                g.gap("CAPABILITY_TOUCHES_UNMODELLED", cid, f"writes {name}, which no class is stored in")
        lk = (links.get("capabilities") or {}).get(c["name"])
        if lk is None:
            g.gap("CAPABILITY_UNANCHORED", cid, "not in links.yaml capabilities")
            continue
        if lk.get("outside"):
            g.node(cid, outside=lk["outside"])
        tr = lk.get("transition")
        if tr:
            if f"transition:{tr}" not in g.nodes:
                g.gap("LINK_BROKEN", cid, f"names transition {tr}, not in gurudevi.yaml")
            else:
                g.edge(f"transition:{tr}", f"done_by:{lk.get('match', 'exact')}", cid)
                trans_links[tr].append(c["name"])
        for rel in ("reads", "edits"):
            for cn in lk.get(rel) or []:
                if f"class:{cn}" not in g.nodes:
                    g.gap("LINK_BROKEN", cid, f"{rel} names class {cn}, not in gurudevi.yaml")
                else:
                    g.edge(f"class:{cn}", f"{rel}_by", cid)
        if lk.get("match") == "differs":
            g.gap("CAPABILITY_DIFFERS", cid, lk.get("why", "").strip())
    for name in links.get("capabilities") or {}:
        if f"capability:{name}" not in g.nodes:
            g.gap("LINK_BROKEN", f"capability:{name}", "links.yaml names a capability not in catalog.ts")
    for nid in sorted(g.nodes):
        if nid.startswith("transition:") and not trans_links.get(nid.split(":", 1)[1]):
            g.gap("TRANSITION_NOT_BUILT", nid, "no capability carries it out")

    # Conformance report, if the API's own tool has run: contract, handler, evidence, clients
    # Opt-in (--conformance), so the committed graph never depends on a local report file.
    rep = root / "reports/capability-conformance.json"
    if with_conformance and rep.exists():
        data = json.loads(rep.read_text())
        for row in data.get("rows", data if isinstance(data, list) else []):
            cid = f"capability:{row.get('capability')}"
            if cid in g.nodes:
                g.node(cid, conformance_gaps=row.get("gaps"))
                for con in (row.get("practice") or {}).get("consumers") or []:
                    g.edge(cid, "consumed_by", g.node(f"code:{con['file']}", client=con.get("client")))

    # Policy: Cedar resources and capacities
    authorities = json.loads((root / "packages/policies/src/authorizationAuthorities.json").read_text())
    res_table = {a["resource"]: a.get("table") for a in authorities}
    cedar_caps = set()
    for f in sorted((root / "packages/policies/src/policies").rglob("*.cedar")):
        text = f.read_text()
        pid = g.node(f"policy:{f.relative_to(root)}")
        cedar_caps |= set(re.findall(r'principal\.capacity == "(\w+)"', text))
        for r in sorted(set(re.findall(r"resource is (\w+)", text))):
            rid = g.node(f"resource:{r}")
            g.edge(rid, "governed_by", pid)
            if f"table:{res_table.get(r)}" in g.nodes:
                g.edge(f"table:{res_table[r]}", "is_resource", rid)
            elif r in models:
                g.edge(f"table:{models[r]['table']}", "is_resource", rid)
    for nid in sorted(g.nodes):
        if nid.startswith("resource:") and not any(e[2] == nid and e[1] == "is_resource" for e in g.edges):
            g.gap("POLICY_RESOURCE_UNKNOWN", nid, "no table: not a zmodel model name, not in authorizationAuthorities.json")

    # Vocabularies: ontology enums against the code's spellings
    for en, sources in (links.get("vocabularies") or {}).items():
        if en not in enums:
            g.gap("LINK_BROKEN", f"enum:{en}", "links.yaml vocabulary for an enum not in gurudevi.yaml")
            continue
        onto_vals = set(enums[en].get("permissible_values") or {})
        spellings = defaultdict(set)
        for v in onto_vals:
            spellings[norm_word(v)].add(v)
        for src in sources:
            (kind, ref), = src.items()
            if kind == "zod":
                path, _, name = ref.partition("#")
                vals = zod_values((root / path).read_text(), name) if (root / path).exists() else []
            elif kind == "cedar":
                vals = sorted(cedar_caps)
            elif kind == "zmodel":
                mn, _, fn = ref.partition(".")
                vals = field_values(models[mn]["fields"][fn]) if fn in models.get(mn, {}).get("fields", {}) else []
            else:
                vals = []
            vid = g.node(f"vocabulary:{kind}:{ref}", values=sorted(vals))
            if not vals:
                g.gap("LINK_BROKEN", vid, "no values found at this source")
                continue
            g.edge(f"enum:{en}", "spelt_in", vid)
            for v in vals:
                spellings[norm_word(v)].add(v)
            # One gap per value, so a new stray value raises the count and fails the gate.
            for v in sorted(set(vals) - onto_vals):
                g.gap("VALUES_DIFFER", vid, f"'{v}' is not a {en} value")
            if kind == "zmodel":
                for v in sorted(onto_vals - set(vals)):
                    g.gap("VALUES_DIFFER", vid, f"{en} '{v}' is never held by the column")
        for key, forms_ in sorted(spellings.items()):
            if len(forms_) > 1:
                g.gap("VALUE_SPELLINGS", f"enum:{en}", f"{' / '.join(sorted(forms_))}")

    # Screens: registry features -> authorization subject -> (capability, once linked)
    flinks = links.get("features") or {}
    for f in sorted((root / "packages").glob("*/src/constants/*Registry.ts")):
        for feat in read_registry(f.read_text()):
            fid = g.node(f"feature:{f.parts[-4]}/{feat['id']}", tab=feat["tab"], file=str(f.relative_to(root)))
            if feat["subject"]:
                g.edge(g.node(f"subject:{feat['subject']}"), "guards", fid)
            capsf = feat["capabilities"] + (flinks.get(f"{f.parts[-4]}/{feat['id']}") or [])
            for c in capsf:
                if f"capability:{c}" in g.nodes:
                    g.edge(f"capability:{c}", "serves", fid)
                else:
                    g.gap("LINK_BROKEN", fid, f"names capability {c}, not in catalog.ts")
            if not capsf:
                g.gap("FEATURE_NO_CAPABILITY", fid, f"subject {feat['subject']}")
    return g


# ---------------------------------------------------------------------------------------
# Impact and ripple
# ---------------------------------------------------------------------------------------
def walk(data: dict, start: str, forward: bool) -> dict[str, int]:
    # Edges point the way a change ripples (src shapes dst). part_of points from a part to
    # its whole: a change to a slot or field ripples to its class or model. Upstream, a part
    # must stay true to its whole and to whatever shapes that whole, so part_of is walked
    # forward both ways and never back down to the whole's other parts.
    nxt = defaultdict(set)
    for s, rel, d in data["edges"]:
        if forward or rel == "part_of":
            nxt[s].add(d)
        else:
            nxt[d].add(s)
    dist, q = {start: 0}, deque([start])
    while q:
        n = q.popleft()
        for m in nxt[n]:
            if m not in dist:
                dist[m] = dist[n] + 1
                q.append(m)
    dist.pop(start)
    return dist


def describe(nodes: dict[str, int], limit: int = 12) -> list[str]:
    by = defaultdict(list)
    for n in sorted(nodes, key=lambda x: (nodes[x], x)):
        by[n.split(":", 1)[0]].append(n.split(":", 1)[1])
    out = []
    for layer in sorted(by, key=lambda k: LAYER_ORDER.index(k) if k in LAYER_ORDER else 99):
        items = by[layer]
        more = f" … and {len(items) - limit} more" if len(items) > limit else ""
        out.append(f"  {layer} ({len(items)}): {', '.join(items[:limit])}{more}")
    return out


LAYER_ORDER = [
    "level", "reality", "class", "slot", "enum", "transition", "vocabulary", "subdomain",
    "model", "field", "table", "dbfn", "capability", "module", "card", "code", "resource",
    "policy", "subject", "feature",
]


def impact(data: dict, node: str) -> str:
    if node not in data["nodes"]:
        close = [n for n in data["nodes"] if node.lower() in n.lower()][:10]
        return f"no node {node}. Did you mean: {', '.join(close)}"
    up, down = walk(data, node, False), walk(data, node, True)
    gaps = [g for g in data["gaps"] if g["node"] == node or g["node"] in down]
    lines = [f"impact of {node}", "", f"must stay true to ({len(up)} upstream):", *describe(up)]
    lines += ["", f"ripples to ({len(down)} downstream):", *describe(down)]
    lines += ["", f"open gaps on this path ({len(gaps)}):"]
    lines += [f"  {g['code']}  {g['node']}  {g['detail']}" for g in gaps[:40]]
    return "\n".join(lines)


def ripple(base: dict, head: dict) -> str:
    bn, hn = set(base["nodes"]), set(head["nodes"])
    be, he = {tuple(e) for e in base["edges"]}, {tuple(e) for e in head["edges"]}
    key = lambda g: (g["code"], g["node"], g["detail"])  # noqa: E731
    bg, hg = {key(g) for g in base["gaps"]}, {key(g) for g in head["gaps"]}
    edited = {n for n in bn & hn if base["nodes"][n] != head["nodes"][n]}
    changed = sorted((hn - bn) | (bn - hn) | edited | {x for e in be ^ he for x in (e[0], e[2])})
    reach = {}
    for n in changed:
        src = head if n in hn else base
        for m, d in walk(src, n, True).items():
            reach[m] = min(d, reach.get(m, d))
    out = ["## Ripple of this change through the links graph", ""]
    out += [f"- nodes added {len(hn - bn)}, removed {len(bn - hn)}; links added {len(he - be)}, removed {len(be - he)}"]
    out += [f"- gaps opened {len(hg - bg)}, closed {len(bg - hg)}", ""]
    if changed:
        out += ["Changed:", "", *[f"- `{n}`" for n in changed[:60]], ""]
        out += [f"Reaches downstream ({len(reach)}):", "", "```", *describe(reach), "```", ""]
    for title, s in (("Gaps opened", hg - bg), ("Gaps closed", bg - hg)):
        if s:
            out += [f"{title}:", "", *[f"- {c} `{n}` {d}" for c, n, d in sorted(s)], ""]
    return "\n".join(out)


# ---------------------------------------------------------------------------------------
# Report and gate
# ---------------------------------------------------------------------------------------
def counts(data: dict) -> dict[str, int]:
    c = {k: 0 for k in GAP_CODES}
    for g in data["gaps"]:
        c[g["code"]] += 1
    return c


def report(data: dict) -> str:
    nodes, gaps = data["nodes"], data["gaps"]
    per = defaultdict(int)
    for n in nodes:
        per[n.split(":", 1)[0]] += 1
    c = counts(data)
    models = [n for n in nodes if n.startswith("model:")]
    linked = {e[2] for e in data["edges"] if e[1].startswith(("stored_in", "also_in"))}
    caps = [n for n in nodes if n.startswith("capability:")]
    trans = [n for n in nodes if n.startswith("transition:")]
    built = {e[0] for e in data["edges"] if e[1].startswith("done_by")}
    feats = [n for n in nodes if n.startswith("feature:")]
    lines = [
        "# Links graph: reality to screen",
        "",
        "Generated by `ontology/scripts/links.py`; do not edit. Hand-written joins live in",
        "`ontology/links/links.yaml`; ceilings per gap code in `tooling/ratchet.json`",
        "(`ontologyLinkGaps`).",
        "",
        "## How far the chain reaches",
        "",
        "| Link | Joined | Of |",
        "| --- | ---: | ---: |",
        f"| ontology classes placed in a reality form | {len({e[2] for e in data['edges'] if e[1] == 'takes_form'})} | {per['class']} |",
        f"| ontology classes stored in a table | {len({e[0] for e in data['edges'] if e[1].startswith('stored_in')})} | {per['class']} |",
        f"| tables linked to an ontology class | {len(linked)} | {len(models)} |",
        f"| tables placed in a landscape subdomain | {len(models) - c['TABLE_NOT_PLACED']} | {len(models)} |",
        f"| ontology transitions carried out by a capability | {len(built)} | {len(trans)} |",
        f"| capabilities anchored in the ontology | {len(caps) - c['CAPABILITY_UNANCHORED']} | {len(caps)} |",
        f"| Cedar resources with a table | {per['resource'] - c['POLICY_RESOURCE_UNKNOWN']} | {per['resource']} |",
        f"| screen features that name a capability | {len(feats) - c['FEATURE_NO_CAPABILITY']} | {len(feats)} |",
        "",
        "## Gaps by code",
        "",
        "| Code | Count |",
        "| --- | ---: |",
        *[f"| {k} | {v} |" for k, v in c.items()],
        "",
        "## Every gap except the long lists",
        "",
    ]
    long_lists = {"TABLE_NO_CLASS", "TABLE_NOT_PLACED", "FEATURE_NO_CAPABILITY", "POLICY_RESOURCE_UNKNOWN"}
    cur = None
    for gp in gaps:
        if gp["code"] in long_lists:
            continue
        if gp["code"] != cur:
            cur = gp["code"]
            lines += ["", f"### {cur}", ""]
        lines.append(f"- `{gp['node']}`: {gp['detail']}")
    for code in sorted(long_lists):
        items = [gp["node"].split(":", 1)[1] for gp in gaps if gp["code"] == code]
        lines += ["", f"### {code} ({len(items)})", "", ", ".join(items)]
    return "\n".join(lines) + "\n"


def main(argv: list[str]) -> int:
    cmd = argv[0] if argv else "build"
    opt = lambda k, d: Path(argv[argv.index(k) + 1]) if k in argv else d  # noqa: E731
    root = opt("--root", Path.cwd())
    out = opt("--out", root / "ontology/links/out")
    if cmd == "impact":
        data = json.loads(opt("--graph", out / "graph.json").read_text())
        print(impact(data, argv[1]))
        return 0
    if cmd == "ripple":
        print(ripple(json.loads(Path(argv[1]).read_text()), json.loads(Path(argv[2]).read_text())))
        return 0
    data = build(root, "--conformance" in argv).to_json()
    out.mkdir(parents=True, exist_ok=True)
    (out / "graph.json").write_text(json.dumps(data, indent=1, sort_keys=True) + "\n")
    (out / "links.md").write_text(report(data))
    c = counts(data)
    print("links: " + ", ".join(f"{k} {v}" for k, v in c.items() if v))
    if cmd not in ("check", "update"):
        return 0
    rfile = root / "tooling/ratchet.json"
    ratchet = json.loads(rfile.read_text())
    ceil = ratchet.get("ontologyLinkGaps")
    if ceil is None and cmd == "check":
        print("FAIL no ontologyLinkGaps in tooling/ratchet.json; run `links.py update` once")
        return 1
    if cmd == "update":
        # Lowers only. `update --raise` sets every ceiling to today's count: for a change that
        # adds scope (new classes bring their own gaps). The raise shows in the ratchet diff.
        raise_ = "--raise" in argv
        nxt = {k: v if raise_ or not ceil else min(v, ceil.get(k, v)) for k, v in c.items()}
        ratchet["ontologyLinkGaps"] = nxt
        rfile.write_text(json.dumps(ratchet, indent=2) + "\n")
        print("ceilings written to tooling/ratchet.json (ontologyLinkGaps)")
    bad = [k for k in GAP_CODES if c[k] > (0 if k in HARD else ratchet["ontologyLinkGaps"].get(k, 0))]
    for k in bad:
        print(f"FAIL {k}: {c[k]} above ceiling {0 if k in HARD else ratchet['ontologyLinkGaps'].get(k, 0)}")
        for gp in data["gaps"]:
            if gp["code"] == k:
                print(f"  {gp['node']}: {gp['detail']}")
    lower = [k for k in GAP_CODES if c[k] < ratchet["ontologyLinkGaps"].get(k, 0)]
    if lower and not bad:
        print("improved: " + ", ".join(lower) + "; run `links.py update` to lower the ceilings")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
