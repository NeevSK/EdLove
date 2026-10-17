import { MultiStepFormManager } from '@intuitui-labs/form-builder-engine';
import type { FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import {
  createFormStudioStore,
  FormStudioStore,
  type StudioState,
} from '@intuitui-labs/form-builder-engine/studio';
import { Award, Check, Eye, Play, RotateCcw, RotateCw, Save, Settings2 } from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import NativeForm from '../NativeForm';
import { MobileStudioCanvas } from './MobileStudioCanvas';
import { BranchingSheet } from './sheets/BranchingSheet';
import { FieldPaletteSheet } from './sheets/FieldPaletteSheet';
import { QuizRubricSheet } from './sheets/QuizRubricSheet';

export interface MobileFormStudioProps {
  initialSchema?: FormSchema;
  onSave?: (schema: FormSchema) => void;
  onPublish?: (schema: FormSchema) => void;
  title?: string;
}

export function MobileFormStudio({
  initialSchema,
  onSave,
  onPublish,
  title = 'Mobile Form & Quiz Studio',
}: MobileFormStudioProps) {
  const store = useMemo(() => createFormStudioStore(initialSchema), [initialSchema]);

  const [state, setState] = useState<StudioState>(() => store.getState());

  useEffect(() => {
    return store.subscribe((next) => {
      setState({ ...next });
    });
  }, [store]);

  const activePage = useMemo(() => {
    return state.schema.pages.find((p) => p.id === state.activePageId) ?? state.schema.pages[0]!;
  }, [state.schema.pages, state.activePageId]);

  const selectedField = useMemo(() => {
    if (!state.selectedFieldId) return null;
    for (const page of state.schema.pages) {
      const field = page.fields.find((f) => f.id === state.selectedFieldId);
      if (field) return field;
    }
    return null;
  }, [state.schema.pages, state.selectedFieldId]);

  // Live preview manager instance
  const previewMultiStepManager = useMemo(() => {
    if (state.mode !== 'preview') return null;
    try {
      return new MultiStepFormManager(store.toFormSchema(), async (values) => {
        // Preview run completion
      });
    } catch {
      return null;
    }
  }, [state.mode, state.schema, store]);

  const handlePaletteSelect = useCallback(
    (option: any) => {
      const fieldId = `q-${Date.now().toString(36)}`;
      store.dispatch({
        type: 'INSERT_FIELD',
        payload: {
          pageId: activePage.id,
          index: activePage.fields.length,
          field: {
            id: fieldId,
            name: `field_${fieldId}`,
            type: option.type,
            label: option.isQuizGraded ? `Graded ${option.label}` : `New ${option.label}`,
            required: false,
          },
        },
      });

      if (option.isQuizGraded) {
        store.dispatch({
          type: 'SET_FIELD_RUBRIC',
          payload: {
            fieldId,
            rubric: {
              kind: option.type === 'number' ? 'numeric-range' : 'single-choice',
              points: 10,
              correctValue: 'Correct Option',
              explanation: 'Default explanation.',
              targetValue: 10,
              tolerance: 0,
            } as any,
          },
        });
      }

      store.dispatch({ type: 'CLOSE_SHEET' });
    },
    [activePage.id, activePage.fields.length, store],
  );

  const handleSave = () => {
    onSave?.(store.toFormSchema());
    store.dispatch({ type: 'RESET_DIRTY' });
  };

  return (
    <VStack className="flex-1 w-full bg-slate-100">
      {/* Studio Navigation Header */}
      <Box className="pt-3 pb-3 px-4 bg-white border-b border-slate-200">
        <HStack className="items-center justify-between">
          <VStack>
            <Text className="text-base font-black text-slate-900">{title}</Text>
            <Text className="text-[11px] text-slate-400">
              {state.isDirty ? '• Unsaved changes' : 'All changes in memory'}
            </Text>
          </VStack>

          <HStack className="items-center gap-2">
            {/* Undo Button */}
            <Pressable
              onPress={() => store.dispatch({ type: 'UNDO' })}
              disabled={!store.canUndo()}
              className={`p-2 rounded-xl border ${
                store.canUndo() ? 'bg-slate-50 border-slate-200' : 'opacity-30 border-transparent'
              }`}
            >
              <Icon as={RotateCcw} size={16} color="#475569" />
            </Pressable>

            {/* Redo Button */}
            <Pressable
              onPress={() => store.dispatch({ type: 'REDO' })}
              disabled={!store.canRedo()}
              className={`p-2 rounded-xl border ${
                store.canRedo() ? 'bg-slate-50 border-slate-200' : 'opacity-30 border-transparent'
              }`}
            >
              <Icon as={RotateCw} size={16} color="#475569" />
            </Pressable>

            {/* Mode Toggle Switch (Edit vs Preview) */}
            <Pressable
              onPress={() =>
                store.dispatch({
                  type: 'SET_MODE',
                  payload: { mode: state.mode === 'edit' ? 'preview' : 'edit' },
                })
              }
              className={`px-3 py-1.5 rounded-xl border flex-row items-center gap-1.5 ${
                state.mode === 'preview'
                  ? 'bg-emerald-600 border-emerald-600'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <Icon
                as={state.mode === 'preview' ? Eye : Play}
                size={14}
                color={state.mode === 'preview' ? '#FFFFFF' : '#475569'}
              />
              <Text
                className={`text-xs font-bold ${
                  state.mode === 'preview' ? 'text-white' : 'text-slate-700'
                }`}
              >
                {state.mode === 'preview' ? 'Editing' : 'Preview'}
              </Text>
            </Pressable>

            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 flex-row items-center gap-1.5 shadow-xs"
            >
              <Icon as={Save} size={14} color="#FFFFFF" />
              <Text className="text-xs font-bold text-white">Save</Text>
            </Pressable>
          </HStack>
        </HStack>
      </Box>

      {/* Main Content: Edit Canvas vs Live Preview Runner */}
      {state.mode === 'edit' ? (
        <MobileStudioCanvas
          store={store}
          activePage={activePage}
          allPages={state.schema.pages}
          onOpenPalette={() =>
            store.dispatch({ type: 'OPEN_SHEET', payload: { sheet: 'palette' } })
          }
          onOpenRubric={(fieldId) =>
            store.dispatch({
              type: 'OPEN_SHEET',
              payload: { sheet: 'rubric', fieldId },
            })
          }
          onOpenBranching={() =>
            store.dispatch({
              type: 'OPEN_SHEET',
              payload: { sheet: 'branching' },
            })
          }
        />
      ) : (
        /* Live Preview Interactive Runner */
        <Box className="flex-1 p-5 bg-white">
          {previewMultiStepManager ? (
            <NativeForm multiStepManager={previewMultiStepManager} />
          ) : (
            <Box className="p-8 items-center justify-center">
              <Text className="text-sm text-slate-400">
                Unable to preview form. Please check schema fields.
              </Text>
            </Box>
          )}
        </Box>
      )}

      {/* Sheets */}
      <FieldPaletteSheet
        isOpen={state.activeSheet === 'palette'}
        onClose={() => store.dispatch({ type: 'CLOSE_SHEET' })}
        onSelectOption={handlePaletteSelect}
      />

      <QuizRubricSheet
        isOpen={state.activeSheet === 'rubric'}
        field={selectedField}
        onClose={() => store.dispatch({ type: 'CLOSE_SHEET' })}
        onSaveRubric={(fieldId, rubric) =>
          store.dispatch({
            type: 'SET_FIELD_RUBRIC',
            payload: { fieldId, rubric },
          })
        }
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
          store.dispatch({
            type: 'REMOVE_JUMP_RULE',
            payload: { pageId, ruleIndex },
          })
        }
      />
    </VStack>
  );
}
export default MobileFormStudio;
