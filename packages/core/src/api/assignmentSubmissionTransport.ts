import { RPCLink, type RPCLinkOptions } from '@orpc/client/fetch';
import type { AssignmentSubmissionReplayTransport } from './assignmentSubmissionReplay';
import './orpcClient';
import { assertSecureApiUrl } from './transportSecurity';

export type AssignmentSubmissionClientContext = Readonly<{
  expectedAccountId: string;
  retry: 0;
}>;

export type AssignmentSubmissionTransportFetch = NonNullable<
  RPCLinkOptions<AssignmentSubmissionClientContext>['fetch']
>;

export type AssignmentSubmissionTransportOptions = Readonly<{
  url: string;
  fetch: AssignmentSubmissionTransportFetch;
}>;

export function createAssignmentSubmissionTransport(
  options: AssignmentSubmissionTransportOptions,
): AssignmentSubmissionReplayTransport {
  assertSecureApiUrl(options.url);
  const parsed = new URL(options.url);
  const origin = parsed.origin as `http://${string}` | `https://${string}`;
  const urlPath = (parsed.pathname === '/' ? '/api' : parsed.pathname) as `/${string}`;
  const link = new RPCLink<AssignmentSubmissionClientContext>({
    url: urlPath,
    origin,
    fetch: (requestUrl, init, clientOptions, path) => {
      assertSecureApiUrl(requestUrl);
      return options.fetch(requestUrl, { ...init, redirect: 'error' }, clientOptions, path);
    },
  });
  return {
    submitAssignment: (request, callOptions) =>
      link.call(['educational', 'submitAssignment'], request, callOptions),
    getOperationReceiptByKey: (request, callOptions) =>
      link.call(['educational', 'getOperationReceiptByKey'], request, callOptions),
  };
}
