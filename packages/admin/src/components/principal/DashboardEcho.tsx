/**
 * DASHBOARD ECHO
 * Surfaces feedback "vistas" and support requests from teachers and students.
 * Supports bidirectional loop: principal can mark feedback read and reply inline.
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  Input,
  InputField,
  Pressable,
  Spinner,
  Text,
  Theme,
  VStack,
  useThemedColors,
} from '@repo/ui';
import { AlertTriangle, CheckCircle2, ChevronRight, Clock, Heart, MessageSquare, Send } from 'lucide-react-native';
import { useStore } from '@repo/core';
import { insightsAPI, type FeedbackEcho } from '../../insights';
import { useTranslation } from 'react-i18next';

const CATEGORY_ICONS: Record<string, any> = {
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
    void fetchFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const fetchFeedback = async () => {
    try {
      const data = await insightsAPI.listFeedbackEchoes(schoolId, 5);
      setFeedback(data || []);
    } catch {
      setMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const setMockData = () => {
    setFeedback([
      {
        id: '1',
        school_id: schoolId,
        source: 'teacher',
        category: 'support',
        content: 'Need guidance on the 2026 Mathematics syllabus transition for Grade 6.',
        priority: 'high',
        is_read: false,
        created_at: new Date().toISOString(),
      } as any,
      {
        id: '2',
        school_id: schoolId,
        source: 'student',
        category: 'morale',
        content: 'The new common area is great! Everyone is enjoying the study space.',
        priority: 'low',
        is_read: true,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      } as any,
    ]);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await insightsAPI.markEchoRead(id);
      setFeedback((prev) => prev.map((e) => (e.id === id ? { ...e, is_read: true } : e)));
    } catch {
      // noop
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim() || !user?.id) return;
    setSavingReply(true);
    try {
      const now = await insightsAPI.replyToEcho(id, user.id, replyText.trim());
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
      // noop
    } finally {
      setSavingReply(false);
    }
  };

  if (isLoading) return <Spinner color={colors.action} />;

  const unreadCount = feedback.filter((e) => !e.is_read).length;

  return (
    <VStack sx={{ gap: Theme.spacing.md }}>
      <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <VStack sx={{ gap: Theme.spacing.xs }}>
          <Heading sx={{ fontSize: Theme.typography.fontSize.md }} color={colors.text}>
            {t('principal.echo.title', { defaultValue: 'Dashboard Echo' })}
          </Heading>
          <Text sx={{ fontSize: Theme.typography.fontSize.xs }} color={colors.textSecondary}>
            {t('principal.echo.subtitle', { defaultValue: 'Recent feedback and support requests.' })}
          </Text>
        </VStack>
        {unreadCount > 0 ? (
          <Box
            sx={{
              backgroundColor: Theme.colors.emberRed,
              borderRadius: 10,
              paddingHorizontal: Theme.spacing.sm,
              paddingVertical: 2,
            }}
          >
            <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '800', color: '#fff' }}>
              {unreadCount}
            </Text>
          </Box>
        ) : null}
      </HStack>

      <VStack sx={{ gap: Theme.spacing.sm }}>
        {feedback.map((item) => {
          const Icon = CATEGORY_ICONS[item.category as any] ?? MessageSquare;
          const isExpanded = replyingTo === item.id;

          return (
            <Box
              key={item.id}
              sx={{
                padding: Theme.spacing.md,
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderColor: item.is_read ? colors.border : colors.action,
                backgroundColor: item.is_read ? colors.secondary : colors.primary,
              }}
            >
              <HStack sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: Theme.spacing.md }}>
                <HStack sx={{ gap: Theme.spacing.sm, flex: 1 }}>
                  <Icon size={16} color={colors.action} />
                  <VStack sx={{ gap: 4, flex: 1 }}>
                    <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '800' }} color={colors.textSecondary}>
                      {item.source} · {item.category}
                    </Text>
                    <Text sx={{ fontSize: Theme.typography.fontSize.sm }} color={colors.text}>
                      {item.content}
                    </Text>
                    <HStack sx={{ gap: 6, alignItems: 'center' }}>
                      <Clock size={10} color={colors.textTertiary} />
                      <Text sx={{ fontSize: Theme.typography.fontSize.xs }} color={colors.textTertiary}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>

                <VStack sx={{ gap: 8, alignItems: 'flex-end' }}>
                  {!item.is_read ? (
                    <Pressable onPress={() => void handleMarkRead(item.id)}>
                      <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '700' }} color={colors.action}>
                        {t('common.markRead', { defaultValue: 'Mark read' })}
                      </Text>
                    </Pressable>
                  ) : (
                    <ChevronRight size={16} color={colors.textTertiary} />
                  )}
                </VStack>
              </HStack>

              <Pressable
                onPress={() => {
                  if (isExpanded) {
                    setReplyingTo(null);
                    setReplyText('');
                  } else {
                    setReplyingTo(item.id);
                    setReplyText((item as any).principal_response ?? '');
                  }
                }}
              >
                <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '700', marginTop: Theme.spacing.sm }} color={colors.action}>
                  {(item as any).principal_response ? 'Edit reply' : 'Reply'}
                </Text>
              </Pressable>

              {isExpanded ? (
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
                      <ButtonText>{t('common.cancel', { defaultValue: 'Cancel' })}</ButtonText>
                    </Button>
                    <Button size="sm" isDisabled={!replyText.trim() || savingReply} onPress={() => void handleSendReply(item.id)}>
                      <Send size={14} color="#fff" />
                      <ButtonText>{savingReply ? '…' : t('common.send', { defaultValue: 'Send' })}</ButtonText>
                    </Button>
                  </HStack>
                </VStack>
              ) : null}
            </Box>
          );
        })}

        {feedback.length === 0 ? (
          <Text sx={{ fontStyle: 'italic', textAlign: 'center' }} color={colors.textTertiary}>
            {t('principal.echo.empty', { defaultValue: 'No feedback yet.' })}
          </Text>
        ) : null}
      </VStack>
    </VStack>
  );
}
