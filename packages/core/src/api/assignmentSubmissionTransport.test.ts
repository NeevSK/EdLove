import { describe, expect, it, vi } from 'vitest';
import {
  type AssignmentSubmissionClientContext,
  type AssignmentSubmissionTransportFetch,
  createAssignmentSubmissionTransport,
} from './assignmentSubmissionTransport';

describe('createAssignmentSubmissionTransport', () => {
  it('uses the SDK RPC encoding and forwards canonical account context to the supplied fetch', async () => {
    const calls: Array<{
      url: string;
      init: RequestInit;
      redirect: RequestRedirect | undefined;
      context: AssignmentSubmissionClientContext;
      path: readonly string[];
    }> = [];
    const fetch: AssignmentSubmissionTransportFetch = async (
      url,
      init,
      options,
      path,
    ) => {
      calls.push({ url, init, redirect: init.redirect, context: options.context, path });
      return new Response(JSON.stringify({ json: { accepted: true } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    };
    const transport = createAssignmentSubmissionTransport({
      url: 'https://api.example.test/rpc',
      fetch,
    });
    const context = { expectedAccountId: 'account-canonical', retry: 0 } as const;

    await transport.submitAssignment(
      {
        params: { assignmentId: 'assignment-1' },
        body: { content: 'answer', idempotencyKey: 'operation-1' },
      },
      { context },
    );
    await transport.getOperationReceiptByKey(
      {
        query: { capability: 'assignment.submit', idempotencyKey: 'operation-1' },
      },
      { context },
    );

    expect(calls).toHaveLength(2);
    expect(calls.map((call) => call.redirect)).toEqual(['error', 'error']);
    expect(calls[0]?.path).toEqual(['educational', 'submitAssignment']);
    expect(calls[0]?.context).toEqual(context);
    expect(calls[0]?.init.method).toBe('POST');
    expect(calls[0]?.url).toBe('https://api.example.test/rpc/educational/submitAssignment');
    expect(JSON.parse(calls[0]?.init.body as string)).toEqual({
      json: {
        params: { assignmentId: 'assignment-1' },
        body: { content: 'answer', idempotencyKey: 'operation-1' },
      },
    });

    expect(calls[1]?.path).toEqual(['educational', 'getOperationReceiptByKey']);
    expect(calls[1]?.context).toEqual(context);
    expect(calls[1]?.init.method).toBe('POST');
    expect(calls[1]?.url).toBe(
      'https://api.example.test/rpc/educational/getOperationReceiptByKey',
    );
    expect(JSON.parse(calls[1]?.init.body as string)).toEqual({
      json: { query: { capability: 'assignment.submit', idempotencyKey: 'operation-1' } },
    });
  });

  it.each([
    'http://api.example.test/rpc',
    'https://user:secret@api.example.test/rpc',
    'https://api.example.test/rpc#fragment',
  ])('rejects an unsafe endpoint before invoking the supplied fetch: %s', (url) => {
    const fetch = vi.fn<AssignmentSubmissionTransportFetch>(async () => new Response());

    expect(() => createAssignmentSubmissionTransport({ url, fetch })).toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('propagates server errors without retrying the supplied fetch', async () => {
    const fetch = vi.fn<AssignmentSubmissionTransportFetch>(
      async () =>
        new Response(
          JSON.stringify({
            json: {
              defined: false,
              code: 'SERVICE_UNAVAILABLE',
              message: 'temporarily unavailable',
            },
          }),
          { status: 503, headers: { 'content-type': 'application/json' } },
        ),
    );
    const transport = createAssignmentSubmissionTransport({
      url: 'https://api.example.test/rpc',
      fetch,
    });

    await expect(
      transport.getOperationReceiptByKey(
        { query: { capability: 'assignment.submit', idempotencyKey: 'operation-1' } },
        { context: { expectedAccountId: 'account-canonical', retry: 0 } },
      ),
    ).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE', status: 503 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
