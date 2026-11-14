import { z } from 'zod';
import { replayAssignmentSubmissionWithTransport } from './assignmentSubmissionReplay';
import { assertActiveRequestAccount } from './clientRuntime';
import { orpcClient } from './orpcClient';

const replayContextSchema = z.object({ commandId: z.uuid(), userId: z.uuid() });

export type AssignmentReplayContext = { commandId?: string; userId?: string };

/** Resolves only after server settlement; callers retain the durable command on rejection. */
export async function replayAssignmentSubmission(
  variables: unknown,
  context: AssignmentReplayContext,
) {
  const owner = replayContextSchema.parse(context);
  return replayAssignmentSubmissionWithTransport(variables, {
    commandId: owner.commandId,
    expectedCanonicalAccountId: owner.userId,
    transport: {
      submitAssignment: (request, options) =>
        orpcClient.educational.submitAssignment(request, options),
      getOperationReceiptByKey: (request, options) =>
        orpcClient.educational.getOperationReceiptByKey(request, options),
    },
    assertPlatformAccount: assertActiveRequestAccount,
  });
}
