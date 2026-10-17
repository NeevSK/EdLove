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
    fetch: async (request: Request, _init: any, clientOptions: any, path: readonly string[]) => {
      const requestUrl = request.url;
      assertSecureApiUrl(requestUrl);
      const body = await request.clone().text();
      const headers = Object.fromEntries(request.headers.entries());
      const mergedInit: RequestInit = {
        method: request.method || 'POST',
        headers,
        body,
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
