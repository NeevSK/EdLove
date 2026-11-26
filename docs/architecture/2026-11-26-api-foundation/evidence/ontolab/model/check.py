import sys
from pyshacl import validate
from rdflib import Graph
sh=Graph()
for f in sys.argv[2:]: sh.parse(f)
d=Graph(); d.parse(sys.argv[1])
ok,g,txt=validate(d,shacl_graph=sh,advanced=True,allow_warnings=True)
print("conforms",ok)
q="""PREFIX sh:<http://www.w3.org/ns/shacl#> SELECT DISTINCT ?f ?p ?m WHERE {?r sh:focusNode ?f . OPTIONAL{?r sh:resultMessage ?m} OPTIONAL{?r sh:resultPath ?p}} ORDER BY ?f"""
for f,p,m in g.query(q): print(" ", f.split('/')[-1], '|', p.split('/')[-1] if p else '-', '|', m)
