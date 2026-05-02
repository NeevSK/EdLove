/**
 * @file composer.reducer.ts
 * @description Centralized state machine for the Community Social Composer.
 * This logic is platform-agnostic and promoted to @repo/core to ensure
 * architectural parity between mobile and web.
 */

export interface ComposerState {
  content: string;
  isSubmitting: boolean;
  selectedImage: string | null;
  isUploading: boolean;
  selectedTags: string[];
  isPollMode: boolean;
  pollOptions: string[];
  pollIsAnonymous: boolean;
  pollAllowMultiple: boolean;
  pollDurationHours: number | null;
  pollCustomEndsAt: string;
  showCustomDate: boolean;
}

export type ComposerAction =
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_IMAGE'; payload: string | null }
  | { type: 'SET_UPLOADING'; payload: boolean }
  | { type: 'TOGGLE_TAG'; payload: string }
  | { type: 'SET_POLL_MODE'; payload: boolean }
  | { type: 'ADD_POLL_OPTION' }
  | { type: 'UPDATE_POLL_OPTION'; index: number; value: string }
  | { type: 'REMOVE_POLL_OPTION'; index: number }
  | { type: 'SET_POLL_DURATION'; payload: number | null }
  | { type: 'SET_CUSTOM_DATE'; payload: string }
  | { type: 'SET_SHOW_CUSTOM_DATE'; payload: boolean }
  | { type: 'SET_POLL_ANON'; payload: boolean }
  | { type: 'SET_POLL_MULTIPLE'; payload: boolean }
  | { type: 'RESET' };

export const initialComposerState: ComposerState = {
  content: '',
  isSubmitting: false,
  selectedImage: null,
  isUploading: false,
  selectedTags: [],
  isPollMode: false,
  pollOptions: ['', ''],
  pollIsAnonymous: false,
  pollAllowMultiple: false,
  pollDurationHours: null,
  pollCustomEndsAt: '',
  showCustomDate: false,
};

export function composerReducer(state: ComposerState, action: ComposerAction): ComposerState {
  switch (action.type) {
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_IMAGE':
      return { ...state, selectedImage: action.payload };
    case 'SET_UPLOADING':
      return { ...state, isUploading: action.payload };
    case 'TOGGLE_TAG':
      return {
        ...state,
        selectedTags: state.selectedTags.includes(action.payload)
          ? state.selectedTags.filter((t) => t !== action.payload)
          : [...state.selectedTags, action.payload],
      };
    case 'SET_POLL_MODE':
      return { ...state, isPollMode: action.payload };
    case 'ADD_POLL_OPTION':
      return state.pollOptions.length < 5
        ? { ...state, pollOptions: [...state.pollOptions, ''] }
        : state;
    case 'UPDATE_POLL_OPTION': {
      const updated = [...state.pollOptions];
      updated[action.index] = action.value;
      return { ...state, pollOptions: updated };
    }
    case 'REMOVE_POLL_OPTION':
      return state.pollOptions.length > 2
        ? {
            ...state,
            pollOptions: state.pollOptions.filter((_, i) => i !== action.index),
          }
        : state;
    case 'SET_POLL_DURATION':
      return { ...state, pollDurationHours: action.payload };
    case 'SET_CUSTOM_DATE':
      return { ...state, pollCustomEndsAt: action.payload };
    case 'SET_SHOW_CUSTOM_DATE':
      return { ...state, showCustomDate: action.payload };
    case 'SET_POLL_ANON':
      return { ...state, pollIsAnonymous: action.payload };
    case 'SET_POLL_MULTIPLE':
      return { ...state, pollAllowMultiple: action.payload };
    case 'RESET':
      return initialComposerState;
    default:
      return state;
  }
}
