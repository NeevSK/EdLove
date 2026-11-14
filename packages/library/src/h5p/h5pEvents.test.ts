import { describe, expect, it } from 'vitest';
import { durationToMs, readH5PEvent } from './h5pEvents';

const now = () => new Date('2026-11-13T18:00:00.000Z');

// The shape H5P.MultiChoice sends when a learner checks an answer.
const answered = {
  actor: { name: 'learner', mbox: 'mailto:learner@example.invalid' },
  verb: { id: 'http://adlnet.gov/expapi/verbs/answered', display: { 'en-US': 'answered' } },
  object: {
    id: 'https://example.invalid/h5p/quiz-1?subContentId=9f2',
    objectType: 'Activity',
    definition: {
      interactionType: 'choice',
      extensions: {
        'http://h5p.org/x-api/h5p-local-content-id': 1,
        'http://h5p.org/x-api/h5p-subContentId': '9f2',
      },
    },
  },
  context: {
    contextActivities: {
      parent: [{ id: 'https://example.invalid/h5p/quiz-1', objectType: 'Activity' }],
      category: [{ id: 'http://h5p.org/libraries/H5P.MultiChoice-1.16', objectType: 'Activity' }],
    },
  },
  result: {
    score: { min: 0, max: 1, raw: 1, scaled: 1 },
    completion: true,
    success: true,
    duration: 'PT12.34S',
    response: '0',
  },
};

describe('readH5PEvent', () => {
  it('reads an answered question inside a compound activity', () => {
    const result = readH5PEvent(answered, now);
    expect(result).toMatchObject({
      ok: true,
      event: {
        verb: 'answered',
        subContentId: '9f2',
        library: 'H5P.MultiChoice-1.16',
        interactionType: 'choice',
        result: {
          score: { raw: 1, max: 1 },
          success: true,
          completion: true,
          durationMs: 12340,
          response: '0',
        },
        occurredAt: '2026-11-13T18:00:00.000Z',
      },
    });
  });

  it('keeps the statement time when the player sends one', () => {
    const result = readH5PEvent({ ...answered, timestamp: '2026-11-13T23:10:00+05:30' }, now);
    expect(result.ok && result.event.occurredAt).toBe('2026-11-13T23:10:00+05:30');
  });

  it('keeps the rest of the result when the score is inconsistent', () => {
    const result = readH5PEvent(
      { ...answered, result: { ...answered.result, score: { min: 0, max: 1, raw: 5 } } },
      now,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.event.result?.score).toBeUndefined();
    expect(result.event.result?.success).toBe(true);
  });

  it('names unfamiliar verbs other and keeps their IRI', () => {
    const result = readH5PEvent(
      { ...answered, verb: { id: 'http://h5p.org/x-api/verbs/seeked' }, result: undefined },
      now,
    );
    expect(result).toMatchObject({
      ok: true,
      event: { verb: 'other', verbId: 'http://h5p.org/x-api/verbs/seeked' },
    });
  });

  it('refuses something that is not a statement', () => {
    expect(readH5PEvent({ hello: 'world' }, now).ok).toBe(false);
    expect(readH5PEvent(null, now).ok).toBe(false);
  });
});

describe('durationToMs', () => {
  it.each([
    ['PT12.34S', 12340],
    ['PT1M', 60000],
    ['PT1H2M3S', 3723000],
    ['P1DT1S', 86401000],
  ])('%s', (d, ms) => expect(durationToMs(d)).toBe(ms));
  it.each(['P', 'PT', '12S', 'P1W'])('refuses %s', (d) => expect(durationToMs(d)).toBeUndefined());
});
