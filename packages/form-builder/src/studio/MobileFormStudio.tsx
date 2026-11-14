import { MultiStepFormManager } from '@intuitui-labs/form-builder-engine';
import type { FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import {
  createFormStudioStore,
  type StudioAction,
  type StudioState,
} from '@intuitui-labs/form-builder-engine/studio';
import { Button, Text } from '@repo/ui/components/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import NativeForm from '../NativeForm';
import {
  type AppliedDraft,
  blankRubricFor,
  checkQuizReadiness,
  gradedFields,
  missingQuizModeConfig,
  type QuizProblem,
} from '../quiz';
import { QuizRunner } from '../runner';
import { MobileStudioCanvas } from './MobileStudioCanvas';
import { BranchingSheet } from './sheets/BranchingSheet';
import { FieldPaletteSheet } from './sheets/FieldPaletteSheet';
import { QuizRubricSheet } from './sheets/QuizRubricSheet';

export interface MobileFormStudioProps {
  initialSchema?: FormSchema;
  /**
   * Stores the form. Throw (or reject) if it could not be stored; the studio
   * then keeps the changes marked unsaved. Without it, Save says plainly that
   * nothing is stored.
   */
  onSave?: (schema: FormSchema) => void | Promise<void>;
  /** Publishes the form. Quizzes reach this only after the quiz check passes. */
  onPublish?: (schema: FormSchema) => void | Promise<void>;
  title?: string;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'failed' | 'unconnected';

export function MobileFormStudio({
  initialSchema,
  onSave,
  onPublish,
  title,
}: MobileFormStudioProps) {
  const { t } = useTranslation();
  // Created once. A new `initialSchema` object from a re-render must not wipe the teacher's work.
  const [store] = useState(() => createFormStudioStore(initialSchema));
  const [state, setState] = useState<StudioState>(() => store.getState());
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [blockers, setBlockers] = useState<QuizProblem[]>([]);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => store.subscribe((next) => setState({ ...next })), [store]);

  const activePage = useMemo(
    () => state.schema.pages.find((p) => p.id === state.activePageId) ?? state.schema.pages[0]!,
    [state.schema.pages, state.activePageId],
  );

  const selectedField = useMemo(() => {
    if (!state.selectedFieldId) return null;
    for (const page of state.schema.pages) {
      const field = page.fields.find((f) => f.id === state.selectedFieldId);
      if (field) return field;
    }
    return null;
  }, [state.schema.pages, state.selectedFieldId]);

  const isQuiz = gradedFields(state.schema).length > 0;

  const previewManager = useMemo(() => {
    if (state.mode !== 'preview' || isQuiz) return null;
    try {
      return new MultiStepFormManager(store.toFormSchema(), async () => {});
    } catch {
      return null;
    }
  }, [state.mode, isQuiz, store]);

  /** Dispatches actions as one undoable step, switching quiz mode on when needed. */
  const commit = useCallback(
    (actions: StudioAction[]) => {
      store.dispatch({ type: 'BATCH_ACTIONS', payload: { actions } });
      const config = missingQuizModeConfig(store.toFormSchema());
      if (config) store.dispatch({ type: 'UPDATE_ASSESSMENT_CONFIG', payload: { config } });
    },
    [store],
  );

  const handlePaletteSelect = useCallback(
    (option: {
      type: FormSchema['pages'][number]['fields'][number]['type'];
      label: string;
      isQuizGraded?: boolean;
    }) => {
      const fieldId = `q-${Date.now().toString(36)}`;
      const field = {
        id: fieldId,
        name: `field_${fieldId}`,
        type: option.type,
        label: '',
        required: false,
      };
      const actions: StudioAction[] = [
        {
          type: 'INSERT_FIELD',
          payload: { pageId: activePage.id, index: activePage.fields.length, field },
        },
      ];
      // A marked question starts with no answer key; the sheet opens to set it.
      const rubric = option.isQuizGraded ? blankRubricFor(field) : undefined;
      if (rubric) actions.push({ type: 'SET_FIELD_RUBRIC', payload: { fieldId, rubric } });
      commit(actions);
      store.dispatch(
        rubric
          ? { type: 'OPEN_SHEET', payload: { sheet: 'rubric', fieldId } }
          : { type: 'CLOSE_SHEET' },
      );
    },
    [activePage.id, activePage.fields.length, commit, store],
  );

  const handleSaveMarking = useCallback(
    (fieldId: string, applied: AppliedDraft) => {
      const page = state.schema.pages.find((p) => p.fields.some((f) => f.id === fieldId));
      if (!page) return;
      const updates = applied.options
        ? { label: applied.label, options: applied.options }
        : { label: applied.label };
      const actions: StudioAction[] = [
        { type: 'UPDATE_FIELD', payload: { pageId: page.id, fieldId, updates } },
      ];
      actions.push({ type: 'SET_FIELD_RUBRIC', payload: { fieldId, rubric: applied.rubric } });
      commit(actions);
    },
    [state.schema.pages, commit],
  );

  const handleSave = async () => {
    if (!onSave) {
      setSaveState('unconnected');
      return;
    }
    setSaveState('saving');
    try {
      await onSave(store.toFormSchema());
      store.dispatch({ type: 'RESET_DIRTY' });
      setSaveState('saved');
    } catch {
      setSaveState('failed');
    }
  };

  const handlePublish = async () => {
    const schema = store.toFormSchema();
    if (isQuiz) {
      const readiness = checkQuizReadiness(schema);
      const found = readiness.problems.filter((p) => p.severity === 'blocker');
      setBlockers(found);
      if (found.length > 0) return;
    }
    await onPublish?.(schema);
  };

  const status = (() => {
    switch (saveState) {
      case 'unconnected':
        return t(
          'forms.studio.unconnected',
          'Not saved. This screen is not connected to storage yet.',
        );
      case 'saving':
        return t('forms.studio.saving', 'Saving…');
      case 'failed':
        return t('forms.studio.saveFailed', 'Could not save. Your changes are still here.');
      default:
        if (state.isDirty) return t('forms.studio.unsaved', 'Changes not saved yet');
        return saveState === 'saved' ? t('forms.studio.saved', 'Saved') : '';
    }
  })();

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text kind="title" numberOfLines={1}>
            {title ??
              (isQuiz ? t('forms.studio.quizTitle', 'Quiz') : t('forms.studio.formTitle', 'Form'))}
          </Text>
          {status ? (
            <Text
              kind="caption"
              tone={saveState === 'failed' || saveState === 'unconnected' ? 'danger' : 'soft'}
              accessibilityLiveRegion="polite"
            >
              {status}
            </Text>
          ) : null}
        </View>
        <Button
          variant="quiet"
          size="sm"
          label={t('forms.studio.undo', 'Undo')}
          disabled={!store.canUndo()}
          onPress={() => store.dispatch({ type: 'UNDO' })}
        />
        <Button
          variant="quiet"
          size="sm"
          label={t('forms.studio.redo', 'Redo')}
          disabled={!store.canRedo()}
          onPress={() => store.dispatch({ type: 'REDO' })}
        />
        <Button
          variant="secondary"
          size="sm"
          label={
            state.mode === 'preview'
              ? t('forms.studio.edit', 'Edit')
              : t('forms.studio.preview', 'Try it')
          }
          onPress={() => {
            setPreviewKey((k) => k + 1);
            store.dispatch({
              type: 'SET_MODE',
              payload: { mode: state.mode === 'edit' ? 'preview' : 'edit' },
            });
          }}
        />
        <Button
          variant="primary"
          size="sm"
          label={t('forms.studio.save', 'Save')}
          loading={saveState === 'saving'}
          onPress={handleSave}
        />
      </View>

      {blockers.length > 0 && (
        <View style={styles.blockers} accessibilityLiveRegion="polite">
          <Text kind="label">
            {t('forms.studio.notReady', 'This quiz is not ready to share yet.')}
          </Text>
          {blockers.map((p, i) => (
            <Text key={`${p.code}-${p.fieldId ?? i}`} kind="caption" tone="danger">
              {t(`quiz.problem.${p.code}`, p.message)}
            </Text>
          ))}
        </View>
      )}

      {state.mode === 'edit' ? (
        <MobileStudioCanvas
          store={store}
          activePage={activePage}
          allPages={state.schema.pages}
          onOpenPalette={() =>
            store.dispatch({ type: 'OPEN_SHEET', payload: { sheet: 'palette' } })
          }
          onOpenRubric={(fieldId) =>
            store.dispatch({ type: 'OPEN_SHEET', payload: { sheet: 'rubric', fieldId } })
          }
          onOpenBranching={() =>
            store.dispatch({ type: 'OPEN_SHEET', payload: { sheet: 'branching' } })
          }
        />
      ) : isQuiz ? (
        <QuizRunner
          key={previewKey}
          preview
          schema={store.toFormSchema()}
          attemptId={`preview-${previewKey}`}
          startedAt={new Date().toISOString()}
          onSubmit={() => {}}
        />
      ) : previewManager ? (
        <View style={styles.preview}>
          <NativeForm multiStepManager={previewManager} />
        </View>
      ) : (
        <Text kind="body" tone="soft" style={styles.preview}>
          {t('forms.studio.previewFailed', 'This form cannot be shown yet. Check its questions.')}
        </Text>
      )}

      {onPublish && state.mode === 'edit' && (
        <View style={styles.footer}>
          <Button
            variant="secondary"
            fullWidth
            label={
              isQuiz
                ? t('forms.studio.publishQuiz', 'Share with students')
                : t('forms.studio.publish', 'Publish')
            }
            onPress={handlePublish}
          />
        </View>
      )}

      <FieldPaletteSheet
        isOpen={state.activeSheet === 'palette'}
        onClose={() => store.dispatch({ type: 'CLOSE_SHEET' })}
        onSelectOption={handlePaletteSelect}
      />
      <QuizRubricSheet
        isOpen={state.activeSheet === 'rubric' || state.activeSheet === 'field-edit'}
        field={selectedField}
        onClose={() => store.dispatch({ type: 'CLOSE_SHEET' })}
        onSave={handleSaveMarking}
      />
      <BranchingSheet
        isOpen={state.activeSheet === 'branching'}
        activePage={activePage}
        allPages={state.schema.pages}
        onClose={() => store.dispatch({ type: 'CLOSE_SHEET' })}
        onAddJumpRule={(pageId, rule) =>
          store.dispatch({ type: 'ADD_JUMP_RULE', payload: { pageId, rule } })
        }
        onRemoveJumpRule={(pageId, ruleIndex) =>
          store.dispatch({ type: 'REMOVE_JUMP_RULE', payload: { pageId, ruleIndex } })
        }
      />
    </View>
  );
}

export default MobileFormStudio;

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleBlock: { flexGrow: 1, flexBasis: 140, gap: 2 },
  blockers: { paddingHorizontal: 16, paddingBottom: 12, gap: 4 },
  preview: { flex: 1, padding: 20 },
  footer: { padding: 16 },
});
