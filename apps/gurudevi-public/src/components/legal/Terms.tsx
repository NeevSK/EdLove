import { CONTACT_EMAILS } from '@repo/core/site';
import { ProvenanceCard } from './ProvenanceCard';

export function Terms() {
  return (
    <main className="reading-shell" id="main-content">
      <a className="back-link" href="/">
        ← Back to Gurudevi
      </a>
      <article className="max-w-3xl space-y-7 font-sans text-[1.05rem] leading-8 text-ink-soft">
        <p className="kicker">A shared agreement</p>
        <h1 className="!mb-0 !font-serif !text-5xl !leading-tight !text-ink">Terms of Use</h1>

        <ProvenanceCard
          documentId="GD-GOV-2026-TERM"
          version="v1.2"
          lastUpdated="28 October 2026"
          governingFramework="Democratic Socialist Republic of Sri Lanka & EdLove Charter"
          custodian="Platform Legal Counsel & Ethics Council"
          status="Official Public Draft"
        >
          These terms establish the mutual operational covenants between users (educators, learners,
          schools, and administrators) and the Gurudevi Platform Stewardship.
        </ProvenanceCard>

        <h2 id="using-gurudevi" className="!mb-0 !font-serif !text-2xl !text-ink">
          1. Purpose and Permitted Use
        </h2>
        <p>
          Gurudevi provides tools and information intended to nurture healthy teaching, reflective
          learning, institutional coordination, and school community collaboration. You agree to use
          the service lawfully, respectfully, and only with the authority to submit data on behalf
          of yourself or your recognized educational institution.
        </p>

        <h2 id="accounts-and-responsibilities" className="!mb-0 !font-serif !text-2xl !text-ink">
          2. Accounts, Authentication & Institutional Authority
        </h2>
        <p>
          Account credentials must remain confidential. Users are responsible for actions taken
          under their account. Educational institutions are responsible for assigning administrative
          and pedagogical roles appropriately, verifying staff permissions, and ensuring
          safeguarding compliance across classroom environments.
        </p>

        <h2 id="intellectual-property" className="!mb-0 !font-serif !text-2xl !text-ink">
          3. Content Ownership & Intellectual Property
        </h2>
        <p>
          <strong>Educator & Student Ownership:</strong> You retain complete moral and intellectual
          rights to original teaching plans, reflections, and assignments submitted to Gurudevi,
          granting only non-exclusive operational licenses necessary to render and sync the content.
        </p>
        <p>
          EdLove Foundation reserves rights in its foundational research, typography, codebases, and
          philosophical publications. No user may scrape, replicate, or commercially exploit
          platform materials without prior written sanction.
        </p>

        <h2 id="safety-and-boundaries" className="!mb-0 !font-serif !text-2xl !text-ink">
          4. Safety, Safeguarding & Algorithmic Boundaries
        </h2>
        <p>
          Gurudevi is designed as a convivial assistive tool. It is not an automated disciplinarian,
          surveillance apparatus, or a substitute for licensed psychiatric, medical, or child
          safeguarding interventions. High-stakes academic, pastoral, or career decisions must never
          be executed solely through automated platform heuristics.
        </p>

        <h2 id="guidelines" className="!mb-0 !font-serif !text-2xl !text-ink">
          5. Community Conduct and Anti-Abuse
        </h2>
        <p>
          Participation across all platform surfaces is governed by our{' '}
          <a className="underline underline-offset-4" href="/guidelines">
            Community Guidelines
          </a>
          . Harassment, unauthorized identity spoofing, hate speech, automated scraping, or attempts
          to breach tenant boundaries will result in immediate termination of platform access.
        </p>

        <h2 id="availability-and-evolution" className="!mb-0 !font-serif !text-2xl !text-ink">
          6. Availability, SLA & Graceful Evolution
        </h2>
        <p>
          We commit to high availability, local offline-first continuity, and transparent security
          practices. However, experimental and beta features may evolve. Where structural changes
          impact access or pedagogy, we provide advance notice to school administrators.
        </p>

        <h2 id="contact-and-disputes" className="!mb-0 !font-serif !text-2xl !text-ink">
          7. Legal Notices and Dispute Resolution
        </h2>
        <p>
          Formal notices, legal queries, or institutional agreement requests should be directed to{' '}
          <a className="underline underline-offset-4" href={`mailto:${CONTACT_EMAILS.support}`}>
            {CONTACT_EMAILS.support}
          </a>
          .
        </p>

        <hr className="my-8 border-line" />
        <section className="text-xs text-ink-soft space-y-1">
          <p className="font-semibold text-ink">Revision Provenance History:</p>
          <p>
            • v1.2 (28 Oct 2026): Added cross-reference to Community Guidelines, clarified
            non-surveillance boundary.
          </p>
          <p>• v1.1 (08 Aug 2026): Initial working draft for stakeholder review.</p>
        </section>
      </article>
    </main>
  );
}
