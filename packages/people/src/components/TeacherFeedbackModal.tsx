import {
  Box,
  Button,
  ButtonText,
  HStack,
  Icon,
  SanctuaryModal,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Spinner,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from '@repo/ui';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Heart,
  MessageSquare,
} from 'lucide-react-native';
import { useState } from 'react';
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
        className="flex-1 border-phase-surface rounded-2xl h-14"
      >
        <ButtonText className="text-phase-text-secondary font-bold">
          {t('common.cancel')}
        </ButtonText>
      </Button>
      <Button
        onPress={handleSubmit}
        isDisabled={isSubmitting || !content.trim()}
        className={`flex-[2] rounded-2xl h-14 shadow-lg ${
          priority === 'high'
            ? 'bg-phase-error shadow-error/20'
            : 'bg-phase-interactive shadow-blue-500/20'
        }`}
      >
        {isSubmitting ? (
          <Spinner className="text-white" />
        ) : (
          <ButtonText className="text-white font-bold">{t('common.send')}</ButtonText>
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
      <VStack className="gap-6 pt-4">
        {/* Category selection */}
        <VStack className="gap-2">
          <Text className="text-phase-text-tertiary text-[10px] font-black uppercase tracking-[1px] ml-1">
            {t('teacher.feedback.category')}
          </Text>
          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger className="border-phase-surface/50 bg-phase-surface/20 h-14 rounded-2xl px-4">
              <SelectInput
                placeholder="Select category"
                className="text-phase-text-primary font-bold"
              />
              <SelectIcon className="mr-2">
                <Icon as={ChevronDown} size="sm" className="text-phase-text-tertiary" />
              </SelectIcon>
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent className="bg-phase-canvas border-t border-phase-surface p-4 rounded-t-[32px]">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} label={cat.label} value={cat.value} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </VStack>

        {/* Priority selection */}
        <VStack className="gap-2">
          <Text className="text-phase-text-tertiary text-[10px] font-black uppercase tracking-[1px] ml-1">
            {t('teacher.feedback.priority')}
          </Text>
          <HStack className="gap-3">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={priority === p ? 'solid' : 'outline'}
                className={`flex-1 rounded-2xl h-11 border-phase-surface ${
                  priority === p
                    ? p === 'high'
                      ? 'bg-phase-error'
                      : 'bg-phase-interactive'
                    : 'bg-transparent'
                }`}
                onPress={() => setPriority(p)}
              >
                <ButtonText
                  className={`text-[11px] font-black ${priority === p ? 'text-white' : 'text-phase-text-tertiary'}`}
                >
                  {p.toUpperCase()}
                </ButtonText>
              </Button>
            ))}
          </HStack>
        </VStack>

        {/* Feedback content */}
        <VStack className="gap-2">
          <Text className="text-phase-text-tertiary text-[10px] font-black uppercase tracking-[1px] ml-1">
            {t('teacher.feedback.content')}
          </Text>
          <Textarea className="bg-phase-surface/20 border-phase-surface/50 min-h-[140px] rounded-[32px] p-2">
            <TextareaInput
              placeholder={t('teacher.feedback.placeholder')}
              value={content}
              onChangeText={setContent}
              className="text-phase-text-primary px-4 pt-4 font-medium"
            />
          </Textarea>
        </VStack>

        {/* Info note */}
        <Box className="p-4 bg-phase-surface/10 rounded-2xl border-l-[3px] border-phase-interactive border border-phase-surface/30 mt-2">
          <Text className="text-phase-text-tertiary text-[10px] italic leading-4">
            {t('teacher.feedback.note')}
          </Text>
        </Box>
      </VStack>
    </SanctuaryModal>
  );
}
