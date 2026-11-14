#!/usr/bin/env python3
import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)))); import atlas_paths as _P  # noqa: E402
"""True first-seen per feature: earliest commit on main in `git log --follow -M` of each anchor file (follows renames incl. the 2026-02-19 move into packages/). Writes analysis/dates.json"""
import json, os, subprocess, concurrent.futures as cf
R = _P.REPO; A = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(A + "/evidence.json")); env = {**os.environ, "TZ": "Asia/Colombo"}
def follow(path):
    out = subprocess.run(["git", "-C", R, "log", "origin/main", "--follow", "-M50%", "--name-status", "--format=@%h %ad", "--date=format-local:%Y-%m-%d %H:%M", "--", path], capture_output=True, text=True, env=env).stdout
    commits = []; cur = None
    for line in out.splitlines():
        if line.startswith("@"): cur = line[1:].split(" ", 1); commits.append({"sha": cur[0], "date": cur[1], "paths": []})
        elif line.strip() and commits: commits[-1]["paths"].append(line.split("\t")[-1])
    if not commits: return None
    first = commits[-1]; last = commits[0]
    renamed_from = sorted({p for c in commits for p in c["paths"] if p != path})[:4]
    return {"first": {"sha": first["sha"], "date": first["date"], "as": first["paths"][-1] if first["paths"] else path}, "last": {"sha": last["sha"], "date": last["date"]}, "renamed_from": renamed_from}
anchors = {}
for fid, e in E.items():
    fs = [r["route"] for r in e["routes"]] + sorted({a["at"].rsplit(":", 1)[0] for a in e["api"]}) + [k for k, v in e["screens_reachable"].items() if v["exists"]]
    anchors[fid] = sorted(set(fs))[:12]
uniq = sorted({f for v in anchors.values() for f in v})
with cf.ThreadPoolExecutor(8) as ex: res = dict(zip(uniq, ex.map(follow, uniq)))
out = {}
for fid, fs in anchors.items():
    rs = [(f, res[f]) for f in fs if res.get(f)]
    if not rs: continue
    f0, r0 = min(rs, key=lambda x: x[1]["first"]["date"]); f1, r1 = max(rs, key=lambda x: x[1]["last"]["date"])
    out[fid] = {"first_seen": {**r0["first"], "anchor": f0}, "last_touched": {**r1["last"], "anchor": f1}, "renames": {f: r["renamed_from"] for f, r in rs if r["renamed_from"]}}
json.dump(out, open(A + "/dates.json", "w"), indent=1); print(len(uniq), "anchors;", len(out), "features dated")
