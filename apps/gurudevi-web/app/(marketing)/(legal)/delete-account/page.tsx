import type { Metadata } from 'next';
import Link from 'next/link';
import { LEGAL_SUPPORT_EMAIL } from '../contact';

export const metadata: Metadata = { title: 'Delete Account' };

export default function DeleteAccountPage() {
  const subject = encodeURIComponent('Delete my Gurudevi account');
  const body = encodeURIComponent(
    'Please delete my Gurudevi account.\n\nEmail or phone used to sign in: \nRole (Teacher/Student/Principal): \nSchool (if applicable): \n\nAdditional context (optional): ',
  );

  return (
    <main className="reading-shell" id="main-content">
      <Link className="back-link" href="/">
        Gurudevi
      </Link>
      <article className="max-w-3xl space-y-7 font-sans text-[1.05rem] leading-8 text-ink-soft">
        <p className="kicker">Your data, your decision</p>
        <h1 className="!mb-0 !font-serif !text-5xl !leading-tight !text-ink">
          Delete your Gurudevi account
        </h1>
        <p className="lede">
          Request deletion here if you cannot access the app. We verify each request before changing
          an account or its data.
        </p>
        <section
          className="border border-line bg-paper-light p-6 sm:p-8"
          aria-labelledby="request-heading"
        >
          <h2 id="request-heading" className="!mb-4 !font-serif !text-2xl !text-ink">
            How to request deletion
          </h2>
          <ol className="list-decimal space-y-3 pl-6">
            <li>
              If you can sign in, use the account deletion option in Gurudevi. This is the fastest
              way to associate a request with your account.
            </li>
            <li>
              Email us at{' '}
              <a className="underline underline-offset-4" href={`mailto:${LEGAL_SUPPORT_EMAIL}`}>
                {LEGAL_SUPPORT_EMAIL}
              </a>
              .
            </li>
            <li>
              Use the subject: <span className="font-semibold">“Delete my Gurudevi account”</span>.
            </li>
            <li>
              Include:
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>The email/phone number you used to sign in</li>
                <li>Your role (Teacher / Student / Principal)</li>
                <li>Your school name (if applicable)</li>
                <li>Any context you want us to know (optional)</li>
              </ul>
            </li>
          </ol>
          <a
            className="primary-action"
            href={`mailto:${LEGAL_SUPPORT_EMAIL}?subject=${subject}&body=${body}`}
          >
            Email deletion request
          </a>
        </section>
        <section
          className="border border-line bg-paper-light/60 p-6 sm:p-8"
          aria-labelledby="after-request-heading"
        >
          <h2 id="after-request-heading" className="!mb-4 !font-serif !text-2xl !text-ink">
            What happens after a request
          </h2>
          <p>
            We acknowledge the request, verify that it comes from the account holder, and check
            whether a school, guardian, safety, fraud-prevention, or legal retention obligation
            affects the request. Once verified, the account is soft-deactivated while the deletion
            is scheduled; this stops normal access but is not presented as completed deletion.
          </p>
          <p className="text-sm opacity-80">
            When deletion is completed, we delete or anonymize account-associated data unless a
            specific security, fraud-prevention, institutional recordkeeping, safeguarding, or legal
            obligation requires limited retention. If that applies, we will explain the category and
            basis before completion. Read the{' '}
            <Link className="underline underline-offset-4" href="/privacy#retention-and-deletion">
              retention and deletion policy
            </Link>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
