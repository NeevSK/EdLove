// Usage: bun tests/harness.ts <approach-dir> <task|baseline>   → prints JSON {passed, failed, failures[]}
import { resolve } from 'node:path';
import { reset } from '../shared/domain';
const [dir, task] = process.argv.slice(2);
const app = await import(resolve(dir, 'app.ts'));
type Res = { status: number; body: any };
export async function post(path: string, body: unknown, headers: Record<string, string> = {}): Promise<Res> {
  const res: Response = await app.handle(new Request(`http://test${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
  }));
  const text = await res.text();
  let parsed: any = text;
  try { parsed = JSON.parse(text); } catch {}
  return { status: res.status, body: parsed };
}
const cases: Array<[string, () => Promise<void>]> = [];
const t = (name: string, fn: () => Promise<void>) => cases.push([name, fn]);
const eq = (a: unknown, b: unknown, what: string) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
};
const code = (r: Res) => r.body?.code;
const action = (op: string) => app.cedarActionOf(op);

if (task === 'baseline') {
  t('grade: omitted feedback keeps', async () => { const r = await post('/lms/submissions/grade', { submissionId: 's1', score: '8.25' }); eq(r.status, 200, 'status'); eq(r.body.feedback, 'good', 'feedback'); });
  t('grade: null clears', async () => { const r = await post('/lms/submissions/grade', { submissionId: 's1', score: '8.25', feedback: null }); eq(r.body.feedback, null, 'feedback'); });
  t('grade: unknown submission 404', async () => { const r = await post('/lms/submissions/grade', { submissionId: 'nope', score: '1' }); eq([r.status, code(r)], [404, 'NOT_FOUND'], 'error'); });
  t('grade: decimal as number rejected', async () => { const r = await post('/lms/submissions/grade', { submissionId: 's1', score: 8.25 }); eq(r.status, 400, 'status'); });
  t('list: empty list is []', async () => { const r = await post('/lms/assignments/list', { classroomId: 'c1' }); eq(r.body.items, [], 'items'); eq('nextCursor' in r.body, false, 'nextCursor omitted'); });
  t('list: dueAt null kept', async () => { const r = await post('/lms/assignments/list', { classroomId: 'c2' }); eq(r.body.items[0].dueAt, null, 'dueAt'); });
  t('invoice: exact decimal total', async () => { const r = await post('/erp/invoices/create', { studentId: 'st1', currency: 'LKR', lines: [{ description: 'fee', quantity: 3, unitPrice: '12345678901234567.3333' }] }, { 'idempotency-key': 'k1' }); eq(r.body.total, '37037036703703701.9999', 'total'); eq(r.body.payment, null, 'payment null'); });
  t('invoice: union bank ok', async () => { const r = await post('/erp/invoices/create', { studentId: 'st1', currency: 'LKR', lines: [], payment: { kind: 'bank', reference: 'r', bankCode: 'b' } }, { 'idempotency-key': 'k2' }); eq(r.body.payment.kind, 'bank', 'kind'); });
  t('invoice: union wrong shape 400', async () => { const r = await post('/erp/invoices/create', { studentId: 'st1', currency: 'LKR', lines: [], payment: { kind: 'bank', receivedBy: 'x' } }, { 'idempotency-key': 'k3' }); eq(r.status, 400, 'status'); });
  t('invoice: missing idempotency header 400', async () => { const r = await post('/erp/invoices/create', { studentId: 'st1', currency: 'LKR', lines: [] }); eq(r.status, 400, 'status'); });
  t('profile: unknown field rejected', async () => { const r = await post('/people/profiles/update', { personId: 'st1', nickname: 'x' }); eq(r.status, 400, 'status'); });
  t('snapshot: payload string verbatim', async () => { const r = await post('/authority/snapshot/refresh', { bondId: 'b1' }); eq(typeof r.body.payload, 'string', 'payload type'); eq(JSON.parse(r.body.payload).bondId, 'b1', 'payload'); });
  t('snapshot: 404', async () => { const r = await post('/authority/snapshot/refresh', { bondId: 'missing' }); eq([r.status, code(r)], [404, 'NOT_FOUND'], 'error'); });
  t('authz metadata on every op', async () => { eq([action('lms.submissions.grade'), action('erp.invoices.create'), action('authority.refreshSnapshot')], ['Lms::GradeSubmission', 'Erp::CreateInvoice', 'Authority::RefreshSnapshot'], 'actions'); });
}
if (task === 'T1') {
  t('mark: counts and notes', async () => { const r = await post('/lms/attendance/mark', { sessionId: 'sess1', marks: [{ studentId: 'st2', status: 'present' }, { studentId: 'st3', status: 'late', note: 'bus' }] }); eq(r.status, 200, 'status'); eq(r.body.counts, { present: 1, absent: 1, late: 1 }, 'counts'); eq(r.body.notes, [{ studentId: 'st2', note: null }, { studentId: 'st3', note: 'bus' }], 'notes'); });
  t('mark: omitted note keeps previous', async () => { const r = await post('/lms/attendance/mark', { sessionId: 'sess1', marks: [{ studentId: 'st1', status: 'late' }] }); eq(r.body.notes, [{ studentId: 'st1', note: 'sick' }], 'notes'); });
  t('mark: null note clears', async () => { const r = await post('/lms/attendance/mark', { sessionId: 'sess1', marks: [{ studentId: 'st1', status: 'late', note: null }] }); eq(r.body.notes, [{ studentId: 'st1', note: null }], 'notes'); });
  t('mark: empty marks', async () => { const r = await post('/lms/attendance/mark', { sessionId: 'sess1', marks: [] }); eq(r.status, 200, 'status'); eq(r.body.notes, [], 'notes'); eq(r.body.counts, { present: 0, absent: 1, late: 0 }, 'counts'); });
  t('mark: unknown session 404', async () => { const r = await post('/lms/attendance/mark', { sessionId: 'x', marks: [] }); eq([r.status, code(r)], [404, 'NOT_FOUND'], 'error'); });
  t('mark: student not in session 404', async () => { const r = await post('/lms/attendance/mark', { sessionId: 'sess1', marks: [{ studentId: 'zz', status: 'present' }] }); eq([r.status, code(r)], [404, 'NOT_FOUND'], 'error'); });
  t('mark: closed session 409', async () => { const r = await post('/lms/attendance/mark', { sessionId: 'sess2', marks: [] }); eq([r.status, code(r)], [409, 'CONFLICT'], 'error'); });
  t('mark: bad status 400', async () => { const r = await post('/lms/attendance/mark', { sessionId: 'sess1', marks: [{ studentId: 'st1', status: 'gone' }] }); eq(r.status, 400, 'status'); });
  t('mark: unknown field 400', async () => { const r = await post('/lms/attendance/mark', { sessionId: 'sess1', marks: [], extra: 1 }); eq(r.status, 400, 'status'); });
  t('mark: cedar action', async () => { eq(action('lms.attendance.mark'), 'Lms::MarkAttendance', 'action'); });
}
if (task === 'T2') {
  const k = (s: string) => ({ 'idempotency-key': s });
  t('refund: exact decimals to zero', async () => { for (const key of ['a', 'b', 'c']) await post('/erp/payments/refund', { invoiceId: 'inv1', amount: '0.1' }, k(key)); const r = await post('/erp/payments/refund', { invoiceId: 'inv1', amount: '0.0001' }, k('d')); eq([r.status, code(r)], [409, 'CONFLICT'], 'after full refund'); });
  t('refund: response normalised', async () => { const r = await post('/erp/payments/refund', { invoiceId: 'inv2', amount: '250.5' }, k('e')); eq(r.status, 200, 'status'); eq([r.body.amount, r.body.remaining], ['250.5000', '749.5000'], 'amounts'); eq(typeof r.body.refundId, 'string', 'refundId'); });
  t('refund: idempotent replay', async () => { const a = await post('/erp/payments/refund', { invoiceId: 'inv2', amount: '1' }, k('same')); const b = await post('/erp/payments/refund', { invoiceId: 'inv2', amount: '1' }, k('same')); eq(b.body.refundId, a.body.refundId, 'refundId'); eq(b.body.remaining, '999.0000', 'remaining not doubled'); });
  t('refund: over balance 409', async () => { const r = await post('/erp/payments/refund', { invoiceId: 'inv1', amount: '0.3001' }, k('f')); eq([r.status, code(r)], [409, 'CONFLICT'], 'error'); });
  t('refund: unknown invoice 404', async () => { const r = await post('/erp/payments/refund', { invoiceId: 'nope', amount: '1' }, k('g')); eq([r.status, code(r)], [404, 'NOT_FOUND'], 'error'); });
  t('refund: number amount 400', async () => { const r = await post('/erp/payments/refund', { invoiceId: 'inv2', amount: 1 }, k('h')); eq(r.status, 400, 'status'); });
  t('refund: missing key 400', async () => { const r = await post('/erp/payments/refund', { invoiceId: 'inv2', amount: '1' }); eq(r.status, 400, 'status'); });
  t('refund: reason null vs omitted both accepted', async () => { const a = await post('/erp/payments/refund', { invoiceId: 'inv2', amount: '1', reason: null }, k('i')); const b = await post('/erp/payments/refund', { invoiceId: 'inv2', amount: '1' }, k('j')); eq([a.status, b.status], [200, 200], 'statuses'); });
  t('refund: cedar action', async () => { eq(action('erp.payments.refund'), 'Erp::RefundPayment', 'action'); });
}
if (task === 'T3') {
  t('link: parent', async () => { const r = await post('/people/guardians/link', { studentId: 'st1', guardianId: 'g1', relationship: { kind: 'parent' } }); eq(r.status, 200, 'status'); eq([r.body.studentId, r.body.guardianId, r.body.verified, r.body.relationship], ['st1', 'g1', false, { kind: 'parent' }], 'body'); });
  t('link: legal guardian echoes ref', async () => { const r = await post('/people/guardians/link', { studentId: 'st1', guardianId: 'g1', relationship: { kind: 'legal_guardian', courtOrderRef: 'CO-1' } }); eq(r.body.relationship, { kind: 'legal_guardian', courtOrderRef: 'CO-1' }, 'relationship'); });
  t('link: other without description 400', async () => { const r = await post('/people/guardians/link', { studentId: 'st1', guardianId: 'g1', relationship: { kind: 'other' } }); eq(r.status, 400, 'status'); });
  t('link: unknown kind 400', async () => { const r = await post('/people/guardians/link', { studentId: 'st1', guardianId: 'g1', relationship: { kind: 'aunt' } }); eq(r.status, 400, 'status'); });
  t('link: duplicate 409', async () => { const r = await post('/people/guardians/link', { studentId: 'st2', guardianId: 'g2', relationship: { kind: 'parent' } }); eq([r.status, code(r)], [409, 'CONFLICT'], 'error'); });
  t('link: locked student 403', async () => { const r = await post('/people/guardians/link', { studentId: 'st3', guardianId: 'g1', relationship: { kind: 'parent' } }); eq([r.status, code(r)], [403, 'FORBIDDEN'], 'error'); });
  t('link: unknown guardian 404', async () => { const r = await post('/people/guardians/link', { studentId: 'st1', guardianId: 'gx', relationship: { kind: 'parent' } }); eq([r.status, code(r)], [404, 'NOT_FOUND'], 'error'); });
  t('link: guardian id that is a student 404', async () => { const r = await post('/people/guardians/link', { studentId: 'st1', guardianId: 'st2', relationship: { kind: 'parent' } }); eq([r.status, code(r)], [404, 'NOT_FOUND'], 'error'); });
  t('link: unknown field 400', async () => { const r = await post('/people/guardians/link', { studentId: 'st1', guardianId: 'g1', relationship: { kind: 'parent', extra: 1 } }); eq(r.status, 400, 'status'); });
  t('link: cedar action', async () => { eq(action('people.guardians.link'), 'People::LinkGuardian', 'action'); });
}
const failures: string[] = [];
for (const [name, fn] of cases) { reset(); try { await fn(); } catch (e) { failures.push(`${name}: ${(e as Error).message}`); } }
console.log(JSON.stringify({ task, passed: cases.length - failures.length, failed: failures.length, failures }, null, 1));
