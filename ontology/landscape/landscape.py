"""Coverage map of the whole landscape: every subdomain in the domain index, what it owns,
what already stores and describes it, and what is missing. Deterministic.

Inputs : landscape.yaml (hand-written placement), ../harvest/out/claims-*.yaml,
         ../gurudevi.yaml, docs/architecture/domains/README.md (status of each subdomain).
Outputs: out/landscape.md, out/landscape.json

Usage: python -I ontology/landscape/landscape.py <repo_root>
"""

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

import yaml

root = Path(sys.argv[1]).resolve()
here = root / "ontology/landscape"
(here / "out").mkdir(exist_ok=True)
land = yaml.safe_load((here / "landscape.yaml").read_text())
onto = yaml.safe_load((root / "ontology/gurudevi.yaml").read_text())
claims = []
for f in ("claims-docs.yaml", "claims-code.yaml"):
    claims += [c for c in yaml.safe_load((root / "ontology/harvest/out" / f).read_text())["claims"] if c.get("verified") is not False]
onto_classes = {c for c, v in onto["classes"].items() if not v.get("mixin")}


def norm(s) -> str:
    s = re.sub(r"[^a-z0-9]", "", str(s).lower())
    return s[:-1] if s.endswith("s") and len(s) > 3 and not s.endswith("ss") else s


# zmodel facts
zmodels, table_of, states_of, rel_of = set(), {}, defaultdict(list), defaultdict(set)
for c in claims:
    if not c["doc"].endswith(".zmodel"):
        continue
    if c["kind"] == "entity":
        zmodels.add(c["subject"])
    elif c["kind"] == "synonym":
        table_of[c["subject"]] = c["value"]["same_as"]
    elif c["kind"] == "state_set":
        m, field = c["subject"].split(".", 1)
        if re.search(r"(state|status|stage|phase)$", field):
            states_of[m].append((field, c["value"]))
    elif c["kind"] == "relation":
        rel_of[c["subject"]].add(c["value"]["to"])

# subdomain status from the domain index
status = {}
for line in (root / "docs/architecture/domains/README.md").read_text().splitlines():
    cells = [x.strip() for x in line.strip().strip("|").split("|")]
    ns = [x for x in cells if re.fullmatch(r"`[a-z.]+`", x)]
    if ns and len(cells) >= 2:
        status[ns[-1].strip("`")] = re.sub(r"\s*\(.*", "", cells[-1]).strip()

doc_claims = [c for c in claims if not c["doc"].endswith(".zmodel") and c["doc"].endswith(".md")]
doc_by_name = defaultdict(list)
for c in doc_claims:
    doc_by_name[norm(str(c["subject"]).split(".")[0])].append(c)

placed = defaultdict(list)
rows, out_json = [], []
LEVELS = {4: "fully in the ontology", 3: "stored and described", 2: "stored only", 1: "described only", 0: "only a name"}
for dkey, dom in land["domains"].items():
    for ns, sd in dom["subdomains"].items():
        models = sd.get("models") or []
        concepts = sd.get("concepts") or []
        for m in models:
            placed[m].append(ns)
        unknown = [m for m in models if m not in zmodels]
        names = {norm(x) for x in models + concepts} | {norm(table_of[m]) for m in models if m in table_of}
        dcl = [c for n in sorted(names) for c in doc_by_name.get(n, [])]
        docs = sorted({c["doc"] for c in dcl})
        lifecycles = {m: states_of[m] for m in models if states_of.get(m)}
        doc_states = [c for c in dcl if c["kind"] in ("state_set", "transition")]
        rules = [c for c in dcl if c["kind"] == "rule"]
        in_onto = sorted(set(concepts) & onto_classes)
        level = 4 if concepts and len(in_onto) == len(concepts) else 3 if models and docs else 2 if models else 1 if docs else 0
        missing = []
        if not models:
            missing.append("no stored model")
        if not docs:
            missing.append("no design doc names it")
        if models and not lifecycles and not doc_states:
            missing.append("no lifecycle anywhere")
        if not rules:
            missing.append("no stated rules")
        st = status.get(ns, "not in index")
        if st in ("skeleton", "not in index"):
            missing.append(f"no card ({st})")
        if not concepts:
            missing.append("no concept named yet")
        row = {"domain": dom["title"], "domain_key": dkey, "kind": dom["kind"], "ns": ns, "title": sd["title"],
               "level": level, "level_name": LEVELS[level], "status": st, "concepts": concepts, "in_ontology": in_onto,
               "models": models, "unknown_models": unknown, "lifecycles": {m: [list(v) for _, v in s] for m, s in lifecycles.items()},
               "doc_files": docs, "doc_claims": len(dcl), "rules": len(rules), "missing": missing, "note": sd.get("note", "")}
        rows.append(row)
        out_json.append(row)

