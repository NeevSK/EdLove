"""Gurudevi ontology -> storage (zmodel), authorization (Cedar), API (TypeSpec), lifecycle guards (TS), diagrams.
Fails loudly when the ontogeny is inconsistent."""
import sys, yaml
from linkml_runtime.utils.schemaview import SchemaView
sv = SchemaView(sys.argv[1]); out = sys.argv[2]
errors = []
ZM = {'string': 'String', 'uriorcurie': 'String', 'date': 'DateTime @db.Date', 'datetime': 'DateTime @db.Timestamptz', 'decimal': 'Decimal', 'integer': 'Int', 'boolean': 'Boolean'}
TS = {'string': 'string', 'uriorcurie': 'Id', 'date': 'plainDate', 'datetime': 'offsetDateTime', 'decimal': 'Decimal', 'integer': 'int32', 'boolean': 'boolean'}
def camel(s): p = s.split('_'); return p[0] + ''.join(x.title() for x in p[1:])
def ann(c, k):
    a = (c.annotations or {}).get(k); return a.value if a else None
zm, ced, tsp, guards, mer = [], ['namespace Gurudevi {'], ['import "../lib/gurudevi.tsp";', 'using Gurudevi;', 'namespace Ontology;', ''], ['// Generated lifecycle guards. A transition not listed here cannot happen.', 'export const lifecycles = {'], []
for name, e in sv.all_enums().items():
    vals = list(e.permissible_values)
    zm.append(f'enum {name} {{ ' + ' '.join(vals) + ' }')
    tsp.append(f'enum {name} {{ ' + ', '.join(vals) + ' }')
for name in sv.all_classes():
    c = sv.get_class(name)
    if c.abstract: ced.append(f'  entity {name};'); continue
    slots = sv.class_induced_slots(name)
    fields, tfields = [], []
    for s in slots:
        r = s.range or 'string'; opt = '' if (s.required or s.identifier) else '?'
        if r in sv.all_classes():
            fields.append(f'  {s.name}_id String{opt}'); tfields.append(f'  {camel(s.name)}Id{opt}: Id;')
        else:
            zt = r if r in sv.all_enums() else ZM.get(r, 'String')
            base, _, attrs = zt.partition(' ')
            fields.append(f'  {s.name} {base}{opt}' + (f' {attrs}' if attrs else '') + (' @id @default(uuid())' if s.identifier else ''))
            tfields.append(f'  {camel(s.name)}{opt}: {r if r in sv.all_enums() else TS.get(r, "string")};')
    owner = ann(c, 'owner') or 'unknown'
    zm.append(f'/// owner: {owner}\nmodel {name} {{\n' + '\n'.join(fields) + '\n}')
    tsp.append(f'/** {c.description or ""} Owner: {owner}. */\nmodel {name} {{\n' + '\n'.join(tfields) + '\n}')
    parents = [p for p in [c.is_a] if p]
    ced.append(f'  entity {name}' + (f' in [{", ".join(parents)}]' if parents else '') + ';')
    life = ann(c, 'lifecycle')
    if life:
        L = yaml.safe_load(life)
        if not isinstance(L, dict): errors.append(f'{name}: lifecycle {L} is named but not written yet'); continue
        st = L['state']
        slot = next((s for s in slots if s.name == st), None)
        if not slot or slot.range not in sv.all_enums(): errors.append(f'{name}: lifecycle state slot {st} must be an enum'); continue
        states = set(sv.get_enum(slot.range).permissible_values)
        reach = {L['start']}; changed = True
        for t in L['transitions']:
            for k in ('from', 'to'):
                if t[k] not in states: errors.append(f'{name}: transition {t["by"]} uses unknown state {t[k]}')
        while changed:
            changed = False
            for t in L['transitions']:
                if t['from'] in reach and t['to'] not in reach: reach.add(t['to']); changed = True
        for s in sorted(states - reach): errors.append(f'{name}: state {s} can never be reached')
        guards.append(f'  {name}: {{ field: "{st}", start: "{L["start"]}", transitions: [' + ', '.join(f'{{ by: "{t["by"]}", from: "{t["from"]}", to: "{t["to"]}", who: {t["who"]} }}' for t in L['transitions']) + '] },')
        mer.append(f'%% {name}\nstateDiagram-v2\n  [*] --> {L["start"]}\n' + '\n'.join(f'  {t["from"]} --> {t["to"]}: {t["by"]} ({", ".join(t["who"])})' for t in L['transitions']))
        for t in L['transitions']:
            who = [w for w in t['who'] if w not in ('person', 'system')]
            on = L.get('within'); onr = next((x.range for x in slots if x.name == on), None) if on else None
            if who and not onr: errors.append(f'{name}: transition {t["by"]} names capacities but the lifecycle has no `within:` entity'); continue
            dec = f'@requiresBond("{(onr or "").upper()}", #[{", ".join(chr(34)+w+chr(34) for w in who)}])' if who else ('@system' if t['who'] == ['system'] else '@ownerOnly')
            tsp.append(f'/** {name}: {t["from"]} -> {t["to"]}. Generated from its lifecycle; the area decides inputs and errors. */\n@command {dec}\nop {camel(name[0].lower()+name[1:])}_{t["by"]}(id: Id): {name} | NotFound | Problem<"INVALID_TRANSITION">;')
ced.append('}'); guards.append('} as const;')
if errors: print('ONTOLOGY ERRORS:\n  ' + '\n  '.join(errors)); sys.exit(1)
for f, body in [('schema.zmodel', zm), ('ontology.cedarschema', ced), ('ontology.tsp', tsp), ('lifecycles.ts', guards), ('lifecycles.mmd', mer)]:
    open(f'{out}/{f}', 'w').write('\n'.join(body) + '\n')
print('ok:', ', '.join(f'{f}' for f in ['schema.zmodel', 'ontology.cedarschema', 'ontology.tsp', 'lifecycles.ts', 'lifecycles.mmd']))
