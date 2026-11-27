"""Check the ontology's examples against gurudevi.yaml.

Valid examples must pass. Each invalid example must be refused by LinkML (caught_by: native)
with the expected message, or, if only a cross-object rule can see it, must still pass LinkML
alone until that rule's check is generated (build steps 3 and 4).

Usage: python -I ontology/scripts/check-examples.py [ontology_dir]
"""

import sys
from pathlib import Path

import yaml
from linkml.validator import validate
from linkml_runtime.utils.schemaview import SchemaView

root = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parents[1])
schema_path = root / "gurudevi.yaml"
examples = root / "examples"
sv = SchemaView(str(schema_path))
rule_ids = {r["id"] for r in sv.schema.annotations["rules"].value}
expected = yaml.safe_load((examples / "expected.yaml").read_text())["invalid"]
failures: list[str] = []


def messages(path: Path, cls: str) -> list[str]:
    out = []
    for obj in yaml.safe_load(path.read_text()):
        report = validate(obj, str(schema_path), target_class=cls)
        out += [r.message for r in report.results]
    return out


for path in sorted((examples / "valid").glob("*.yaml")):
    cls = path.stem
    if cls not in sv.all_classes():
        failures.append(f"valid/{path.name}: no class named {cls}")
        continue
    for m in messages(path, cls):
        failures.append(f"valid/{path.name}: {m}")

seen = set()
for path in sorted((examples / "invalid").glob("*.yaml")):
    name = path.stem
    seen.add(name)
    spec = expected.get(name)
    if spec is None:
        failures.append(f"invalid/{path.name}: not listed in expected.yaml")
        continue
    got = messages(path, spec["class"])
    if spec["caught_by"] == "native":
        if not any(spec["expect"] in m for m in got):
            failures.append(f"invalid/{path.name}: expected LinkML to refuse it with {spec['expect']!r}, got {got or 'no errors'}")
    else:
        if spec["caught_by"] not in rule_ids:
            failures.append(f"invalid/{path.name}: caught_by {spec['caught_by']} is not a rule id in gurudevi.yaml")
        if got:
            failures.append(f"invalid/{path.name}: LinkML alone already refuses it ({got}); caught_by should be native")

for name in sorted(set(expected) - seen):
    failures.append(f"expected.yaml lists {name}, but invalid/{name}.yaml does not exist")

if failures:
    print("ONTOLOGY EXAMPLES FAILED:\n  " + "\n  ".join(failures))
    sys.exit(1)
pending = sorted({s["caught_by"] for s in expected.values() if s["caught_by"] != "native"})
print(f"ok: {len(list((examples / 'valid').glob('*.yaml')))} valid files pass; {len(expected)} invalid examples behave as expected")
print(f"   waiting for generated rule checks: {', '.join(pending)}")
