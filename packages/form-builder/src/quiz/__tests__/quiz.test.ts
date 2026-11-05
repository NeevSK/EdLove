import type { FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import { describe, expect, it } from 'vitest';
import {
  blankRubricFor,
  checkQuizReadiness,
  gradeQuiz,
  missingQuizModeConfig,
  normalizeAnswerText,
  parseNumberAnswer,
  withQuizMode,
} from '../index';

const at = { attemptId: 'a1', submittedAt: '2026-11-05T08:00:00.000Z' };

function quiz(overrides: Partial<FormSchema> = {}): FormSchema {
  return {
    id: 'quiz-1',
    title: 'Grade 6 science',
    updatedAt: '2026-11-05T07:00:00.000Z',
    pages: [
      {
        id: 'p1',
        fields: [
          {
            id: 'f1',
            name: 'planet',
            type: 'select',
            label: 'Which planet is closest to the Sun?',
            required: false,
            order: 0,
            options: [
              { label: 'Mercury', value: 'mercury' },
              { label: 'Venus', value: 'venus' },
            ],
            rubric: { kind: 'single-choice', points: 2, correctValue: 'mercury', negativePoints: 1 },
          },
          {
            id: 'f2',
            name: 'legs',
            type: 'number',
            label: 'How many legs does an insect have?',
            required: false,
            order: 1,
            rubric: { kind: 'numeric-range', points: 1, targetValue: 6, tolerance: 0 },
          },
          {
            id: 'f3',
            name: 'capital',
            type: 'text',
            label: 'Capital (Sinhala)',
            required: false,
            order: 2,
            rubric: {
              kind: 'text-match',
              points: 1,
              acceptableAnswers: ['ශ්‍රී ජයවර්ධනපුර කෝට්ටේ'],
            },
          },
        ],
      },
    ],
    ...overrides,
  } as FormSchema;
}

describe('normalising answers', () => {
  it('treats Sinhala typed with and without zero-width joiners as the same', () => {
    expect(normalizeAnswerText('ශ්‍රී')).toBe(normalizeAnswerText('ශ්රී'));
  });

  it('collapses no-break and repeated spaces', () => {
    expect(normalizeAnswerText('  a  b  ')).toBe('a b');
  });

  it('reads numbers without inventing them', () => {
    expect(parseNumberAnswer('')).toBeUndefined();
    expect(parseNumberAnswer(' ')).toBeUndefined();
    expect(parseNumberAnswer('0')).toBe(0);
    expect(parseNumberAnswer('-2.5')).toBe(-2.5);
    expect(parseNumberAnswer('௬')).toBe(6); // Tamil digit six
    expect(parseNumberAnswer('1,5')).toBeUndefined(); // ambiguous, refused
    expect(parseNumberAnswer('6 legs')).toBeUndefined();
    expect(parseNumberAnswer(Number.NaN)).toBeUndefined();
  });
});

describe('quiz mode', () => {
  it('switches on for a schema with graded questions and no assessment config', () => {
    expect(missingQuizModeConfig(quiz())).toEqual({ timing: 'deferred', floorScoreToZero: true });
    expect(withQuizMode(quiz()).kind).toBe('quiz');
  });

  it('leaves an existing config and plain forms alone', () => {
    expect(missingQuizModeConfig(quiz({ assessment: { timing: 'instant' } }))).toBeNull();
    const plain = quiz();
    for (const f of plain.pages[0]!.fields) delete (f as { rubric?: unknown }).rubric;
    expect(missingQuizModeConfig(plain)).toBeNull();
  });
});

describe('readiness', () => {
  it('accepts a complete quiz', () => {
    const r = checkQuizReadiness(quiz());
    expect(r.ready).toBe(true);
    expect(r.gradedCount).toBe(3);
    expect(r.totalPoints).toBe(4);
  });

  it('blocks a brand-new graded question until a key is chosen', () => {
    const s = quiz();
    const field = s.pages[0]!.fields[0]!;
    (field as { rubric?: unknown }).rubric = blankRubricFor(field, 2);
    const r = checkQuizReadiness(s);
    expect(r.ready).toBe(false);
    expect(r.problems.map((p) => p.code)).toContain('missing-answer-key');
  });

  it('blocks a key that no longer matches an option after the teacher edits choices', () => {
    const s = quiz();
    s.pages[0]!.fields[0]!.options = [
      { label: 'Mercury', value: 'merc' },
      { label: 'Venus', value: 'venus' },
    ];
    expect(checkQuizReadiness(s).problems.map((p) => p.code)).toContain('answer-key-not-an-option');
  });

  it('catches the old studio placeholder key and a missing number target after saving', () => {
    const s = quiz();
    (s.pages[0]!.fields[0] as { rubric: { correctValue: string } }).rubric.correctValue = 'Correct Option';
    // NaN becomes null once saved as JSON.
    (s.pages[0]!.fields[1] as { rubric: { targetValue: unknown } }).rubric.targetValue = null;
    const codes = checkQuizReadiness(s).problems.map((p) => p.code);
    expect(codes).toContain('answer-key-not-an-option');
    expect(codes).toContain('invalid-target');
  });

  it('blocks two questions sharing an internal name, and essay marking', () => {
    const s = quiz();
    s.pages[0]!.fields[1]!.name = 'planet';
    s.pages[0]!.fields.push({
      id: 'f4',
      name: 'essay',
      type: 'textarea',
      label: 'Explain photosynthesis',
      required: false,
      order: 3,
      rubric: { kind: 'text-match', points: 5, acceptableAnswers: ['light'] },
    } as never);
    const codes = checkQuizReadiness(s).problems.map((p) => p.code);
    expect(codes).toContain('duplicate-field-name');
    expect(codes).toContain('not-gradable');
  });

  it('blocks a broken pattern and warns about an unanchored one', () => {
    const s = quiz();
    const rubric = (s.pages[0]!.fields[2] as unknown as { rubric: Record<string, unknown> }).rubric;
    rubric.regexPattern = '([';
    expect(checkQuizReadiness(s).problems.map((p) => p.code)).toContain('invalid-pattern');
    rubric.regexPattern = '\\d+';
    const r = checkQuizReadiness(s);
    expect(r.ready).toBe(true);
    expect(r.problems.map((p) => p.code)).toContain('unanchored-pattern');
  });
});

describe('grading', () => {
  it('marks a full correct attempt, accepting Sinhala typed without joiners', () => {
    const a = gradeQuiz(quiz(), { planet: 'mercury', legs: '6', capital: 'ශ්රී ජයවර්ධනපුර කෝට්ටේ' }, at);
    expect(a.score).toBe(4);
    expect(a.maxScore).toBe(4);
    expect(a.percent).toBe(100);
    expect(a.questions.every((q) => q.status === 'correct')).toBe(true);
    expect(a.formVersion).toBe('2026-11-05T07:00:00.000Z');
  });

  it('never applies negative marking to a skipped question', () => {
    const a = gradeQuiz(quiz(), { legs: 6 }, at);
    const planet = a.questions.find((q) => q.name === 'planet')!;
    expect(planet.status).toBe('unanswered');
    expect(planet.score).toBe(0);
    expect(a.score).toBe(1);
    expect(a.unansweredCount).toBe(2);
  });

  it('applies negative marking to a wrong answer and floors the total at zero', () => {
    const a = gradeQuiz(quiz(), { planet: 'venus' }, at);
    expect(a.questions.find((q) => q.name === 'planet')!.score).toBe(-1);
    expect(a.score).toBe(0);
  });

  it('treats a blank number as unanswered, not as zero', () => {
    const s = quiz();
    (s.pages[0]!.fields[1] as { rubric: { targetValue: number } }).rubric.targetValue = 0;
    expect(gradeQuiz(s, { legs: '' }, at).questions[1]!.status).toBe('unanswered');
    expect(gradeQuiz(s, { legs: '0' }, at).questions[1]!.status).toBe('correct');
  });

  it('does not count questions hidden by branching or on pages never reached', () => {
    const s = quiz();
    s.pages[0]!.fields[2]!.visibleIf = { field: 'planet', operator: 'equals', value: 'venus' } as never;
    s.pages.push({
      id: 'p2',
      fields: [
        {
          id: 'f9',
          name: 'bonus',
          type: 'select',
          label: 'Bonus',
          required: false,
          order: 0,
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
          rubric: { kind: 'single-choice', points: 5, correctValue: 'a' },
        } as never,
      ],
    });
    const a = gradeQuiz(s, { planet: 'mercury', legs: 6 }, { ...at, visitedPageIds: ['p1'] });
    expect(a.maxScore).toBe(3);
    expect(a.percent).toBe(100);
    expect(a.notShown.sort()).toEqual(['bonus', 'capital']);
  });

  it('gives no pass or fail verdict when the quiz has no pass mark', () => {
    expect(gradeQuiz(quiz(), {}, at).isPassing).toBeUndefined();
    const withMark = quiz({ assessment: { timing: 'deferred', passingPercent: 50 } });
    expect(gradeQuiz(withMark, { planet: 'mercury' }, at).isPassing).toBe(true);
    expect(gradeQuiz(withMark, { legs: 6 }, at).isPassing).toBe(false);
  });

  it('counts leaving the app without changing the score', () => {
    const a = gradeQuiz(quiz(), { planet: 'mercury' }, {
      ...at,
      proctoringEvents: [
        { type: 'app-blur', timestamp: '2026-11-05T07:59:00.000Z' },
        { type: 'app-focus', timestamp: '2026-11-05T07:59:30.000Z' },
      ],
    });
    expect(a.leftAppCount).toBe(1);
    expect(a.score).toBe(2);
  });

  it('is deterministic', () => {
    const values = { planet: 'mercury', legs: '7', capital: 'Colombo' };
    expect(gradeQuiz(quiz(), values, at)).toEqual(gradeQuiz(quiz(), values, at));
  });
});
