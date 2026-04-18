import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  SanctuaryModal,
  Textarea,
  TextareaInput,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
  Spinner,
  Icon
} from '@repo/ui';
import { ChevronDown, MessageSquare, Heart, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { teacherFeedbackAPI } from '../feedback';

interface TeacherFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  teacherId: string;
}

const CATEGORIES = [
  { label: 'Teaching Support', value: 'support', icon: MessageSquare },
  { label: 'Staff Morale', value: 'morale', icon: Heart },
  { label: 'Facility/Resource Alert', value: 'facility', icon: AlertTriangle },
  { label: 'Recognition/Positive Note', value: 'recognition', icon: CheckCircle2 },
];

export default function TeacherFeedbackModal({
  isOpen,
  onClose,
  schoolId,
  teacherId,
}: TeacherFeedbackModalProps) {
  const { t } = useTranslation();
  const [category, setCategory] = useState<string>('support');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const ok = await teacherFeedbackAPI.submitTeacherFeedback({
        schoolId,
        teacherId,
        category,
        content,
        priority,
      });
      if (!ok) return;

      onClose();
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <HStack className="gap-4 w-full">
      <Button 
        variant="outline" 
        onPress={onClose} 
        className="flex-1 border-border"
      >
        <ButtonText className="text-bark">
          {t('common.cancel')}
        </ButtonText>
      </Button>
      <Button
        onPress={handleSubmit}
        isDisabled={isSubmitting || !content.trim()}
        className={`flex-[2] rounded-2xl ${
          priority === 'high' ? 'bg-error' : 'bg-primary'
        }`}
      >
        {isSubmitting ? (
          <Spinner className="text-white" />
        ) : (
          <ButtonText className="text-white">
            {t('common.send')}
          </ButtonText>
        )}
      </Button>
    </HStack>
  );

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('teacher.feedback.title')}
      subtitle={t('teacher.feedback.subtitle')}
      footer={footer}
    >
      <VStack className="gap-4">
        {/* Category selection */}
        <VStack className="gap-1">
          <Text className="text-textPrimary text-sm font-bold">
            {t('teacher.feedback.category')}
          </Text>
          <Select 
            onValueChange={setCategory} 
            defaultValue={category}
          >
            <SelectTrigger
              className="border-border bg-silk"
            >
              <SelectInput placeholder="Select category" className="text-textPrimary" />
              <SelectIcon className="mr-4">
                <Icon as={ChevronDown} size="sm" className="text-bark" />
              </SelectIcon>
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent className="bg-silk">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} label={cat.label} value={cat.value} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </VStack>

        {/* Priority selection */}
        <VStack className="gap-1">
          <Text className="text-textPrimary text-sm font-bold">
            {t('teacher.feedback.priority')}
          </Text>
          <HStack className="gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={priority === p ? 'solid' : 'outline'}
                className={`flex-1 rounded-2xl ${
                  priority === p 
                    ? (p === 'high' ? 'bg-error' : 'bg-primary') 
                    : 'bg-transparent border-border'
                }`}
                onPress={() => setPriority(p)}
              >
                <ButtonText className={priority === p ? 'text-white' : 'text-bark'}>
                  {p.toUpperCase()}
                </ButtonText>
              </Button>
            ))}
          </HStack>
        </VStack>

        {/* Feedback content */}
        <VStack className="gap-1">
          <Text className="text-textPrimary text-sm font-bold">
            {t('teacher.feedback.content')}
          </Text>
          <Textarea
            className="bg-silk border-border min-h-[120px]"
          >
            <TextareaInput
              placeholder={t('teacher.feedback.placeholder')}
              value={content}
              onChangeText={setContent}
              className="text-textPrimary"
            />
          </Textarea>
        </VStack>

        {/* Info note */}
        <Box
          className="p-2 bg-silk rounded-2xl border-l-4 border-primary border border-border"
        >
          <Text className="text-bark text-[10px] italic">
            {t('teacher.feedback.note')}
          </Text>
        </Box>
      </VStack>
    </SanctuaryModal>
  );
}
