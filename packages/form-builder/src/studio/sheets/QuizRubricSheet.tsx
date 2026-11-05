import type { QuestionRubric } from '@intuitui-labs/form-builder-engine/assessment';
import type { FormField } from '@intuitui-labs/form-builder-engine/schema';
import {
  Button,
  Chip,
  Section,
  Surface,
  Switch,
  Text,
  TextField,
} from '@repo/ui/world/native';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  type AppliedDraft,
  applyDraft,
  checkQuizReadiness,
  draftFromField,
  gradableKindsFor,
  type MarkingDraft,
  newChoice,
  removeChoice,
  toggleCorrect,
} from '../../quiz';

export interface QuizRubricSheetProps {
  isOpen: boolean;
  field: (FormField & { rubric?: QuestionRubric }) | null;
  onClose: () => void;
  /** Stores the question text, choices and marking together, as one undoable step. */
  onSave: (fieldId: string, applied: AppliedDraft) => void;
}

const makeId = () => Math.random().toString(36).slice(2, 8);

/**
 * The question sheet: the question text, its choices and correct answer,
 * marks, and what students see afterwards. Problems are named while the teacher types; the
 * sheet still saves an unfinished question, and the quiz check blocks
 * publishing until it is complete.
 */
export function QuizRubricSheet({ isOpen, field, onClose, onSave }: QuizRubricSheetProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<MarkingDraft | null>(null);

  useEffect(() => {
    setDraft(isOpen && field ? draftFromField(field) : null);
  }, [isOpen, field]);

  const kind = field ? gradableKindsFor(field)[0] : undefined;
  const multiple = kind === 'multiple-choice';
  const isChoice = kind === 'single-choice' || multiple;

  const problems = useMemo(() => {
    if (!field || !draft?.graded) return [];
    const applied = applyDraft(field, draft);
    const preview = { ...field, options: applied.options ?? field.options, rubric: applied.rubric };
    return checkQuizReadiness({ id: 'preview', title: '', pages: [{ id: 'p', fields: [preview] }] })
      .problems.filter((p) => p.fieldId === field.id);
  }, [field, draft]);

  if (!isOpen || !field || !draft) return null;

  const set = (patch: Partial<MarkingDraft>) => setDraft({ ...draft, ...patch });
  const setChoiceLabel = (value: string, label: string) =>
    set({ choices: draft.choices.map((c) => (c.value === value ? { ...c, label } : c)) });

  const save = () => {
    onSave(field.id, applyDraft(field, draft));
    onClose();
  };

  return (
    <Surface tone="raised" style={styles.sheet} accessibilityViewIsModal>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text kind="title">{t('quiz.marking.title', 'Question')}</Text>
        </View>
        <Button variant="quiet" size="sm" label={t('common.close', 'Close')} onPress={onClose} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
      >
        <TextField
          label={t('quiz.marking.questionText', 'Question, as students will read it')}
          multiline
          value={draft.label}
          onChangeText={(label) => set({ label })}
        />
        {!kind ? (
          <Text kind="body" tone="soft">
            {t(
              'quiz.marking.notGradable',
              'This kind of question cannot be marked automatically. Paragraph answers and photos need a teacher to read them.',
            )}
          </Text>
        ) : (
          <>
            <Switch
              label={t('quiz.marking.markThis', 'Mark this question')}
              value={draft.graded}
              onValueChange={(graded) => set({ graded })}
            />

            {isChoice && (
              <Section
                title={t('quiz.marking.choices', 'Choices')}
                voice={
                  multiple
                    ? t('quiz.marking.choicesVoiceMulti', 'Tap every correct answer.')
                    : t('quiz.marking.choicesVoice', 'Tap the correct answer.')
                }
              >
                {draft.choices.map((choice, i) => (
                  <View key={choice.value} style={styles.choice}>
                    <View style={styles.grow}>
                      <TextField
                        label={t('quiz.marking.choiceN', 'Choice {{n}}', { n: i + 1 })}
                        value={choice.label}
                        onChangeText={(label) => setChoiceLabel(choice.value, label)}
                      />
                    </View>
                    {draft.graded && (
                      <Chip
                        kind={multiple ? 'checkbox' : 'radio'}
                        label={t('quiz.marking.correct', 'Correct')}
                        selected={draft.correct.includes(choice.value)}
                        disabled={choice.label.trim() === ''}
                        onPress={() => setDraft(toggleCorrect(draft, choice.value, multiple))}
                      />
                    )}
                    <Button
                      variant="quiet"
                      size="sm"
                      label={t('quiz.marking.remove', 'Remove')}
                      accessibilityLabel={t('quiz.marking.removeN', 'Remove choice {{n}}', { n: i + 1 })}
                      onPress={() => setDraft(removeChoice(draft, choice.value))}
                    />
                  </View>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  label={t('quiz.marking.addChoice', 'Add a choice')}
                  onPress={() => set({ choices: [...draft.choices, newChoice(draft.choices, makeId)] })}
                />
              </Section>
            )}

            {draft.graded && kind === 'numeric-range' && (
              <Section title={t('quiz.marking.answer', 'Answer')}>
                <TextField
                  label={t('quiz.marking.correctNumber', 'Correct number')}
                  keyboardType="decimal-pad"
                  value={draft.target}
                  onChangeText={(target) => set({ target })}
                />
                <TextField
                  label={t('quiz.marking.tolerance', 'Allowed difference')}
                  hint={t('quiz.marking.toleranceHint', '0 means the answer must be exact.')}
                  keyboardType="decimal-pad"
                  value={draft.tolerance}
                  onChangeText={(tolerance) => set({ tolerance })}
                />
              </Section>
            )}

            {draft.graded && kind === 'text-match' && (
              <Section title={t('quiz.marking.answer', 'Answer')}>
                <TextField
                  label={t('quiz.marking.accepted', 'Accepted answers, one per line')}
                  hint={t(
                    'quiz.marking.acceptedHint',
                    'Spelling must match. Capital letters and extra spaces do not matter.',
                  )}
                  multiline
                  value={draft.accepted}
                  onChangeText={(accepted) => set({ accepted })}
                />
              </Section>
            )}

            {draft.graded && (
              <Section title={t('quiz.marking.marksTitle', 'Marks')}>
                <TextField
                  label={t('quiz.marking.marks', 'Marks for this question')}
                  keyboardType="decimal-pad"
                  value={draft.points}
                  onChangeText={(points) => set({ points })}
                />
                <TextField
                  label={t('quiz.marking.explanation', 'Explanation (optional)')}
                  hint={t('quiz.marking.explanationHint', 'Students see this after they submit.')}
                  multiline
                  value={draft.explanation}
                  onChangeText={(explanation) => set({ explanation })}
                />
              </Section>
            )}

            {problems.length > 0 && (
              <View accessibilityLiveRegion="polite" style={styles.problems}>
                {problems.map((p) => (
                  <Text key={p.code} kind="caption" tone={p.severity === 'blocker' ? 'danger' : 'soft'}>
                    {t(`quiz.problem.${p.code}`, p.message)}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Button
        variant="primary"
        fullWidth
        label={t('quiz.marking.save', 'Save')}
        onPress={save}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '88%',
    padding: 20,
    gap: 12,
    zIndex: 50,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerText: { flex: 1, gap: 2 },
  body: { flexGrow: 0 },
  bodyContent: { gap: 16, paddingBottom: 8 },
  choice: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  grow: { flex: 1 },
  problems: { gap: 4 },
});
