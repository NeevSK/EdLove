import { describe, expect, it } from 'vitest';
import {
  calculateApca,
  evaluateApca,
  evaluateWcag,
  generateFluidClamp,
  isValidSpatialQuantum,
  meetsDualStandardContrast,
} from '../../lib/a11y';
import {
  createArticlePublishedEvent,
  createDelivery,
  type Publication,
  transitionDelivery,
} from '../../lib/editorial';

describe('@repo/editorial Domain Contracts in Next.js', () => {
  it('recognizes both canonical publications', () => {
    const pub1: Publication = 'edlove';
    const pub2: Publication = 'gurudevi';
    expect([pub1, pub2]).toEqual(['edlove', 'gurudevi']);
  });

  it('creates and transitions an editorial delivery ledger event through allowed state machine', () => {
    const event = createArticlePublishedEvent({
      eventId: 'evt-101',
      workId: 'work-101',
      editionId: 'ed-01',
      publication: 'edlove',
      language: 'en',
      canonicalUrl: 'https://edlove.org/research/noble-lie',
      occurredAt: '2026-10-10T19:00:00Z',
    });

    const now = '2026-10-10T19:00:00Z';
    const delivery = createDelivery(event, 'linkedin', 'acct-edlove', now);
    expect(delivery.status).toBe('pending');

    // State machine: pending -> processing
    const processing = transitionDelivery(delivery, 'processing', now);
    expect(processing.status).toBe('processing');
    expect(processing.attempts).toBe(1);

    // State machine: processing -> published
    const published = transitionDelivery(processing, 'published', now, {
      externalUrl: 'https://linkedin.com/post/12345',
    });
    expect(published.status).toBe('published');
    expect(published.externalUrl).toBe('https://linkedin.com/post/12345');
  });
});

describe('@intuitui-labs/a11y-gate Perceptual & Spatial Governance in Next.js', () => {
  it('evaluates APCA lightness contrast correctly', () => {
    // Dawn vellum (#fff6e8) with Midnight ink (#131e27)
    const apca = evaluateApca('#131e27', '#fff6e8');
    expect(apca.absLc).toBeGreaterThan(90);
    expect(apca.passesBodyText).toBe(true);

    const rawLc = Math.abs(calculateApca('#131e27', '#fff6e8'));
    expect(rawLc).toBeGreaterThan(90);
  });

  it('evaluates WCAG 2.2 AA contrast compliance', () => {
    const wcag = evaluateWcag('#131e27', '#fff6e8');
    expect(wcag.ratio).toBeGreaterThan(10);
    expect(wcag.passesAaNormal).toBe(true);
    expect(wcag.passesAaaNormal).toBe(true);
  });

  it('satisfies dual-standard governance (WCAG 2.2 + APCA 0.98G)', () => {
    // Dawn theme body text
    expect(meetsDualStandardContrast('#131e27', '#fff6e8', 'body')).toBe(true);
    // Saffron accent on Dawn
    expect(meetsDualStandardContrast('#a85022', '#fff6e8', 'headline')).toBe(true);
  });

  it('validates 4px / 8px spatial quantum grid', () => {
    expect(isValidSpatialQuantum(8)).toBe(true);
    expect(isValidSpatialQuantum(16)).toBe(true);
    expect(isValidSpatialQuantum(24)).toBe(true);
    expect(isValidSpatialQuantum(13)).toBe(false);
  });

  it('generates fluid typography clamp formulas', () => {
    const clamp = generateFluidClamp({
      minPx: 16,
      maxPx: 24,
      minVw: 360,
      maxVw: 1440,
    });
    expect(clamp).toContain('clamp(');
    expect(clamp).toContain('rem');
  });
});
