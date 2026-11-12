'use client';

import { FormEvent, useEffect, useReducer } from 'react';
import { useTranslation } from '../../../lib/i18n';

export type IssueType =
  | 'support'
  | 'explore'
  | 'sanctuary'
  | 'bug'
  | 'feature'
  | 'contribute'
  | 'institutional'
  | 'feedback';

type Props = {
  supportEmail: string;
  formAction?: string;
  initialCategory?: IssueType;
};

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

const categoryLabels: Record<IssueType, string> = {
  support: 'General Support & Inquiries',
  explore: 'Explore Web & Guest House',
  sanctuary: 'Sanctuary Workspace & School Sync',
  bug: 'Report a Bug or Defect',
  feature: 'Feature Request / Idea',
  contribute: 'Contribute (Code, Curriculum, Translation)',
  institutional: 'School Onboarding & Pilot Request',
  feedback: 'General Experience Feedback',
};

const placeholderHints: Record<IssueType, string> = {
  support: 'How can we help? Describe what you are trying to accomplish.',
  explore:
    'Tell us about your experience in the Explore Guest House (which browser, device, or feature).',
  sanctuary: 'Describe what happened in your school workspace, attendance floor, or /self.',
  bug: 'What went wrong? Please include your browser (e.g. Chrome/Safari) and steps to reproduce.',
  feature: 'What new rhythm, practice, or capability would make your school or classroom lighter?',
  contribute:
    'Tell us how you would like to contribute (engineering, translations, curriculum materials, or research).',
  institutional:
    'Tell us about your school, location, number of classrooms, and preferred timeline.',
  feedback: 'Share your thoughts, impressions, or field notes with our care team.',
};

function createInitialState(initialCategory: IssueType = 'support'): FormState {
  return {
    issueType: initialCategory,
    name: '',
    address: '',
    message: '',
    emailError: null,
    messageError: null,
    status: 'idle',
    submitError: null,
  };
}

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
    `Category: ${categoryLabels[issueType]} (${issueType})`,
    name ? `Name: ${name}` : null,
    address ? `Email: ${address}` : null,
    '',
    message || '(message)',
  ]
    .filter((part): part is string => part !== null)
    .join('\n');
  return `mailto:${email}?subject=${encodeURIComponent(`Gurudevi [${issueType.toUpperCase()}]: ${categoryLabels[issueType]}`)}&body=${encodeURIComponent(body)}`;
}

export function SupportForm({ supportEmail, formAction, initialCategory = 'support' }: Props) {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(formReducer, initialCategory, createInitialState);

  useEffect(() => {
    if (initialCategory) {
      dispatch({ type: 'field', field: 'issueType', value: initialCategory });
    }
  }, [initialCategory]);

  const getCategoryLabel = (type: IssueType) =>
    t(`supportForm.categories.${type}`) || categoryLabels[type];

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
    data.set('category', state.issueType);
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
            {t('supportForm.directEmailTitle')}
          </h2>
          <p className="leading-7 text-ink-soft">{t('supportForm.directEmailBody')}</p>
          <a
            className="inline-flex min-h-12 items-center rounded-full bg-ink px-6 py-3 font-sans text-sm font-bold text-paper-light no-underline hover:bg-lotus focus:outline-3 focus:outline-offset-4 focus:outline-water"
            href={fallbackHref}
          >
            {t('supportForm.emailSupportCta')} ({getCategoryLabel(state.issueType)}) ↗
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
              <span className="block text-sm font-semibold">{t('supportForm.categoryLabel')}</span>
              <select
                className="min-h-12 w-full rounded-2xl border border-line bg-paper-light px-4 py-3 text-sm focus:outline-3 focus:outline-offset-2 focus:outline-water"
                name="type"
                value={state.issueType}
                onChange={(event) =>
                  dispatch({
                    type: 'field',
                    field: 'issueType',
                    value: event.target.value as IssueType,
                  })
                }
              >
                <option value="support">{getCategoryLabel('support')}</option>
                <option value="explore">{getCategoryLabel('explore')}</option>
                <option value="sanctuary">{getCategoryLabel('sanctuary')}</option>
                <option value="institutional">{getCategoryLabel('institutional')}</option>
                <option value="contribute">{getCategoryLabel('contribute')}</option>
                <option value="bug">{getCategoryLabel('bug')}</option>
                <option value="feature">{getCategoryLabel('feature')}</option>
                <option value="feedback">{getCategoryLabel('feedback')}</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-semibold">
                {t('supportForm.nameLabel')}{' '}
                <span className="font-normal text-ink-soft">{t('supportForm.optionalHint')}</span>
              </span>
              <input
                className="min-h-12 w-full rounded-2xl border border-line bg-paper-light px-4 py-3 text-sm focus:outline-3 focus:outline-offset-2 focus:outline-water"
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
                {t('supportForm.emailLabel')}{' '}
                <span className="font-normal text-ink-soft">{t('supportForm.optionalHint')}</span>
              </span>
              <input
                className="min-h-12 w-full rounded-2xl border border-line bg-paper-light px-4 py-3 text-sm focus:outline-3 focus:outline-offset-2 focus:outline-water"
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
            <span className="block text-sm font-semibold">{t('supportForm.messageLabel')}</span>
            <textarea
              className="min-h-40 w-full rounded-3xl border border-line bg-paper-light px-5 py-4 text-sm leading-relaxed focus:outline-3 focus:outline-offset-2 focus:outline-water"
              name="message"
              required
              value={state.message}
              onChange={(event) =>
                dispatch({ type: 'field', field: 'message', value: event.target.value })
              }
              aria-invalid={Boolean(state.messageError)}
              aria-describedby={state.messageError ? 'support-message-error' : undefined}
              placeholder={placeholderHints[state.issueType]}
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
              {state.status === 'sending'
                ? t('supportForm.sendingCta')
                : t('supportForm.submitCta')}
            </button>
            <a className="text-sm text-ink-soft underline underline-offset-4" href={fallbackHref}>
              Prefer direct email? Contact {supportEmail}
            </a>
          </div>
          {state.status === 'success' ? (
            <p
              className="rounded-2xl border border-green-800/20 bg-green-50 p-4 font-semibold text-green-900"
              role="status"
            >
              Received with gratitude. Our team will review and reply within 24–48 hours.
            </p>
          ) : null}
          {state.status === 'error' ? (
            <p
              className="rounded-2xl border border-red-800/20 bg-red-50 p-4 font-semibold text-red-900"
              role="alert"
            >
              {state.submitError ?? 'Something went wrong. Please use email instead.'}{' '}
              <a className="underline" href={fallbackHref}>
                Email support directly
              </a>
              .
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
