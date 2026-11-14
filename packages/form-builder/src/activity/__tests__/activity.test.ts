import type { FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import { describe, expect, it } from 'vitest';
import { gradeQuiz } from '../../quiz';
import {
  type AttemptStep,
  advanceCues,
  answerCue,
  appendStep,
  assistanceByPart,
  canResume,
  DEFAULT_CUE_POLICY,
  dismissCue,
  gradeInputFromJournal,
  initialCueState,
  isRevealed,
  type Journal,
  prepareCues,
  resolveMode,
  schemaForMode,
  type VideoCue,
} from '../index';

const quiz: FormSchema = {
  id: 'quiz-1',
  title: 'සංඛ්‍යා · எண்கள்',
  updatedAt: '2026-11-13T08:00:00.000Z',
  assessment: {
    timing: 'deferred',
    speedBonusWindowSeconds: 10,
    speedBonusMaxPercent: 50,
    streakBonusEnabled: true,
    passingPercent: 50,
  },
  pages: [
    {
      id: 'p1',
      fields: [
        {
          id: 'f1',
          name: 'planet',
          type: 'select',
          label: 'Closest planet to the Sun?',
          required: false,
          order: 0,
          options: [
            { label: 'Mercury', value: 'mercury' },
            { label: 'Venus', value: 'venus' },
          ],
          rubric: {
            kind: 'single-choice',
            points: 2,
            correctValue: 'mercury',
            hint: { text: 'It is the smallest.', penaltyPercent: 50 },
            penaltyPerRetryPercent: 25,
          },
        },
      ],
    },
  ],
} as FormSchema;

// A step without its time, kept as a union so each kind keeps its own fields.
type Draft = AttemptStep extends infer S ? (S extends AttemptStep ? Omit<S, 'at'> : never) : never;

const step = (s: Draft, i: number): AttemptStep =>
  ({ at: `2026-11-13T08:00:${String(i).padStart(2, '0')}.000Z`, ...s }) as AttemptStep;

const journalOf = (...steps: Draft[]): Journal =>
  steps.reduce<Journal>((j, s, i) => appendStep(j, step(s, i)), []);

describe('modes', () => {
  it('keeps help from lowering marks by default, and lets a policy turn that on', () => {
    const values = { planet: 'mercury' };
    const journal = journalOf(
      { id: 's1', kind: 'helped', part: 'planet', assistance: 'hint', level: 1 },
      { id: 's2', kind: 'answered', part: 'planet', response: 'mercury' },
    );
    const input = {
      attemptId: 'a1',
      submittedAt: '2026-11-13T08:01:00.000Z',
      ...gradeInputFromJournal(journal),
    };

    const fair = gradeQuiz(schemaForMode(quiz, resolveMode('check')), values, input);
    expect(fair.score).toBe(2);

    const penalised = gradeQuiz(
      schemaForMode(quiz, resolveMode('check', { assistanceAffectsMarks: true })),
      values,
      input,
    );
    expect(penalised.score).toBeLessThan(2);
  });

  it('drops speed and streak bonuses unless a policy asks for them', () => {
    const run = schemaForMode(quiz, resolveMode('practice'));
    expect(run.assessment).toMatchObject({ timing: 'instant', passingPercent: 50 });
    expect(run.assessment?.streakBonusEnabled).toBeUndefined();
    expect(run.assessment?.speedBonusMaxPercent).toBeUndefined();
    const kept = schemaForMode(quiz, resolveMode('practice', { speedAndStreakBonus: true }));
    expect(kept.assessment?.streakBonusEnabled).toBe(true);
  });

  it('runs a poll with the same questions and no answer key', () => {
    const poll = schemaForMode(quiz, resolveMode('poll'));
    expect(poll.assessment).toBeUndefined();
    expect('rubric' in (poll.pages[0]?.fields[0] ?? {})).toBe(false);
    expect(poll.pages[0]?.fields[0]?.name).toBe('planet');
  });

  it('never changes the authored schema', () => {
    const before = JSON.stringify(quiz);
    schemaForMode(quiz, resolveMode('exam'));
    schemaForMode(quiz, resolveMode('poll'));
    expect(JSON.stringify(quiz)).toBe(before);
  });

  it('gives an exam one try, shuffling and lockdown, with answers after it closes', () => {
    const exam = resolveMode('exam');
    expect(exam).toMatchObject({
      hints: false,
      triesPerQuestion: 1,
      lockdown: true,
      shuffle: true,
    });
    expect(isRevealed(exam.revealAnswers, 'submitted')).toBe(false);
    expect(isRevealed(exam.revealAnswers, 'closed')).toBe(true);
    expect(isRevealed(resolveMode('practice').feedback, 'answered')).toBe(true);
    expect(isRevealed(resolveMode('poll').resultsToParticipants, 'answered')).toBe(true);
  });
});

describe('journal', () => {
  it('keeps a step sent twice once', () => {
    const once = journalOf({ id: 's1', kind: 'answered', part: 'q1', response: 1 });
    expect(appendStep(once, step({ id: 's1', kind: 'answered', part: 'q1', response: 1 }, 5))).toBe(
      once,
    );
  });

  it('tells help before an answer from review after it', () => {
    const journal = journalOf(
      { id: '1', kind: 'answered', part: 'alone', response: 'a' },
      { id: '2', kind: 'help_asked', part: 'helped' },
      { id: '3', kind: 'helped', part: 'helped', assistance: 'hint', level: 1 },
      { id: '4', kind: 'helped', part: 'helped', assistance: 'hint', level: 2 },
      { id: '5', kind: 'helped', part: 'helped', assistance: 'teacher', helperId: 'teacher-1' },
      { id: '6', kind: 'answered', part: 'helped', response: 'b' },
      { id: '7', kind: 'helped', part: 'alone', assistance: 'worked_example' },
    );
    const byPart = assistanceByPart(journal);
    expect(byPart.get('alone')).toMatchObject({
      independent: true,
      kinds: [],
      helpAfterAnswer: true,
    });
    expect(byPart.get('helped')).toMatchObject({
      independent: false,
      kinds: ['hint', 'teacher'],
      highestHintLevel: 2,
      askedForHelp: true,
      tries: 1,
    });
  });

  it('counts a wrong try, a retry and a second answer', () => {
    const journal = journalOf(
      { id: '1', kind: 'answered', part: 'q', response: 'x' },
      { id: '2', kind: 'retried', part: 'q' },
      { id: '3', kind: 'answered', part: 'q', response: 'y' },
      { id: '4', kind: 'left_app' },
      { id: '5', kind: 'returned' },
    );
    const input = gradeInputFromJournal(journal);
    expect(input.attemptsByField).toEqual({ q: 2 });
    expect(input.hintsUsed).toEqual([]);
    expect(input.proctoringEvents?.map((e) => e.type)).toEqual([
      'retry-attempted',
      'app-blur',
      'app-focus',
    ]);
    expect(input.timerExpired).toBe(false);
  });
});

describe('video cues', () => {
  const authored: VideoCue[] = [
    { id: 'c2', atMs: 60_000, parts: ['q2'], pause: true, required: true },
    { id: 'c1', atMs: 30_000, parts: ['q1'], pause: false, required: false },
    { id: 'c3', atMs: 90_000, parts: ['q3'], pause: true, required: false },
  ];
  const { cues } = prepareCues(authored);

  it('reports authoring problems instead of failing later', () => {
    const bad = prepareCues(
      [
        { id: 'a', atMs: 10, parts: ['q'], pause: true, required: false },
        { id: 'a', atMs: 20, parts: ['q'], pause: true, required: false },
        { id: 'b', atMs: 999_999, parts: ['q'], pause: true, required: false },
        { id: 'c', atMs: 5, parts: [], pause: true, required: false },
      ],
      120_000,
    );
    expect(bad.problems.map((p) => p.code)).toEqual(['duplicate_id', 'after_end', 'no_questions']);
    expect(bad.cues).toEqual([]);
  });

  it('opens a cue crossed between ticks, and pauses at it when it pauses', () => {
    let state = initialCueState(29_800);
    const first = advanceCues(cues, state, 30_050, false);
    expect(first.due.map((c) => c.id)).toEqual(['c1']);
    expect(first.pause).toBe(false);
    state = answerCue(first.next, 'c1');

    const tick = advanceCues(cues, { ...state, positionMs: 59_900 }, 60_200, false);
    expect(tick).toMatchObject({ positionMs: 60_000, pause: true });
    expect(tick.due.map((c) => c.id)).toEqual(['c2']);
    expect(canResume(cues, tick.next)).toBe(false);
    expect(canResume(cues, answerCue(tick.next, 'c2'))).toBe(true);
  });

  it('stops a seek at an unanswered required question, and lets it through once answered', () => {
    const seek = advanceCues(cues, initialCueState(10_000), 100_000, true);
    expect(seek).toMatchObject({ positionMs: 60_000, pause: true });
    expect(seek.due.map((c) => c.id)).toEqual(['c2']);

    const answered = answerCue(seek.next, 'c2');
    const again = advanceCues(cues, { ...answered, positionMs: 10_000 }, 100_000, true);
    expect(again).toMatchObject({ positionMs: 100_000, pause: false, due: [] });
  });

  it('treats a long forward tick as a seek and backwards as free', () => {
    const jump = advanceCues(cues, initialCueState(1_000), 95_000, false);
    expect(jump.positionMs).toBe(60_000);
    const back = advanceCues(cues, { ...initialCueState(95_000) }, 5_000, true);
    expect(back).toMatchObject({ positionMs: 5_000, due: [], pause: false });
  });

  it('lets a policy allow seeking past required questions, and open what was skipped', () => {
    const policy = {
      ...DEFAULT_CUE_POLICY,
      seekPastRequired: 'allow' as const,
      openSkippedOptional: true,
    };
    const seek = advanceCues(cues, initialCueState(0), 100_000, true, policy);
    expect(seek).toMatchObject({ positionMs: 100_000, pause: false });
    expect(seek.due.map((c) => c.id)).toEqual(['c1', 'c3']);
  });

  it('lets optional questions be dismissed but not required ones', () => {
    const open = { ...initialCueState(0), open: ['c2', 'c3'] };
    expect(dismissCue(cues, open, 'c3').open).toEqual(['c2']);
    expect(dismissCue(cues, open, 'c2').open).toEqual(['c2', 'c3']);
  });

  it('does not reopen an answered cue when rewatching', () => {
    const state = answerCue(initialCueState(0), 'c1');
    expect(advanceCues(cues, { ...state, positionMs: 29_000 }, 30_500, false).due).toEqual([]);
  });
});
