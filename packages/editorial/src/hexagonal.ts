import {
  type ContentKind,
  canTransitionSubmission,
  type EditorialSubmission,
  type EditorialWork,
  type FacultyReviewInput,
  type IEdgeDomainResolutionPort,
  type IEditorialContentStoragePort,
  type IEditorialPublishingPort,
  type ISandboxedPluginPort,
  type PublishedSchoolArticle,
  type StudentSubmissionDraft,
} from './domain';

/**
 * EmDashHexagonalAdapter
 *
 * Implements the Hexagonal Bridge between Cloudflare EmDash edge semantics
 * (Astro, Workers, D1 SQLite, R2 zero-egress storage) and Gurudevi's core editorial domain.
 * This adapter remains completely pure and decoupled from external Node/Edge/Browser runtimes.
 */
export class EmDashHexagonalAdapter
  implements
    IEditorialPublishingPort,
    IEditorialContentStoragePort,
    IEdgeDomainResolutionPort,
    ISandboxedPluginPort
{
  private readonly submissions = new Map<string, EditorialSubmission>();
  private readonly works = new Map<string, EditorialWork>();
  private readonly published = new Map<string, PublishedSchoolArticle>();
  private readonly hostRegistry = new Map<string, { schoolId: string; handle: string }>();

  constructor(initialHosts?: Record<string, { schoolId: string; handle: string }>) {
    if (initialHosts) {
      for (const [host, target] of Object.entries(initialHosts)) {
        this.hostRegistry.set(host.toLowerCase(), target);
      }
    }
  }

  // --- Inbound Publishing Port ---

  async submitStudentDraft(draft: StudentSubmissionDraft): Promise<EditorialSubmission> {
    const now = new Date().toISOString();
    const id = `sub-${draft.schoolId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const submission: EditorialSubmission = {
      id,
      publication: 'gurudevi',
      kind: draft.kind,
      title: draft.title,
      summary: draft.summary,
      body: draft.body,
      language: draft.language,
      submitterId: draft.authorId,
      rightsAgreementId: draft.rightsAgreementId,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
      schoolId: draft.schoolId,
      subEntityId: draft.subEntityId,
    };

    await this.saveSubmission(submission);
    return submission;
  }

  async reviewSubmission(
    submissionId: string,
    review: FacultyReviewInput,
  ): Promise<EditorialSubmission> {
    const existing = await this.getSubmission(submissionId);
    if (!existing) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    if (!canTransitionSubmission(existing.status, review.decision)) {
      throw new Error(
        `Illegal transition from '${existing.status}' to '${review.decision}' for submission ${submissionId}`,
      );
    }

    const updated: EditorialSubmission = {
      ...existing,
      status: review.decision,
      reviewerId: review.reviewerId,
      decisionNote: review.decisionNote,
      updatedAt: new Date().toISOString(),
    };

    await this.saveSubmission(updated);
    return updated;
  }

  async publishApprovedWork(submissionId: string, slug: string): Promise<PublishedSchoolArticle> {
    const submission = await this.getSubmission(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    if (submission.status !== 'approved') {
      throw new Error(
        `Cannot publish submission ${submissionId} with status '${submission.status}'. Must be 'approved'.`,
      );
    }

    const now = new Date().toISOString();
    const workId = `work-${submission.schoolId}-${slug}`;

    const publishedArticle: PublishedSchoolArticle = {
      workId,
      schoolId: submission.schoolId ?? 'unknown',
      subEntityId: submission.subEntityId,
      title: submission.title,
      summary: submission.summary,
      body: submission.body,
      language: submission.language,
      slug,
      publishedAt: now,
      authorIds: [submission.submitterId],
    };

    const work: EditorialWork = {
      id: workId,
      publication: 'gurudevi',
      kind: submission.kind,
      status: 'published',
      canonicalSlug: slug,
      contributions: [
        {
          authorId: submission.submitterId,
          role: 'author',
          credit: 'Student Reporter',
        },
      ],
      schoolId: submission.schoolId,
      subEntityId: submission.subEntityId,
    };

    await this.saveWork(work);
    this.published.set(`${submission.schoolId}:${slug}`, publishedArticle);

    return publishedArticle;
  }

  // --- Outbound Storage Port ---

  async saveWork(work: EditorialWork): Promise<void> {
    this.works.set(work.id, work);
  }

  async saveSubmission(submission: EditorialSubmission): Promise<void> {
    this.submissions.set(submission.id, submission);
  }

  async getSubmission(id: string): Promise<EditorialSubmission | undefined> {
    return this.submissions.get(id);
  }

  async getWorkBySlug(schoolId: string, slug: string): Promise<PublishedSchoolArticle | undefined> {
    return this.published.get(`${schoolId}:${slug}`);
  }

  async listSchoolPublished(schoolId: string): Promise<ReadonlyArray<PublishedSchoolArticle>> {
    const results: PublishedSchoolArticle[] = [];
    for (const article of this.published.values()) {
      if (article.schoolId === schoolId) {
        results.push(article);
      }
    }
    return results;
  }

  // --- Outbound Edge Domain Router Port ---

  registerHost(hostname: string, schoolId: string, handle: string): void {
    this.hostRegistry.set(hostname.toLowerCase(), { schoolId, handle });
  }

  async resolveSchoolByHost(
    hostname: string,
  ): Promise<{ schoolId: string; handle: string } | null> {
    const normalized = hostname.trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
    const directMatch = this.hostRegistry.get(normalized);
    if (directMatch) return directMatch;

    // Pattern matching: e.g. <handle>.gurudevi.app
    const gurudeviMatch = normalized.match(/^([a-z0-9_-]+)\.gurudevi\.app$/);
    const handle = gurudeviMatch?.[1];
    if (handle && !['sanctuary', 'explore', 'api', 'admin', 'www', 'platform'].includes(handle)) {
      return {
        schoolId: `school-${handle}`,
        handle,
      };
    }

    return null;
  }

  // --- Outbound Sandboxed Plugin Port (EmDash Isolates) ---

  async executePlugin(
    pluginId: string,
    capabilities: ReadonlyArray<string>,
    context: Record<string, unknown>,
  ): Promise<{ success: boolean; output: unknown }> {
    const disallowed = ['network:fetch', 'env:secrets', 'fs:write'];
    const forbiddenRequests = capabilities.filter((cap) => disallowed.includes(cap));

    if (forbiddenRequests.length > 0) {
      return {
        success: false,
        output: {
          error: `Capability violation: Sandbox denied permissions [${forbiddenRequests.join(', ')}] for plugin '${pluginId}'.`,
        },
      };
    }

    return {
      success: true,
      output: {
        pluginId,
        renderedHtml: `<div class="emdash-widget" data-plugin="${pluginId}">Rendered Safe Widget</div>`,
        contextEcho: context,
      },
    };
  }
}
