import { describe, expect, it } from 'vitest';
import { classView } from '../classView';

const attempt = (
  r: Record<string, unknown>,
  c: Record<string, boolean>,
  helped: string[] = [],
) => ({
  responses: new Map(Object.entries(r)),
  correct: new Map(Object.entries(c)),
  helped: new Set(helped),
});

describe('class answer view', () => {
  const attempts = [
    attempt({ q1: '3/4', q2: ['a', 'b'] }, { q1: true, q2: true }),
    attempt({ q1: '2/6', q2: ['b', 'a'] }, { q1: false, q2: true }, ['q2']),
    attempt({ q1: '2/6 ' }, { q1: false }),
    attempt({ q1: '1/4' }, { q1: false }),
    attempt({}, {}),
  ];

  it('counts answers, right answers and right-alone answers per question', () => {
    const [q1, q2] = classView(attempts, ['q1', 'q2']);
    expect(q1).toMatchObject({ answered: 4, right: 1, rightAlone: 1 });
    expect(q2).toMatchObject({ answered: 2, right: 2, rightAlone: 1, commonWrong: [] });
  });

  it('puts the most common wrong answer first, treating spacing and order as the same answer', () => {
    expect(classView(attempts, ['q1'])[0]?.commonWrong).toEqual([
      { response: '2/6', count: 2 },
      { response: '1/4', count: 1 },
    ]);
  });

  it('leaves unmarked answers out of right and wrong, and names no one', () => {
    const poll = classView([attempt({ q: 'yes' }, {}), attempt({ q: 'no' }, {})], ['q'])[0];
    expect(poll).toEqual({ part: 'q', answered: 2, right: 0, rightAlone: 0, commonWrong: [] });
  });
});
