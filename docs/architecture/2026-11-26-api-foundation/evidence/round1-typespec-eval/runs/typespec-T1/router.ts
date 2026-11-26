import { implement, ORPCError } from '@orpc/server';
import { db } from '../../shared/domain';
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
    attendance: {
      mark: os.lms.attendance.mark.handler(({ input }) => {
        const session = db.sessions.get(input.body.sessionId);
        if (!session) throw new ORPCError('NOT_FOUND');
        if (!session.open) throw new ORPCError('CONFLICT');
        // Validate every student before changing anything.
        for (const m of input.body.marks) {
          if (!session.students.includes(m.studentId)) throw new ORPCError('NOT_FOUND');
        }
        for (const m of input.body.marks) {
          const prev = session.marks.get(m.studentId);
          // note omitted = keep existing note (null if none); null = clear; string = set.
          const note = m.note === undefined ? (prev?.note ?? null) : m.note;
          session.marks.set(m.studentId, { status: m.status, note });
        }
        const counts = { present: 0, absent: 0, late: 0 };
        for (const { status } of session.marks.values()) counts[status] += 1;
        const notes = input.body.marks.map((m) => ({
          studentId: m.studentId,
          note: session.marks.get(m.studentId)?.note ?? null,
        }));
        return { sessionId: input.body.sessionId, counts, notes };
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
