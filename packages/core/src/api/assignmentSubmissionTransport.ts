import { RPCLink, type RPCLinkOptions } from '@orpc/client/fetch';
import type { AssignmentSubmissionReplayTransport } from './assignmentSubmissionReplay';
import './orpcClient';
import { assertSecureApiUrl } from './transportSecurity';

export type AssignmentSubmissionClientContext = Readonly<{
  expectedAccountId: string;
  retry: 0;
}>;

export type AssignmentSubmissionTransportFetch = (
  url: string,
  init: RequestInit,
  options: { context: AssignmentSubmissionClientContext },
  path: readonly string[],
) => Promise<Response>;

export type AssignmentSubmissionTransportOptions = Readonly<{
  url: string;
  fetch: AssignmentSubmissionTransportFetch;
}>;

export function createAssignmentSubmissionTransport(
  options: AssignmentSubmissionTransportOptions,
): AssignmentSubmissionReplayTransport {
  assertSecureApiUrl(options.url);
  const link = new RPCLink<AssignmentSubmissionClientContext>({
    url: options.url,
    fetch: async (url: URL | string, init: RequestInit, clientOptions: any, path: readonly string[]) => {
      const requestUrl = typeof url === 'string' ? url : url.href;
      assertSecureApiUrl(requestUrl);
      const mergedInit: RequestInit = {
        ...init,
        redirect: 'error',
      };
      return options.fetch(requestUrl, mergedInit, clientOptions, path);
    },
  } as any);
  return {
    submitAssignment: (request, callOptions) =>
      link.call(['educational', 'submitAssignment'], request, callOptions),
    getOperationReceiptByKey: (request, callOptions) =>
      link.call(['educational', 'getOperationReceiptByKey'], request, callOptions),
  };
}
