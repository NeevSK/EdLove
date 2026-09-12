import type { Metadata } from 'next';
import { SupportForm } from '../SupportForm';

export const metadata: Metadata = {
  title: 'Support & Feedback',
  description: 'Ask for help, report a problem, share feedback, or start a school conversation with Gurudevi.',
};

const supportEmail = 'support@gurudevi.lk';
const institutionalEmail = 'institutional@gurudevi.lk';
const gratitudeEmail = 'gratitude@gurudevi.lk';

function emailLink(email: string, subject: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

export default function SupportPage() {
  return (
    <main id="main-content">
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-8 lg:px-16 lg:py-32">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">Support</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-medium leading-[0.97] tracking-[-0.06em] sm:text-7xl">
          Tell us what would make the work lighter.
        </h1>
        <p className="mt-8 max-w-3xl text-xl leading-9 text-ink-soft">
          Report a problem, share feedback, request a feature, or ask about bringing Gurudevi to your school.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 border-y border-line px-4 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-16 lg:py-24">
        <div>
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">A direct line</p>
          <h2 className="mt-4 max-w-xl text-4xl font-medium tracking-[-0.04em] sm:text-5xl">We are still listening closely.</h2>
          <p className="mt-7 max-w-xl text-lg leading-8 text-ink-soft">
            Gurudevi is being shaped with the people who will use it. Your report helps us understand where the system needs to become more useful, more careful, or more clear.
          </p>
          <nav aria-label="Support contacts" className="mt-8 grid gap-3 font-sans text-sm font-bold">
            <a className="min-h-11 w-fit items-center underline decoration-lotus/60 underline-offset-4" href={emailLink(supportEmail, 'Gurudevi Support')}>
              Support &amp; bugs ↗
            </a>
            <a className="min-h-11 w-fit items-center underline decoration-lotus/60 underline-offset-4" href={emailLink(institutionalEmail, 'Gurudevi School conversation')}>
              School conversation ↗
            </a>
            <a className="min-h-11 w-fit items-center underline decoration-lotus/60 underline-offset-4" href={emailLink(gratitudeEmail, 'Gurudevi Thuthimal')}>
              Thuthimal ↗
            </a>
          </nav>
        </div>
        <SupportForm supportEmail={supportEmail} formAction={process.env.NEXT_PUBLIC_SUPPORT_FORM_ACTION} />
      </section>
    </main>
  );
}
