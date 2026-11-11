import type { FormField } from '@intuitui-labs/form-builder-engine/schema';
import { describe, expect, it } from 'vitest';
import {
  applyDraft,
  checkQuizReadiness,
  draftFromField,
  newChoice,
  removeChoice,
  toggleCorrect,
} from '../index';

const select = {
  id: 'f1',
  name: 'q1',
  type: 'select',
  label: 'Q',
  required: false,
  order: 0,
} as FormField;

let n = 0;
const makeId = () => String(++n);

describe('marking draft', () => {
  it('builds choices and a key that survives rewording a choice', () => {
    let d = draftFromField(select);
    expect(d.graded).toBe(false);
    d = { ...d, graded: true, choices: [newChoice([], makeId)] };
    d = { ...d, choices: [...d.choices, newChoice(d.choices, makeId)] };
    d.choices[0]!.label = 'Mercury';
    d.choices[1]!.label = 'Venus';
    d = toggleCorrect(d, d.choices[0]!.value, false);

    const first = applyDraft(select, d);
    // Fix a typo in the correct choice: the key does not move.
    d.choices[0]!.label = 'Mercury (closest)';
    const second = applyDraft(select, d);
    expect(second.rubric).toEqual(first.rubric);
    expect(second.options![0]!.label).toBe('Mercury (closest)');

    const field = { ...select, options: second.options, rubric: second.rubric };
    expect(
      checkQuizReadiness({ id: 'q', title: 'Q', pages: [{ id: 'p', fields: [field] }] }).ready,
    ).toBe(true);
  });

  it('drops blank choices and any key pointing at them', () => {
    let d = { ...draftFromField(select), graded: true };
    const a = newChoice([], makeId);
    const b = newChoice([a], makeId);
    a.label = 'Yes';
    d = toggleCorrect({ ...d, choices: [a, b] }, b.value, false);
    const out = applyDraft(select, d);
    expect(out.options).toHaveLength(1);
    expect(out.rubric).toMatchObject({ kind: 'single-choice', correctValue: '' });
  });

  it('removing a choice removes it from the answer', () => {
    const d = { ...draftFromField(select), choices: [{ value: 'a', label: 'A' }], correct: ['a'] };
    expect(removeChoice(d, 'a').correct).toEqual([]);
  });

  it('toggles answers for multiple choice and replaces for single choice', () => {
    const d = { ...draftFromField(select), correct: ['a'] };
    expect(toggleCorrect(d, 'b', false).correct).toEqual(['b']);
    expect(toggleCorrect(d, 'b', true).correct).toEqual(['a', 'b']);
    expect(toggleCorrect(d, 'a', true).correct).toEqual([]);
  });

  it('keeps a missing number missing instead of turning it into 0', () => {
    const number = { ...select, type: 'number' } as FormField;
    const out = applyDraft(number, { ...draftFromField(number), graded: true, target: '' });
    expect(out.rubric).toMatchObject({ kind: 'numeric-range' });
    expect(Number.isNaN((out.rubric as { targetValue: number }).targetValue)).toBe(true);
  });

  it('reads accepted answers one per line', () => {
    const text = { ...select, type: 'text' } as FormField;
    const out = applyDraft(text, {
      ...draftFromField(text),
      graded: true,
      accepted: 'Kandy\n\n  Mahanuwara \n',
    });
    expect(out.rubric).toMatchObject({ acceptableAnswers: ['Kandy', 'Mahanuwara'] });
  });

  it('turning marking off clears the rubric', () => {
    expect(applyDraft(select, draftFromField(select)).rubric).toBeUndefined();
  });

  it('round-trips an existing rubric', () => {
    const field = {
      ...select,
      options: [
        { value: 'x', label: 'X' },
        { value: 'y', label: 'Y' },
      ],
      rubric: {
        kind: 'single-choice' as const,
        points: 3,
        correctValue: 'y',
        explanation: 'Because.',
      },
    };
    expect(applyDraft(field, draftFromField(field)).rubric).toEqual(field.rubric);
  });
});
