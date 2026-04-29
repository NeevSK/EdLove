import { Box, Heading, HStack, Icon, SanctuaryModal, Text, VStack, X } from '@repo/ui';
import { SkeletonCard } from '@repo/ui/components';
import { Pressable, ScrollView } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import React, { useEffect, useState } from 'react';
import { type TeacherSentEcho, teacherFeedbackAPI } from '../feedback';

// —————————————————————————————————————————————————————————————————————————————
// TYPES
// —————————————————————————————————————————————————————————————————————————————

interface TeacherEchoHistoryModalProps {
  visible: boolean;
  teacherId: string;
  onClose: () => void;
}

// —————————————————————————————————————————————————————————————————————————————
// COMPONENT
// —————————————————————————————————————————————————————————————————————————————

/**
 * TEACHER ECHO HISTORY MODAL
 * Sanctuary V3 standard for reviewing sent feedback.
 * Features hierarchical priority display and premium styling.
 */
export default function TeacherEchoHistoryModal({
  visible,
  teacherId,
  onClose,
}: TeacherEchoHistoryModalProps) {
  const [echoes, setEchoes] = useState<TeacherSentEcho[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !teacherId) return;

    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await teacherFeedbackAPI.listSentEchoes(teacherId, 20);
        if (mounted) setEchoes(data);
      } catch (err) {
        console.error('Failed to load feedback history:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [teacherId, visible]);

  return (
    <SanctuaryModal
      isOpen={visible}
      onClose={onClose}
      title="Echo History"
      subtitle="SOVEREIGN FEEDBACK"
    >
      <Box className="flex-1">
        {/* Content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 0, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <VStack space="md">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </VStack>
          ) : echoes.length === 0 ? (
            <Box className="px-12 py-20 items-center justify-center mt-10">
              <Text className="text-sm text-phase-text-tertiary italic text-center font-medium leading-6">
                No echoes sent yet. Use the "Principal Echo" action to share feedback with the
                governing body.
              </Text>
            </Box>
          ) : (
            <VStack space="lg">
              {echoes.map((echo) => (
                <Box
                  key={echo.id}
                  className="bg-phase-surface/20 rounded-[32px] border border-phase-surface shadow-sm overflow-hidden"
                >
                  {/* Priority Indicator */}
                  <Box
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      echo.priority === 'high' ? 'bg-phase-error' : 'bg-phase-interactive'
                    }`}
                  />

                  <VStack className="p-6">
                    <HStack className="justify-between items-center mb-4">
                      <HStack space="xs" className="items-center flex-wrap">
                        <Box className="bg-phase-surface px-2.5 py-1 rounded-full border border-phase-surface">
                          <Text className="text-[10px] font-bold uppercase text-phase-text-secondary tracking-tight">
                            {echo.category}
                          </Text>
                        </Box>
                        <Box
                          className={`px-2.5 py-1 rounded-full border ${
                            echo.priority === 'high'
                              ? 'bg-phase-error/10 border-phase-error/20'
                              : 'bg-phase-interactive/10 border-phase-interactive/20'
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-bold uppercase ${
                              echo.priority === 'high'
                                ? 'text-phase-error'
                                : 'text-phase-interactive'
                            }`}
                          >
                            {echo.priority}
                          </Text>
                        </Box>
                        <Box
                          className={`px-2.5 py-1 rounded-full border ${
                            echo.is_read
                              ? 'bg-phase-success/10 border-phase-success/20'
                              : 'bg-phase-warning/10 border-phase-warning/20'
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-bold uppercase ${
                              echo.is_read ? 'text-phase-success' : 'text-phase-warning'
                            }`}
                          >
                            {echo.is_read ? 'read' : 'pending'}
                          </Text>
                        </Box>
                      </HStack>
                    </HStack>

                    <Text className="text-base text-phase-text-primary leading-7 font-medium mb-4">
                      {echo.content}
                    </Text>

                    <HStack className="justify-between items-center pt-4 border-t border-phase-surface/50">
                      <Text className="text-[10px] font-bold text-phase-text-tertiary uppercase tracking-widest">
                        SENT ON{' '}
                        {new Date(echo.created_at).toLocaleDateString(undefined, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </HStack>

                    {echo.principal_response && (
                      <Box className="mt-5 p-5 bg-phase-canvas rounded-2xl border-l-[4px] border-phase-interactive shadow-sm">
                        <Text className="text-[10px] font-bold text-phase-interactive uppercase tracking-widest mb-2">
                          PRINCIPAL RESPONSE
                        </Text>
                        <Text className="text-sm text-phase-text-primary leading-6 font-medium">
                          {echo.principal_response}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </ScrollView>
      </Box>
    </SanctuaryModal>
  );
}
