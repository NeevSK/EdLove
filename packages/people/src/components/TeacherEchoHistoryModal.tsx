import React, { useEffect, useState } from 'react';
import { Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { 
    Box, 
    HStack, 
    Heading, 
    ScrollView, 
    SkeletonCard, 
    Text, 
    Theme, 
    useThemedColors,
    VStack 
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
  const colors = useThemedColors();
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
      <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
        {/* Header */}
        <Box
          sx={{
            paddingTop: Theme.spacing.xl,
            paddingBottom: Theme.spacing.md,
            paddingHorizontal: Theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Heading size="lg" sx={{ color: colors.text }}>
              My Feedback History
            </Heading>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textTertiary} />
            </TouchableOpacity>
          </HStack>
        </Box>

        {/* Content */}
        <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ padding: 16 }}
        >
          {loading ? (
            <VStack space="md">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </VStack>
          ) : echoes.length === 0 ? (
            <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
              <Text sx={{ color: colors.textTertiary, fontSize: 14, fontStyle: 'italic', textAlign: 'center' }}>
                No echoes sent yet. Use the "Principal Echo" action to share feedback.
              </Text>
            </Box>
          ) : (
            <VStack space="md">
              {echoes.map((echo) => (
                <Box
                  key={echo.id}
                  sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 4,
                    borderLeftColor: echo.priority === 'high' ? Theme.colors.emberRed : colors.action,
                  }}
                >
                  <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <HStack space="xs" sx={{ alignItems: 'center' }}>
                        <Text sx={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: colors.textSecondary }}>
                            {echo.category}
                        </Text>
                        <Text sx={{ fontSize: 10, color: colors.textTertiary }}>•</Text>
                        <Text sx={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: echo.priority === 'high' ? Theme.colors.emberRed : colors.textSecondary }}>
                            {echo.priority}
                        </Text>
                        <Text sx={{ fontSize: 10, color: colors.textTertiary }}>•</Text>
                        <Text sx={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: echo.is_read ? colors.success : colors.warning }}>
                            {echo.is_read ? 'read' : 'pending'}
                        </Text>
                    </HStack>
                    <Text sx={{ fontSize: 10, color: colors.textTertiary }}>
                      {new Date(echo.created_at).toLocaleDateString()}
                    </Text>
                  </HStack>
                  
                  <Text sx={{ color: colors.text, fontSize: 14, lineHeight: 22, marginBottom: 12 }}>
                    {echo.content}
                  </Text>

                  {echo.principal_response ? (
                    <Box
                      sx={{
                        padding: Theme.spacing.sm,
                        backgroundColor: colors.primary,
                        borderRadius: Theme.corners.comfortable,
                        borderLeftWidth: 3,
                        borderLeftColor: colors.action,
                        marginTop: 8
                      }}
                    >
                      <Text sx={{ fontSize: 11, fontWeight: '800', color: colors.action, marginBottom: 4 }}>
                        Principal's Reply
                      </Text>
                      <Text sx={{ color: colors.text, fontSize: 13, lineHeight: 18 }}>
                        {echo.principal_response}
                      </Text>
                    </Box>
                  ) : (
                    <Box sx={{ marginTop: 4 }}>
                        <Text sx={{ color: colors.textTertiary, fontSize: 12, fontStyle: 'italic' }}>
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

const styles = StyleSheet.create({
    closeButton: {
        padding: 4,
    }
});
