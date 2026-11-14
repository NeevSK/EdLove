import { CONTACT_EMAILS } from '@repo/core/site';
import { ProvenanceCard } from './ProvenanceCard';

export function PrivacyPolicy() {
  return (
    <main className="reading-shell" id="main-content">
      <a className="back-link" href="/">
        ← Back to Gurudevi
      </a>
      <article className="max-w-3xl space-y-7 font-sans text-[1.05rem] leading-8 text-ink-soft">
        <p className="kicker">Trust and boundaries</p>
        <h1 className="!mb-0 !font-serif !text-5xl !leading-tight !text-ink">Privacy Policy</h1>

        <ProvenanceCard
          documentId="GD-GOV-2026-PRIV"
          version="v1.2"
          lastUpdated="28 October 2026"
          governingFramework="Sri Lanka PDPA No. 9 of 2022 & EdLove Sanctuary Charter"
          custodian="Safeguarding & Data Governance Board"
          status="Official Public Draft"
        >
          This policy serves as a binding commitment to educators, students, and families. It is
          structured to align directly with the statutory obligations of the Sri Lanka Personal Data
          Protection Act No. 9 of 2022 before production student telemetry is accepted.
        </ProvenanceCard>

        <h2 id="audience" className="!mb-0 !font-serif !text-2xl !text-ink">
          1. Scope and Beneficiaries
        </h2>
        <p>
          Gurudevi is an education ecology support system for teachers, students, principals,
          administrators, schools, and communities in Sri Lanka. Teachers and students are
          first-class design beneficiaries; neither is ever treated as an extractive data source or
          advertising subject.
        </p>

        <h2 id="information-handled" className="!mb-0 !font-serif !text-2xl !text-ink">
          2. Information We Handle
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Identity & Account Details:</strong> Name, institutional email, phone number,
            role (Educator, Student, Principal, Guardian), school registration, and cryptographic
            auth identifiers.
          </li>
          <li>
            <strong>Pedagogical & Reflection Data:</strong> Lesson plans, reflections, educational
            resources, student assessment summaries, and collaborative workspace notes.
          </li>
          <li>
            <strong>Operational Telemetry:</strong> Device security states, network stability logs,
            approximate regional locale (to route to the closest island node), and crash reports.
          </li>
          <li>
            <strong>Optional Sensory Analytics:</strong> Enabled only when explicitly permitted via
            the PDPA consent banner.
          </li>
        </ul>

        <h2 id="use-of-information" className="!mb-0 !font-serif !text-2xl !text-ink">
          3. How We Use Information
        </h2>
        <p>
          Data is processed strictly to provide educational services, protect classroom safety,
          prevent abuse, and fulfill institutional duties. We operate under a non-commercial
          covenant:
        </p>
        <div className="callout-box">
          <p className="font-semibold text-ink">Our Absolute Data Covenant:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>We do not sell, rent, or monetize personal information.</li>
            <li>We do not build surveillance profiles across schools.</li>
            <li>We do not run behavioral advertising algorithms against children or educators.</li>
          </ul>
        </div>

        <h2 id="role-boundaries" className="!mb-0 !font-serif !text-2xl !text-ink">
          4. Role Boundaries and Information Silos
        </h2>
        <p>
          Access follows strict cryptographic boundaries matching user roles. School-level
          analytical summaries must never compromise personal teacher journals or private student
          pastoral reflections. Third-party infrastructure partners process encrypted data only as
          necessary to operate the service under binding data processing agreements.
        </p>

        <h2 id="child-safeguarding" className="!mb-0 !font-serif !text-2xl !text-ink">
          5. Safeguarding Children and Schools
        </h2>
        <p>
          Classroom environments often utilize shared tablets and institutional terminals. Schools
          and legal guardians retain primary authority. The platform enforces minimal data
          collection principles, enforces age-appropriate content filters, and prevents unintended
          public exposure of minor details.
        </p>

        <h2 id="retention-and-deletion" className="!mb-0 !font-serif !text-2xl !text-ink">
          6. Retention, Rectification & Right to Erasure
        </h2>
        <p>
          Under Section 14 of the Sri Lanka PDPA, data subjects retain the right to request erasure
          and rectification. Requests can be submitted directly via{' '}
          <a className="underline underline-offset-4" href="/delete-account">
            the Account Deletion portal
          </a>{' '}
          or through in-app administrative controls.
        </p>
        <p>
          Deletion requests trigger a two-phase protocol: immediate cryptographic soft-deactivation
          followed by secure permanent purging, subject only to mandatory institutional
          recordkeeping or child protection obligations.
        </p>

        <h2 id="cookies-and-storage" className="!mb-0 !font-serif !text-2xl !text-ink">
          7. Local Storage and Analytics Controls
        </h2>
        <p>
          We utilize localized client storage (e.g. secure browser cookies and local tokens) solely
          for authentication sessions and diurnal circadian theme preferences. Optional telemetry is
          disabled by default until consented to via the PDPA consent interface.
        </p>

        <h2 id="contact-and-redress" className="!mb-0 !font-serif !text-2xl !text-ink">
          8. Inquiries, Data Protection Officer & Redress
        </h2>
        <p>
          For data protection queries, supervisory inquiries, or rights enforcement, contact the
          Gurudevi Data Stewardship Board at{' '}
          <a className="underline underline-offset-4" href={`mailto:${CONTACT_EMAILS.support}`}>
            {CONTACT_EMAILS.support}
          </a>
          .
        </p>

        <hr className="my-8 border-line" />
        <section className="text-xs text-ink-soft space-y-1">
          <p className="font-semibold text-ink">Revision Provenance History:</p>
          <p>
            • v1.2 (28 Oct 2026): Harmonized cross-subdomain references, codified PDPA Section 14
            erasure protocol.
          </p>
          <p>
            • v1.1 (01 Sep 2026): Initial public draft with school safeguarding and data covenant
            boundaries.
          </p>
        </section>
      </article>
    </main>
  );
}
