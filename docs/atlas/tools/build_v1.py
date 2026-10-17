import json,yaml,sys
sys.path.insert(0,'analysis');from overrides import O,NEW
v0=yaml.safe_load(open('features.yaml'));old={f['id']:f for f in v0['features']}
A=json.load(open('analysis/auto.json'))['features'];E=json.load(open('analysis/evidence.json'))
D=json.load(open('analysis/dates.json'));C=json.load(open('analysis/concept_dates.json'))
def mn(*c):
    c=[x for x in c if x and x.get('date')];return min(c,key=lambda x:x['date']) if c else None
out=[]
for fid in list(old)+[k for k in A if k not in old]:
    o=old.get(fid,{});a=A.get(fid);e=E.get(fid,{})
    f={'id':fid,'name':o.get('name') or NEW[fid][0],'roles':o.get('roles') or NEW[fid][1],'capability':o.get('capability') or NEW[fid][2]}
    if o.get('name_note'):f['name_note']=o['name_note']
    if a:
        st,why=O[fid]
        ev={'schema':[f"{s['model']} @ {s['at']} (table {s.get('table')})" for s in e.get('schema',[])][:6],
            'api':[f"{p['proc']} @ {p['at']} [{','.join(sorted(set(p.get('transport',[])))) or 'no client'}]" for p in e.get('api',[])][:12],
            'client':[f"{p['proc']} <- {s}" for p in e.get('api',[]) for s in p.get('client_sites',[])[:1]][:8],
            'screen':[r['route'] for r in e.get('routes',[])][:8],
            'nav':[f"{u} <- {', '.join(l[:2])}" for u,l in a.get('nav_evidence',[])][:6],
            'real_data':(a.get('real_data_evidence') or [])[:6],'unserved':(a.get('unserved_data_evidence') or [])[:6],
            'ungated_mock':a.get('ungated_mock_markers') or []}
        f.update(layers=a['layers'],auto_status=a['auto_status'],status=st,status_v0=o.get('status'),evidence=ev,
                 served_procs=a['served_procs'],unserved_procs=a['unserved_procs'],no_client_procs=a['no_client_procs'])
    else:
        st,why='LOST',o.get('hostile','Gone from main.')
        f.update(layers=o.get('layers'),status='LOST',status_v0=o.get('status'),evidence=o.get('evidence'))
    p1=o.get('first_seen');fd=D.get(fid,{}).get('first_seen');cd=C.get(fid)
    f['first_seen']=mn(p1,fd,cd);f['first_seen_candidates']={'pass1':p1,'follow':fd,'concept':cd}
    f['last_touched']=D.get(fid,{}).get('last_touched') or o.get('last_touched');f['current_ref']='main'
    L=f.get('layers') or {}
    gaps=[k for k,v in L.items() if v in ('N','P')]
    f['reviews']={
     'advocate':(o.get('advocate_status') or a and a['auto_status'] or st)+": "+(f"{len(a['served_procs'])} served procs; layers {L}" if a else "historical evidence only"),
     'critic':{'noted':f"status {f['status_v0']} -> {st}" if f['status_v0']!=st else f"status unchanged ({st})",
               'missing':(f"weak layers: {gaps}" if gaps else "none at layer level")+(f"; unserved procs: {a['unserved_procs'][:5]}" if a and a['unserved_procs'] else "")+(f"; procs without client: {a['no_client_procs'][:5]}" if a and a['no_client_procs'] else ""),
               'overemphasized':(f"advocate rated {a['auto_status']} by rules; adjudicated {st}" if a and a['auto_status']!=st else "-")},
     'hostile':why}
    out.append(f)
v0['meta'].update(version='v1',generated='2026-10-16',current_state_basis='main @ 175c036e (2026-10-15 19:19 +0530)',
  method='static import/call-chain trace over 2561 files (analysis/graph.py, trace.py, eval.py, autostatus.py) + manual adjudication (analysis/overrides.py). Not runtime-tested.',
  rules=json.load(open('analysis/auto.json'))['rules'])
yaml.safe_dump({'meta':v0['meta'],'features':out},open('features.yaml','w'),sort_keys=False,allow_unicode=True,width=200)
from collections import Counter
print(len(out),Counter(f['status'] for f in out));print('v0',Counter(f['status'] for f in v0['features']) if False else '')
for f in out:
    if f['status_v0']!=f['status']:print(' delta',f['id'],f['status_v0'],'->',f['status'])
