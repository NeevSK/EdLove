import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { Box, HStack, Input, InputField, Text, VStack } from '@repo/ui/primitives';
import { useCallback, useReducer, useState } from 'react';

// ------------------------------------------------------------
// ASSET CREATION MODAL
// ------------------------------------------------------------

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
  onAdd: (data: any) => void | Promise<void>;
  title?: string;
  placeholders?: Record<string, string>;
}) {
  const [formData, dispatch] = useReducer(assetReducer, {
    title: '',
    url: '',
    description: '',
    tags: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.title || !formData.url || isSubmitting) return;
    setErrorMessage(null);
    setIsSubmitting(true);
    void Promise.resolve()
      .then(() => onAdd({ ...formData, tags: formData.tags.split(',').map((t) => t.trim()) }))
      .then(() => {
        onClose();
        dispatch({ type: 'RESET' });
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : 'We could not add this resource.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [formData, isSubmitting, onAdd, onClose]);

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
        {errorMessage ? (
          <Box className="rounded-xl border border-phase-danger/20 bg-phase-danger/10 px-3 py-2">
            <Text className="text-sm text-phase-danger">{errorMessage}</Text>
          </Box>
        ) : null}
        <HStack className="justify-end gap-3 pt-4">
          <SanctuaryButton variant="ghost" onPress={onClose}>
            Dismiss
          </SanctuaryButton>
          <SanctuaryButton
            onPress={handleAdd}
            isLoading={isSubmitting}
            isDisabled={isSubmitting || !formData.title || !formData.url}
          >
            {isSubmitting ? 'Adding…' : 'Complete'}
          </SanctuaryButton>
        </HStack>
      </VStack>
    </SanctuaryModal>
  );
}

// ------------------------------------------------------------
// COLLECTION CREATION MODAL
// ------------------------------------------------------------

interface CollectionState {
  name: string;
  description: string;
  thumbnailUrl: string;
  loading: boolean;
}

type CollectionAction =
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_DESCRIPTION'; description: string }
  | { type: 'SET_THUMBNAIL_URL'; thumbnailUrl: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'RESET' };

function collectionReducer(state: CollectionState, action: CollectionAction): CollectionState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.description };
    case 'SET_THUMBNAIL_URL':
      return { ...state, thumbnailUrl: action.thumbnailUrl };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'RESET':
      return { name: '', description: '', thumbnailUrl: '', loading: false };
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
  onSubmit: (data: { name: string; description: string; thumbnail_url?: string }) => Promise<void>;
  title?: string;
}) {
  const [state, dispatch] = useReducer(collectionReducer, {
    name: '',
    description: '',
    thumbnailUrl: '',
    loading: false,
  });

  const { name, description, thumbnailUrl, loading } = state;

  const handleSetName = useCallback((val: string) => dispatch({ type: 'SET_NAME', name: val }), []);
  const handleSetDescription = useCallback(
    (val: string) => dispatch({ type: 'SET_DESCRIPTION', description: val }),
    [],
  );

  const handleSetThumbnailUrl = useCallback(
    (val: string) => dispatch({ type: 'SET_THUMBNAIL_URL', thumbnailUrl: val }),
    [],
  );

  const handleComplete = useCallback(async () => {
    if (!name.trim()) return;
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      await onSubmit({
        name,
        description,
        thumbnail_url: thumbnailUrl.trim() || undefined,
      });
      dispatch({ type: 'RESET' });
      onClose();
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [name, description, thumbnailUrl, onSubmit, onClose]);

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
        <Input className="h-14">
          <InputField
            placeholder="Thumbnail image URL"
            value={thumbnailUrl}
            onChangeText={handleSetThumbnailUrl}
            autoCapitalize="none"
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
