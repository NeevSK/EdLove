"""Harvest ontology claims from the repository's schemas and code. Deterministic: no network,
no clock, sorted output; two runs give identical bytes.

Reads:
  - packages/schema/schema.zmodel         models, fields, relations, value lists in comments,
                                           @default values, capacities named in @@allow rules
  - supabase/migrations/*.sql              tables, CHECK (... IN (...)) lists, CREATE TYPE AS ENUM
  - packages/**/src, apps/sanctuary-api/src (*.ts, not tests)
                                           `export const X = [...]` and `export type X = 'a' | 'b'`
                                           whose name says state, status, capacity, role, stage,
                                           phase or power; z.enum([...]) in the v1 contract
  - docs/**/*.md                           mermaid erDiagram entities

Writes claims in the same shape the document extraction uses (see INSTRUCTIONS.md beside this
file), with `doc` = the source file and `line` = where the fact is.

Usage: python -I ontology/harvest/harvest_code.py <repo_root> <out.yaml>
"""

import re
import sys
from pathlib import Path

import yaml

root = Path(sys.argv[1]).resolve()
out = Path(sys.argv[2])
claims: list[dict] = []
STATEY = re.compile(r"(state|status|stage|phase|capacity|role|kind)$", re.I)
NAMEY = re.compile(r"(STATE|STATUS|CAPACIT|ROLE|STAGE|PHASE|POWER)", re.I)


def rel(p: Path) -> str:
    return p.relative_to(root).as_posix()


def add(path: Path, line: int, kind: str, subject: str, value, quote: str):
    claims.append({
        "doc": rel(path), "line": line, "doc_status": "code", "doc_date": "current",
        "kind": kind, "subject": subject, "value": value, "quote": quote.strip()[:200],
    })


def split_values(text: str) -> list[str]:
    """'active, archived, revoked' or "'PLATFORM', 'SCHOOL'" or 'a | b' -> list."""
    text = re.split(r"[;.(]| - | — | e\.g\.", text.replace("e.g.,", "").replace("e.g.", ""))[0]
    parts = re.split(r"\s*[,|/]\s*|\s+or\s+", text)
    vals = [p.strip().strip("'\"` ") for p in parts]
    vals = [v for v in vals if re.fullmatch(r"[A-Za-z][A-Za-z0-9_-]*", v)]
    if "etc" in text:
        vals.append("...")
    return [v for v in vals if v != "etc"]


# ---------------------------------------------------------------- zmodel
SCALARS = {"String", "Int", "BigInt", "Float", "Decimal", "Boolean", "DateTime", "Json", "Bytes", "Unsupported"}
for zpath in sorted((root / "packages/schema").glob("schema.zmodel")):
    lines = zpath.read_text().splitlines()
    model, doc_lines = None, []
    for i, raw in enumerate(lines, 1):
        s = raw.strip()
        if s.startswith(("/**", "*", "///")) and model is None:
            doc_lines.append(s.lstrip("/* ").strip())
            continue
        m = re.match(r"model\s+(\w+)\s*\{", s)
        if m:
            model = m.group(1)
            desc = " ".join(x for x in doc_lines if x)[:200]
            add(zpath, i, "entity", model, desc, s)
            doc_lines = []
            continue
        if model is None:
            if s and not s.startswith(("/", "*")):
                doc_lines = []
            continue
        if s == "}":
            model = None
            continue
        if s.startswith("@@map"):
            mm = re.search(r'"(\w+)"', s)
            if mm:
                add(zpath, i, "synonym", model, {"same_as": mm.group(1), "note": "table name"}, s)
            continue
        if s.startswith("@@allow") or s.startswith("@@deny"):
            caps = sorted(set(re.findall(r"capacity\s*==\s*'(\w+)'", s)))
            if caps:
                op = re.match(r"@@(allow|deny)\('([^']+)'", s)
                for c in caps:
                    add(zpath, i, "power",  c, {"who": c, "may": op.group(1) == "allow" if op else True,
                                                "act": op.group(2) if op else "", "where": model}, s)
            continue
        fm = re.match(r"(\w+)\s+(\w+)(\[\])?(\?)?(.*)$", s)
        if not fm or s.startswith("//"):
            continue
        fname, ftype, is_list, _opt, rest = fm.groups()
        if ftype not in SCALARS:
            add(zpath, i, "relation", model, {"to": ftype, "type": "has many" if is_list else "has one", "field": fname}, s)
            continue
        comment = rest.split("//", 1)[1] if "//" in rest else ""
        default = re.search(r'@default\("([^"]+)"\)', rest)
        if STATEY.search(fname) and ftype == "String":
            vals = split_values(comment) if comment else []
            if len(vals) >= 2:
                add(zpath, i, "state_set", f"{model}.{fname}", vals, s)
            elif default:
                add(zpath, i, "state_set", f"{model}.{fname}", [default.group(1), "..."], s)

