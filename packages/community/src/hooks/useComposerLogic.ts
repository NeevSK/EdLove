import React, { useReducer, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { identityAPI } from '@repo/core/api';
import { uploadToCloudinary, usePermissions } from '@repo/core/logic';
import { communityAPI } from '../api/community';

interface PollData {
  options: { id: string; text: string }[];
  allow_multiple?: boolean;
  is_anonymous?: boolean;
  ends_at?: string | null;
}

interface ComposerState {
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

type ComposerAction =
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

function composerReducer(state: ComposerState, action: ComposerAction): ComposerState {
  switch (action.type) {
    case 'SET_CONTENT': return { ...state, content: action.payload };
    case 'SET_SUBMITTING': return { ...state, isSubmitting: action.payload };
    case 'SET_IMAGE': return { ...state, selectedImage: action.payload };
    case 'SET_UPLOADING': return { ...state, isUploading: action.payload };
    case 'TOGGLE_TAG':
      return {
        ...state,
        selectedTags: state.selectedTags.includes(action.payload)
          ? state.selectedTags.filter((t) => t !== action.payload)
          : [...state.selectedTags, action.payload],
      };
    case 'SET_POLL_MODE': return { ...state, isPollMode: action.payload };
    case 'ADD_POLL_OPTION':
      return state.pollOptions.length < 5 
        ? { ...state, pollOptions: [...state.pollOptions, ''] } 
        : state;
    case 'UPDATE_POLL_OPTION':
      const updated = [...state.pollOptions];
      updated[action.index] = action.value;
      return { ...state, pollOptions: updated };
    case 'REMOVE_POLL_OPTION':
      return state.pollOptions.length > 2
        ? { ...state, pollOptions: state.pollOptions.filter((_, i) => i !== action.index) }
        : state;
    case 'SET_POLL_DURATION': return { ...state, pollDurationHours: action.payload };
    case 'SET_CUSTOM_DATE': return { ...state, pollCustomEndsAt: action.payload };
    case 'SET_SHOW_CUSTOM_DATE': return { ...state, showCustomDate: action.payload };
    case 'SET_POLL_ANON': return { ...state, pollIsAnonymous: action.payload };
    case 'SET_POLL_MULTIPLE': return { ...state, pollAllowMultiple: action.payload };
    case 'RESET': return initialState;
    default: return state;
  }
}

const initialState: ComposerState = {
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

export function useComposerLogic(groupId: string, onClose: () => void) {
  const [state, dispatch] = useReducer(composerReducer, initialState);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      dispatch({ type: 'SET_IMAGE', payload: result.assets[0].uri });
    }
  }, []);

  const { context } = usePermissions();
  
  const handleSubmit = useCallback(async () => {
    if (!state.content.trim() && !state.selectedImage) return;

    const myId = await identityAPI.getMyInternalId();
    if (!myId || !context.schoolId) return;

    dispatch({ type: 'SET_SUBMITTING', payload: true });
    let mediaUrl = '';
    let mediaType: 'image' | 'document' | 'audio' | 'video' | undefined;

    try {
      if (state.selectedImage) {
        dispatch({ type: 'SET_UPLOADING', payload: true });
        mediaUrl = await uploadToCloudinary(state.selectedImage, 'image');
        mediaType = 'image';
        dispatch({ type: 'SET_UPLOADING', payload: false });
      }

      const endsAt = state.showCustomDate && state.pollCustomEndsAt 
        ? new Date(state.pollCustomEndsAt).toISOString()
        : state.pollDurationHours !== null 
          ? new Date(Date.now() + state.pollDurationHours * 60 * 60 * 1000).toISOString()
          : null;

      const pollData: PollData | undefined = state.isPollMode
        ? {
            options: state.pollOptions
              .filter((o) => o.trim())
              .map((o, i) => ({ id: `opt_${i}`, text: o.trim() })),
            allow_multiple: state.pollAllowMultiple,
            is_anonymous: state.pollIsAnonymous,
            ends_at: endsAt,
          }
        : undefined;

      await communityAPI.createPost(
        {
          group_id: groupId || 'general',
          content: state.content.trim(),
          post_type: state.isPollMode ? 'poll' : mediaUrl ? 'resource' : 'discussion',
          visibility: 'school',
          media_url: mediaUrl,
          media_type: mediaType,
          poll_data: pollData,
          metadata: state.selectedTags.length > 0 ? { education_tags: state.selectedTags } : undefined,
        },
        myId,
        context.authority || 'guest',
        context.schoolId || ''
      );

      dispatch({ type: 'RESET' });
      onClose();
    } catch (error) {
      console.error('[ComposerLogic] handleSubmit error:', error);
      dispatch({ type: 'SET_UPLOADING', payload: false });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [state, groupId, onClose]);

  return {
    state,
    actions: {
      setContent: (payload: string) => dispatch({ type: 'SET_CONTENT', payload }),
      setSelectedImage: (payload: string | null) => dispatch({ type: 'SET_IMAGE', payload }),
      toggleTag: (payload: string) => dispatch({ type: 'TOGGLE_TAG', payload }),
      setIsPollMode: (payload: boolean) => dispatch({ type: 'SET_POLL_MODE', payload }),
      pickImage,
      addPollOption: () => dispatch({ type: 'ADD_POLL_OPTION' }),
      updatePollOption: (index: number, value: string) => dispatch({ type: 'UPDATE_POLL_OPTION', index, value }),
      removePollOption: (index: number) => dispatch({ type: 'REMOVE_POLL_OPTION', index }),
      setPollDurationHours: (payload: number | null) => dispatch({ type: 'SET_POLL_DURATION', payload }),
      setShowCustomDate: (payload: boolean) => dispatch({ type: 'SET_SHOW_CUSTOM_DATE', payload }),
      setPollCustomEndsAt: (payload: string) => dispatch({ type: 'SET_CUSTOM_DATE', payload }),
      setPollIsAnonymous: (payload: boolean) => dispatch({ type: 'SET_POLL_ANON', payload }),
      setPollAllowMultiple: (payload: boolean) => dispatch({ type: 'SET_POLL_MULTIPLE', payload }),
      handleSubmit,
      resetComposer: () => dispatch({ type: 'RESET' }),
    },
  };
}
