import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..")); import atlas_paths as _P  # noqa: E402
"""Merge doc intents into v2/capabilities.json: PLANNED caps (source: doc) + doc_refs on matched caps."""
import json,os,collections
A=_P.ATLAS;P=A+"/v2/capabilities.json";d=json.load(open(P))
d["capabilities"]=[c for c in d["capabilities"] if c.get("source")!="doc"]
I=json.load(open(A+"/v3/intents.json"))["intents"];byid={c["id"]:c for c in d["capabilities"]}
for c in d["capabilities"]:c.pop("doc_refs",None)
for i in I:
    if i["verdict"] in("MATCHED","CONTRADICTED","CLAIM-UNVERIFIED") and i.get("cap") in byid:
        c=byid[i["cap"]];c.setdefault("doc_refs",[]).append({"intent":i["iid"],"verdict":i["verdict"],"sim":i.get("sim"),"src":f"{i['sources'][-1]['doc']}:{i['sources'][-1]['line']}","claim":i["latest_claim"],"note":i.get("manual_check")})
        if i["verdict"]=="CONTRADICTED":c["doc_contradiction"]=True
    if i["verdict"]=="NEW" or (i["verdict"]=="CONTRADICTED" and "cap" not in i and "feature" not in i):
        s=i["sources"][-1]
        d["capabilities"].append({"id":f"planned:{i['iid']}","kind":"doc-intent","source":"doc","feature":(i.get("area") or ["?"])[0],
          "task":i["text"][:200],"roles":[r for r in i["roles"] if r!="?"],
          "provenance":{"sources":i["sources"][:6],"n_sources":i["n_sources"],"first_date":i["first_date"],"last_date":i["last_date"],"priority":i["priority"],"all_superseded":i["all_superseded"],"docs_disagree":i["docs_disagree"]},
          "layers":{"schema":"NA","api":"NA","client":{"valid":[],"dead":[]},"routes":{}},
          "ui":{"kind":"planned","needed":["screen"],"existing":[],"missing":["screen"],"paths":[]},
          "status":"PLANNED","doc_contradiction":i["verdict"]=="CONTRADICTED","confidence":i.get("confidence","low"),"likely_wanted":bool(i.get("likely_wanted")),
          "why":(i.get("contradiction") or "intended in docs; no matching capability in code")+f" (best candidate: {i['best'][0][0]} sim {i['best'][0][1]})" if i["best"] else (i.get("contradiction") or "intended in docs; no matching capability in code")})
json.dump(d,open(P,"w"),indent=1)
print(collections.Counter(c["status"] for c in d["capabilities"] if c.get("source")=="doc"),sum(1 for c in d["capabilities"] if c.get("doc_refs")))