# ---------------------------------------------------------------- SQL
for spath in sorted((root / "supabase/migrations").glob("*.sql")):
    text = spath.read_text()
    for m in re.finditer(r"create\s+table\s+(?:if\s+not\s+exists\s+)?([\w.\"]+)", text, re.I):
        add(spath, text.count("\n", 0, m.start()) + 1, "entity", m.group(1).replace('"', "").split(".")[-1], "", m.group(0))
    for m in re.finditer(r"(\w+)\s+in\s*\(\s*('[^)]*')\s*\)", text, re.I):
        vals = re.findall(r"'([^']*)'", m.group(2))
        if len(vals) >= 2:
            add(spath, text.count("\n", 0, m.start()) + 1, "state_set", m.group(1), vals, m.group(0))
    for m in re.finditer(r"create\s+type\s+([\w.\"]+)\s+as\s+enum\s*\(([^)]*)\)", text, re.I):
        add(spath, text.count("\n", 0, m.start()) + 1, "state_set", m.group(1).split(".")[-1],
            re.findall(r"'([^']*)'", m.group(2)), m.group(0))

# ---------------------------------------------------------------- TypeScript
ts_roots = [root / "packages", root / "apps/sanctuary-api/src"]
for base in ts_roots:
    for tpath in sorted(base.rglob("*.ts")):
        p = tpath.as_posix()
        if "node_modules" in p or ".test." in p or "/dist/" in p or ".generated." in p or "/__tests__/" in p:
            continue
        if base.name == "packages" and "/src/" not in p:
            continue
        if re.search(r"/packages/(ui|verger-[\w-]+|graphics|eslint-config|typescript-config|types-shim|scanner-kit)/", p):
            continue  # presentation and runtime packages own no domain facts
        text = tpath.read_text(errors="ignore")
        for m in re.finditer(r"export\s+const\s+(\w+)\s*(?::[^=]+)?=\s*\[([^\]]*)\]", text):
            if not NAMEY.search(m.group(1)):
                continue
            vals = re.findall(r"^\s*['\"]([\w-]+)['\"]\s*,?\s*$|['\"]([\w-]+)['\"]", m.group(2), re.M)
            vals = [a or b for a, b in vals]
            if len(vals) >= 2 and "{" not in m.group(2):
                add(tpath, text.count("\n", 0, m.start()) + 1,
                    "capacity_set" if re.search("CAPACIT|ROLE", m.group(1), re.I) else "state_set", m.group(1), vals, m.group(0).split("\n")[0])
        for m in re.finditer(r"export\s+type\s+(\w+)\s*=\s*((?:\s*\|?\s*'[\w-]+')+)\s*;", text):
            if not NAMEY.search(m.group(1)):
                continue
            vals = re.findall(r"'([\w-]+)'", m.group(2))
            if len(vals) >= 2:
                add(tpath, text.count("\n", 0, m.start()) + 1,
                    "capacity_set" if re.search("CAPACIT|ROLE", m.group(1), re.I) else "state_set", m.group(1), vals, m.group(0)[:200])
        if tpath.match("**/api/v1/*.ts"):
            for m in re.finditer(r"(\w+)\s*[:=]\s*z\.enum\(\s*\[([^\]]*)\]", text):
                vals = re.findall(r"'([\w-]+)'", m.group(2))
                if len(vals) >= 2:
                    add(tpath, text.count("\n", 0, m.start()) + 1,
                        "capacity_set" if re.search("capacit|role", m.group(1), re.I) else "state_set", m.group(1), vals, m.group(0)[:200])

# ---------------------------------------------------------------- mermaid ER in docs
for dpath in sorted((root / "docs").rglob("*.md")):
    if "2026-11-26-api-foundation" in dpath.as_posix():
        continue
    text = dpath.read_text(errors="ignore")
    for block in re.finditer(r"```mermaid\s*\n\s*erDiagram\n(.*?)```", text, re.S):
        start = text.count("\n", 0, block.start()) + 1
        body = block.group(1)
        for m in re.finditer(r"^\s*([A-Za-z_][\w-]*)\s*\{", body, re.M):
            add(dpath, start + body.count("\n", 0, m.start()) + 1, "entity", m.group(1), "", m.group(0))
        for m in re.finditer(r"^\s*([A-Za-z_][\w-]*)\s+([|}o{.\-]+)\s+([A-Za-z_][\w-]*)\s*:\s*\"?([^\"\n]*)", body, re.M):
            add(dpath, start + body.count("\n", 0, m.start()) + 1, "relation", m.group(1),
                {"to": m.group(3), "type": m.group(4).strip() or m.group(2)}, m.group(0))

claims.sort(key=lambda c: (c["doc"], c["line"], c["kind"], c["subject"]))
out.write_text(yaml.safe_dump({"batch": "code", "claims": claims}, sort_keys=False, allow_unicode=True, width=200))
kinds: dict[str, int] = {}
for c in claims:
    kinds[c["kind"]] = kinds.get(c["kind"], 0) + 1
print(f"{len(claims)} claims from code:", ", ".join(f"{k} {v}" for k, v in sorted(kinds.items())))
