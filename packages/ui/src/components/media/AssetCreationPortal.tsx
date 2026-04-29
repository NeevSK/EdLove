import React, { useState } from 'react';
import { HStack, Input, InputField, Text, VStack } from '../../primitives';
import { SanctuaryButton } from '../SanctuaryButton';
import SanctuaryModal from '../SanctuaryModal';

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
  const [formData, setFormData] = useState({ title: '', url: '', description: '', tags: '' });

  const handleAdd = () => {
    if (!formData.title || !formData.url) return;
    onAdd({ ...formData, tags: formData.tags.split(',').map((t) => t.trim()) });
    onClose();
    setFormData({ title: '', url: '', description: '', tags: '' });
  };

  return (
    <SanctuaryModal isOpen={isOpen} onClose={onClose} title={title}>
      <VStack className="gap-5 p-2">
        <Input className="h-14">
          <InputField
            placeholder={placeholders.title || 'Asset Title'}
            value={formData.title}
            onChangeText={(t) => setFormData({ ...formData, title: t })}
          />
        </Input>
        <Input className="h-14">
          <InputField
            placeholder={placeholders.url || 'Reference URL'}
            value={formData.url}
            onChangeText={(u) => setFormData({ ...formData, url: u })}
            autoCapitalize="none"
          />
        </Input>
        <Input className="min-h-[100px]">
          <InputField
            placeholder={placeholders.description || 'Description (Optional)'}
            value={formData.description}
            onChangeText={(d) => setFormData({ ...formData, description: d })}
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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onSubmit({ name, description });
    setLoading(false);
    onClose();
  };

  return (
    <SanctuaryModal isOpen={isOpen} onClose={onClose} title={title}>
      <VStack className="gap-5 p-2">
        <Input className="h-14">
          <InputField placeholder="Collection Name" value={name} onChangeText={setName} />
        </Input>
        <Input className="min-h-[100px]">
          <InputField
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </Input>
        <HStack className="justify-end gap-3 pt-4">
          <SanctuaryButton variant="ghost" onPress={onClose}>
            Cancel
          </SanctuaryButton>
          <SanctuaryButton onPress={handleComplete} isLoading={loading} isDisabled={!name.trim()}>
            Create
          </SanctuaryButton>
        </HStack>
      </VStack>
    </SanctuaryModal>
  );
}
