import { createFileRegistry, fromBinary, toBinary, fromJson, toJson, create } from "@bufbuild/protobuf";
import { FileDescriptorSetSchema } from "@bufbuild/protobuf/wkt";
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
const reg = createFileRegistry(fromBinary(FileDescriptorSetSchema, readFileSync(import.meta.dir + "/v1.binpb")));
const Req = reg.getMessage("gurudevi.lms.v1.MarkAttendanceRequest")!;
const Res = reg.getMessage("gurudevi.lms.v1.MarkAttendanceResponse")!;
const show = (label: string, v: unknown) => console.log(label.padEnd(44), JSON.stringify(v));

console.log("--- semantics: REST JSON in, proto JSON out ---");
const rest1 = { sessionId: "sess1", marks: [{ studentId: "st1", present: false }, { studentId: "st2", present: true, note: "" }] };
show("REST input (note omitted / empty string)", rest1);
show("proto JSON round trip", toJson(Req, fromJson(Req, rest1)));
const rest2 = { sessionId: "sess1", marks: [] };
show("REST input (empty marks)", rest2);
show("proto JSON round trip", toJson(Req, fromJson(Req, rest2)));
show("proto JSON with alwaysEmitImplicit", toJson(Req, fromJson(Req, rest2), { alwaysEmitImplicit: true }));
const res = { presentCount: 0, absentCount: 0, fee: "0.3000" };
show("REST output (zero counts)", res);
show("proto JSON round trip", toJson(Res, fromJson(Res, res)));
try { fromJson(Req, { sessionId: "s", marks: [{ studentId: "a", present: true, note: null }] }); show("note: null accepted ->", toJson(Req, fromJson(Req, { sessionId: "s", marks: [{ studentId: "a", present: true, note: null }] }))); } catch (e) { show("note: null", String(e)); }
try { fromJson(Req, { sessionId: "s", marks: [], extra: 1 }); show("unknown field", "accepted"); } catch (e) { show("unknown field", String(e).slice(0, 80)); }
try { fromJson(Res, { presentCount: "3", absentCount: 1.0, fee: "1" }); show("int as string \"3\"", "accepted (proto JSON allows it)"); } catch (e) { show("int as string", String(e).slice(0, 80)); }

console.log("\n--- payload (synthetic roster, secondary) ---");
for (const n of [40, 400, 4000]) {
  const msg = { sessionId: "sess_2026_11_26_grade7b_period3", marks: Array.from({ length: n }, (_, i) => ({ studentId: `st_${String(100000 + i)}`, present: i % 9 !== 0, ...(i % 9 === 0 ? { note: "sick" } : {}) })) };
  const json = Buffer.from(JSON.stringify(msg)); const bin = toBinary(Req, fromJson(Req, msg));
  console.log(`${String(n).padStart(5)} marks  JSON ${json.length} B, JSON+gzip ${gzipSync(json).length} B, proto ${bin.length} B, proto+gzip ${gzipSync(bin).length} B`);
}
