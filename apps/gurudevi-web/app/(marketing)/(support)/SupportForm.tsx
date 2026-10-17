'use client';

import { FormEvent, useReducer } from 'react';

type IssueType = 'support' | 'bug' | 'feature' | 'feedback';

type Props = { supportEmail: string; formAction?: string };

type FormState = {
  issueType: IssueType;
  name: string;
  address: string;
  message: string;
  emailError: string | null;
  messageError: string | null;
  status: 'idle' | 'sending' | 'success' | 'error';
  submitError: string | null;
};

type FormAction =
  | { type: 'field'; field: 'issueType' | 'name' | 'address' | 'message'; value: string }
  | { type: 'validation'; emailError: string | null; messageError: string | null }
  | { type: 'sending' }
  | { type: 'success' }
  | { type: 'error'; message: string };

const initialState: FormState = {
  issueType: 'support',
  name: '',
  address: '',
  message: '',
  emailError: null,
  messageError: null,
  status: 'idle',
  submitError: null,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'field':
      return { ...state, [action.field]: action.value };
    case 'validation':
      return { ...state, emailError: action.emailError, messageError: action.messageError };
    case 'sending':
      return { ...state, status: 'sending', submitError: null };
    case 'success':
      return { ...state, name: '', address: '', message: '', status: 'success' };
    case 'error':
      return { ...state, status: 'error', submitError: action.message };
  }
}

function mailtoHref(
  email: string,
  issueType: IssueType,
  name: string,
  address: string,
  message: string,
) {
  const body = [
    `Type: ${issueType}`,
    name ? `Name: ${name}` : null,
    address ? `Email: ${address}` : null,
    '',
    message || '(message)',
  ]
    .filter((part): part is string => part !== null)
    .join('\n');
  return `mailto:${email}?subject=${encodeURIComponent(`Gurudevi (${issueType})`)}&body=${encodeURIComponent(body)}`;
}

export function SupportForm({ supportEmail, formAction }: Props) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailError =
      state.address && !/^\S+@\S+\.\S+$/.test(state.address)
        ? 'Enter a valid email address.'
        : null;
    const messageError = state.message.trim() ? null : 'Message is required.';
    dispatch({ type: 'validation', emailError, messageError });
    if (emailError || messageError || !formAction) return;

    dispatch({ type: 'sending' });
    const data = new FormData(event.currentTarget);
    data.set('source', 'gurudevi-web');
    data.set('page', window.location.href);
    data.set('ts', new Date().toISOString());
    void fetch(formAction, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        dispatch({ type: 'success' });
      })
      .catch((error: unknown) => {
        dispatch({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Something went wrong. Please use email instead.',
        });
      });
  }

  const fallbackHref = mailtoHref(
    supportEmail,
    state.issueType,
    state.name,
    state.address,
    state.message,
  );

  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-10">
      {!formAction ? (
        <div className="space-y-5">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">
            A direct email is the current support channel.
          </h2>
          <p className="leading-7 text-ink-soft">
            Our support form is not configured yet. Please email us and we’ll take care of you.
          </p>
          <a
            className="inline-flex min-h-12 items-center rounded-full bg-ink px-6 py-3 font-sans text-sm font-bold text-paper-light no-underline hover:bg-lotus focus:outline-3 focus:outline-offset-4 focus:outline-water"
            href={fallbackHref}
          >
            Email support ↗
          </a>
          <p className="text-sm text-ink-soft">
            Deployment prerequisite: set{' '}
            <code className="rounded bg-paper-light px-1.5 py-0.5">
              NEXT_PUBLIC_SUPPORT_FORM_ACTION
            </code>{' '}
            to a trusted HTTPS form endpoint before enabling submissions.
          </p>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={submit} noValidate>
          <div className="grid gap-6 md:grid-cols-3">
            <label className="space-y-2">
              <span className="block text-sm font-semibold">Type</span>
              <select
                className="min-h-12 w-full rounded-2xl border border-line bg-paper-light px-4 py-3 focus:outline-3 focus:outline-offset-2 focus:outline-water"
                name="type"
                value={state.issueType}
                onChange={(event) =>
                  dispatch({ type: 'field', field: 'issueType', value: event.target.value })
                }
              >
                <option value="support">Support</option>
                <option value="bug">Bug report</option>
                <option value="feature">Feature request</option>
                <option value="feedback">Feedback</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-semibold">
                Name <span className="font-normal text-ink-soft">(optional)</span>
              </span>
              <input
                className="min-h-12 w-full rounded-2xl border border-line bg-paper-light px-4 py-3 focus:outline-3 focus:outline-offset-2 focus:outline-water"
                name="name"
                type="text"
                autoComplete="name"
                value={state.name}
                onChange={(event) =>
                  dispatch({ type: 'field', field: 'name', value: event.target.value })
                }
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-semibold">
                Email <span className="font-normal text-ink-soft">(optional)</span>
              </span>
              <input
                className="min-h-12 w-full rounded-2xl border border-line bg-paper-light px-4 py-3 focus:outline-3 focus:outline-offset-2 focus:outline-water"
                name="email"
                type="email"
                autoComplete="email"
                value={state.address}
                onChange={(event) =>
                  dispatch({ type: 'field', field: 'address', value: event.target.value })
                }
                aria-invalid={Boolean(state.emailError)}
                aria-describedby={state.emailError ? 'support-email-error' : undefined}
              />
              {state.emailError ? (
                <span id="support-email-error" className="block text-sm text-red-700">
                  {state.emailError}
                </span>
              ) : null}
            </label>
          </div>
          <label className="block space-y-2">
            <span className="block text-sm font-semibold">Message</span>
            <textarea
              className="min-h-40 w-full rounded-3xl border border-line bg-paper-light px-5 py-4 focus:outline-3 focus:outline-offset-2 focus:outline-water"
              name="message"
              required
              value={state.message}
              onChange={(event) =>
                dispatch({ type: 'field', field: 'message', value: event.target.value })
              }
              aria-invalid={Boolean(state.messageError)}
              aria-describedby={state.messageError ? 'support-message-error' : undefined}
              placeholder="Tell us what’s happening (and what you hoped would happen)."
            />
            {state.messageError ? (
              <span id="support-message-error" className="block text-sm text-red-700">
                {state.messageError}
              </span>
            ) : null}
          </label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-8 py-3 font-sans text-sm font-bold text-paper-light hover:bg-lotus focus:outline-3 focus:outline-offset-4 focus:outline-water disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={state.status === 'sending'}
            >
              {state.status === 'sending' ? 'Sending…' : 'Send'}
            </button>
            <a className="text-sm text-ink-soft underline underline-offset-4" href={fallbackHref}>
              Prefer email? Contact {supportEmail}
            </a>
          </div>
          {state.status === 'success' ? (
            <p
              className="rounded-2xl border border-green-800/20 bg-green-50 p-4 font-semibold text-green-900"
              role="status"
            >
              Received. We’ll respond as soon as we can.
            </p>
          ) : null}
          {state.status === 'error' ? (
            <p
              className="rounded-2xl border border-red-800/20 bg-red-50 p-4 font-semibold text-red-900"
              role="alert"
            >
              {state.submitError ?? 'Something went wrong. Please use email instead.'}{' '}
              <a className="underline" href={fallbackHref}>
                Email support
              </a>
              .
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
