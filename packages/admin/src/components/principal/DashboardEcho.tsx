/**
 * DASHBOARD ECHO
 * Surfaces feedback "vistas" and support requests from teachers and students.
 * Supports bidirectional loop: principal can mark feedback read and reply inline.
 */

import { useStore } from '@repo/core/logic';
import { supabase } from '@repo/core/native';

import {
  AlertTriangle,
  Box,
  Button,
  ButtonText,
  CheckCircle2,
  ChevronRight,
  Heading,
  Heart,
  HStack,
  Icon,
  Input,
  InputField,
  MessageSquare,
  Send,
  Spinner,
  Text,
  VStack,
} from '@repo/ui';
import { Pressable } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FeedbackEcho {
  id: string;
  source: 'teacher' | 'student';
  category: 'support' | 'morale' | 'facility' | 'recognition';
  content: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
  principal_response?: string;
  responded_at?: string;
}

const CATEGORY_ICONS = {
  support: MessageSquare,
  morale: Heart,
  facility: AlertTriangle,
  recognition: CheckCircle2,
};

export default function DashboardEcho({ schoolId }: { schoolId: string }) {
  const { t } = useTranslation();
  const user = useStore((s) => s.user);
  const [feedback, setFeedback] = useState<FeedbackEcho[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [savingReply, setSavingReply] = useState(false);

  const setMockData = () => {
    setFeedback([
      {
        id: '1',
        source: 'teacher',
        category: 'support',
        content: 'Need guidance on the 2026 Mathematics syllabus transition for Grade 6.',
        priority: 'high',
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        source: 'student',
        category: 'morale',
        content: 'The new common area is great! Everyone is enjoying the study space.',
        priority: 'low',
        is_read: true,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        source: 'teacher',
        category: 'facility',
        content: 'Multimedia projector in Room 4 is flickering intermittently.',
        priority: 'medium',
        is_read: false,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);
  };

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('school_echo_feedback')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        setMockData();
      } else {
        setFeedback(data || []);
      }
    } catch {
      setMockData();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleMarkRead = async (id: string) => {
    try {
      hapticLight();
      await supabase.from('school_echo_feedback').update({ is_read: true }).eq('id', id);
      setFeedback((prev) => prev.map((e) => (e.id === id ? { ...e, is_read: true } : e)));
    } catch {
      /**/
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim() || !user?.id) return;
    setSavingReply(true);
    try {
      hapticLight();
      const now = new Date().toISOString();
      await supabase
        .from('school_echo_feedback')
        .update({
          principal_response: replyText.trim(),
          responded_by: user.id,
          responded_at: now,
          is_read: true,
        })
        .eq('id', id);

      setFeedback((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, principal_response: replyText.trim(), responded_at: now, is_read: true }
            : e,
        ),
      );
      setReplyingTo(null);
      setReplyText('');
    } catch {
      /**/
    } finally {
      setSavingReply(false);
    }
  };

  if (isLoading)
    return (
      <Box className="p-12 items-center justify-center">
        <Spinner className="text-phase-interactive" />
      </Box>
    );

  return (
    <VStack className="gap-8">
      <HStack className="justify-between items-center">
        <VStack className="gap-1.5">
          <Heading className="text-[22px] font-black text-phaseText-primary tracking-tight">
            {t('principal.echo.title', 'Vocal Echo')}
          </Heading>
          <Text className="text-[12px] font-bold text-phaseText-muted uppercase tracking-[2px]">
            {t('principal.echo.subtitle', 'Institutional Resonance')}
          </Text>
        </VStack>
        {feedback.filter((e) => !e.is_read).length > 0 && (
          <Box className="bg-phase-danger rounded-full px-4 py-1.5 shadow-sm">
            <Text className="text-[11px] font-black text-white uppercase tracking-wider">
              {feedback.filter((e) => !e.is_read).length} Unread
            </Text>
          </Box>
        )}
      </HStack>

      <VStack className="gap-5">
        {feedback.map((item) => {
          const IconComp = CATEGORY_ICONS[item.category] || MessageSquare;
          const isExpanded = replyingTo === item.id;
          const priorityColor =
            item.priority === 'high' ? 'border-l-phase-danger' : 'border-l-phase-interactive';

          return (
            <Pressable key={item.id} onPress={() => !item.is_read && handleMarkRead(item.id)}>
              <Box
                className={`p-6 rounded-[32px] border-2 border-l-[8px] transition-all ${
                  item.is_read
                    ? 'bg-phase-surface border-phase-border'
                    : 'bg-phase-surface border-phase-interactive/20 shadow-md'
                } ${priorityColor}`}
              >
                <HStack className="gap-5 items-start">
                  <Box className="p-3.5 bg-phase-canvas rounded-[18px] border border-phase-border">
                    <Icon as={IconComp} size="sm" className="text-phaseText-primary" />
                  </Box>
                  <VStack className="gap-4 flex-1">
                    <VStack className="gap-2">
                      <HStack className="justify-between items-center">
                        <Text className="text-[11px] font-black text-phaseText-muted uppercase tracking-widest">
                          {item.source} · {item.category}
                        </Text>
                        <Text className="text-[10px] font-black text-phaseText-muted/50 uppercase">
                          {new Date(item.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      </HStack>
                      <Text className="text-[15px] font-bold text-phaseText-primary leading-[22px]">
                        {item.content}
                      </Text>
                    </VStack>

                    {item.principal_response && (
                      <Box className="p-5 bg-phase-interactive/5 rounded-[20px] border border-phase-interactive/10">
                        <Text className="text-[11px] font-black text-phase-interactive uppercase tracking-widest mb-1.5">
                          Leadership Response
                        </Text>
                        <Text className="text-[14px] font-bold text-phaseText-secondary leading-[20px]">
                          {item.principal_response}
                        </Text>
                      </Box>
                    )}

                    <HStack className="gap-5 items-center">
                      <Pressable
                        onPress={() => {
                          hapticLight();
                          if (isExpanded) {
                            setReplyingTo(null);
                            setReplyText('');
                          } else {
                            setReplyingTo(item.id);
                            setReplyText(item.principal_response ?? '');
                          }
                        }}
                      >
                        <Text className="text-[11px] font-black text-phase-interactive uppercase tracking-[2px]">
                          {item.principal_response ? 'Refine Voice' : 'Establish Echo'}
                        </Text>
                      </Pressable>
                      {!item.is_read && (
                        <Box className="w-2 h-2 rounded-full bg-phase-danger shadow-sm" />
                      )}
                    </HStack>

                    {isExpanded && (
                      <VStack className="gap-4 mt-4 border-t border-phase-border pt-6">
                        <Input className="min-h-[140px] bg-phase-canvas border-phase-border rounded-[24px] p-5">
                          <InputField
                            value={replyText}
                            onChangeText={setReplyText}
                            placeholder="Transmit response to community..."
                            placeholderTextColor="rgba(0,0,0,0.3)"
                            multiline
                            className="text-[15px] font-bold text-phaseText-primary"
                          />
                        </Input>
                        <HStack className="gap-3 justify-end">
                          <Button
                            variant="outline"
                            onPress={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="h-12 rounded-[16px] px-6 border-phase-border"
                          >
                            <ButtonText className="text-phaseText-primary font-black uppercase text-[11px]">
                              Dismiss
                            </ButtonText>
                          </Button>
                          <Button
                            isDisabled={!replyText.trim() || savingReply}
                            onPress={() => handleSendReply(item.id)}
                            className="h-12 rounded-[16px] px-8 bg-phase-interactive border-none shadow-md"
                          >
                            <HStack className="items-center gap-2">
                              {savingReply ? (
                                <Spinner size="small" color="#FFFFFF" />
                              ) : (
                                <>
                                  <Icon as={Send} className="text-white" size="xs" />
                                  <ButtonText className="text-[11px] font-black uppercase text-white tracking-widest">
                                    Transmit
                                  </ButtonText>
                                </>
                              )}
                            </HStack>
                          </Button>
                        </HStack>
                      </VStack>
                    )}
                  </VStack>
                  {!isExpanded && (
                    <Icon as={ChevronRight} className="text-phaseText-muted/10 mt-1" size="sm" />
                  )}
                </HStack>
              </Box>
            </Pressable>
          );
        })}
        {feedback.length === 0 && (
          <Box className="p-16 items-center justify-center bg-phase-canvas rounded-[32px] border border-dashed border-phase-border">
            <Text className="text-[14px] font-bold text-phaseText-muted italic opacity-60">
              The institutional echo is currently silent.
            </Text>
          </Box>
        )}
      </VStack>
    </VStack>
  );
}
