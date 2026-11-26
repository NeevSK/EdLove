import { oc } from '@orpc/contract';
import { openapi } from '@orpc/openapi';
import { z } from 'zod';
import { cedar } from '../../shared/cedar';

// Decimal carried as a string so no precision is lost (e.g. "1234.50").
const Decimal = z.string().regex(/^-?[0-9]+(\.[0-9]{1,4})?$/);
const route = (operationId: string, path: `/${string}`, detailed = false) =>
  openapi({ method: 'POST', path, operationId, ...(detailed ? { inputStructure: 'detailed' as const } : {}) });

const Assignment = z.strictObject({ id: z.string(), classroomId: z.string(), title: z.string(), dueAt: z.iso.datetime().nullable(), maxScore: Decimal });
const Grade = z.strictObject({ submissionId: z.string(), score: Decimal, feedback: z.string().nullable() });
const Payment = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('cash'), receivedBy: z.string() }),
  z.strictObject({ kind: z.literal('bank'), reference: z.string(), bankCode: z.string() }),
]);
const InvoiceLine = z.strictObject({ description: z.string(), quantity: z.int32(), unitPrice: Decimal });
const Profile = z.strictObject({ personId: z.string(), legalName: z.string(), preferredName: z.string().nullable(), phone: z.string().nullable(), guardians: z.array(z.string()) });
const SignedSnapshot = z.strictObject({ payload: z.string(), signature: z.string(), keyId: z.string(), expiresAt: z.iso.datetime() });
const GuardianRelationship = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('parent') }),
  z.strictObject({ kind: z.literal('legal_guardian'), courtOrderRef: z.string() }),
  z.strictObject({ kind: z.literal('other'), description: z.string() }),
]);

export const contract = {
  lms: {
    assignments: {
      list: oc.errors({ NOT_FOUND: {}, FORBIDDEN: {} }).meta(cedar('Lms::ListAssignments'), route('lms.assignments.list', '/lms/assignments/list'))
        .input(z.strictObject({ classroomId: z.string(), cursor: z.string().optional(), limit: z.int32().optional() }))
        .output(z.strictObject({ items: z.array(Assignment), nextCursor: z.string().optional() })),
    },
    submissions: {
      // feedback: omitted = keep existing; null = clear.
      grade: oc.errors({ NOT_FOUND: {}, FORBIDDEN: {}, CONFLICT: {} }).meta(cedar('Lms::GradeSubmission'), route('lms.submissions.grade', '/lms/submissions/grade'))
        .input(z.strictObject({ submissionId: z.string(), score: Decimal, feedback: z.string().nullish() }))
        .output(Grade),
    },
  },
  erp: {
    invoices: {
      create: oc.errors({ FORBIDDEN: {}, CONFLICT: {} }).meta(cedar('Erp::CreateInvoice'), route('erp.invoices.create', '/erp/invoices/create', true))
        .input(z.object({
          headers: z.object({ 'idempotency-key': z.string() }),
          body: z.strictObject({ studentId: z.string(), currency: z.enum(['LKR', 'USD']), lines: z.array(InvoiceLine), payment: Payment.optional() }),
        }))
        .output(z.strictObject({ id: z.string(), total: Decimal, lines: z.array(InvoiceLine), payment: Payment.nullable() })),
    },
  },
  people: {
    profiles: {
      // omitted = unchanged; null = clear.
      update: oc.errors({ NOT_FOUND: {}, FORBIDDEN: {} }).meta(cedar('People::UpdateProfile'), route('people.profiles.update', '/people/profiles/update'))
        .input(z.strictObject({ personId: z.string(), preferredName: z.string().nullish(), phone: z.string().nullish() }))
        .output(Profile),
    },
    guardians: {
      link: oc.errors({ NOT_FOUND: {}, FORBIDDEN: {}, CONFLICT: {} }).meta(cedar('People::LinkGuardian'), route('people.guardians.link', '/people/guardians/link'))
        .input(z.strictObject({ studentId: z.string(), guardianId: z.string(), relationship: GuardianRelationship }))
        .output(z.strictObject({ linkId: z.string(), studentId: z.string(), guardianId: z.string(), relationship: GuardianRelationship, verified: z.literal(false) })),
    },
  },
  authority: {
    refreshSnapshot: oc.errors({ NOT_FOUND: {}, FORBIDDEN: {} }).meta(cedar('Authority::RefreshSnapshot'), route('authority.refreshSnapshot', '/authority/snapshot/refresh'))
      .input(z.strictObject({ bondId: z.string() }))
      .output(SignedSnapshot),
  },
};
