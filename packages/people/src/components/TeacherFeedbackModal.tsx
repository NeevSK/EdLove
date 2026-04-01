import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Theme,
  useTheme,
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
  const { text, accent, glass } = useTheme();
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
    <HStack sx={{ gap: Theme.spacing.md, width: '100%' }}>
      <Button 
        variant="outline" 
        onPress={onClose} 
        sx={{ flex: 1, borderColor: glass.interact.border }}
      >
        <ButtonText sx={{ color: text.secondary }}>
          {t('common.cancel')}
        </ButtonText>
      </Button>
      <Button
        onPress={handleSubmit}
        isDisabled={isSubmitting || !content.trim()}
        sx={{ 
          flex: 2, 
          backgroundColor: accent.action, 
          borderRadius: Theme.corners.comfortable 
        }}
      >
        {isSubmitting ? (
          <Spinner color={text.inverse} />
        ) : (
          <ButtonText sx={{ color: text.inverse }}>
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
      <VStack sx={{ gap: Theme.spacing.md }}>
        {/* Category selection */}
        <VStack sx={{ gap: Theme.spacing.xs }}>
          <Text sx={{ color: text.primary, fontSize: Theme.typography.fontSize.sm, fontWeight: '700' }}>
            {t('teacher.feedback.category')}
          </Text>
          <Select 
            onValueChange={setCategory} 
            defaultValue={category}
          >
            <SelectTrigger
              variant="outline"
              sx={{ borderColor: glass.interact.border, backgroundColor: glass.interact.bg }}
            >
              <SelectInput placeholder="Select category" sx={{ color: text.primary }} />
              <SelectIcon sx={{ marginRight: Theme.spacing.md }}>
                <ChevronDown size={20} color={text.secondary} />
              </SelectIcon>
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent sx={{ backgroundColor: glass.interact.bg }}>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} label={cat.label} value={cat.value} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </VStack>

        {/* Priority selection */}
        <VStack sx={{ gap: Theme.spacing.xs }}>
          <Text sx={{ color: text.primary, fontSize: Theme.typography.fontSize.sm, fontWeight: '700' }}>
            {t('teacher.feedback.priority')}
          </Text>
          <HStack sx={{ gap: Theme.spacing.sm }}>
            {(['low', 'medium', 'high'] as const).map((p) => (
              <Button
                key={p}
                size="xs"
                variant={priority === p ? 'solid' : 'outline'}
                sx={{
                  flex: 1,
                  backgroundColor: priority === p ? (p === 'high' ? accent.danger : accent.action) : 'transparent',
                  borderColor: p === 'high' ? accent.danger : glass.interact.border,
                  borderRadius: Theme.corners.comfortable,
                }}
                onPress={() => setPriority(p)}
              >
                <ButtonText sx={{ color: priority === p ? text.inverse : text.secondary }}>
                  {p.toUpperCase()}
                </ButtonText>
              </Button>
            ))}
          </HStack>
        </VStack>

        {/* Feedback content */}
        <VStack sx={{ gap: Theme.spacing.xs }}>
          <Text sx={{ color: text.primary, fontSize: Theme.typography.fontSize.sm, fontWeight: '700' }}>
            {t('teacher.feedback.content')}
          </Text>
          <Textarea
            sx={{ backgroundColor: glass.interact.bg, borderColor: glass.interact.border, minHeight: 120 }}
          >
            <TextareaInput
              placeholder={t('teacher.feedback.placeholder')}
              value={content}
              onChangeText={setContent}
              sx={{ color: text.primary }}
            />
          </Textarea>
        </VStack>

        {/* Info note */}
        <Box
          sx={{
            padding: Theme.spacing.sm,
            backgroundColor: glass.interact.bg,
            borderRadius: Theme.corners.comfortable,
            borderLeftWidth: 4,
            borderLeftColor: accent.reward,
            borderColor: glass.interact.border,
            borderWidth: 1,
          }}
        >
          <Text sx={{ color: text.secondary, fontSize: Theme.typography.fontSize.xs, fontStyle: 'italic' }}>
            {t('teacher.feedback.note')}
          </Text>
        </Box>
      </VStack>
    </SanctuaryModal>
  );
}
