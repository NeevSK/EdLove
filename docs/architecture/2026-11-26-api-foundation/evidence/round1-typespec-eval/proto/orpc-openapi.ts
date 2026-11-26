import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
const dir = process.argv[2];
const { contract } = await import(`${process.cwd()}/${dir}/contract.ts`);
const doc = await new OpenAPIGenerator({ converters: [new ZodToJsonSchemaConverter()] }).generate(contract, { version: "3.1.0", base: { info: { title: "orpc", version: "1" } } });
await Bun.write(`${dir}.openapi.json`, JSON.stringify(doc, null, 1));
console.log(Object.keys(doc.paths ?? {}).length, "paths");
