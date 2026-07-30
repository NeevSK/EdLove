import { useCallback, useReducer } from 'react';
import { HStack, Input, InputField, VStack } from '@repo/ui/primitives';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';

// ──────────────────────────────────────────────────────────
// ASSET CREATION MODAL
// ──────────────────────────────────────────────────────────

interface AssetFormState {
  title: string;
  url: string;
  description: string;
  tags: string;
}

type AssetAction =
  | { type: 'SET_FIELD'; field: keyof AssetFormState; value: string }
  | { type: 'RESET' };

function assetReducer(state: AssetFormState, action: AssetAction): AssetFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return { title: '', url: '', description: '', tags: '' };
    default:
      return state;
  }
}

/**
 * AssetCreationModal - Standard Platform Entry Point
 */
export function AssetCreationModal({
  isOpen,
  onClose,
  onAdd,
  title = 'Add New Asset',
  placeholders = {},
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
  title?: string;
  placeholders?: Record<string, string>;
}) {
  const [formData, dispatch] = useReducer(assetReducer, {
    title: '',
    url: '',
    description: '',
    tags: '',
  });

  const handleSetTitle = useCallback(
    (t: string) => dispatch({ type: 'SET_FIELD', field: 'title', value: t }),
    [],
  );
  const handleSetUrl = useCallback(
    (u: string) => dispatch({ type: 'SET_FIELD', field: 'url', value: u }),
    [],
  );
  const handleSetDescription = useCallback(
    (d: string) => dispatch({ type: 'SET_FIELD', field: 'description', value: d }),
    [],
  );

  const handleAdd = useCallback(() => {
    if (!formData.title || !formData.url) return;
    onAdd({ ...formData, tags: formData.tags.split(',').map((t) => t.trim()) });
    onClose();
    dispatch({ type: 'RESET' });
  }, [formData, onAdd, onClose]);

  return (
    <SanctuaryModal isOpen={isOpen} onClose={onClose} title={title}>
      <VStack className="gap-5 p-2">
        <Input className="h-14">
          <InputField
            placeholder={placeholders.title || 'Asset Title'}
            value={formData.title}
            onChangeText={handleSetTitle}
          />
        </Input>
        <Input className="h-14">
          <InputField
            placeholder={placeholders.url || 'Reference URL'}
            value={formData.url}
            onChangeText={handleSetUrl}
            autoCapitalize="none"
          />
        </Input>
        <Input className="min-h-[100px]">
          <InputField
            placeholder={placeholders.description || 'Description (Optional)'}
            value={formData.description}
            onChangeText={handleSetDescription}
            multiline
          />
        </Input>
        <HStack className="justify-end gap-3 pt-4">
          <SanctuaryButton variant="ghost" onPress={onClose}>
            Dismiss
          </SanctuaryButton>
          <SanctuaryButton onPress={handleAdd} isDisabled={!formData.title || !formData.url}>
            Complete
          </SanctuaryButton>
        </HStack>
      </VStack>
    </SanctuaryModal>
  );
}

// ──────────────────────────────────────────────────────────
// COLLECTION CREATION MODAL
// ──────────────────────────────────────────────────────────

interface CollectionState {
  name: string;
  description: string;
  loading: boolean;
}

type CollectionAction =
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_DESCRIPTION'; description: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'RESET' };

function collectionReducer(state: CollectionState, action: CollectionAction): CollectionState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.description };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'RESET':
      return { name: '', description: '', loading: false };
    default:
      return state;
  }
}

/**
 * CollectionCreationModal - Standard Platform Organizer
 */
export function CollectionCreationModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'Create Collection',
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  title?: string;
}) {
  const [state, dispatch] = useReducer(collectionReducer, {
    name: '',
    description: '',
    loading: false,
  });

  const { name, description, loading } = state;

  const handleSetName = useCallback((val: string) => dispatch({ type: 'SET_NAME', name: val }), []);
  const handleSetDescription = useCallback(
    (val: string) => dispatch({ type: 'SET_DESCRIPTION', description: val }),
    [],
  );

  const handleComplete = useCallback(async () => {
    if (!name.trim()) return;
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      await onSubmit({ name, description });
      dispatch({ type: 'RESET' });
      onClose();
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [name, description, onSubmit, onClose]);

  return (
    <SanctuaryModal isOpen={isOpen} onClose={onClose} title={title}>
      <VStack className="gap-5 p-2">
        <Input className="h-14">
          <InputField placeholder="Collection Name" value={name} onChangeText={handleSetName} />
        </Input>
        <Input className="min-h-[100px]">
          <InputField
            placeholder="Description"
            value={description}
            onChangeText={handleSetDescription}
            multiline
          />
        </Input>
        <HStack className="justify-end gap-3 pt-4">
          <SanctuaryButton variant="ghost" onPress={onClose}>
            Cancel
          </SanctuaryButton>
          <SanctuaryButton
            onPress={() => {
              void handleComplete();
            }}
            isLoading={loading}
            isDisabled={!name.trim()}
          >
            Create
          </SanctuaryButton>
        </HStack>
      </VStack>
    </SanctuaryModal>
  );
}
