import { CONTACT_EMAILS } from '@repo/core/site';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { SupportHub } from '../../../app/(sanctuary)/(support)/SupportHub';
import { SUPPORT_PAGE } from '../../../app/(sanctuary)/(support)/supportData';
import { getSupportConfig } from '../../../lib/support/supportConfig';
import { useSession } from '../../surface/session';

export const Route = createFileRoute('/_app/support')({
  head: () => ({
    meta: [{ title: SUPPORT_PAGE.title }, { name: 'description', content: SUPPORT_PAGE.description }],
  }),
  validateSearch: z.object({ school: z.string().optional() }),
  component: SupportScreen,
});

const BADGE = {
  explore: 'border-purple-200 bg-purple-100 text-purple-900',
  sanctuary: 'border-emerald-200 bg-emerald-100 text-emerald-900',
} as const;

function SupportScreen() {
  const { surface } = useSession();
  const { school } = Route.useSearch();
  const config = school ? getSupportConfig('school', school) : getSupportConfig(surface, null);

  return (
    <main id="main-content" className="min-h-screen px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 space-y-3">
          <span
            className={`rounded-full border px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider ${BADGE[surface]}`}
          >
            {config.badge}
          </span>
          <h1 className="text-3xl font-medium tracking-tight text-ink sm:text-5xl">
            {config.title}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-ink-soft">{config.description}</p>
        </header>
        <SupportHub
          config={config}
          supportEmail={CONTACT_EMAILS.support}
          institutionalEmail={CONTACT_EMAILS.institutional}
          gratitudeEmail={CONTACT_EMAILS.gratitude}
          formAction={process.env.NEXT_PUBLIC_SUPPORT_FORM_ACTION}
        />
      </div>
    </main>
  );
}
