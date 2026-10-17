import type { Metadata } from 'next';
import Link from 'next/link';
import { LEGAL_SUPPORT_EMAIL } from '../contact';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: "Gurudevi's first-draft Privacy Policy for the education ecology support system.",
};

export default function PrivacyPage() {
  return (
    <main className="reading-shell" id="main-content">
      <Link className="back-link" href="/">
        Gurudevi
      </Link>
      <article className="max-w-3xl space-y-7 font-sans text-[1.05rem] leading-8 text-ink-soft">
        <p className="kicker">Trust and boundaries</p>
        <h1 className="!mb-0 !font-serif !text-5xl !leading-tight !text-ink">Privacy Policy</h1>
        <p>
          <strong>First draft — last updated 1 September 2026.</strong> This page is a practical
          public draft for review. It is not legal advice and will be reviewed for the final
          operating entity, jurisdictions, school agreements, and applicable Sri Lankan requirements
          before production launch.
        </p>

        <h2 className="!mb-0 !font-serif !text-2xl !text-ink">1. Who this is for</h2>
        <p>
          Gurudevi is an education ecology support system for teachers, students, principals,
          administrators, schools, and communities in Sri Lanka. Teachers are a first-class design
          beneficiary, but no role is treated as merely a data source.
        </p>

        <h2 className="!mb-0 !font-serif !text-2xl !text-ink">2. Information we may handle</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Account details such as name, email, role, school, language, and sign-in identifiers.
          </li>
          <li>
            Workspace information that a user or institution chooses to create, such as resources,
            plans, reflections, messages, and learning activity.
          </li>
          <li>
            Technical information needed for security and reliability, such as device, browser,
            logs, approximate region, and error reports.
          </li>
          <li>Optional analytics events only when the visitor gives consent.</li>
        </ul>

        <h2 className="!mb-0 !font-serif !text-2xl !text-ink">3. How we use information</h2>
        <p>
          We use information to provide and secure the service, support learning and teaching
          workflows, respond to requests, improve usability, prevent abuse, meet legal obligations,
          and communicate important service changes. We do not sell personal information or build
          surveillance profiles.
        </p>

        <h2 className="!mb-0 !font-serif !text-2xl !text-ink">4. Role boundaries and sharing</h2>
        <p>
          Access should follow the user’s role, context, and permissions. School-level summaries
          must not become a shortcut to private reflections or personal struggles. We share
          information with service providers only when needed to operate the service, with
          institutions where their agreement and permissions require it, or when law and safety
          obligations require it.
        </p>

        <h2 className="!mb-0 !font-serif !text-2xl !text-ink">
          5. Children and school communities
        </h2>
        <p>
          School use may involve students and shared devices. Institutions and guardians remain
          responsible for appropriate consent and supervision where required. The product should
          collect the minimum information needed, provide age-appropriate experiences, and avoid
          unnecessary public exposure of student information.
        </p>

        <h2 id="retention-and-deletion" className="!mb-0 !font-serif !text-2xl !text-ink">
          6. Retention and deletion
        </h2>
        <p>
          We retain information only for as long as needed for the stated purpose, safety, dispute
          resolution, institutional recordkeeping, or legal obligations. You can request deletion or
          correction through{' '}
          <Link className="underline underline-offset-4" href="/delete-account">
            the account deletion page
          </Link>{' '}
          or, when available, from the account controls in the app.
        </p>
        <p>
          A deletion request is not silently treated as completed. We verify the requester, assess
          safeguarding, custody, school-record, security, fraud-prevention, and legal-retention
          obligations, then soft-deactivate the account while a permitted deletion is scheduled.
          Soft deactivation stops ordinary account access; it is not a substitute for deletion.
        </p>
        <p>
          When a request can be completed, we delete or anonymize associated account data. Where a
          category must be retained, we keep only what is necessary for the stated obligation and
          explain the category and basis to the requester. This operating policy is a pre-launch
          draft: exact retention periods and the responsible operating entity will be finalized with
          legal counsel and applicable school agreements before production student data is accepted.
        </p>

        <h2 className="!mb-0 !font-serif !text-2xl !text-ink">7. Cookies and analytics</h2>
        <p>
          Essential storage may remember basic site preferences. Optional analytics is disabled
          until you choose “Allow analytics” in the consent notice. You can withdraw that choice by
          clearing site storage or contacting us. This draft does not promise that every future
          vendor or integration will use the same data practices; those will be documented before
          activation.
        </p>

        <h2 className="!mb-0 !font-serif !text-2xl !text-ink">8. Contact and changes</h2>
        <p>
          For privacy questions or requests, email{' '}
          <a className="underline underline-offset-4" href={`mailto:${LEGAL_SUPPORT_EMAIL}`}>
            {LEGAL_SUPPORT_EMAIL}
          </a>
          . We will publish material changes on this page with a new update date.
        </p>
      </article>
    </main>
  );
}
