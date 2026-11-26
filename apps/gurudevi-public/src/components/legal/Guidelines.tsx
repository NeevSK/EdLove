import { CONTACT_EMAILS } from '@repo/core/site';
import { ProvenanceCard } from './ProvenanceCard';

export function Guidelines() {
  return (
    <main className="reading-shell" id="main-content">
      <a className="back-link" href="/">
        ← Back to Gurudevi
      </a>
      <article className="max-w-3xl space-y-7 font-sans text-[1.05rem] leading-8 text-ink-soft">
        <p className="kicker">An ecology of care</p>
        <h1 className="!mb-0 !font-serif !text-5xl !leading-tight !text-ink">
          Community Guidelines
        </h1>

        <ProvenanceCard
          documentId="GD-GOV-2026-GUIDE"
          version="v1.1"
          lastUpdated="28 October 2026"
          governingFramework="EdLove Convivial Sanctuary Charter & National Pedagogical Standards"
          custodian="Community Standards & Ethics Board"
          status="Official Public Draft"
        >
          Technology in Gurudevi exists to restore energy, protect human dignity, and cultivate
          joyful, convivial learning. Every participant—teacher, student, administrator, mentor, and
          guardian—shares in this stewardship.
        </ProvenanceCard>

        <h2 id="kindness" className="!mb-0 !font-serif !text-2xl !text-ink">
          1. Kindness is Not Optional
        </h2>
        <p>
          We communicate with warmth, patience, and mutual respect. Classrooms, community circles,
          and collaborative workspaces must remain safe environments where errors and misconceptions
          are embraced as natural, sacred steps in discovery rather than occasions for ridicule or
          chastisement.
        </p>

        <h2 id="dignity" className="!mb-0 !font-serif !text-2xl !text-ink">
          2. Safeguarding Student & Teacher Dignity
        </h2>
        <p>
          Gurudevi is an education sanctuary, not a panopticon. Private journals, personal
          struggles, attendance logs, and developmental grade assessments must never be weaponized,
          publicly shamed, or shared outside authorized institutional channels.
        </p>

        <h2 id="pedagogical-agency" className="!mb-0 !font-serif !text-2xl !text-ink">
          3. Respecting Pedagogical Agency
        </h2>
        <p>
          Teachers are first-class beneficiaries and co-creators of our ecology. Software should
          lift administrative drudgery—never enclose human relationships, prescribe rigid lockstep
          scripts, or micromanage educators. We honor the rich diversity of teaching traditions
          across all provinces and communities in Sri Lanka.
        </p>

        <h2 id="knowledge-sharing" className="!mb-0 !font-serif !text-2xl !text-ink">
          4. Generous & Responsible Knowledge Sharing
        </h2>
        <p>
          When contributing lesson designs, reflection prompts, or resource collections to shared
          libraries, ensure content is accurate, culturally respectful, and free of commercial
          exploitation. Always acknowledge original authors and institutional sources.
        </p>

        <h2 id="zero-tolerance" className="!mb-0 !font-serif !text-2xl !text-ink">
          5. Zero Tolerance for Bullying, Harassment & Discrimination
        </h2>
        <p>
          Any form of cyberbullying, harassment, discrimination based on ethnicity, language,
          gender, or religious faith, hate speech, or predatory data harvesting will result in
          immediate account suspension and prompt escalation to institutional safeguarding
          leadership.
        </p>

        <h2 id="reporting" className="!mb-0 !font-serif !text-2xl !text-ink">
          6. Getting Help and Reporting Concerns
        </h2>
        <p>
          If you encounter interactions that compromise safety, psychological well-being, or human
          dignity, report the matter immediately to{' '}
          <a className="underline underline-offset-4" href={`mailto:${CONTACT_EMAILS.support}`}>
            {CONTACT_EMAILS.support}
          </a>
          . All reports are investigated with prompt care, strict confidentiality, and protective
          empathy.
        </p>

        <hr className="my-8 border-line" />
        <section className="text-xs text-ink-soft space-y-1">
          <p className="font-semibold text-ink">Revision Provenance History:</p>
          <p>
            • v1.1 (28 Oct 2026): Codified Convivial Sanctuary Charter, established reporting
            protocols.
          </p>
        </section>
      </article>
    </main>
  );
}
