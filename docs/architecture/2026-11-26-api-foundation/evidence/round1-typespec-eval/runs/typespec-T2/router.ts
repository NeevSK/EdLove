import { implement, ORPCError } from '@orpc/server';
import { db, nextId } from '../../shared/domain';
import { fromMinor, toMinor } from '../../shared/decimal';
import { contract } from './gen/orpc.gen';

const os = implement(contract);

export const router = os.router({
  authority: {
    refreshSnapshot: os.authority.refreshSnapshot.handler(({ input }) => {
      if (input.body.bondId === 'missing') throw new ORPCError('NOT_FOUND');
      return { payload: JSON.stringify({ bondId: input.body.bondId, scopes: [] }), signature: 'c2ln', keyId: 'k1', expiresAt: '2026-12-01T00:00:00Z' };
    }),
  },
  erp: {
    invoices: {
      create: os.erp.invoices.create.handler(({ input }) => {
        let total = 0n;
        for (const line of input.body.lines) total += toMinor(line.unitPrice) * BigInt(line.quantity);
        return { id: 'inv_new', total: fromMinor(total), lines: input.body.lines, payment: input.body.payment ?? null };
      }),
    },
    payments: {
      refund: os.erp.payments.refund.handler(({ input }) => {
        const key = input.headers['idempotency-key'];
        const replay = db.refundsByKey.get(key);
        if (replay) return replay;
        const invoice = db.invoices.get(input.body.invoiceId);
        if (!invoice) throw new ORPCError('NOT_FOUND');
        const amount = toMinor(input.body.amount);
        const remaining = toMinor(invoice.total) - toMinor(invoice.refunded);
        if (amount > remaining) throw new ORPCError('CONFLICT');
        invoice.refunded = fromMinor(toMinor(invoice.refunded) + amount);
        const result = {
          refundId: nextId('refund'),
          invoiceId: input.body.invoiceId,
          amount: fromMinor(amount),
          remaining: fromMinor(remaining - amount),
        };
        db.refundsByKey.set(key, result);
        return result;
      }),
    },
  },
  lms: {
    assignments: {
      list: os.lms.assignments.list.handler(({ input }) => ({ items: db.assignments.get(input.body.classroomId) ?? [] })),
    },
    submissions: {
      grade: os.lms.submissions.grade.handler(({ input }) => {
        const prev = db.submissions.get(input.body.submissionId);
        if (!prev) throw new ORPCError('NOT_FOUND');
        const next = { score: input.body.score, feedback: input.body.feedback === undefined ? prev.feedback : input.body.feedback };
        db.submissions.set(input.body.submissionId, next);
        return { submissionId: input.body.submissionId, ...next };
      }),
    },
  },
  people: {
    profiles: {
      update: os.people.profiles.update.handler(({ input }) => {
        const p = db.people.get(input.body.personId);
        if (!p) throw new ORPCError('NOT_FOUND');
        if (input.body.preferredName !== undefined) p.preferredName = input.body.preferredName;
        if (input.body.phone !== undefined) p.phone = input.body.phone;
        return { personId: input.body.personId, legalName: p.legalName, preferredName: p.preferredName, phone: p.phone, guardians: [] };
      }),
    },
  },
});
