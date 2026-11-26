<script lang="ts">
import { CONTACT_EMAILS } from '../lib/site';

const formAction = import.meta.env.PUBLIC_SUPPORT_FORM_ACTION as string | undefined;
const SUPPORT_EMAIL = CONTACT_EMAILS.support;

type IssueType = 'support' | 'bug' | 'feature' | 'feedback';

const issueTypeOptions: { value: IssueType; label: string }[] = [
  { value: 'support', label: 'Support' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'feedback', label: 'Feedback' },
];

let issueType = $state<IssueType>('support');
let name = $state('');
let email = $state('');
let message = $state('');

let errors = $state<{ email?: string; message?: string }>({});
let isSubmitting = $state(false);
let submitSuccess = $state(false);
let submitError = $state<string | null>(null);

function validateEmail(val: string): boolean {
  if (!val) return true; // optional
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(val);
}

function validate(): boolean {
  const newErrors: { email?: string; message?: string } = {};
  if (email && !validateEmail(email)) {
    newErrors.email = 'Invalid email format';
  }
  if (!message.trim()) {
    newErrors.message = 'Message is required';
  }
  errors = newErrors;
  return Object.keys(newErrors).length === 0;
}

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault();
  submitError = null;
  submitSuccess = false;

  if (!validate()) return;
  if (!formAction) return;

  isSubmitting = true;
  try {
    const formData = new FormData();
    formData.set('source', 'gurudevi-web');
    formData.set('type', issueType);
    formData.set('name', name);
    formData.set('email', email);
    formData.set('message', message);
    formData.set('page', window.location.href);
    formData.set('ts', new Date().toISOString());

    const res = await fetch(formAction, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(`Request failed (${res.status})`);

    submitSuccess = true;
    name = '';
    email = '';
    message = '';
  } catch (err: any) {
    submitError = err.message || 'Something went wrong. Please use email instead.';
  } finally {
    isSubmitting = false;
  }
}

function mailtoHref() {
  const subject = `Gurudevi (${issueType})`;
  const body = [
    `Type: ${issueType}`,
    name ? `Name: ${name}` : null,
    email ? `Email: ${email}` : null,
    '',
    message || '(message)',
  ]
    .filter(Boolean)
    .join('\n');

  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
</script>

<div class="bg-white rounded-3xl border border-mud-brown/10 shadow-sm p-8 md:p-10">
  {#if !formAction}
    <div class="space-y-4">
      <p class="text-mud-brown">
        Our support form is not configured yet. Please email us and we’ll take care of you.
      </p>
      <a
        class="inline-block px-8 py-3 bg-sanctuary-saffron text-white rounded-full font-bold hover:bg-peacock-blue transition-all"
        href={mailtoHref()}
      >
        Email Support
      </a>
    </div>
  {:else}
    <form
      class="space-y-6"
      onsubmit={handleSubmit}
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <label class="space-y-2">
          <div class="text-sm font-semibold text-mud-brown">Type</div>
          <select
            class="w-full rounded-2xl border border-mud-brown/20 bg-temple-stone/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sanctuary-saffron/40"
            bind:value={issueType}
            aria-label="Issue type"
          >
            {#each issueTypeOptions as t}
              <option value={t.value}>{t.label}</option>
            {/each}
          </select>
        </label>

        <label class="space-y-2">
          <div class="text-sm font-semibold text-mud-brown">Name (optional)</div>
          <input
            class="w-full rounded-2xl border border-mud-brown/20 bg-temple-stone/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sanctuary-saffron/40 ph-no-capture"
            type="text"
            bind:value={name}
            autocomplete="name"
          />
        </label>

        <label class="space-y-2">
          <div class="text-sm font-semibold text-mud-brown">Email (optional)</div>
          <input
            class="w-full rounded-2xl border border-mud-brown/20 bg-temple-stone/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sanctuary-saffron/40 ph-no-capture"
            type="email"
            bind:value={email}
            autocomplete="email"
            inputmode="email"
          />
          {#if errors.email}
            <p class="text-xs text-ember-red mt-1">{errors.email}</p>
          {/if}
        </label>
      </div>

      <label class="space-y-2 block">
        <div class="text-sm font-semibold text-mud-brown">Message</div>
        <textarea
          class="w-full min-h-40 rounded-3xl border border-mud-brown/20 bg-temple-stone/30 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-sanctuary-saffron/40"
          bind:value={message}
          required
          aria-label="Message"
          placeholder="Tell us what’s happening (and what you hoped would happen)."
        ></textarea>
        {#if errors.message}
          <p class="text-xs text-ember-red mt-1">{errors.message}</p>
        {/if}
      </label>

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <button
          type="submit"
          class="px-10 py-4 bg-void-indigo text-sacred-white rounded-full font-bold shadow-xl hover:bg-peacock-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Send"}
        </button>

        <a class="text-sm text-mud-brown/70 hover:text-mud-brown transition-colors" href={mailtoHref()}>
          Prefer email? Contact support@gurudevi.lk
        </a>
      </div>

      {#if submitSuccess}
        <div class="mt-4 rounded-2xl bg-sage-green/10 border border-sage-green/20 p-4 text-sage-green font-semibold">
          Received. We’ll respond as soon as we can.
        </div>
      {/if}

      {#if submitError}
        <div class="mt-4 rounded-2xl bg-ember-red/10 border border-ember-red/20 p-4 text-ember-red font-semibold">
          {submitError}
        </div>
      {/if}
    </form>
  {/if}
</div>
