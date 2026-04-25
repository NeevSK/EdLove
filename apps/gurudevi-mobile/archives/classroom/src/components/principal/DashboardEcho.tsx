/**
 * DASHBOARD ECHO
 * Surfaces feedback "vistas" and support requests from teachers and students.
 * Supports bidirectional loop: principal can mark feedback read and reply inline.
 */

import { supabase, useStore } from '@repo/core';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Input,
  InputField,
  Pressable,
  Spinner,
  Text,
  Theme,
  useThemedColors,
  VStack,
} from '@repo/ui';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Heart,
  MessageSquare,
  Send,
} from 'lucide-react-native';
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
  const colors = useThemedColors();
  const { user } = useStore();
  const [feedback, setFeedback] = useState<FeedbackEcho[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [savingReply, setSavingReply] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

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

  const handleMarkRead = async (id: string) => {
    try {
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

  if (isLoading) return <Spinner color={colors.action} />;

  return (
    <VStack sx={{ gap: Theme.spacing.md }}>
      <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <VStack sx={{ gap: Theme.spacing.xs }}>
          <Heading sx={{ fontSize: Theme.typography.fontSize.md }} color={colors.text}>
            {t('principal.echo.title')}
          </Heading>
          <Text sx={{ fontSize: Theme.typography.fontSize.xs }} color={colors.textSecondary}>
            {t('principal.echo.subtitle')}
          </Text>
        </VStack>
        {feedback.filter((e) => !e.is_read).length > 0 && (
          <Box
            sx={{
              backgroundColor: Theme.colors.emberRed,
              borderRadius: 10,
              paddingHorizontal: Theme.spacing.sm,
              paddingVertical: 2,
            }}
          >
            <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '800', color: '#fff' }}>
              {feedback.filter((e) => !e.is_read).length} new
            </Text>
          </Box>
        )}
      </HStack>

      <VStack sx={{ gap: Theme.spacing.sm }}>
        {feedback.map((item) => {
          const IconComp = CATEGORY_ICONS[item.category] || MessageSquare;
          const isExpanded = replyingTo === item.id;
          return (
            <Pressable key={item.id} onPress={() => !item.is_read && handleMarkRead(item.id)}>
              <Box
                sx={{
                  padding: Theme.spacing.md,
                  backgroundColor: item.is_read ? colors.tertiary : colors.secondary,
                  borderRadius: Theme.corners.comfortable,
                  borderLeftWidth: 4,
                  borderLeftColor: item.priority === 'high' ? Theme.colors.emberRed : colors.action,
                }}
              >
                <HStack sx={{ gap: Theme.spacing.md, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      padding: Theme.spacing.sm,
                      backgroundColor: colors.primary,
                      borderRadius: Theme.corners.comfortable,
                    }}
                  >
                    <IconComp size={18} color={colors.action} />
                  </Box>
                  <VStack sx={{ gap: Theme.spacing.xs, flex: 1 }}>
                    <HStack sx={{ justifyContent: 'space-between' }}>
                      <Text
                        sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '700' }}
                        color={colors.textSecondary}
                      >
                        {item.source.toUpperCase()} · {item.category.toUpperCase()}
                        {!item.is_read && <Text color={Theme.colors.emberRed}> ●</Text>}
                      </Text>
                      <Text
                        sx={{ fontSize: Theme.typography.fontSize.xs }}
                        color={colors.textTertiary}
                      >
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </HStack>
                    <Text
                      sx={{ fontSize: Theme.typography.fontSize.sm }}
                      color={colors.text}
                      numberOfLines={3}
                    >
                      {item.content}
                    </Text>
                    {/* Principal response bubble */}
                    {item.principal_response && (
                      <Box
                        sx={{
                          marginTop: Theme.spacing.sm,
                          padding: Theme.spacing.sm,
                          backgroundColor: colors.primary,
                          borderRadius: Theme.corners.comfortable,
                          borderLeftWidth: 3,
                          borderLeftColor: colors.action,
                        }}
                      >
                        <Text
                          sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '800' }}
                          color={colors.action}
                        >
                          Your Reply
                        </Text>
                        <Text
                          sx={{ fontSize: Theme.typography.fontSize.xs, marginTop: 2 }}
                          color={colors.text}
                        >
                          {item.principal_response}
                        </Text>
                      </Box>
                    )}
                    {/* Reply toggle */}
                    <Pressable
                      onPress={() => {
                        if (isExpanded) {
                          setReplyingTo(null);
                          setReplyText('');
                        } else {
                          setReplyingTo(item.id);
                          setReplyText(item.principal_response ?? '');
                        }
                      }}
                    >
                      <Text
                        sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '700' }}
                        color={colors.action}
                      >
                        {item.principal_response ? '✏️ Edit reply' : '↩ Reply'}
                      </Text>
                    </Pressable>
                    {/* Inline reply input */}
                    {isExpanded && (
                      <VStack sx={{ gap: Theme.spacing.sm, marginTop: Theme.spacing.sm }}>
                        <Input>
                          <InputField
                            value={replyText}
                            onChangeText={setReplyText}
                            placeholder="Write your response…"
                            multiline
                            numberOfLines={2}
                          />
                        </Input>
                        <HStack sx={{ gap: Theme.spacing.sm, justifyContent: 'flex-end' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            <ButtonText>{t('common.cancel')}</ButtonText>
                          </Button>
                          <Button
                            size="sm"
                            isDisabled={!replyText.trim() || savingReply}
                            onPress={() => handleSendReply(item.id)}
                          >
                            <Send size={14} color="#fff" />
                            <ButtonText> {savingReply ? '…' : t('common.send')}</ButtonText>
                          </Button>
                        </HStack>
                      </VStack>
                    )}
                  </VStack>
                  {!isExpanded && <ChevronRight size={16} color={colors.textTertiary} />}
                </HStack>
              </Box>
            </Pressable>
          );
        })}
        {feedback.length === 0 && (
          <Text sx={{ fontStyle: 'italic', textAlign: 'center' }} color={colors.textTertiary}>
            {t('principal.echo.empty')}
          </Text>
        )}
      </VStack>
    </VStack>
  );
}
