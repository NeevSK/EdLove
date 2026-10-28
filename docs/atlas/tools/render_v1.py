import yaml
d=yaml.safe_load(open('features.yaml'));F=d['features'];m=d['meta']
R=['teacher','principal','student','parent','admin','founder']
def fd(x):return f"{x['sha']} {x['date']}" if x else '?'
L=["# EdLove Feature Atlas v1","",f"Generated from features.yaml (source of truth) by analysis/render_v1.py. Basis: {m['current_state_basis']}. Times are Asia/Colombo.","",
f"> Method: {m['method']}","> Caveat: unpushed laptop work isn't visible. Statuses are static-analysis verdicts and need runtime confirmation.","",
"## Counts"]
from collections import Counter
c=Counter(f['status'] for f in F);L+=[f"- {k}: {v}" for k,v in sorted(c.items())]+["",
"## Systemic finding","Commit e383ef01 (2026-07-30 08:03, \"chore: normalize workspace import aliases\") removed 52 REST `registerRoute` mounts. Since then, 92 legacy Hono `hc` call sites (`(client.api as any).<x>.$get/$post`) hit paths that sanctuary-api no longer serves. Only typed oRPC procedure URLs (/api/<router>/<proc>, 139 sites) and GET-only /api/openapi/* are served (apps/sanctuary-api/src/core/app.ts ~L949–985; test __tests__/self.orpc.test.ts:296).","",
"## Features","","| id | name | roles | schema | api | client | screen | nav | data | status (v0→v1) | first seen | last touched |","|---|---|---|---|---|---|---|---|---|---|---|---|"]
for f in F:
    l=f.get('layers') or {}
    g=lambda k:str(l.get(k,'-'))
    L.append(f"| {f['id']} | {f['name']} | {', '.join(f['roles'])} | {g('schema')} | {g('api')} | {g('client')} | {g('screen')} | {g('nav')} | {g('real_data')} | {f.get('status_v0') or 'new'}→**{f['status']}** | {fd(f.get('first_seen'))} | {fd(f.get('last_touched'))} |")
L+=["","## Evidence"]
for f in F:
    L+=["",f"### {f['id']} — {f['status']}",f"- Hostile verdict: {f['reviews']['hostile']}"]
    if f.get('name_note'):L.append(f"- Name note: {f['name_note']}")
    ev=f.get('evidence') or {}
    if isinstance(ev,dict) and 'api' in ev and isinstance(ev['api'],list):
        for k in ('schema','api','client','screen','nav','real_data','unserved','ungated_mock'):
            if ev.get(k):L.append(f"- {k}: "+"; ".join(map(str,ev[k])))
open('FEATURE_ATLAS.md','w').write("\n".join(L)+"\n")
# reviews
Rv=["# Reviews v1 (advocate → critic → hostile)","","These are per-feature verdicts. The same text is stored under `reviews:` in features.yaml. The critic's lines are generated from the layer gaps; the hostile verdicts were adjudicated by hand.",""]
for f in F:
    r=f['reviews'];Rv+=[f"## {f['id']}",f"- **Advocate:** {r['advocate']}",f"- **Critic — noted:** {r['critic']['noted']}",f"- **Critic — missing:** {r['critic']['missing']}",f"- **Critic — overemphasized:** {r['critic']['overemphasized']}",f"- **Hostile:** {r['hostile']}",""]
open('REVIEWS.md','w').write("\n".join(Rv))
# matrix
M=["# Role × capability (v1)","","**LIVE** = what a role can actually do today. Parent rows assume the user picked the `guardian` capacity. Role entry follows routeResolution.ts: `parent` and `admin` land on classroom-list, and only the `guardian` capacity opens the guardian workspace.","","| role | LIVE | PARTIAL | not usable (UI-UNWIRED/BACKEND-ONLY) |","|---|---|---|---|"]
for r in R:
    s=lambda st:", ".join(f['id'] for f in F if r in f['roles'] and f['status'] in st)
    M.append(f"| {r} | {s(['LIVE'])} | {s(['PARTIAL'])} | {s(['UI-UNWIRED','BACKEND-ONLY'])} |")
open('ROLE_MATRIX.md','w').write("\n".join(M)+"\n")
print(c)
