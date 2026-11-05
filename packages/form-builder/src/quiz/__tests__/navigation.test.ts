import type { FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import { describe, expect, it } from 'vitest';
import { gradeQuiz, nextPageId } from '../index';

const page = (id: string, extra: Record<string, unknown> = {}) => ({ id, fields: [], ...extra });

const choice = {
  id: 'f1',
  name: 'q1',
  type: 'select',
  label: 'Q1',
  required: false,
  order: 0,
  options: [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b' },
  ],
  rubric: { kind: 'single-choice', points: 1, correctValue: 'a' },
};

describe('next page', () => {
  it('goes to the next page in order by default, then ends', () => {
    const s = { id: 's', title: 'S', pages: [page('p1'), page('p2')] } as FormSchema;
    expect(nextPageId(s, 'p1', {}, [])).toBe('p2');
    expect(nextPageId(s, 'p2', {}, ['p1'])).toBeNull();
  });

  it('follows an answer-based jump rule', () => {
    const s = {
      id: 's',
      title: 'S',
      pages: [
        page('p1', {
          fields: [choice],
          jumpRules: [{ condition: { field: 'q1', operator: 'equals', value: 'b' }, targetPageId: 'p3' }],
        }),
        page('p2'),
        page('p3'),
      ],
    } as FormSchema;
    expect(nextPageId(s, 'p1', { q1: 'b' }, [])).toBe('p3');
    expect(nextPageId(s, 'p1', { q1: 'a' }, [])).toBe('p2');
  });

  it('follows a score-based rule using marks so far', () => {
    const s = {
      id: 's',
      title: 'S',
      pages: [
        page('p1', {
          fields: [choice],
          jumpRules: [
            {
              scoreCondition: { type: 'score-total-percent', operator: 'lessThan', value: 50 },
              targetPageId: 'revise',
            },
          ],
        }),
        page('next'),
        page('revise'),
      ],
    } as FormSchema;
    const meta = { attemptId: 'x', submittedAt: '2026-11-05T00:00:00.000Z', visitedPageIds: ['p1'] };
    const wrong = gradeQuiz(s, { q1: 'b' }, meta);
    const right = gradeQuiz(s, { q1: 'a' }, meta);
    expect(nextPageId(s, 'p1', { q1: 'b' }, [], wrong)).toBe('revise');
    expect(nextPageId(s, 'p1', { q1: 'a' }, [], right)).toBe('next');
    // No marks available: a score rule cannot fire.
    expect(nextPageId(s, 'p1', { q1: 'b' }, [])).toBe('next');
  });

  it('never loops back to a page already seen', () => {
    const s = {
      id: 's',
      title: 'S',
      pages: [page('p1'), page('p2', { jumpRules: [{ targetPageId: 'p1' }] }), page('p3')],
    } as FormSchema;
    expect(nextPageId(s, 'p2', {}, ['p1'])).toBe('p3');
  });

  it('ignores a rule pointing at a page that does not exist', () => {
    const s = {
      id: 's',
      title: 'S',
      pages: [page('p1', { jumpRules: [{ targetPageId: 'gone' }], defaultNextPageId: 'gone' }), page('p2')],
    } as FormSchema;
    expect(nextPageId(s, 'p1', {}, [])).toBe('p2');
  });
});
