import React, { useEffect, useState } from 'react';
import { Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { 
    Box, 
    HStack, 
    ScrollView, 
    SkeletonCard, 
    Text, 
    VStack,
    Pressable,
    Icon
} from '@repo/ui';
import { teacherFeedbackAPI, type TeacherSentEcho } from '../feedback';

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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Box className="flex-1 bg-background">
        {/* Header */}
        <Box className="pt-8 pb-4 px-4 border-b border-border">
          <HStack className="justify-between items-center">
            <Text className="text-xl font-bold text-textPrimary">
              My Feedback History
            </Text>
            <Pressable onPress={onClose} className="p-1">
              <Icon as={X} size="lg" className="text-willow" />
            </Pressable>
          </HStack>
        </Box>

        {/* Content */}
        <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ padding: 16 }}
        >
          {loading ? (
            <VStack space="md">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </VStack>
          ) : echoes.length === 0 ? (
            <Box className="p-12 items-center justify-center mt-10">
              <Text className="text-sm text-willow italic text-center">
                No echoes sent yet. Use the "Principal Echo" action to share feedback.
              </Text>
            </Box>
          ) : (
            <VStack space="md">
              {echoes.map((echo) => (
                <Box
                  key={echo.id}
                  className={`p-4 bg-silk rounded-2xl border-l-4 ${
                    echo.priority === 'high' ? 'border-error' : 'border-primary'
                  }`}
                >
                  <HStack className="justify-between items-center mb-2">
                    <HStack space="xs" className="items-center">
                        <Text className="text-[10px] font-extrabold uppercase text-bark">
                            {echo.category}
                        </Text>
                        <Text className="text-[10px] text-willow">•</Text>
                        <Text className={`text-[10px] font-extrabold uppercase ${
                          echo.priority === 'high' ? 'text-error' : 'text-bark'
                        }`}>
                            {echo.priority}
                        </Text>
                        <Text className="text-[10px] text-willow">•</Text>
                        <Text className={`text-[10px] font-extrabold uppercase ${
                          echo.is_read ? 'text-success' : 'text-warning'
                        }`}>
                            {echo.is_read ? 'read' : 'pending'}
                        </Text>
                    </HStack>
                    <Text className="text-[10px] text-willow">
                      {new Date(echo.created_at).toLocaleDateString()}
                    </Text>
                  </HStack>
                  
                  <Text className="text-sm text-textPrimary leading-relaxed mb-3">
                    {echo.content}
                  </Text>

                  {echo.principal_response ? (
                    <Box className="p-2 bg-background rounded-xl border-l-[3px] border-primary mt-2">
                      <Text className="text-[11px] font-extrabold text-primary mb-1">
                        Principal's Reply
                      </Text>
                      <Text className="text-[13px] text-textPrimary leading-normal">
                        {echo.principal_response}
                      </Text>
                    </Box>
                  ) : (
                    <Box className="mt-1">
                        <Text className="text-xs text-willow italic">
                            Awaiting principal response...
                        </Text>
                    </Box>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </ScrollView>
      </Box>
    </Modal>
  );
}
