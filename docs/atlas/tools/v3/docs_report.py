import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..")); import atlas_paths as _P  # noqa: E402
import json,collections,re,os
A=_P.ATLAS;docs=json.load(open(A+"/v3/docs.json"));J=json.load(open(A+"/v3/intents.json"));I=J["intents"];raw=json.load(open(A+"/v3/intents_raw.json"))
can=[d for d in docs if not d["dup_of"]];EX={"vendor-skill","content/marketing","research"}
per=collections.defaultdict(collections.Counter)
for i in I:
    for s in i["sources"]:per[s["doc"]][i["verdict"]]+=1
rawn=collections.Counter(x["doc"] for x in raw)
V=collections.Counter(i["verdict"] for i in I)
L=["# Docs intent sweep (atlas v3)","",
"Read-only sweep. It covers the optional private plan folder (EDLOVE_PLAN), every .md/.mdx/.txt on main, docs that exist only on other branches, and docs deleted in any ref. For deleted docs, the text was taken from the parent of the deleting commit. Dates are Asia/Colombo: front-matter `updated`/`created` when present, otherwise the first commit. The last commit is also recorded, because a mass docs commit on 2026-08-24 touched most files.","",
"## Counts","",f"- Docs read: **{len(docs)}**. By origin: "+", ".join(f"{k} {v}" for k,v in collections.Counter(d['origin'] for d in docs).items()),
f"- After dedupe (exact hash plus MinHash Jaccard ≥ 0.85): **{len(can)} canonical**, {len(docs)-len(can)} duplicates or near-duplicates. Canonical preference: plan > main > branch-only > deleted, then the latest version.",
f"- Canonical docs by kind: "+", ".join(f"{k} {v}" for k,v in collections.Counter(d['kind'] for d in can).items()),
f"- Excluded from intent extraction, but still counted as read: {sum(1 for d in can if d['kind'] in EX)} docs (vendor skills, marketing/edlove-web content, research).",
f"- Raw requirement lines extracted: **{len(raw)}**. By class: "+", ".join(f"{k} {v}" for k,v in J["nonproduct"].items()),
f"- Product intents after near-duplicate merge (token-set ≥ 92): **{len(I)}**. Verdicts: "+", ".join(f"{k} {v}" for k,v in V.items()),
"","### Verdict by role","","| role | MATCHED | NEW→PLANNED | CONTRADICTED | CLAIM-UNVERIFIED | UNCLASSIFIED |","|---|---|---|---|---|---|"]
for r in ["teacher","principal","student","parent","admin","founder","?"]:
    c=collections.Counter(i["verdict"] for i in I if r in i["roles"]);L.append(f"| {r} | {c['MATCHED']} | {c['NEW']} | {c['CONTRADICTED']} | {c['CLAIM-UNVERIFIED']} | {c['UNCLASSIFIED']} |")
L+=["","**Method.** Lines are extracted from checkboxes, task and gap tables, intent-headed lists, user stories, and role-ability sentences. Each line is classified as product, engineering, qa, business or other. Product intents get a domain from a keyword map and are scored by TF-IDF against the capabilities in that domain (a matching role gets a bonus).",
"- **MATCHED:** similarity ≥ 0.22. High confidence at ≥ 0.30.",
"- **CONTRADICTED:** the latest non-superseded claim says done/✅, but the capability is PARTIAL, UI-UNWIRED, BACKEND-ONLY or LOST. Also when a doc claims something is built and no capability matches.",
"- **NEW → PLANNED:** task-like and unmatched.",
"- **UNCLASSIFIED:** not task-like.",
"Manual spot checks are in v3/manual_checks.json. The fuzzy matching is heuristic, so expect noise in the LOW-CONFIDENCE items.",""]
# themes
new=[i for i in I if i["verdict"]=="NEW"]
L+=["## Top themes of unbuilt intent (NEW→PLANNED)","","| theme/area | PLANNED | likely still wanted | example |","|---|---|---|---|"]
th=collections.defaultdict(list)
for i in new:
    for a in (i.get("area") or ["(no domain)"]):th[a].append(i)
for a,l in sorted(th.items(),key=lambda x:-len(x[1]))[:30]:
    ex=max(l,key=lambda i:i["n_sources"]);L.append(f"| {a} | {len(l)} | {sum(1 for i in l if i.get('likely_wanted'))} | {ex['text'][:110].replace('|','/')} ({ex['sources'][-1]['doc'].split('/')[-1]}) |")
# contradictions
con=sorted([i for i in I if i["verdict"]=="CONTRADICTED"],key=lambda i:(i.get("manual_check") is None,-(i.get("sim") or 0),-i["n_sources"]))
L+=["","## Biggest contradictions (docs say done; code disagrees)","","| intent | doc (latest) | date | code says | note |","|---|---|---|---|---|"]
for i in con[:60]:
    s=i["sources"][-1];L.append(f"| {i['text'][:100].replace('|','/')} | {s['doc']}:{s['line']} | {(s['date'] or '')[:10]} | {i.get('cap','no capability')} → {i.get('cap_status','PLANNED')} | {(i.get('manual_check') or '').replace('|','/')} |")
# disagreements
dis=[i for i in I if i["docs_disagree"]]
L+=["",f"## Docs that disagree with each other ({len(dis)} intents)","","Some docs mark these done and others mark them not done. Listed oldest to newest; the newest non-superseded doc wins.","","| intent | claims over time |","|---|---|"]
for i in sorted(dis,key=lambda i:-i["n_sources"])[:50]:
    L.append(f"| {i['text'][:90].replace('|','/')} | "+"; ".join(f"{(s['date'] or '')[:10]} {s['claim']}{' (superseded)' if s['superseded'] else ''} {s['doc'].split('/')[-1]}" for s in i["sources"][:6]).replace('|','/')+" |")
sup=[d for d in can if re.search(r"old_docs|/archive|/old/|_archive|historical|deprecated|superseded|legacy",d["path"]+" "+(d["front"].get("status") or ""),re.I) or d["origin"]=="deleted"]
L+=["",f"## Superseded docs: {len(sup)} canonical docs (archive/old/deleted/historical status)","",
"Intents that come only from superseded docs are kept with `all_superseded: true` and never set `likely_wanted`.",""]
# timeline
L+=["## Intent timeline (first appearance by month)","","| month | new intents | MATCHED | PLANNED | CONTRADICTED |","|---|---|---|---|---|"]
tl=collections.defaultdict(collections.Counter)
for i in I:tl[(i["first_date"] or "?")[:7]][i["verdict"]]+=1
for m in sorted(tl):c=tl[m];L.append(f"| {m} | {sum(c.values())} | {c['MATCHED']} | {c['NEW']} | {c['CONTRADICTED']} |")
# per-doc
L+=["","## Per-doc summary (canonical docs)","","| doc | origin | kind | date | last commit | status | dup group | lines extracted | MATCHED/NEW/CONTRA |","|---|---|---|---|---|---|---|---|---|"]
for d in sorted(can,key=lambda d:d["path"]):
    p=per[d["path"]];dt=d["front"].get("updated") or d["front"].get("created") or (d.get("first") or [0,""])[1]
    L.append(f"| {d['path']} | {d['origin']}{' '+d['deleted'][0] if d.get('deleted') else ''} | {d['kind']} | {(dt or '')[:16]} | {(d.get('last') or [0,''])[1]} | {d['front'].get('status','')} | {d['dup_group']} | {rawn[d['path']]} | {p['MATCHED']}/{p['NEW']}/{p['CONTRADICTED']} |")
open(A+"/DOCS_INTENT.md","w").write("\n".join(L)+"\n")
print(len(L))
