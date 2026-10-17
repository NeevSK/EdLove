import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..")); import atlas_paths as _P  # noqa: E402
"""v5: rebase features.yaml current_ref onto terrain/version-hops @ 50fb1b9e (0 behind main, so it holds the newest evidence for every feature)."""
import yaml,json,collections
A=_P.ATLAS;F=yaml.safe_load(open(A+"/features.yaml"))
K=json.load(open(A+"/v2/capabilities.json"))["capabilities"];t=collections.Counter(c["feature"] for c in K if c.get("touched_v5"))
F.setdefault("meta",{}).update(current_state_basis="terrain/version-hops @ 50fb1b9e (2026-10-17 11:39 +0530; 9 ahead / 0 behind main 175c036e)",current_ref="terrain/version-hops")
fs=F["features"] if isinstance(F.get("features"),list) else []
for f in fs:
    f["current_ref"]="terrain/version-hops@50fb1b9e";f["changed_on_branch"]=bool(t.get(f["id"]));f["branch_touched_capabilities"]=t.get(f["id"],0)
yaml.safe_dump(F,open(A+"/features.yaml","w"),sort_keys=False,allow_unicode=True,width=200)
print(len(fs),sum(1 for f in fs if f["changed_on_branch"]))
