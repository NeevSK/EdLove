import type { FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import { WorldScope } from '@repo/ui/world/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type React from 'react';
import { vi } from 'vitest';
import type { QuizAttempt } from '../../quiz';
import { QuizRunner } from '../QuizRunner';

vi.mock('@repo/ui/utils/haptics', () => ({ hapticImpact: vi.fn() }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string, vars?: Record<string, unknown>) =>
      fallback.replace(/\{\{(\w+)\}\}/g, (_m, k: string) => String(vars?.[k] ?? '')),
  }),
}));

const schema = {
  id: 'quiz-1',
  title: 'Grade 6 science',
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
          rubric: { kind: 'single-choice', points: 2, correctValue: 'mercury' },
        },
        {
          id: 'f2',
          name: 'legs',
          type: 'number',
          label: 'Legs on an insect',
          required: false,
          order: 1,
          rubric: { kind: 'numeric-range', points: 1, targetValue: 6, tolerance: 0 },
        },
      ],
    },
  ],
} as FormSchema;

const base = { schema, attemptId: 'att-1', startedAt: '2026-11-05T08:00:00.000Z' };

function inWorld(node: React.ReactNode) {
  return (
    <WorldScope world="sanctuary" phase="morning" mode="light">
      {node}
    </WorldScope>
  );
}

describe('QuizRunner (mounted)', { tags: ['interaction', 'unit'] }, () => {
  it('lets a student pick a choice, type a number, submit and see marks', async () => {
    const onSubmit = vi.fn<(a: QuizAttempt) => void>();
    const screen = await render(inWorld(<QuizRunner {...base} onSubmit={onSubmit} />));

    await fireEvent.press(screen.getByRole('radio', { name: 'Mercury' }));
    await fireEvent.changeText(screen.getByLabelText('Legs on an insect'), '6');
    await fireEvent.press(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const attempt = onSubmit.mock.calls[0]![0];
    expect(attempt).toMatchObject({ attemptId: 'att-1', score: 3, maxScore: 3, unansweredCount: 0 });
    expect(await screen.findByText('3 of 3')).toBeTruthy();
  });

  it('asks before submitting with questions unanswered', async () => {
    const onSubmit = vi.fn();
    const screen = await render(inWorld(<QuizRunner {...base} onSubmit={onSubmit} />));

    await fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('2 questions are not answered.')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Submit anyway' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ score: 0, unansweredCount: 2 });
  });

  it('keeps answers and allows retry when saving fails', async () => {
    const onSubmit = vi
      .fn<(a: QuizAttempt) => Promise<void>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(undefined);
    const screen = await render(inWorld(<QuizRunner {...base} onSubmit={onSubmit} />));

    await fireEvent.press(screen.getByRole('radio', { name: 'Mercury' }));
    await fireEvent.changeText(screen.getByLabelText('Legs on an insect'), '6');
    await fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    expect(
      await screen.findByText('Could not save your answers. They are still here. Try again.'),
    ).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    // Same attempt id both times, so a server can drop the duplicate.
    expect(onSubmit.mock.calls[1]![0].attemptId).toBe('att-1');
    expect(onSubmit.mock.calls[1]![0].score).toBe(3);
  });

  it('resumes saved progress', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      inWorld(
        <QuizRunner
          {...base}
          onSubmit={onSubmit}
          resume={{ values: { planet: 'venus', legs: '6' }, path: ['p1'], proctoringEvents: [] }}
        />,
      ),
    );
    expect(screen.getByRole('radio', { name: 'Venus' }).props.accessibilityState).toMatchObject({
      checked: true,
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ score: 1, maxScore: 3 });
  });
});
