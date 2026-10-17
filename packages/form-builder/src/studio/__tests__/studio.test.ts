import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  Pressable: 'Pressable',
  TextInput: 'TextInput',
  StyleSheet: { create: (s: any) => s },
  Platform: { OS: 'ios', select: (obj: any) => obj.ios },
}));

vi.mock('react-native-reanimated', () => ({
  default: {
    View: 'Animated.View',
    createAnimatedComponent: (c: any) => c,
  },
  useSharedValue: (v: any) => ({ value: v }),
  useAnimatedStyle: (fn: any) => fn(),
  withSpring: (v: any) => v,
  withTiming: (v: any) => v,
  FadeIn: { duration: () => ({}) },
  FadeOut: { duration: () => ({}) },
  Layout: { springify: () => ({}) },
}));

vi.mock('react-native-gesture-handler', () => ({
  GestureDetector: 'GestureDetector',
  Gesture: {
    Pan: () => ({
      onBegin: function () {
        return this;
      },
      onUpdate: function () {
        return this;
      },
      onEnd: function () {
        return this;
      },
    }),
  },
}));

vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn(),
  notificationAsync: vi.fn(),
  ImpactFeedbackStyle: { Medium: 'medium', Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
}));

vi.mock('@repo/ui/primitives', () => ({
  Box: 'Box',
  HStack: 'HStack',
  VStack: 'VStack',
  Text: 'Text',
  Pressable: 'Pressable',
  Icon: 'Icon',
  ScrollView: 'ScrollView',
  Badge: 'Badge',
  BadgeText: 'BadgeText',
  Card: 'Card',
  Input: 'Input',
  InputField: 'InputField',
  Center: 'Center',
}));

vi.mock('@repo/ui/icons', () => ({
  FileText: 'FileText',
  Hash: 'Hash',
  Mail: 'Mail',
  ChevronDown: 'ChevronDown',
  Check: 'Check',
  Star: 'Star',
  Award: 'Award',
  Camera: 'Camera',
  FolderCheck: 'FolderCheck',
  X: 'X',
  GripVertical: 'GripVertical',
  Plus: 'Plus',
  Trash2: 'Trash2',
  Copy: 'Copy',
  GitBranch: 'GitBranch',
  ChevronUp: 'ChevronUp',
  Eye: 'Eye',
  Settings2: 'Settings2',
  Save: 'Save',
  RotateCcw: 'RotateCcw',
  RotateCw: 'RotateCw',
  Play: 'Play',
}));

import {
  createDefaultStudioSchema,
  createFormStudioStore,
} from '@intuitui-labs/form-builder-engine/studio';
import {
  BranchingSheet,
  FieldPaletteSheet,
  MobileFormStudio,
  MobileStudioCanvas,
  MobileStudioCard,
  QuizRubricSheet,
} from '../index';

describe('Sovereign Mobile Form & Quiz Studio Integration', () => {
  it('exports all mobile studio components cleanly', () => {
    expect(MobileFormStudio).toBeDefined();
    expect(MobileStudioCanvas).toBeDefined();
    expect(MobileStudioCard).toBeDefined();
    expect(FieldPaletteSheet).toBeDefined();
    expect(QuizRubricSheet).toBeDefined();
    expect(BranchingSheet).toBeDefined();
  });

  it('manages studio state with drag reordering, quiz rubrics, and undo/redo', () => {
    const store = createFormStudioStore();
    const pageId = store.getState().activePageId;

    // Add fields
    store.dispatch({
      type: 'INSERT_FIELD',
      payload: {
        pageId,
        index: 0,
        field: { id: 'math_q1', name: 'q1', type: 'select', label: '10 + 10 = ?' },
      },
    });

    store.dispatch({
      type: 'INSERT_FIELD',
      payload: {
        pageId,
        index: 1,
        field: { id: 'name_q', name: 'name', type: 'text', label: 'Your Name' },
      },
    });

    // Attach quiz rubric
    store.dispatch({
      type: 'SET_FIELD_RUBRIC',
      payload: {
        fieldId: 'math_q1',
        rubric: {
          kind: 'single-choice',
          points: 10,
          correctValue: '20',
          explanation: '10 + 10 = 20',
        },
      },
    });

    let schema = store.toFormSchema();
    const q1 = schema.pages[0]!.fields[0] as any;
    expect(q1.rubric.points).toBe(10);
    expect(q1.rubric.correctValue).toBe('20');

    // Reorder
    store.dispatch({
      type: 'REORDER_FIELDS',
      payload: { pageId, fromIndex: 0, toIndex: 1 },
    });

    schema = store.toFormSchema();
    expect(schema.pages[0]!.fields[0]!.id).toBe('name_q');
    expect(schema.pages[0]!.fields[1]!.id).toBe('math_q1');

    // Undo
    store.dispatch({ type: 'UNDO' });
    schema = store.toFormSchema();
    expect(schema.pages[0]!.fields[0]!.id).toBe('math_q1');
    expect(schema.pages[0]!.fields[1]!.id).toBe('name_q');

    // Redo
    store.dispatch({ type: 'REDO' });
    schema = store.toFormSchema();
    expect(schema.pages[0]!.fields[0]!.id).toBe('name_q');
    expect(schema.pages[0]!.fields[1]!.id).toBe('math_q1');
  });
});
