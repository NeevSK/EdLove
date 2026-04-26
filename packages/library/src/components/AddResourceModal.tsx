import { LIBRARY_RESOURCE_CATEGORIES } from '@repo/core';
import { HStack, Input, InputField, SanctuaryButton, SanctuaryModal, Text, VStack } from '@repo/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type LibResourceType = 'link' | 'video' | 'pdf' | 'doc' | 'note';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    title: string;
    type: LibResourceType;
    url: string;
    description: string;
    tags: string[];
  }) => void;
}

export default function AddResourceModal({ isOpen, onClose, onAdd }: AddResourceModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<LibResourceType>('link');
  const [tags, setTags] = useState('');

  const handleAdd = () => {
    if (!title || !url) return;

    // Process tags
    const tagList = tags
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    onAdd({
      title,
      type,
      url,
      description,
      tags: tagList,
    });

    onClose();
    // Reset
    setTitle('');
    setUrl('');
    setDescription('');
    setType('link');
    setTags('');
  };

  const footer = (
    <HStack className="gap-4">
      <SanctuaryButton onPress={onClose} variant="ghost">
        {t('library.addResource.dismiss')}
      </SanctuaryButton>
      <SanctuaryButton onPress={handleAdd} isDisabled={!title || !url}>
        {t('library.addResource.submit')}
      </SanctuaryButton>
    </HStack>
  );

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('library.addResource.title')}
      subtitle={t('library.addResource.subtitle')}
      footer={footer}
    >
      <VStack className="gap-4 mt-4">
        <VStack className="gap-1">
          <Text className="text-phaseText-secondary text-xs font-bold">
            {t('library.addResource.infoSection')}
          </Text>
          <Input className="bg-phase-surface border-phase-border">
            <InputField
              className="text-phaseText-primary"
              placeholder={t('library.addResource.titlePlaceholder')}
              value={title}
              onChangeText={setTitle}
            />
          </Input>
        </VStack>

        <Input className="bg-phase-surface border-phase-border">
          <InputField
            className="text-phaseText-primary"
            placeholder={t('library.addResource.urlPlaceholder')}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
          />
        </Input>

        <Input className="min-h-[80px] bg-phase-surface border-phase-border">
          <InputField
            className="text-phaseText-primary"
            placeholder={t('library.addResource.descriptionPlaceholder')}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </Input>

        <VStack className="gap-1">
          <Text className="text-phaseText-secondary text-xs font-bold">
            {t('library.addResource.typeSection')}
          </Text>
          <HStack className="gap-2 flex-wrap">
            {LIBRARY_RESOURCE_CATEGORIES.map((cat) => (
              <SanctuaryButton
                key={cat.id}
                onPress={() => setType(cat.id as LibResourceType)}
                variant={type === cat.id ? 'solid' : 'outline'}
                size="xs"
              >
                {t(`library.types.${cat.id}` as any)}
              </SanctuaryButton>
            ))}
          </HStack>
        </VStack>

        <VStack className="gap-1">
          <Text className="text-phaseText-secondary text-xs font-bold">
            {t('library.addResource.tagsSection')}
          </Text>
          <Input className="bg-phase-surface border-phase-border">
            <InputField
              className="text-phaseText-primary"
              placeholder={t('library.addResource.tagsPlaceholder')}
              value={tags}
              onChangeText={setTags}
            />
          </Input>
        </VStack>
      </VStack>
    </SanctuaryModal>
  );
}
