import { describe, expect, it } from 'vitest';
import { calibrationOf, reflectionsOf } from '../calibration';
import {
  type AttemptStep,
  appendStep,
  assistanceByPart,
  gradeInputFromJournal,
  type Journal,
} from '../journal';

const at = '2026-11-14T03:00:00.000Z';
const journalOf = (steps: AttemptStep[]): Journal =>
  steps.reduce<Journal>((j, s) => appendStep(j, s), []);

const journal = journalOf([
  { id: '0', at, kind: 'reflected', stage: 'plan', text: 'Read each question twice first.' },
  { id: '1', at, kind: 'confidence', part: 'q1', level: 'sure' },
  { id: '2', at, kind: 'answered', part: 'q1', response: 'a' },
  { id: '3', at, kind: 'confidence', part: 'q2', level: 'sure' },
  { id: '4', at, kind: 'answered', part: 'q2', response: 'b' },
  { id: '5', at, kind: 'confidence', part: 'q3', level: 'unsure' },
  { id: '6', at, kind: 'confidence', part: 'q3', level: 'guessing' },
  { id: '7', at, kind: 'answered', part: 'q3', response: 'c' },
  { id: '8', at, kind: 'answered', part: 'q4', response: 'd' },
  { id: '9', at, kind: 'reflected', stage: 'evaluate', text: 'ඊළඟ වතාවේ භාග ගැන නැවත බලන්න.' },
  { id: '10', at, kind: 'reflected', stage: 'monitor', text: '   ' },
]);

describe('calibration', () => {
  it('sorts answers by how sure the person was and how they turned out', () => {
    const correct = new Map([
      ['q1', true],
      ['q2', false],
      ['q3', true],
      ['q4', false],
    ]);
    expect(calibrationOf(journal, correct)).toEqual({
      sureRight: ['q1'],
      sureWrong: ['q2'],
      unsureRight: ['q3'],
      unsureWrong: [],
      notRated: ['q4'],
    });
  });

  it('keeps the person’s reflections by stage, skipping empty ones', () => {
    expect(reflectionsOf(journal)).toEqual({
      plan: ['Read each question twice first.'],
      monitor: [],
      evaluate: ['ඊළඟ වතාවේ භාග ගැන නැවත බලන්න.'],
    });
  });

  it('does not count confidence as help or as a try', () => {
    expect(assistanceByPart(journal).get('q1')).toMatchObject({
      independent: true,
      tries: 1,
      kinds: [],
    });
    expect(gradeInputFromJournal(journal).attemptsByField).toEqual({ q1: 1, q2: 1, q3: 1, q4: 1 });
  });
});
