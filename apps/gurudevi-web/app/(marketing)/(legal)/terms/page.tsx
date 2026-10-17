import type { Metadata } from 'next';
import Link from 'next/link';
import { LEGAL_SUPPORT_EMAIL } from '../contact';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    "Gurudevi's first-draft Terms of Use for its public website and education ecology platform.",
};

export default function TermsPage() {
  return (
    <main className="reading-shell" id="main-content">
      <Link className="back-link" href="/">
        Gurudevi
      </Link>
      <article className="max-w-3xl space-y-7 font-sans text-[1.05rem] leading-8 text-ink-soft">
        <p className="kicker">A shared agreement</p>
        <h1 className="!mb-0 !font-serif !text-5xl !leading-tight !text-ink">Terms of Use</h1>
        <p>
          <strong>First draft — last updated 8 August 2026.</strong> These terms are a public
          working draft for review by the operating team and legal counsel. They should be finalized
          before paid plans, formal school agreements, or production student data are introduced.
        </p>
        <h2 className="!mb-0 !font-serif !text-2xl !text-ink">1. Using Gurudevi</h2>
        <p>
          Gurudevi provides tools and information intended to support healthy teaching, learning,
          reflection, collaboration, and school practice. You agree to use the service lawfully,
          respectfully, and only with the authority to provide information you submit.
        </p>
        <h2 className="!mb-0 !font-serif !text-2xl !text-ink">2. Accounts and responsibilities</h2>
        <p>
          Keep sign-in details secure and tell us promptly about suspected misuse. Institutions are
          responsible for assigning roles carefully, establishing appropriate safeguarding
          procedures, and ensuring that users have the required permissions.
        </p>
        <h2 className="!mb-0 !font-serif !text-2xl !text-ink">
          3. Content and intellectual property
        </h2>
        <p>
          You retain rights in content you submit, subject to the permissions needed for Gurudevi to
          host, display, secure, and process it for the service. EdLove owns its philosophical and
          research works; Gurudevi product materials are separate unless stated otherwise. Do not
          copy or republish another person’s work without permission.
        </p>
        <h2 className="!mb-0 !font-serif !text-2xl !text-ink">4. Safety and boundaries</h2>
        <p>
          Gurudevi is not a replacement for professional medical, psychological, legal,
          safeguarding, or emergency support. Do not use the service to expose private student or
          teacher information, harass others, bypass permissions, or make high-stakes decisions
          solely from automated summaries.
        </p>
        <h2 className="!mb-0 !font-serif !text-2xl !text-ink">5. Availability and changes</h2>
        <p>
          Early-stage features may change, be unavailable, or contain errors. We will work to
          protect data and communicate material changes, but cannot promise uninterrupted service or
          that every feature will remain available.
        </p>
        <h2 className="!mb-0 !font-serif !text-2xl !text-ink">6. Contact</h2>
        <p>
          Questions, safety concerns, and account requests can be sent to{' '}
          <a className="underline underline-offset-4" href={`mailto:${LEGAL_SUPPORT_EMAIL}`}>
            {LEGAL_SUPPORT_EMAIL}
          </a>
          . Final terms will identify the contracting entity, governing law, dispute process,
          service commitments, and institution-specific terms.
        </p>
      </article>
    </main>
  );
}
