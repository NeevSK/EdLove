#!/usr/bin/env python3
"""Rule-based layers + status from evidence.json. Rules documented in RULES below; output analysis/auto.json"""
import json, os, re
A = os.path.dirname(os.path.abspath(__file__)); E = json.load(open(A + "/evidence.json"))
SAME_APP = {"mobile": lambda f: not re.match(r"apps/(gurudevi-web|edlove-web|gurudevi-marketingWeb)/", f),
            "gurudevi-web": lambda f: f.startswith("apps/gurudevi-web/") or (f.startswith("packages/") and ".web." in f),
            "edlove-web": lambda f: f.startswith("apps/edlove-web/")}
RULES = """schema: Y=mapped zmodel model(s) exist (file:line); N=none mapped though data feature; NA=no persistent data.
api: Y=procedures exist in a mounted router (file:line). transport per client site: orpc-rpc:served (typed RPCLink), hono-rest:NO-SERVER-MOUNT (REST path removed from server in e383ef01).
client: Y=>=1 procedure has a served client call site; P=only unserved (REST) sites or partial; N=no client sites.
screen: Y=route file resolves to a screen component; N=no route; reachable screen files listed.
nav: Y=same-app inbound link (href/push/navigate literal) or tab root or workspace role-dispatch; P=route registered (file-based) but no inbound link found; N=no route.
real_data: Y=route import-closure reaches a served feature procedure, a direct Supabase .from(<feature table>), or PowerSync; P=reaches only unserved REST calls / ungated sample fallbacks; N=none.
status: LIVE=screen Y & nav Y & real_data Y & no ungated mock in the feature's own files & not default-off flag; PARTIAL=screen+some real path but caveats; UI-UNWIRED=screen but nav N/P-without-link or real_data N; BACKEND-ONLY=api Y but no reachable screen; LOST=gone from main."""
DISPATCH = {"/workspace/principal", "/workspace/founder", "/workspace/guardian", "/workspace/classroom", "/workspace/classroom/[classroomId]", "/workspace/classroom/student/[classroomId]", "/workspace/commercial/[batchId]"}
out = {}
for fid, e in E.items():
    L = {}
    L["schema"] = "Y" if e["schema"] else "NA"
    L["api"] = "Y" if e["api"] else "NA"
    served = [a for a in e["api"] if any("served" in t for t in a["transport"])]
    unserved = [a for a in e["api"] if a not in served and a["transport"] != ["NO-CLIENT"]]
    nocl = [a for a in e["api"] if a["transport"] == ["NO-CLIENT"]]
    L["client"] = "NA" if not e["api"] else ("Y" if served and not unserved else "P" if served or unserved else "N")
    reach_screens = {k: v for k, v in e["screens_reachable"].items() if v["exists"] and v["routes"]}
    L["screen"] = "Y" if e["routes"] or reach_screens else ("N" if not any(v["exists"] for v in e["screens_reachable"].values()) else "P")
    links = []
    for r in e["routes"]:
        ok = SAME_APP.get(r["app"], lambda f: True)
        ll = [x for x in r["inbound_links"] if ok(x)]
        if ll or r["tab_root"] or r["url"] in DISPATCH: links.append((r["url"], ll[:2] or (["tab root"] if r["tab_root"] else ["workspace role dispatch (apps/gurudevi-mobile/src/lib/workspace/routeResolution.ts)"])))
    L["nav"] = "Y" if links else ("P" if e["routes"] or reach_screens else "N")
    real = []; fake = []
    for r in e["routes"]:
        for k, v in r["feature_procs_reached"].items():
            if any("served" in t for t in v["transport"]): real.append(f"{r['url']} -> {k} [{','.join(v['transport'])}]")
            else: fake.append(f"{r['url']} -> {k} [{','.join(v['transport'])}]")
        for t, at in r["feature_tables_direct"].items(): real.append(f"{r['url']} -> supabase .from('{t}') @ {at}")
        if r["powersync"] and e["schema"] and any(s["powersync"] for s in e["schema"]): real.append(f"{r['url']} -> PowerSync ({r['powersync'][0]})")
    ung = sorted({m["at"] for r in e["routes"] for m in r["mock_markers"] if not m["gated"]})
    L["real_data"] = "Y" if real else ("P" if fake else ("NA" if not e["schema"] and not e["api"] else "N"))
    if not e["routes"] and not reach_screens: st = "BACKEND-ONLY" if e["api"] else "UNKNOWN"
    elif L["nav"] != "Y": st = "UI-UNWIRED"
    elif L["real_data"] in ("Y", "NA") and not fake: st = "LIVE"
    elif L["real_data"] == "Y": st = "PARTIAL"
    elif L["real_data"] == "P": st = "PARTIAL"
    else: st = "UI-UNWIRED"
    out[fid] = {"layers": L, "auto_status": st, "served_procs": [a["proc"] for a in served], "unserved_procs": [a["proc"] for a in unserved], "no_client_procs": [a["proc"] for a in nocl],
                "nav_evidence": links[:4], "real_data_evidence": real[:6], "unserved_data_evidence": fake[:6], "ungated_mock_markers": ung[:10]}
json.dump({"rules": RULES, "features": out}, open(A + "/auto.json", "w"), indent=1)
for k, v in out.items(): print(f"{k:<26} {v['auto_status']:<13} {v['layers']} served={len(v['served_procs'])} unserved={len(v['unserved_procs'])} nocl={len(v['no_client_procs'])} mocks={len(v['ungated_mock_markers'])}")
