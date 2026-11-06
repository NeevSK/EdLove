import { View, Text, Pressable, ScrollView } from 'react-native';
import type { FormPage, FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import type { FormStudioStore } from '@intuitui-labs/form-builder-engine/studio';
import { DraggableCanvasSurface } from '@repo/ui/components/workspace';
import { useThemedColors } from '@repo/ui/hooks';
import { GitBranch, Plus, Sparkles } from '@repo/ui/icons';
import { Theme } from '@repo/ui/theme/Theme';
import React, { memo } from 'react';
import { MobileStudioCard } from './MobileStudioCard';

export interface MobileStudioCanvasProps {
  store: FormStudioStore;
  activePage: FormPage;
  allPages: FormPage[];
  onOpenPalette: () => void;
  onOpenRubric: (fieldId: string) => void;
  onOpenBranching: () => void;
}

export const MobileStudioCanvas = memo(function MobileStudioCanvas({
  store,
  activePage,
  allPages,
  onOpenPalette,
  onOpenRubric,
  onOpenBranching,
}: MobileStudioCanvasProps) {
  const colors = useThemedColors();
  const fields = activePage.fields ?? [];

  return (
    <View className="flex-1 w-full bg-slate-50">
      {/* Horizontal Step Tabs Carousel */}
      <View className="py-2.5 px-4 bg-white border-b border-slate-200 shadow-2xs">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row items-center items-center gap-2">
            {allPages.map((page, idx) => {
              const isActive = page.id === activePage.id;
              return (
                <Pressable
                  key={page.id}
                  onPress={() =>
                    store.dispatch({
                      type: 'SET_ACTIVE_PAGE',
                      payload: { pageId: page.id },
                    })
                  }
                  className={`px-3.5 py-1.5 rounded-full border items-center justify-center ${
                    isActive ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-600'}`}
                  >
                    {page.title || `Step ${idx + 1}`} ({page.fields.length})
                  </Text>
                </Pressable>
              );
            })}

            {/* Add Step Button */}
            <Pressable
              onPress={() =>
                store.dispatch({
                  type: 'ADD_PAGE',
                  payload: { title: `Step ${allPages.length + 1}` },
                })
              }
              className="px-3 py-1.5 rounded-full bg-slate-100 border border-dashed border-slate-300 flex-row items-center gap-1"
            >
              <Plus size={14} color="#64748B" />
              <Text className="text-xs font-bold text-slate-600">Add Step</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {/* Main Drag-and-Drop Scroll View */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Title Header */}
        <View className="mb-4">
          <Text className="text-xl font-black text-slate-900">{activePage.title || 'Step'}</Text>
          {activePage.description && (
            <Text className="text-xs text-slate-500 mt-0.5">{activePage.description}</Text>
          )}
        </View>

        {/* Empty State */}
        {fields.length === 0 ? (
          <View className="p-8 rounded-3xl border-2 border-dashed border-slate-200 items-center justify-center bg-white/60 my-6">
            <View className="p-4 rounded-2xl bg-amber-50 mb-3">
              <Sparkles size={28} color="#D97706" />
            </View>
            <Text className="text-base font-bold text-slate-800">
              No questions in this step yet
            </Text>
            <Text className="text-xs text-slate-400 text-center mt-1 mb-4">
              Tap the button below to add questions, surveys, or graded quiz items.
            </Text>
            <Pressable
              onPress={onOpenPalette}
              className="px-5 py-2.5 rounded-xl bg-slate-900 flex-row items-center gap-2"
            >
              <Plus size={16} color="#FFFFFF" />
              <Text className="text-xs font-bold text-white">+ Add First Question</Text>
            </Pressable>
          </View>
        ) : (
          /* Sortable Field Cards using DraggableCanvasSurface */
          fields.map((field, index) => (
            <DraggableCanvasSurface
              key={field.id}
              id={field.id}
              dragAxis="vertical"
              onDragEnd={(id, translation) => {
                const cardApproxHeight = 110;
                const shift = Math.round(translation.y / cardApproxHeight);
                if (shift !== 0) {
                  store.dispatch({
                    type: 'REORDER_FIELDS',
                    payload: {
                      pageId: activePage.id,
                      fromIndex: index,
                      toIndex: index + shift,
                    },
                  });
                }
              }}
            >
              <MobileStudioCard
                field={field}
                index={index}
                totalFields={fields.length}
                onSelect={(id) =>
                  store.dispatch({ type: 'SELECT_FIELD', payload: { fieldId: id } })
                }
                onEditConfig={(id) =>
                  store.dispatch({
                    type: 'OPEN_SHEET',
                    payload: { sheet: 'field-edit', fieldId: id },
                  })
                }
                onEditRubric={onOpenRubric}
                onRemove={(id) =>
                  store.dispatch({
                    type: 'REMOVE_FIELD',
                    payload: { pageId: activePage.id, fieldId: id },
                  })
                }
                onMoveUp={() =>
                  store.dispatch({
                    type: 'REORDER_FIELDS',
                    payload: {
                      pageId: activePage.id,
                      fromIndex: index,
                      toIndex: index - 1,
                    },
                  })
                }
                onMoveDown={() =>
                  store.dispatch({
                    type: 'REORDER_FIELDS',
                    payload: {
                      pageId: activePage.id,
                      fromIndex: index,
                      toIndex: index + 1,
                    },
                  })
                }
              />
            </DraggableCanvasSurface>
          ))
        )}

        {/* Exit Rules Summary Card */}
        {fields.length > 0 && (
          <View className="mt-2 p-4 rounded-2xl bg-white border border-slate-200">
            <View className="flex-row items-center items-center justify-between">
              <View className="flex-row items-center items-center gap-2">
                <GitBranch size={18} color="#7C3AED" />
                <Text className="text-xs font-bold text-slate-800">
                  Step Exit Rules ({activePage.jumpRules?.length ?? 0})
                </Text>
              </View>
              <Pressable
                onPress={onOpenBranching}
                className="px-3 py-1 rounded-lg bg-purple-50 border border-purple-200"
              >
                <Text className="text-xs font-bold text-purple-700">Configure Flow</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <View className="absolute bottom-6 right-6">
        <Pressable
          onPress={onOpenPalette}
          className="h-14 px-6 rounded-full bg-slate-900 shadow-xl flex-row items-center gap-2"
        >
          <Plus size={20} color="#FFFFFF" />
          <Text className="text-sm font-black text-white">Add Question</Text>
        </Pressable>
      </View>
    </View>
  );
});
