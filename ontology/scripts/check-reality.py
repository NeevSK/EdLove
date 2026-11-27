"""Check every class in the ontology against the reality form it takes.

The forms and what each requires are in ontology/reality/reality.yaml (the machine-readable
part of "Gurudevi's model of reality"). A class takes a form as a mixin, directly or through
is_a. This script refuses:
  - a class that takes no form, or more than one form;
  - a class that does not meet a requirement of its form;
  - a requirement id this script does not know.
Deterministic: no clock, no network, sorted output.

Usage: python -I ontology/scripts/check-reality.py <ontology dir> [schema.yaml] [--report]
  --report  print every finding but exit 0 (for a schema that is not yet placed)
"""

import sys
from pathlib import Path

import yaml

args = [a for a in sys.argv[1:] if not a.startswith("--")]
report_only = "--report" in sys.argv
odir = Path(args[0])
schema_path = Path(args[1]) if len(args) > 1 else odir / "gurudevi.yaml"
reality = yaml.safe_load((odir / "reality/reality.yaml").read_text())
schema = yaml.safe_load(schema_path.read_text())


def ann(obj: dict, key: str):
    v = (obj.get("annotations") or {}).get(key)
    return v.get("value") if isinstance(v, dict) and "value" in v else v


FORMS = {n: c for n, c in reality["classes"].items() if ann(c, "requires") is not None}
RECORD = "Bitemporal"
classes = {**{n: c for n, c in reality["classes"].items()}, **schema.get("classes", {})}
slots = {**(reality.get("slots") or {}), **(schema.get("slots") or {})}
rules = ann(schema, "rules") or []


def lineage(name: str) -> list[str]:
    out, cur = [], name
    while cur:
        out.append(cur)
        cur = classes.get(cur, {}).get("is_a")
    return out


def mixins(name: str) -> set[str]:
    return {m for c in lineage(name) for m in classes.get(c, {}).get("mixins") or []}


def own_slots(name: str) -> list[str]:
    out = []
    for c in lineage(name) + sorted(mixins(name)):
        out += classes.get(c, {}).get("slots") or []
    return out


def lifecycle(name: str):
    for c in lineage(name):
        lc = ann(classes.get(c, {}), "lifecycle")
        if lc:
            return lc
    return None


def form_of(name: str) -> list[str]:
    return sorted(m for m in mixins(name) if m in FORMS)


def slot_ann(s: str, key: str):
    return ann(slots.get(s) or {}, key)


def has_valid_to_rule(name: str) -> bool:
    for c in lineage(name):
        for r in classes.get(c, {}).get("rules") or []:
            post = ((r.get("postconditions") or {}).get("slot_conditions") or {}).get("valid_to") or {}
            if post.get("required"):
                return True
    return False


def check(req: str, name: str) -> str | None:
    lc = lifecycle(name)
    trans = (lc or {}).get("transitions") or []
    if req == "is_recorded":
        return None if RECORD in mixins(name) else "is not recorded with two times (no Bitemporal)"
    if req == "has_course":
        return None if lc else "has no lifecycle, but every distinction has a course"
    if req == "has_two_parties":
        n = sum(1 for s in own_slots(name) if slot_ann(s, "ufo") == "mediation")
        return None if n >= 2 else f"has {n} parties; a coupling needs two"
    if req == "ending_keeps_history":
        if not any(t.get("to") == "ended" for t in trans):
            return "has no transition to ended"
        if any(t.get("to") in ("deleted", "removed", "archived") for t in trans):
            return "can be deleted or archived instead of ended with history"
        return None if has_valid_to_rule(name) else "does not require valid_to once ended"
    if req == "never_changes_once_over":
        return None if not trans else f"has {len(trans)} transitions, but a course is fixed once over"
    if req == "has_source":
        ok = any(r.get("class") == name and r.get("kind") == "within_interval" for r in rules)
        return None if ok else "has no within_interval rule tying it to its source"
    if req == "can_be_withdrawn":
        start = (lc or {}).get("start")
        return None if any(t.get("from") == start and t.get("to") == "ended" for t in trans) else "cannot be withdrawn"
    if req == "names_who_recognises":
        return None if any(slot_ann(s, "reality") == "recognised_by" for s in own_slots(name)) else "does not name who recognises it"
    if req == "names_who_draws":
        return None if any(slot_ann(s, "reality") == "drawn_by" for s in own_slots(name)) else "does not name who draws it"
    if req == "held_through_coupling":
        ok = any(FORMS and "Coupling" in form_of(slots.get(s, {}).get("range", "")) for s in own_slots(name))
        return None if ok else "is not held through a coupling"
    return f"UNKNOWN requirement id `{req}`"


findings = []
for name in sorted(schema.get("classes") or {}):
    if classes[name].get("mixin") or classes[name].get("abstract"):
        continue
    forms = form_of(name)
    if len(forms) != 1:
        findings.append((name, "-", f"takes {len(forms)} reality forms ({', '.join(forms) or 'none'}); it must take exactly one"))
        continue
    for req in ann(FORMS[forms[0]], "requires"):
        msg = check(req, name)
        if msg:
            findings.append((name, forms[0], f"{req}: {msg}"))

concrete = [n for n in schema.get("classes") or {} if not classes[n].get("mixin") and not classes[n].get("abstract")]
placed = sum(1 for n in concrete if len(form_of(n)) == 1)
total = len(concrete)
print(f"reality check: {placed} of {total} classes placed, {len(findings)} findings")
for name, form, msg in findings:
    print(f"  {name} ({form}): {msg}")
sys.exit(1 if findings and not report_only else 0)
