import fs from 'node:fs'; import * as yaml from 'js-yaml';
import { createMachine } from 'xstate'; import { getShortestPaths, getSimplePaths } from '@xstate/graph';
const schema = yaml.load(fs.readFileSync(process.argv[2], 'utf8'));
for (const [cls, def] of Object.entries(schema.classes)) {
  const lc = def.annotations?.lifecycle; if (!lc) continue;
  const L = yaml.load(typeof lc === 'string' ? lc : lc.value);
  const states = {};
  for (const t of L.transitions) { (states[t.from] ??= { on: {} }).on[t.by.toUpperCase()] = { target: t.to, meta: { who: t.who } }; states[t.to] ??= { on: {} }; }
  for (const s of Object.keys(states)) if (!Object.keys(states[s].on).length) states[s].type = 'final';
  const machine = createMachine({ id: cls, initial: L.start, states });
  fs.writeFileSync(`../out/${cls}.machine.json`, JSON.stringify(machine.config, null, 1));
  const sp = getShortestPaths(machine); const simple = getSimplePaths(machine);
  console.log(`${cls}: ${Object.keys(states).length} states, ${L.transitions.length} transitions, final: ${Object.keys(states).filter(s=>states[s].type).join(',')}`);
  console.log(`  shortest-path tests: ${sp.length}, simple-path tests: ${simple.length}`);
  for (const p of sp) console.log('   ', p.steps.map(s => s.event.type).join(' > ') || '(start)', '=>', JSON.stringify(p.state.value));
}
