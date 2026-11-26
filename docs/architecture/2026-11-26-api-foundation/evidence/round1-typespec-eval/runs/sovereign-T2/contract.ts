import { z } from 'zod';
import type { SovereignContract } from './runtime';

// Decimal carried as a string so no precision is lost (e.g. "1234.50").
const Decimal = z.string().regex(/^-?[0-9]+(\.[0-9]{1,4})?$/);
// Non-negative amount for refunds (a negative refund would raise the remaining balance).
const Amount = z.string().regex(/^[0-9]+(\.[0-9]{1,4})?$/);
const Assignment = z.strictObject({ id: z.string(), classroomId: z.string(), title: z.string(), dueAt: z.iso.datetime().nullable(), maxScore: Decimal });
const Payment = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('cash'), receivedBy: z.string() }),
  z.strictObject({ kind: z.literal('bank'), reference: z.string(), bankCode: z.string() }),
]);
const InvoiceLine = z.strictObject({ description: z.string(), quantity: z.int32(), unitPrice: Decimal });

export const contract = {
  listAssignments: {
    method: 'post', path: '/lms/assignments/list', operationId: 'lms.assignments.list',
    request: { body: z.strictObject({ classroomId: z.string(), cursor: z.string().optional(), limit: z.int32().optional() }) },
    responses: { 200: { schema: z.strictObject({ items: z.array(Assignment), nextCursor: z.string().optional() }), description: 'Assignments page' } },
    errors: ['NOT_FOUND', 'FORBIDDEN'],
    metadata: { cedarAction: 'Lms::ListAssignments', policy: { action: 'read', subject: 'Assignment' } },
  },
  gradeSubmission: {
    method: 'post', path: '/lms/submissions/grade', operationId: 'lms.submissions.grade',
    // feedback: omitted = keep existing; null = clear.
    request: { body: z.strictObject({ submissionId: z.string(), score: Decimal, feedback: z.string().nullish() }) },
    responses: { 200: { schema: z.strictObject({ submissionId: z.string(), score: Decimal, feedback: z.string().nullable() }), description: 'Grade' } },
    errors: ['NOT_FOUND', 'FORBIDDEN', 'CONFLICT'],
    metadata: { cedarAction: 'Lms::GradeSubmission', policy: { action: 'grade', subject: 'Submission' } },
  },
  createInvoice: {
    method: 'post', path: '/erp/invoices/create', operationId: 'erp.invoices.create',
    request: {
      headers: z.object({ 'idempotency-key': z.string() }),
      body: z.strictObject({ studentId: z.string(), currency: z.enum(['LKR', 'USD']), lines: z.array(InvoiceLine), payment: Payment.optional() }),
    },
    responses: { 200: { schema: z.strictObject({ id: z.string(), total: Decimal, lines: z.array(InvoiceLine), payment: Payment.nullable() }), description: 'Invoice' } },
    errors: ['FORBIDDEN', 'CONFLICT'],
    metadata: { cedarAction: 'Erp::CreateInvoice', policy: { action: 'create', subject: 'Invoice' } },
  },
  refundPayment: {
    method: 'post', path: '/erp/payments/refund', operationId: 'erp.payments.refund',
    request: {
      headers: z.object({ 'idempotency-key': z.string() }),
      body: z.strictObject({ invoiceId: z.string(), amount: Amount, reason: z.string().nullish() }),
    },
    responses: { 200: { schema: z.strictObject({ refundId: z.string(), invoiceId: z.string(), amount: Decimal, remaining: Decimal }), description: 'Refund' } },
    errors: ['NOT_FOUND', 'CONFLICT'],
    metadata: { cedarAction: 'Erp::RefundPayment', policy: { action: 'refund', subject: 'Payment' } },
  },
  updateProfile: {
    method: 'post', path: '/people/profiles/update', operationId: 'people.profiles.update',
    // omitted = unchanged; null = clear.
    request: { body: z.strictObject({ personId: z.string(), preferredName: z.string().nullish(), phone: z.string().nullish() }) },
    responses: { 200: { schema: z.strictObject({ personId: z.string(), legalName: z.string(), preferredName: z.string().nullable(), phone: z.string().nullable(), guardians: z.array(z.string()) }), description: 'Profile' } },
    errors: ['NOT_FOUND', 'FORBIDDEN'],
    metadata: { cedarAction: 'People::UpdateProfile', policy: { action: 'update', subject: 'Profile' } },
  },
  refreshSnapshot: {
    method: 'post', path: '/authority/snapshot/refresh', operationId: 'authority.refreshSnapshot',
    request: { body: z.strictObject({ bondId: z.string() }) },
    responses: { 200: { schema: z.strictObject({ payload: z.string(), signature: z.string(), keyId: z.string(), expiresAt: z.iso.datetime() }), description: 'Signed snapshot' } },
    errors: ['NOT_FOUND', 'FORBIDDEN'],
    metadata: { cedarAction: 'Authority::RefreshSnapshot', policy: { action: 'read', subject: 'Snapshot' } },
  },
} as const satisfies SovereignContract;
