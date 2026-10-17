'use client';

import {
  replayAssignmentSubmissionWithTransport,
  type AssignmentSubmissionReplayTransport,
} from '@repo/core/api/assignmentSubmissionReplay';
import {
  createAssignmentSubmissionTransport,
  type AssignmentSubmissionTransportFetch,
} from '@repo/core/api/assignmentSubmissionTransport';
import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import { educationalContract } from '@repo/core/api/educational.contract';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { createBrowserSupabaseClient } from '../supabase/browser';

type SubmissionIntent = Readonly<{ assignmentId: string; content: string | null }>;

export type BrowserAssignment = Readonly<{
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  classroom: string | null;
  submitted: boolean;
}>;

export type BrowserSubmission = Readonly<{
  id: string;
  assignmentId: string;
  content: string | null;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
}>;

export type BrowserSubmissionResult = Readonly<{
  status: 'committed' | 'queued';
  commandId: string;
  message?: string;
}>;

function apiOrigin(): string {
  const origin = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!origin) throw new Error('Sanctuary services are not configured in this browser.');
  try {
    assertSecureApiUrl(origin);
  } catch {
    throw new Error('Sanctuary services are not configured securely in this browser.');
  }
  return origin;
}

function orpcUrl(): string {
  return `${apiOrigin()}/api`;
}

async function requireBrowserSession(expectedAuthSubjectId: string) {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) throw new Error('Sign in to use assignment submissions.');
  const { data, error } = await supabase.auth.getSession();
  const session = data.session;
  if (
    error ||
    !session?.access_token ||
    !session.user.id ||
    session.user.is_anonymous ||
    session.user.id !== expectedAuthSubjectId
  ) {
    throw new Error('Your secure session has ended. Sign in again to continue.');
  }
  return session;
}

async function requestAccountJson(path: string, expectedAuthSubjectId: string): Promise<unknown> {
  const origin = apiOrigin();
  const session = await requireBrowserSession(expectedAuthSubjectId);
  let response: Response;
  try {
    response = await fetch(`${origin}${path}`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${session.access_token}` },
      redirect: 'error',
    });
  } catch {
    throw new Error('Sanctuary could not be reached. Check your connection and retry.');
  }
  if (response.status === 401) throw new Error('Your secure session has ended. Sign in again.');
  if (response.status === 403) throw new Error('Your current scope cannot access assignments.');
  if (!response.ok) throw new Error('Assignments are unavailable right now. Please retry.');
  return response.json();
}

/** Re-checks the server-derived account scope under the current browser session. */
async function assertBrowserAccountBinding(
  accountId: string,
  authSubjectId: string,
): Promise<void> {
  await requestAccountJson(
    `/api/openapi/educational/students/${encodeURIComponent(accountId)}/assignments/upcoming?limit=1`,
    authSubjectId,
  );
}

export async function loadBrowserAssignments(accountId: string, authSubjectId: string): Promise<readonly BrowserAssignment[]> {
  const raw = await requestAccountJson(
    `/api/openapi/educational/students/${encodeURIComponent(accountId)}/assignments/upcoming?limit=24`,
    authSubjectId,
  );
  const assignments = educationalContract.getUpcomingAssignments.responses[200].schema.parse(raw);
  return assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.due_date,
    classroom: assignment.classroom,
    submitted: assignment.submitted,
  }));
}

export async function loadBrowserSubmissions(accountId: string, authSubjectId: string): Promise<readonly BrowserSubmission[]> {
  const raw = await requestAccountJson(
    `/api/openapi/educational/students/${encodeURIComponent(accountId)}/submissions`,
    authSubjectId,
  );
  const submissions = educationalContract.getStudentSubmissions.responses[200].schema.parse(raw);
  return submissions.map((submission) => ({
    id: submission.id,
    assignmentId: submission.assignment_id,
    content: submission.content,
    submittedAt: submission.submitted_at,
    grade: submission.grade,
    feedback: submission.feedback,
  }));
}

function sameIntent(value: unknown, intent: SubmissionIntent): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Readonly<Record<string, unknown>>;
  return candidate.assignmentId === intent.assignmentId && candidate.content === intent.content;
}

async function browserTransportFetch(authSubjectId: string): Promise<AssignmentSubmissionTransportFetch> {
  return async (request, init, options) => {
    if (!options.context?.expectedAccountId) throw new Error('Assignment submission requires an account scope.');
    assertSecureApiUrl(request.url);
    const session = await requireBrowserSession(authSubjectId);
    const headers = new Headers(request.headers);
    headers.set('Authorization', `Bearer ${session.access_token}`);
    return fetch(request, { ...init, headers, redirect: 'error' });
  };
}

async function createBrowserTransport(authSubjectId: string): Promise<AssignmentSubmissionReplayTransport> {
  return createAssignmentSubmissionTransport({
    url: orpcUrl(),
    fetch: await browserTransportFetch(authSubjectId),
  });
}

async function findOrCreateCommand(accountId: string, intent: SubmissionIntent) {
  const before = new Set(useMutationQueue.getState().getQueueForUser(accountId).map((item) => item.id));
  const existing = useMutationQueue
    .getState()
    .getQueueForUser(accountId)
    .find((item) => item.name === 'assignment.submit' && sameIntent(item.variables, intent));
  if (existing) return existing;

  await useMutationQueue.getState().addToQueue({
    name: 'assignment.submit',
    scope: 'educational',
    type: 'CREATE',
    userId: accountId,
    variables: intent,
  });
  const created = useMutationQueue
    .getState()
    .getQueueForUser(accountId)
    .find(
      (item) =>
        !before.has(item.id) && item.name === 'assignment.submit' && sameIntent(item.variables, intent),
    );
  if (!created) throw new Error('The submission command could not be stored. Your draft is still intact.');
  return created;
}

/** Persists first; only removes the command after a matching committed server receipt. */
export async function submitBrowserAssignment(
  accountId: string,
  authSubjectId: string,
  intent: SubmissionIntent,
): Promise<BrowserSubmissionResult> {
  apiOrigin();
  const command = await findOrCreateCommand(accountId, intent);
  const queue = useMutationQueue.getState();
  if (!queue.tryAcquireMutationLease(command.id, 30_000)) {
    throw new Error('This submission is already being sent. Your draft remains intact.');
  }

  try {
    const receipt = await replayAssignmentSubmissionWithTransport(intent, {
      commandId: command.id,
      expectedCanonicalAccountId: accountId,
      transport: await createBrowserTransport(authSubjectId),
      assertPlatformAccount: async (expectedCanonicalAccountId) => {
        if (expectedCanonicalAccountId !== accountId)
          throw new Error('Submission ownership changed. Reload before retrying.');
        await assertBrowserAccountBinding(accountId, authSubjectId);
      },
    });
    queue.removeFromQueue(command.id);
    return { status: 'committed', commandId: command.id };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Submission could not be sent.';
    const status =
      cause && typeof cause === 'object' && 'status' in cause && typeof cause.status === 'number'
        ? cause.status
        : undefined;
    queue.updateMutation(command.id, {
      commandState: status === 401 ? 'auth_paused' : status === 409 ? 'conflict' : 'queued',
      lastError: message,
      lockLeaseExpiresAt: undefined,
    });
    throw new Error(message);
  }
}
