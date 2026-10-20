import { describe, expect, expectTypeOf, it, test } from 'vitest';
import {
  createLinkedInAdapter,
  createMemoryDispatchLedger,
  createPostizAdapter,
  dispatchArticlePublished,
  linkedinAdapter,
} from './distribution';
import {
  type AuthorProfile,
  canTransitionSubmission,
  createArticlePublishedEvent,
  createDelivery,
  MemoryDistributionLedger,
  type SubmissionStatus,
  transitionDelivery,
} from './domain';
import { EmDashHexagonalAdapter } from './hexagonal';

const event = createArticlePublishedEvent({
  eventId: 'evt-1',
  occurredAt: '2026-08-31T00:00:00.000Z',
  workId: 'work-1',
  versionId: 'version-1',
  publication: 'edlove',
  language: 'en',
  canonicalUrl: 'https://edlove.org/journal/example',
  policy: { channels: ['linkedin'], excerptOnly: ['linkedin'], utmCampaign: 'journal-launch' },
});

describe('editorial distribution contracts', { tags: ['editorial', 'pure', 'fast'] }, () => {
  it('enforces static type boundaries on core editorial models (T16 expectTypeOf)', () => {
    expectTypeOf<AuthorProfile['displayName']>().toBeString();
    expectTypeOf<SubmissionStatus>().toEqualTypeOf<
      'submitted' | 'in_review' | 'rights_review' | 'approved' | 'rejected' | 'withdrawn'
    >();
    expectTypeOf(canTransitionSubmission).toBeFunction();
    expectTypeOf(canTransitionSubmission).parameter(0).toBeString();
  });

  it('creates stable idempotent delivery keys', () => {
    expect(createDelivery(event, 'linkedin', 'edlove-main', event.occurredAt).idempotencyKey).toBe(
      'evt-1:linkedin:edlove-main',
    );
  });

  it('allows retry after failure and increments attempts', () => {
    const delivery = createDelivery(event, 'linkedin', 'edlove-main', event.occurredAt);
    const processing = transitionDelivery(delivery, 'processing', event.occurredAt);
    const failed = transitionDelivery(processing, 'failed', event.occurredAt, {
      lastError: 'rate limited',
    });
    const retry = transitionDelivery(failed, 'processing', event.occurredAt);
    expect(retry.attempts).toBe(2);
    expect(retry.status).toBe('processing');
  });

  it('prepares channel-specific links and excerpts', () => {
    const payload = linkedinAdapter.prepare(event, { title: 'Title', text: 'x'.repeat(400) });
    expect(payload.text).toHaveLength(280);
    expect(payload.url).toMatch(/utm_source=linkedin/);
    expect(payload.url).toContain('utm_source=linkedin');
    expect(payload.text.trim()).toBe('x'.repeat(280));
  });

  it('deduplicates deliveries through the ledger', () => {
    const ledger = new MemoryDistributionLedger();
    const delivery = createDelivery(event, 'linkedin', 'edlove-main', event.occurredAt);
    ledger.save(delivery);
    ledger.save(delivery);
    expect(ledger.list(event.eventId)).toHaveLength(1);
  });

  it('does not claim a dry-run adapter published externally', async () => {
    const deliveries = await dispatchArticlePublished({
      event,
      article: { title: 'Title', text: 'Body' },
      accountIds: { linkedin: 'edlove-main' },
      ledger: createMemoryDispatchLedger(),
      now: event.occurredAt,
    });
    expect(deliveries[0]?.status).toBe('skipped');
  });

  it('records a skipped delivery when rights exclude a channel', async () => {
    const restrictedEvent = createArticlePublishedEvent({
      ...event,
      eventId: 'evt-restricted',
      policy: {
        ...event.policy,
        permittedChannels: [],
      },
    });
    const deliveries = await dispatchArticlePublished({
      event: restrictedEvent,
      article: { title: 'Title', text: 'Body' },
      accountIds: { linkedin: 'edlove-main' },
      ledger: createMemoryDispatchLedger(),
      now: restrictedEvent.occurredAt,
    });
    expect(deliveries[0]?.status).toBe('skipped');
  });

  test.for([
    { from: 'submitted', to: 'approved', allowed: false },
    { from: 'in_review', to: 'rights_review', allowed: true },
    { from: 'rights_review', to: 'approved', allowed: true },
    { from: 'approved', to: 'in_review', allowed: false },
  ])(
    'submission lifecycle: from $from -> to $to is allowed=$allowed (T17 test.for capability)',
    ({ from, to, allowed }) => {
      expect(canTransitionSubmission(from as any, to as any)).toBe(allowed);
    },
  );

  it('publishes a LinkedIn post through the supported Posts API shape', async () => {
    let request: Request | undefined;
    const adapter = createLinkedInAdapter({
      accessToken: 'token',
      authorUrn: 'urn:li:organization:1',
      apiVersion: '202601',
      fetcher: async (input, init) => {
        request = new Request(input, init);
        return new Response(null, { status: 201, headers: { 'x-restli-id': 'urn:li:share:2' } });
      },
    });
    const result = await adapter.publish(
      createDelivery(event, 'linkedin', 'edlove-main', event.occurredAt),
      adapter.prepare(event, { title: 'Title', text: 'Body' }),
    );
    expect(result).toEqual({
      status: 'published',
      externalUrl: 'https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A2',
    });
    expect(request?.headers.get('Linkedin-Version')).toBe('202601');
    expect(await request?.json()).toMatchObject({
      author: 'urn:li:organization:1',
      lifecycleState: 'PUBLISHED',
    });
  });

  it('publishes a post via Postiz REST API contract', async () => {
    let request: Request | undefined;
    const adapter = createPostizAdapter({
      baseUrl: 'https://postiz.example.com',
      apiKey: 'test-api-key',
      integrationIds: ['li-1', 'x-1'],
      fetcher: async (input, init) => {
        request = new Request(input, init);
        return new Response(
          JSON.stringify({ id: 'post-123', url: 'https://postiz.example.com/posts/post-123' }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      },
    });

    const result = await adapter.publish(
      createDelivery(event, 'postiz', 'postiz-main', event.occurredAt),
      adapter.prepare(event, { title: 'Title', text: 'Body' }),
    );

    expect(result).toEqual({
      status: 'published',
      externalUrl: 'https://postiz.example.com/posts/post-123',
    });
    expect(request?.headers.get('Authorization')).toBe('Bearer test-api-key');
    expect(await request?.json()).toMatchObject({
      providers: ['li-1', 'x-1'],
      type: 'now',
    });
  });
});

describe('EmDashHexagonalAdapter & School Editorial Commons', {
  tags: ['editorial', 'pure', 'fast'],
}, () => {
  it('handles student draft submission with institutional and club scope', async () => {
    const adapter = new EmDashHexagonalAdapter();
    const draft = {
      schoolId: 'school-ananda',
      subEntityId: 'society-media-unit',
      authorId: 'student-kamal-01',
      title: 'Ananda-Dharmaraja Annual Encounter 2026 Match Report',
      summary: 'Comprehensive analysis of day 1 play at the Asgiriya Stadium.',
      body: '# Battle of the Maroons\nDay 1 opened under clear Kandy skies...',
      language: 'en' as const,
      kind: 'original' as const,
    };

    const submission = await adapter.submitStudentDraft(draft);
    expect(submission.id).toMatch(/^sub-school-ananda-/);
    expect(submission.status).toBe('submitted');
    expect(submission.schoolId).toBe('school-ananda');
    expect(submission.subEntityId).toBe('society-media-unit');
    expect(submission.title).toBe(draft.title);
  });

  it('enforces faculty review and approval before edge publication', async () => {
    const adapter = new EmDashHexagonalAdapter();
    const submission = await adapter.submitStudentDraft({
      schoolId: 'school-ananda',
      subEntityId: 'society-media-unit',
      authorId: 'student-kamal-01',
      title: 'Sinhala Literary Day 2026',
      summary: 'Annual festival celebrating classical and modern poetry.',
      body: 'අනඳ සාහිත්‍ය දින උළෙල සාර්ථකව නිමාවට පත්විය...',
      language: 'si' as const,
      kind: 'original' as const,
    });

    // Attempting to publish unapproved draft throws
    await expect(
      adapter.publishApprovedWork(submission.id, 'sinhala-literary-day-2026'),
    ).rejects.toThrow(/Must be 'approved'/);

    // Faculty TIC picks up the draft for review
    const inReview = await adapter.reviewSubmission(submission.id, {
      reviewerId: 'tic-perera-01',
      decision: 'in_review',
      decisionNote: 'Reviewing with media committee.',
    });
    expect(inReview.status).toBe('in_review');

    // Faculty TIC approves
    const reviewed = await adapter.reviewSubmission(submission.id, {
      reviewerId: 'tic-perera-01',
      decision: 'approved',
      decisionNote: 'Well written and verified by the media unit advisor.',
    });
    expect(reviewed.status).toBe('approved');
    expect(reviewed.reviewerId).toBe('tic-perera-01');

    // Edge publish
    const article = await adapter.publishApprovedWork(submission.id, 'sinhala-literary-day-2026');
    expect(article.slug).toBe('sinhala-literary-day-2026');
    expect(article.schoolId).toBe('school-ananda');
    expect(article.language).toBe('si');

    // Retrieve published by slug
    const retrieved = await adapter.getWorkBySlug('school-ananda', 'sinhala-literary-day-2026');
    expect(retrieved?.title).toBe('Sinhala Literary Day 2026');
  });

  it('resolves vanity subdomains and custom apex hostnames to sovereign school tenants', async () => {
    const adapter = new EmDashHexagonalAdapter({
      'anandacollege.edu.lk': { schoolId: 'school-ananda-colombo', handle: 'ananda' },
      'royalcollege.lk': { schoolId: 'school-royal-colombo', handle: 'royal' },
    });

    // Custom registered apex
    const customMatch = await adapter.resolveSchoolByHost('anandacollege.edu.lk');
    expect(customMatch).toEqual({ schoolId: 'school-ananda-colombo', handle: 'ananda' });

    // Wildcard vanity subdomain
    const subdomainMatch = await adapter.resolveSchoolByHost('nalanda.gurudevi.app');
    expect(subdomainMatch).toEqual({ schoolId: 'school-nalanda', handle: 'nalanda' });

    // Reserved platform subdomains should not resolve to schools
    expect(await adapter.resolveSchoolByHost('sanctuary.gurudevi.app')).toBeNull();
    expect(await adapter.resolveSchoolByHost('explore.gurudevi.app')).toBeNull();
    expect(await adapter.resolveSchoolByHost('unknown-domain.org')).toBeNull();
  });

  it('enforces EmDash sandbox capability boundaries for student-authored widgets', async () => {
    const adapter = new EmDashHexagonalAdapter();

    // Permitted isolated widget
    const safeResult = await adapter.executePlugin(
      'inter-house-scoreboard',
      ['content:read', 'storage:isolated'],
      { house: 'Parakrama', points: 420 },
    );
    expect(safeResult.success).toBe(true);
    expect((safeResult.output as any).renderedHtml).toContain('emdash-widget');

    // Forbidden capability attempt (network access or secret leakage)
    const dangerousResult = await adapter.executePlugin(
      'crypto-miner',
      ['content:read', 'network:fetch', 'env:secrets'],
      {},
    );
    expect(dangerousResult.success).toBe(false);
    expect((dangerousResult.output as any).error).toContain('Capability violation');
  });
});
