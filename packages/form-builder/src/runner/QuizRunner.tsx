import { Mulberry32PRNG, type ProctoringEvent } from '@intuitui-labs/form-builder-engine/assessment';
import { evaluateCondition } from '@intuitui-labs/form-builder-engine/core';
import type { FormField, FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import { Button, Chip, Chips, Section, Text, TextField } from '@repo/ui/world/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, ScrollView, StyleSheet, View } from 'react-native';
import { gradeQuiz, isBlankAnswer, nextPageId, type QuizAttempt, withQuizMode } from '../quiz';

/** Everything needed to resume an attempt after the app is closed. */
export interface QuizProgress {
  values: Record<string, unknown>;
  /** Pages seen, in order; the last is the current page. */
  path: string[];
  proctoringEvents: ProctoringEvent[];
}

export interface QuizRunnerProps {
  schema: FormSchema;
  /** Made once when the student starts, and kept. Makes resending safe. */
  attemptId: string;
  /** ISO time the attempt began. The timer counts from here, so a restart cannot reset it. */
  startedAt: string;
  responderId?: string;
  /** Saved progress, to resume where the student left off. */
  resume?: QuizProgress;
  /** Called on every change; store it to survive the app closing. */
  onProgress?: (progress: QuizProgress) => void;
  /** Store the attempt. Throw if it could not be stored, and the student can try again. */
  onSubmit: (attempt: QuizAttempt) => Promise<void> | void;
  /** Teacher preview: marks are shown, nothing is stored. */
  preview?: boolean;
}

type Phase = 'answering' | 'submitting' | 'failed' | 'done';

export function QuizRunner(props: QuizRunnerProps) {
  const { attemptId, startedAt, responderId, resume, onProgress, onSubmit, preview } = props;
  const { t } = useTranslation();
  const schema = useMemo(() => withQuizMode(props.schema), [props.schema]);
  const config = schema.assessment;
  const firstPage = schema.pages[0]?.id;

  const [values, setValues] = useState<Record<string, unknown>>(resume?.values ?? {});
  const [path, setPath] = useState<string[]>(
    resume?.path?.length ? resume.path : firstPage ? [firstPage] : [],
  );
  const [events, setEvents] = useState<ProctoringEvent[]>(resume?.proctoringEvents ?? []);
  const [phase, setPhase] = useState<Phase>('answering');
  const [confirmingBlank, setConfirmingBlank] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const submitting = useRef(false);

  const pageId = path[path.length - 1];
  const page = schema.pages.find((p) => p.id === pageId);

  useEffect(() => {
    if (phase === 'answering') onProgress?.({ values, path, proctoringEvents: events });
  }, [values, path, events, phase, onProgress]);

  // Leaving the app is recorded for the teacher to see. It never changes marks.
  useEffect(() => {
    if (preview) return;
    const sub = AppState.addEventListener('change', (state) => {
      const type = state === 'active' ? 'app-focus' : state === 'background' ? 'app-blur' : null;
      if (type) setEvents((e) => [...e, { type, timestamp: new Date().toISOString() }]);
    });
    return () => sub.remove();
  }, [preview]);

  const grade = useCallback(
    (timerExpired: boolean) =>
      gradeQuiz(schema, values, {
        attemptId,
        startedAt,
        responderId,
        submittedAt: new Date().toISOString(),
        visitedPageIds: path,
        proctoringEvents: events,
        timerExpired,
      }),
    [schema, values, attemptId, startedAt, responderId, path, events],
  );

  const submit = useCallback(
    async (timerExpired = false) => {
      if (submitting.current) return;
      submitting.current = true;
      const attempt = grade(timerExpired);
      setPhase('submitting');
      try {
        if (!preview) await onSubmit(attempt);
        setResult(attempt);
        setPhase('done');
      } catch {
        setPhase('failed');
      } finally {
        submitting.current = false;
      }
    },
    [grade, onSubmit, preview],
  );

  const minutesLeft = useTimer(config?.globalTimerSeconds, startedAt, phase === 'answering', () =>
    submit(true),
  );

  if (phase === 'done' && result) return <QuizResult schema={schema} attempt={result} preview={preview} />;
  if (!page) {
    return (
      <Text kind="body" tone="soft">
        {t('quiz.run.empty', 'This quiz has no questions yet.')}
      </Text>
    );
  }

  const visible = [...page.fields]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((f) => evaluateCondition(f.visibleIf, values));
  const next = nextPageId(schema, page.id, values, path.slice(0, -1), grade(false));
  const unanswered = grade(false).unansweredCount;
  const setValue = (name: string, value: unknown) => {
    setConfirmingBlank(false);
    if (phase === 'failed') setPhase('answering');
    setValues((v) => ({ ...v, [name]: value }));
  };

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      {preview && (
        <Text kind="caption" tone="soft">
          {t('quiz.run.preview', 'Preview. Nothing you enter is saved.')}
        </Text>
      )}
      {(page.title || minutesLeft !== null) && (
        <View style={styles.pageHead}>
          {page.title ? <Text kind="title">{page.title}</Text> : null}
          {minutesLeft !== null && (
            <Text kind="caption" tone={minutesLeft <= 2 ? 'lamp' : 'soft'} accessibilityLiveRegion="polite">
              {minutesLeft <= 1
                ? t('quiz.run.lastMinute', 'Less than a minute left')
                : t('quiz.run.minutesLeft', 'About {{n}} minutes left', { n: minutesLeft })}
            </Text>
          )}
        </View>
      )}

      {visible.map((field) => (
        <QuestionInput
          key={field.id}
          field={field}
          value={values[field.name]}
          seed={`${attemptId}:${field.name}`}
          shuffle={Boolean(config?.shuffleOptions)}
          onChange={(v) => setValue(field.name, v)}
        />
      ))}

      {phase === 'failed' && (
        <Text kind="body" tone="danger" accessibilityLiveRegion="assertive">
          {t('quiz.run.failed', 'Could not save your answers. They are still here. Try again.')}
        </Text>
      )}
      {confirmingBlank && (
        <Text kind="body" accessibilityLiveRegion="polite">
          {t('quiz.run.blankWarning', '{{n}} questions are not answered.', { n: unanswered })}
        </Text>
      )}

      <View style={styles.actions}>
        {path.length > 1 && (
          <Button
            variant="secondary"
            label={t('quiz.run.back', 'Back')}
            onPress={() => setPath((p) => p.slice(0, -1))}
            disabled={phase === 'submitting'}
          />
        )}
        {next ? (
          <Button
            variant="primary"
            label={t('quiz.run.next', 'Next')}
            onPress={() => setPath((p) => [...p, next])}
          />
        ) : (
          <Button
            variant="primary"
            loading={phase === 'submitting'}
            label={
              confirmingBlank
                ? t('quiz.run.submitAnyway', 'Submit anyway')
                : t('quiz.run.submit', 'Submit')
            }
            onPress={() => {
              if (unanswered > 0 && !confirmingBlank) setConfirmingBlank(true);
              else void submit();
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}

/** Whole minutes left, updated once a minute; `null` without a time limit. */
function useTimer(
  limitSeconds: number | undefined,
  startedAt: string,
  running: boolean,
  onExpire: () => void,
): number | null {
  const deadline = limitSeconds ? Date.parse(startedAt) + limitSeconds * 1000 : null;
  const [now, setNow] = useState(() => Date.now());
  const expire = useRef(onExpire);
  expire.current = onExpire;

  useEffect(() => {
    if (!deadline || !running) return;
    const left = deadline - Date.now();
    if (left <= 0) {
      expire.current();
      return;
    }
    // Wake at the next whole minute or the deadline, whichever is first.
    const wait = Math.min(left, 60_000 - (Date.now() % 60_000));
    const id = setTimeout(() => setNow(Date.now()), wait);
    return () => clearTimeout(id);
  }, [deadline, running, now]);

  if (!deadline) return null;
  return Math.max(0, Math.ceil((deadline - now) / 60_000));
}

interface QuestionInputProps {
  field: FormField;
  value: unknown;
  seed: string;
  shuffle: boolean;
  onChange: (value: unknown) => void;
}

function QuestionInput({ field, value, seed, shuffle, onChange }: QuestionInputProps) {
  const { t } = useTranslation();
  const options = useMemo(() => {
    const list = [...(field.options ?? [])];
    return shuffle ? new Mulberry32PRNG(seed).shuffle(list) : list;
  }, [field.options, seed, shuffle]);

  switch (field.type) {
    case 'heading':
      return <Text kind="title">{field.content || field.label}</Text>;
    case 'statement':
    case 'rich-text':
      return <Text kind="body">{field.content || field.label}</Text>;
    case 'divider':
      return <View style={styles.divider} />;
    case 'select': {
      const multiple = field.config?.multiple === true;
      const picked = multiple ? (Array.isArray(value) ? (value as string[]) : []) : [value];
      return (
        <View style={styles.question}>
          <Text kind="body">{field.label}</Text>
          {field.helperText ? <Text kind="caption" tone="soft">{field.helperText}</Text> : null}
          <Chips label={field.label} single={!multiple}>
            {options.map((o) => (
              <Chip
                key={o.value}
                kind={multiple ? 'checkbox' : 'radio'}
                label={o.label}
                selected={picked.includes(o.value)}
                onPress={() =>
                  onChange(
                    multiple
                      ? picked.includes(o.value)
                        ? picked.filter((v) => v !== o.value)
                        : [...picked, o.value]
                      : o.value,
                  )
                }
              />
            ))}
          </Chips>
        </View>
      );
    }
    case 'likert': {
      const max = typeof field.max === 'number' && field.max > 1 ? Math.min(field.max, 10) : 5;
      return (
        <View style={styles.question}>
          <Text kind="body">{field.label}</Text>
          <Chips label={field.label} single>
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
              <Chip key={n} kind="radio" label={String(n)} selected={value === n} onPress={() => onChange(n)} />
            ))}
          </Chips>
        </View>
      );
    }
    case 'number':
    case 'slider':
      // Kept as typed text and read at marking, so "0", "-" and "2." survive typing.
      return (
        <TextField
          label={field.label}
          hint={field.helperText}
          keyboardType="decimal-pad"
          value={typeof value === 'string' ? value : isBlankAnswer(value) ? '' : String(value)}
          onChangeText={onChange}
        />
      );
    case 'text':
    case 'email':
    case 'textarea':
      return (
        <TextField
          label={field.label}
          hint={field.helperText}
          multiline={field.type === 'textarea'}
          keyboardType={field.type === 'email' ? 'email-address' : 'default'}
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
        />
      );
    default:
      return (
        <View style={styles.question}>
          <Text kind="body">{field.label}</Text>
          <Text kind="caption" tone="soft">
            {t('quiz.run.unsupported', 'This question cannot be answered in a quiz yet.')}
          </Text>
        </View>
      );
  }
}

const STATUS_COPY = {
  correct: ['quiz.result.correct', 'Correct'],
  'partly-correct': ['quiz.result.partly', 'Partly correct'],
  wrong: ['quiz.result.wrong', 'Not correct'],
  unanswered: ['quiz.result.unanswered', 'Not answered'],
} as const;

function QuizResult({
  schema,
  attempt,
  preview,
}: {
  schema: FormSchema;
  attempt: QuizAttempt;
  preview?: boolean;
}) {
  const { t } = useTranslation();
  const labels = new Map(schema.pages.flatMap((p) => p.fields.map((f) => [f.id, f.label] as const)));
  const verdict =
    attempt.isPassing === undefined
      ? undefined
      : attempt.isPassing
        ? t('quiz.result.passed', 'Passed.')
        : t('quiz.result.notPassed', 'Not passed yet.');

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Section
        title={t('quiz.result.score', '{{score}} of {{max}}', { score: attempt.score, max: attempt.maxScore })}
        voice={[
          preview
            ? t('quiz.result.previewSaved', 'Preview. Nothing was saved.')
            : t('quiz.result.saved', 'Your answers are saved.'),
          verdict,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {attempt.questions.map((q) => {
          const [key, fallback] = STATUS_COPY[q.status];
          return (
            <View key={q.fieldId} style={styles.question}>
              <Text kind="body">{labels.get(q.fieldId) ?? q.name}</Text>
              <Text kind="caption" tone={q.status === 'correct' ? 'ink' : 'soft'}>
                {`${t(key, fallback)} · ${t('quiz.result.marks', '{{score}} of {{max}} marks', {
                  score: q.score,
                  max: q.maxPoints,
                })}`}
              </Text>
              {q.explanation ? <Text kind="caption" tone="soft">{q.explanation}</Text> : null}
            </View>
          );
        })}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, gap: 20 },
  pageHead: { gap: 4 },
  question: { gap: 8 },
  divider: { height: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
});
