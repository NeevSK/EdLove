import { CONTACT_EMAILS } from '@repo/core/site';
import { ProvenanceCard } from './ProvenanceCard';

export function DeleteAccount() {
  const subject = encodeURIComponent('Delete my Gurudevi account');
  const body = encodeURIComponent(
    'Please delete my Gurudevi account.\n\nEmail or phone used to sign in: \nRole (Teacher/Student/Principal): \nSchool (if applicable): \n\nAdditional context (optional): ',
  );

  return (
    <main className="reading-shell" id="main-content">
      <a className="back-link" href="/">
        ← Back to Gurudevi
      </a>
      <article className="max-w-3xl space-y-7 font-sans text-[1.05rem] leading-8 text-ink-soft">
        <p className="kicker">Your data, your decision</p>
        <h1 className="!mb-0 !font-serif !text-5xl !leading-tight !text-ink">
          Account Deletion & Data Erasure
        </h1>

        <ProvenanceCard
          documentId="GD-GOV-2026-ERASURE"
          version="v1.2"
          lastUpdated="28 October 2026"
          governingFramework="Sri Lanka Personal Data Protection Act No. 9 of 2022 (Section 14)"
          custodian="Data Protection Officer & Account Security Team"
          status="Statutory Operational Protocol"
        >
          This procedure implements your statutory Right to Erasure under Section 14 of the Sri
          Lanka PDPA. We verify every request through cryptographic identity verification before
          committing irreversible mutations.
        </ProvenanceCard>

        <p className="lede">
          If you wish to terminate your account and remove associated personal records, you may
          initiate the process directly via this form or through the authenticated Sanctuary
          settings.
        </p>

        <section className="callout-box !p-6 sm:!p-8" aria-labelledby="request-heading">
          <h2 id="request-heading" className="!mb-4 !font-serif !text-2xl !text-ink">
            How to Submit an Erasure Request
          </h2>
          <ol className="list-decimal space-y-3 pl-6">
            <li>
              <strong>From Sanctuary Settings (Fastest):</strong> If you can sign in, navigate to
              Account Settings and select <em>“Request Account Deletion”</em>. This automatically
              binds your cryptographic identity token to the request.
            </li>
            <li>
              <strong>Via Direct Email Verification:</strong> If you cannot sign in or need manual
              assistance, email our Data Stewardship Board at{' '}
              <a className="underline underline-offset-4" href={`mailto:${CONTACT_EMAILS.support}`}>
                {CONTACT_EMAILS.support}
              </a>
              .
            </li>
            <li>
              Use the exact subject line:{' '}
              <span className="font-semibold text-ink">“Delete my Gurudevi account”</span>.
            </li>
            <li>
              Please provide the following verification details:
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
                <li>Primary email or phone number used to sign in</li>
                <li>Your institutional role (Teacher / Student / Principal / Guardian)</li>
                <li>Your school or organizational affiliation (if applicable)</li>
                <li>Any specific retention or migration concerns (optional)</li>
              </ul>
            </li>
          </ol>
          <div className="mt-6">
            <a
              className="button button--dark"
              href={`mailto:${CONTACT_EMAILS.support}?subject=${subject}&body=${body}`}
            >
              Email deletion request →
            </a>
          </div>
        </section>

        <section
          className="border border-line bg-paper-light/60 p-6 sm:p-8 rounded"
          aria-labelledby="after-request-heading"
        >
          <h2 id="after-request-heading" className="!mb-4 !font-serif !text-2xl !text-ink">
            What Happens Following Your Request
          </h2>
          <div className="space-y-4">
            <p>
              <strong>1. Verification & Soft Deactivation:</strong> Upon receiving your request, we
              verify account ownership and immediately apply a soft deactivation. This stops all
              active sessions, notification dispatches, and public or school-level visibility.
            </p>
            <p>
              <strong>2. Statutory Audit:</strong> Before executing cryptographic erasure, we review
              whether mandatory statutory retention rules apply (such as official Ministry of
              Education examination records, child safeguarding incident documentation, or
              anti-fraud requirements).
            </p>
            <p>
              <strong>3. Permanent Irreversible Purging:</strong> All remaining personal data,
              reflections, auth tokens, and local cache backups are permanently purged from primary
              storage and scheduled for irreversible garbage collection in our secure database
              partitions.
            </p>
          </div>
          <p className="mt-4 text-xs opacity-80 border-t border-line pt-3">
            For further information regarding retention categories and legal bases, consult the{' '}
            <a className="underline underline-offset-4" href="/privacy#retention-and-deletion">
              Data Retention & Erasure Policy
            </a>
            .
          </p>
        </section>

        <hr className="my-8 border-line" />
        <section className="text-xs text-ink-soft space-y-1">
          <p className="font-semibold text-ink">Revision Provenance History:</p>
          <p>
            • v1.2 (28 Oct 2026): Streamlined two-stage deletion protocol, clarified PDPA Section 14
            statutory alignment.
          </p>
          <p>• v1.1 (01 Sep 2026): Initial draft of account deletion guidelines.</p>
        </section>
      </article>
    </main>
  );
}
