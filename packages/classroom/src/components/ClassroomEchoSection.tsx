import { echoAPI } from '@repo/core/api';
import { useStore } from '@repo/core/logic';
import { supabase } from '@repo/core/native';

import { EyeOff, Inbox, User } from '@repo/ui/icons';
import { Box, Button, Input } from '@repo/ui/primitives';
import { ButtonText, HStack, Heading, Icon, InputField, Spinner, Text, VStack } from '@repo/ui/primitives';
import { Pressable } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Echo {
  id: string;
  student_id: string;
  classroom_id: string;
  content: string;
  is_anonymous: boolean;
  is_read: boolean;
  teacher_response?: string;
  responded_at?: string;
  created_at: string;
  student_name?: string;
}

interface Props {
  classroomId: string;
  isTeacher: boolean;
}

export default function ClassroomEchoSection({ classroomId, isTeacher }: Props) {
  const { t } = useTranslation();
  const { user } = useStore();
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Student side state
  const [newEcho, setNewEcho] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Teacher side state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    fetchEchoes();

    // Subscription for real-time updates
    const channel = supabase
      .channel(`classroom_echoes:${classroomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_echoes',
          filter: `classroom_id=eq.${classroomId}`,
        },
        () => {
          fetchEchoes();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classroomId, fetchEchoes]);

  async function fetchEchoes() {
    try {
      const data = await echoAPI.getEchoesByClassroom(classroomId);
      setEchoes(data || []);
    } catch (error) {
      console.error('Error fetching echoes:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSendEcho = async () => {
    if (!newEcho.trim() || isSending) return;
    setIsSending(true);
    hapticLight();
    try {
      await echoAPI.sendEcho({
        classroom_id: classroomId,
        content: newEcho.trim(),
        is_anonymous: isAnonymous,
      });
      setNewEcho('');
      // Success haptic or toast could go here
    } catch (error) {
      console.error('Error sending echo:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = async (echoId: string) => {
    if (!replyText.trim() || isReplying) return;
    setIsReplying(true);
    try {
      await echoAPI.respondToEcho(echoId, replyText.trim());
      setReplyingTo(null);
      setReplyText('');
      fetchEchoes();
    } catch (error) {
      console.error('Error replying to echo:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const handleMarkRead = async (echoId: string) => {
    try {
      await echoAPI.markAsRead(echoId);
      setEchoes((prev) => prev.map((e) => (e.id === echoId ? { ...e, is_read: true } : e)));
    } catch (error) {
      console.error('Error marking echo as read:', error);
    }
  };

  const renderStudentView = () => (
    <VStack className="gap-md p-md">
      <Box className="p-lg bg-phase-surface rounded-comfortable border border-phase-border">
        <VStack className="gap-md">
          <Heading className="text-lg text-sanctuarySaffron">Sharing Your Voice</Heading>
          <Text className="text-sm text-phase-text-secondary">
            Your feedback helps the teacher improve the classroom experience. You can choose to
            remain anonymous.
          </Text>

          <Box className="mt-sm rounded-xl bg-phase-surface-secondary p-sm">
            <Input className="border-b border-phase-border">
              <InputField
                placeholder="What's on your mind?"
                value={newEcho}
                onChangeText={setNewEcho}
                multiline
                numberOfLines={4}
                className="text-phase-text-primary"
              />
            </Input>
          </Box>

          <HStack className="justify-between items-center">
            <Pressable onPress={() => setIsAnonymous(!isAnonymous)}>
              <HStack className="gap-xs items-center">
                {isAnonymous ? (
                  <Icon as={EyeOff} size="sm" className="text-sanctuarySaffron" />
                ) : (
                  <Icon as={User} size="sm" className="text-phase-text-tertiary" />
                )}
                <Text
                  className={`text-xs font-semibold ${
                    isAnonymous ? 'text-sanctuarySaffron' : 'text-phase-text-tertiary'
                  }`}
                >
                  {isAnonymous ? 'Anonymous Mode' : 'Share as yourself'}
                </Text>
              </HStack>
            </Pressable>

            <Button
              action="primary"
              size="sm"
              onPress={handleSendEcho}
              isDisabled={!newEcho.trim() || isSending}
              className="rounded-full"
            >
              {isSending ? (
                <Spinner size="small" className="text-white" />
              ) : (
                <ButtonText>Send Echo</ButtonText>
              )}
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Previous Echoes (Student) */}
      <VStack className="gap-sm mt-md">
        <Heading className="text-base text-phase-text-primary">Your Recent Echoes</Heading>
        {echoes.length === 0 ? (
          <Box className="p-xl items-center">
            <Icon as={Inbox} size="xl" className="text-phase-border" />
            <Text className="mt-sm text-phase-text-tertiary">No echoes sent yet.</Text>
          </Box>
        ) : (
          echoes.map((echo) => (
            <Box key={echo.id} className="p-md bg-phase-surface rounded-comfortable shadow-sm">
              <VStack className="gap-xs">
                <HStack className="justify-between">
                  <Text className="text-xs font-bold text-phase-text-tertiary">
                    {echo.is_anonymous ? 'ANONYMOUS' : 'YOU'}
                  </Text>
                  <Text className="text-[10px] text-phase-text-tertiary">
                    {formatDistanceToNow(new Date(echo.created_at))} ago
                  </Text>
                </HStack>
                <Text className="text-sm text-phase-text-primary">{echo.content}</Text>
                {echo.teacher_response && (
                  <Box className="mt-sm p-sm bg-phase-elevated rounded-comfortable border-l-[3px] border-l-sanctuarySaffron">
                    <Text className="text-[11px] font-extrabold text-sanctuarySaffron">
                      TEACHER RESPONSE
                    </Text>
                    <Text className="text-[13px] text-phase-text-primary mt-0.5">
                      {echo.teacher_response}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>
          ))
        )}
      </VStack>
    </VStack>
  );

  const renderTeacherView = () => (
    <VStack className="gap-md p-md">
      <HStack className="justify-between items-center">
        <VStack>
          <Heading className="text-lg text-phase-text-primary">Student Echoes</Heading>
          <Text className="text-xs text-phase-text-tertiary">
            Dignified feedback from your class
          </Text>
        </VStack>
        {echoes.filter((e) => !e.is_read).length > 0 && (
          <Box className="bg-emberRed px-2 py-0.5 rounded-[10px]">
            <Text className="text-[10px] font-extrabold text-white">
              {echoes.filter((e) => !e.is_read).length} NEW
            </Text>
          </Box>
        )}
      </HStack>

      {echoes.length === 0 ? (
        <Box className="p-xl items-center">
          <Icon as={Inbox} size="xl" className="text-phase-border" />
          <Text className="mt-sm text-phase-text-tertiary">No student echoes yet.</Text>
        </Box>
      ) : (
        echoes.map((echo) => {
          const isReplyingThis = replyingTo === echo.id;
          return (
            <Pressable key={echo.id} onPress={() => !echo.is_read && handleMarkRead(echo.id)}>
              <Box
                className={`p-md rounded-comfortable border-l-4 shadow-sm ${
                  echo.is_read
                    ? 'bg-phase-elevated border-phase-border'
                    : 'bg-phase-surface border-sanctuarySaffron'
                }`}
              >
                <VStack className="gap-sm">
                  <HStack className="justify-between">
                    <Text className="text-[11px] font-extrabold text-phase-text-tertiary">
                      {echo.is_anonymous
                        ? '\uD83D\uDC64 ANONYMOUS STUDENT'
                        : `\uD83C\uDF93 ${echo.student_name || 'STUDENT'}`}
                      {!echo.is_read && <Text className="text-emberRed"> \u25CF</Text>}
                    </Text>
                    <Text className="text-[10px] text-phase-text-tertiary">
                      {formatDistanceToNow(new Date(echo.created_at))} ago
                    </Text>
                  </HStack>

                  <Text className="text-sm text-phase-text-primary">{echo.content}</Text>

                  {echo.teacher_response && (
                    <Box className="p-sm bg-phase-surface rounded-comfortable mt-1">
                      <Text className="text-[11px] font-bold text-phase-text-secondary">
                        YOUR RESPONSE
                      </Text>
                      <Text className="text-[13px] text-phase-text-primary">
                        {echo.teacher_response}
                      </Text>
                    </Box>
                  )}

                  {!isReplyingThis ? (
                    <Pressable onPress={() => setReplyingTo(echo.id)}>
                      <Text className="text-xs font-bold text-sanctuarySaffron">
                        {echo.teacher_response ? 'Edit Response' : 'Reply'}
                      </Text>
                    </Pressable>
                  ) : (
                    <VStack className="gap-sm mt-2">
                      <Box className="bg-phase-surface rounded-comfortable p-2">
                        <Input className="border-b-0">
                          <InputField
                            placeholder="Write your response..."
                            value={replyText}
                            onChangeText={setReplyText}
                            multiline
                            className="text-phase-text-primary text-sm"
                            autoFocus
                          />
                        </Input>
                      </Box>
                      <HStack className="gap-sm justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          action="secondary"
                          onPress={() => setReplyingTo(null)}
                        >
                          <ButtonText className="font-English">Cancel</ButtonText>
                        </Button>
                        <Button
                          size="sm"
                          action="primary"
                          onPress={() => handleReply(echo.id)}
                          isDisabled={!replyText.trim() || isReplying}
                        >
                          {isReplying ? (
                            <Spinner size="small" className="text-white" />
                          ) : (
                            <ButtonText className="font-English">Send</ButtonText>
                          )}
                        </Button>
                      </HStack>
                    </VStack>
                  )}
                </VStack>
              </Box>
            </Pressable>
          );
        })
      )}
    </VStack>
  );

  if (isLoading)
    return (
      <Box className="p-xl items-center">
        <Spinner className="text-sanctuarySaffron" />
      </Box>
    );

  return isTeacher ? renderTeacherView() : renderStudentView();
}
