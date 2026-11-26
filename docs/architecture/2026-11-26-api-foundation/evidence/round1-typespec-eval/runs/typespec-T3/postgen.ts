// One-time pipeline glue (not edited per operation). Carries what Hey API's beta oRPC plugin drops:
// declared errors (.errors) and the Cedar action (x-cedar-action → meta), and makes objects strict.
import { readFileSync, writeFileSync } from 'node:fs';
const spec = JSON.parse(readFileSync('out/openapi.json', 'utf8'));
const ops = new Map<string, { errors: Record<string, number>; action?: string }>();
for (const item of Object.values<any>(spec.paths)) for (const op of Object.values<any>(item)) {
  if (!op?.operationId) continue;
  const errors: Record<string, number> = {};
  for (const [status, res] of Object.entries<any>(op.responses ?? {})) {
    if (Number(status) < 400) continue;
    const schema = res.content?.['application/json']?.schema;
    const resolved = schema?.$ref ? spec.components.schemas[schema.$ref.split('/').pop()] : schema;
    const code = resolved?.properties?.code?.enum?.[0];
    if (code) errors[code] = Number(status);
  }
  ops.set(op.operationId, { errors, action: op['x-cedar-action'] });
}
let orpc = readFileSync('gen/orpc.gen.ts', 'utf8');
orpc = orpc.replace(/oc\.meta\(openapi\(\{([\s\S]*?)operationId: '([^']+)'([\s\S]*?)\}\)\)/g, (_m, a, id, b) => {
  const o = ops.get(id);
  if (!o) throw new Error(`postgen: no operation ${id}`);
  // oRPC v2 error maps carry no status: it follows from the code (COMMON_ERROR_STATUS_MAP).
  const errs = Object.keys(o.errors).map((c) => `${c}: {}`).join(', ');
  const cedarMeta = o.action ? `.meta(cedar('${o.action}'))` : '';
  return `oc.errors({ ${errs} })${cedarMeta}.meta(openapi({${a}operationId: '${id}'${b}}))`;
});
orpc = orpc.replace("import { openapi } from '@orpc/openapi';", "import { openapi } from '@orpc/openapi';\nimport { cedar } from '../../../shared/cedar';");
writeFileSync('gen/orpc.gen.ts', orpc);
// Bodies reject unknown fields like the v1 contract; header objects must stay loose.
const zod = readFileSync('gen/zod.gen.ts', 'utf8').replace(/^(export const (\w+) = )([\s\S]*?)(?=^export const |(?![\s\S]))/gm, (_m, head, name, rest) =>
  head + (name.endsWith('Headers') ? rest : rest.replaceAll('z.object(', 'z.strictObject(')));
writeFileSync('gen/zod.gen.ts', zod);
for (const [id, o] of ops) if (!o.action) { console.error(`postgen: ${id} has no x-cedar-action`); process.exit(1); }
