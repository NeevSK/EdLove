import { describe, expect, it } from 'vitest';
import { fromH5PEvent } from '../fromH5P';
import { appendStep, assistanceByPart, type Journal } from '../journal';

const at = '2026-11-14T03:00:00.000Z';

describe('H5P events into the journal', () => {
  it('records an answer to a question inside a composite under its part', () => {
    const out = fromH5PEvent(
      {
        verb: 'answered',
        activityId: 'iv-1',
        subContentId: '9f2',
        occurredAt: at,
        result: { response: '0', success: true },
      },
      'a1:1',
    );
    expect(out).toEqual({
      kind: 'step',
      step: { id: 'a1:1', at, kind: 'answered', part: '9f2', response: '0' },
    });
  });

  it('treats a top-level completion as the end of the activity, and a part completion as nothing new', () => {
    expect(
      fromH5PEvent(
        { verb: 'completed', activityId: 'iv-1', occurredAt: at, result: { success: false } },
        'x',
      ),
    ).toEqual({
      kind: 'finished',
      at,
      success: false,
    });
    expect(
      fromH5PEvent(
        { verb: 'completed', activityId: 'iv-1', subContentId: '9f2', occurredAt: at },
        'x',
      ).kind,
    ).toBe('ignored');
    expect(fromH5PEvent({ verb: 'interacted', activityId: 'iv-1', occurredAt: at }, 'x').kind).toBe(
      'ignored',
    );
  });

  it('keeps a resent event once and counts it as answered alone', () => {
    const event = {
      verb: 'answered',
      activityId: 'q',
      occurredAt: at,
      result: { response: 'true' },
    };
    let journal: Journal = [];
    for (let i = 0; i < 2; i += 1) {
      const out = fromH5PEvent(event, 'same-id');
      if (out.kind === 'step') journal = appendStep(journal, out.step);
    }
    expect(journal).toHaveLength(1);
    expect(assistanceByPart(journal).get('q')).toMatchObject({ independent: true, tries: 1 });
  });
});
