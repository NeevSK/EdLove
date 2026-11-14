import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..")); import atlas_paths as _P  # noqa: E402
"""v4 report: AUTH_ONBOARDING.md, a v4 section appended to DOCS_INTENT.md, and v4/summary.json (deltas vs the v3 snapshot)."""
import json,yaml,collections
A=_P.ATLAS
AD=yaml.safe_load(open(A+"/v5/auth_domain.yaml"));V=json.load(open(A+"/v4/verification.json"))
K=json.load(open(A+"/v2/capabilities.json"))["capabilities"];now={c["id"]:c for c in K}
old={c["id"]:c for c in yaml.safe_load(open(A+"/v3/capabilities.v3.yaml"))["capabilities"]}
def g(a,*ks):
    out=[]
    for k in ks:
        v=a.get(k)
        if isinstance(v,dict):out+= [f"{kk}: {vv}" for kk,vv in v.items()]
        elif isinstance(v,list):out+=[str(x) for x in v]
        elif v:out.append(str(v))
    return "<br>".join(out).replace("|","\\|")
L=["# Auth & onboarding: hand-verified (v5, terrain/version-hops @ 50fb1b9e)","","Static, read-only trace (grep + import chain). Nothing was executed. Since e383ef01, Hono REST `(client.api as any)…$post` sites have no server mount, so they count as dead.","",
"| id | task | status | mobile | web | api / data / calls | caveats / blockers |","|---|---|---|---|---|---|---|"]
for a in AD:
    L.append(f"| {a['id']} | {a['task']} | **{a['status']}** | {g(a,'mobile')} | {g(a,'web','web_only')} | {g(a,'api','call','ui','data','route','evidence')} | {g(a,'caveat','caveats','blocker','status_note','note')} |")
open(A+"/AUTH_ONBOARDING.md","w").write("\n".join(L)+"\n")
lt=collections.Counter();ch=[]
for i,o in old.items():
    if o.get("source")=="doc":continue
    n=now.get(i)
    s=n["status"] if n else "REMOVED"
    if o["status"]=="LIVE":lt["LIVE->"+s]+=1
    if n and o["status"]!=s:ch.append((i,o["status"],s,n["why"][:160]))
st=collections.Counter(c["status"] for c in K)
low=sum(1 for c in K if c.get("confidence")=="low" or (c.get("verification") or {}).get("confidence")=="low")
lowp=sum(1 for c in K if c["status"]=="PLANNED" and c.get("confidence")=="low")
S={"status_totals":dict(st),"total":len(K),"planned_reclass":V["counts"]["planned_reclass"],"live_transitions":dict(lt),"status_changes_non_doc":len(ch),
   "contradicted_refs":V["counts"]["contradicted"],"low_confidence":low,"low_confidence_planned":lowp,"non_capabilities":sum(1 for r in V["planned"] if r["to"]=="NON-CAPABILITY"),"changes":ch}
json.dump(S,open(A+"/v4/summary.json","w"),indent=1)
D=open(A+"/DOCS_INTENT.md").read().split("\n## v4 verification")[0]
pl=V["planned"];ex=lambda k,n:[r for r in pl if r["to"].startswith(k)][:n]
D+="\n## v4 verification (evidence-first; supersedes v3 PLANNED verdicts)\n\n"
D+="Each of the 1067 v3 PLANNED intents was re-checked by code search: identifiers, routes, i18n keys and joined phrases, on main (3165 files), on the 19 branches, and in deleted history. Hits are mapped to capabilities by file. Text similarity is not used. Every record is in v4/verification.json as {method, terms, hits, verdict, confidence}.\n\n"
D+="| v3 PLANNED → | count |\n|---|---|\n"+"".join(f"| {k} | {v} |\n" for k,v in sorted(V["counts"]["planned_reclass"].items(),key=lambda x:-x[1]))
D+=f"\nDoc CONTRADICTED refs re-checked against the hostile statuses: {dict(V['counts']['contradicted'])}. The {V['counts']['planned_contradicted_rechecked']} PLANNED items that came from CONTRADICTED intents are included in the table above.\n\n### Examples\n"
for k in ("MERGED","PARTIAL","UI-UNWIRED","LOST","NON-CAPABILITY","PLANNED"):
    for r in ex(k,4):D+=f"- **{r['to']}** ({r['verification']['confidence']}): {r['task'][:110]} (evidence: {', '.join(list(r['verification']['hits'])[:3]) or r['verification'].get('negative') or r['verification'].get('reason','auth keyword route')})\n"
open(A+"/DOCS_INTENT.md","w").write(D)
print(json.dumps({k:v for k,v in S.items() if k!="changes"},indent=0))
