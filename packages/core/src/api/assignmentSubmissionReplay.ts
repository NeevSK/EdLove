import { z } from 'zod';
import {
  ASSIGNMENT_SUBMISSION_CAPABILITY,
  educationalContract,
  OperationReceiptResponseSchema,
} from './educational.contract';

const intentSchema = z.strictObject({
  ...educationalContract.submitAssignment.request.params.shape,
  ...educationalContract.submitAssignment.request.body.omit({ idempotencyKey: true }).shape,
});

type SubmitAssignmentParams = z.input<typeof educationalContract.submitAssignment.request.params>;
type SubmitAssignmentBody = z.input<typeof educationalContract.submitAssignment.request.body>;
type ReceiptQuery = z.input<typeof educationalContract.getOperationReceiptByKey.request.query>;
type ReplayOptions = { context: { expectedAccountId: string; retry: 0 } };

export type AssignmentSubmissionReplayTransport = Readonly<{
  submitAssignment: (
    request: {
      params: SubmitAssignmentParams;
      body: Omit<SubmitAssignmentBody, 'idempotencyKey'> & { idempotencyKey: string };
    },
    options: ReplayOptions,
  ) => Promise<unknown>;
  getOperationReceiptByKey: (
    request: { query: ReceiptQuery },
    options: ReplayOptions,
  ) => Promise<unknown>;
}>;

export type AssignmentSubmissionReplayInput = Readonly<{
  commandId: string;
  expectedCanonicalAccountId: string;
  transport: AssignmentSubmissionReplayTransport;
  assertPlatformAccount: (expectedCanonicalAccountId: string) => void | Promise<void>;
}>;

/** Resolves only after server settlement; callers retain the durable command on rejection. */
export async function replayAssignmentSubmissionWithTransport(
  variables: unknown,
  input: AssignmentSubmissionReplayInput,
): Promise<z.infer<typeof OperationReceiptResponseSchema>> {
  const owner = z
    .strictObject({
      commandId: z.uuid(),
      expectedCanonicalAccountId: z.uuid(),
    })
    .parse({
      commandId: input.commandId,
      expectedCanonicalAccountId: input.expectedCanonicalAccountId,
    });
  await input.assertPlatformAccount(owner.expectedCanonicalAccountId);
  const intent = intentSchema.parse(variables);
  const { assignmentId, ...submissionIntent } = intent;
  const body = { ...submissionIntent, idempotencyKey: owner.commandId };
  const options = {
    context: { expectedAccountId: owner.expectedCanonicalAccountId, retry: 0 as const },
  };
  const submitted: unknown = await input.transport.submitAssignment(
    { params: { assignmentId }, body },
    options,
  );
  await input.assertPlatformAccount(owner.expectedCanonicalAccountId);
  const submission = educationalContract.submitAssignment.responses[201].schema.parse(submitted);
  if (
    submission.student_id !== owner.expectedCanonicalAccountId ||
    submission.assignment_id !== intent.assignmentId ||
    (submission.content ?? null) !== (intent.content ?? null)
  ) {
    throw Object.assign(new Error('Submission acknowledgement conflicts with the queued intent.'), {
      status: 409,
    });
  }
  const recovered: unknown = await input.transport.getOperationReceiptByKey(
    {
      query: {
        capability: ASSIGNMENT_SUBMISSION_CAPABILITY,
        idempotencyKey: owner.commandId,
      },
    },
    options,
  );
  await input.assertPlatformAccount(owner.expectedCanonicalAccountId);
  const receipt = OperationReceiptResponseSchema.parse(recovered);
  if (receipt.status !== 'committed' || !receipt.result) {
    throw Object.assign(new Error('Submission has no committed receipt. Retry the same command.'), {
      status: 503,
    });
  }
  if (receipt.result.submissionId !== submission.id) {
    throw Object.assign(new Error('Receipt conflicts with the acknowledged submission.'), {
      status: 409,
    });
  }
  return receipt;
}