all_names = set()
for dom in land["domains"].values():
    for sd in dom["subdomains"].values():
        all_names |= {norm(x) for x in (sd.get("models") or []) + (sd.get("concepts") or [])}
        all_names |= {norm(table_of[m]) for m in (sd.get("models") or []) if m in table_of}
orphan = defaultdict(set)
for c in doc_claims:
    if c["kind"] == "entity":
        n = str(c["subject"]).split(".")[0]
        if norm(n) not in all_names and re.fullmatch(r"[A-Z][A-Za-z]+", n):
            orphan[n].add(c["doc"])
orphans = sorted(((n, sorted(d)) for n, d in orphan.items() if len(d) >= 2), key=lambda x: (-len(x[1]), x[0]))
unplaced_models = sorted(m for m in zmodels if m not in placed and m not in (land.get("unplaced") or {}))
twice = sorted(m for m, v in placed.items() if len(v) > 1)

# ---------------------------------------------------------------- report
L = ["# Landscape: what Gurudevi has, area by area", "",
     "Generated by `ontology/landscape/landscape.py` from `landscape.yaml`, the harvest and `gurudevi.yaml`. Do not edit.", ""]
by_level = defaultdict(int)
for r in rows:
    by_level[r["level"]] += 1
L += [f"{len(rows)} subdomains in {len(land['domains'])} areas. " +
      "; ".join(f"{by_level[k]} {LEVELS[k]}" for k in sorted(LEVELS, reverse=True)) + ".", "",
      f"{len(zmodels)} stored models: {sum(1 for m in zmodels if m in placed)} placed, "
      f"{len(land.get('unplaced') or {})} set aside on purpose, {len(unplaced_models)} not placed"
      + (f" ({', '.join(unplaced_models)})" if unplaced_models else "") + ".", ""]
if twice:
    L += [f"Placed in two subdomains: {', '.join(twice)}.", ""]
L += ["Docs counted are the 39 read by the harvest (`ontology/harvest/docs.txt`), so \"no design doc\" means none of those.", ""]
L += ["## The map", "", "| Area | Subdomain | Coverage | In ontology | Card | Concepts | Stored as | Docs | Missing |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |"]
for r in rows:
    L.append(f"| {r['domain']} | {r['title']} (`{r['ns']}`) | {r['level_name']} | {len(r['in_ontology'])} of {len(r['concepts'])} | {r['status']} | {', '.join(r['concepts']) or '—'} | "
             f"{len(r['models'])} | {len(r['doc_files'])} | {'; '.join(r['missing']) or '—'} |")
L.append("")
L += ["## Named in two or more docs, owned by no subdomain", "",
      "Either a concept a subdomain should own, or a word to retire.", "", "| Name | Docs | Example |", "| --- | --- | --- |"]
for n, d in orphans:
    L.append(f"| `{n}` | {len(d)} | `{d[0]}` |")
L.append("")
L += ["## Each subdomain", ""]
for r in rows:
    L += [f"### {r['domain']} · {r['title']} (`{r['ns']}`)", ""]
    L.append(f"Coverage: **{r['level_name']}**. Card: {r['status']}.")
    if r["note"]:
        L.append(f"Note: {r['note']}")
    L.append("")
    L.append(f"- Concepts: {', '.join(r['concepts']) or 'none named'}" + (f" (in ontology: {', '.join(r['in_ontology'])})" if r["in_ontology"] else ""))
    L.append(f"- Stored as: {', '.join(f'`{m}`' for m in r['models']) or 'nothing'}" + (f"; not in schema: {', '.join(r['unknown_models'])}" if r["unknown_models"] else ""))
    if r["lifecycles"]:
        L.append("- States in the schema: " + "; ".join(f"`{m}` {' / '.join(', '.join(v) for v in s)}" for m, s in r["lifecycles"].items()))
    L.append(f"- Described in {len(r['doc_files'])} docs ({r['doc_claims']} claims, {r['rules']} rules)" + (": " + ", ".join(f"`{d}`" for d in r["doc_files"][:6]) + (" …" if len(r["doc_files"]) > 6 else "") if r["doc_files"] else ""))
    L.append(f"- Missing: {'; '.join(r['missing']) or 'nothing found'}")
    L.append("")
(here / "out/landscape.md").write_text("\n".join(L) + "\n")
(here / "out/landscape.json").write_text(json.dumps({"subdomains": out_json, "unplaced_models": unplaced_models,
                                                     "set_aside": land.get("unplaced") or {}, "orphans": [{"name": n, "docs": d} for n, d in orphans]}, indent=1, sort_keys=True) + "\n")
print(f"{len(rows)} subdomains; " + ", ".join(f"{LEVELS[k]} {by_level[k]}" for k in sorted(LEVELS, reverse=True))
      + f"; unplaced models {len(unplaced_models)}; placed twice {len(twice)}")
