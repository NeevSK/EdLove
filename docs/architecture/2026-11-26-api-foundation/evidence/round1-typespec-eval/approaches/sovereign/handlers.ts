import { db } from '../../shared/domain';
import { fromMinor, toMinor } from '../../shared/decimal';
import type { contract } from './contract';
import { ApiError, type Handlers } from './runtime';

export const handlers: Handlers<typeof contract> = {
  listAssignments: ({ body }) => ({ items: db.assignments.get(body.classroomId) ?? [] }),
  gradeSubmission: ({ body }) => {
    const prev = db.submissions.get(body.submissionId);
    if (!prev) throw new ApiError('NOT_FOUND');
    const next = { score: body.score, feedback: body.feedback === undefined ? prev.feedback : body.feedback };
    db.submissions.set(body.submissionId, next);
    return { submissionId: body.submissionId, ...next };
  },
  createInvoice: ({ body }) => {
    let total = 0n;
    for (const line of body.lines) total += toMinor(line.unitPrice) * BigInt(line.quantity);
    return { id: 'inv_new', total: fromMinor(total), lines: body.lines, payment: body.payment ?? null };
  },
  updateProfile: ({ body }) => {
    const p = db.people.get(body.personId);
    if (!p) throw new ApiError('NOT_FOUND');
    if (body.preferredName !== undefined) p.preferredName = body.preferredName;
    if (body.phone !== undefined) p.phone = body.phone;
    return { personId: body.personId, legalName: p.legalName, preferredName: p.preferredName, phone: p.phone, guardians: [] };
  },
  refreshSnapshot: ({ body }) => {
    if (body.bondId === 'missing') throw new ApiError('NOT_FOUND');
    return { payload: JSON.stringify({ bondId: body.bondId, scopes: [] }), signature: 'c2ln', keyId: 'k1', expiresAt: '2026-12-01T00:00:00Z' };
  },
};
