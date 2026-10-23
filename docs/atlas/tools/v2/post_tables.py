import os as _os, sys as _sys; _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..")); import atlas_paths as _P  # noqa: E402
import json,re,subprocess,collections
d=json.load(open('v2/capabilities.json'));o=[t for t,v in d['coverage']['migration_tables'].items() if v=='ORPHAN']
txt=subprocess.run("git ls-files 'apps/sanctuary-api/*.ts' 'apps/gurudevi-mobile/supabase/functions/*' | xargs cat",shell=True,cwd=_P.REPO,capture_output=True,text=True).stdout
for t in o:
    if re.search(r"\b%s\b"%t,txt): d['coverage']['migration_tables'][t]="server/edge-ref-only"
json.dump(d,open('v2/capabilities.json','w'),indent=1);print(collections.Counter(d['coverage']['migration_tables'].values()))
