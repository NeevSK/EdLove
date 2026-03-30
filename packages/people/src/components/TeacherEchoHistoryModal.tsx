import React, { useEffect, useState } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { Box, HStack, Heading, ScrollView, SkeletonCard, Text, Theme, useThemedColors } from '@repo/ui';
import { teacherFeedbackAPI, type TeacherSentEcho } from '../feedback';

interface TeacherEchoHistoryModalProps {
  visible: boolean;
  teacherId: string;
  onClose: () => void;
}

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
        const data = await teacherFeedbackAPI.listSentEchoes(teacherId, 10);
        if (mounted) setEchoes(data);
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
          <Box flex={1} sx={{ backgroundColor: colors.primary }}        <Box
          sx={{
            paddingTop: 50,
            paddingBottom: Theme.spacing.md,
            paddingHorizontal: Theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
                  <HStack justifyContent="space-between" alignItems="center"            <Heading size="lg" color={colors.text}              My Feedback History
            </Heading            <TouchableOpacity onPress={onClose}              <X size={24} color={colors.textTertiary} /            </TouchableOpacity          </HStack        </Box        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}          {loading ? (
            <SkeletonCard /          ) : echoes.length === 0 ? (
            <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}              <Text color={colors.textTertiary} style={{ fontStyle: 'italic', textAlign: 'center' }}                No echoes sent yet. Use the "Principal Echo" action to share feedback.
              </Text            </Box          ) : (
            echoes.map((echo) => (
              <Box
                key={echo.id}
                sx={{
                  padding: Theme.spacing.md,
                  backgroundColor: colors.secondary,
                  borderRadius: Theme.corners.comfortable,
                  borderLeftWidth: 4,
                  borderLeftColor: echo.priority === 'high' ? Theme.colors.emberRed : colors.action,
                  marginBottom: Theme.spacing.sm,
                }}
                              <HStack justifyContent="space-between" style={{ marginBottom: 4 }}                  <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: colors.textSecondary }}                    {echo.category} \u00B7 {echo.priority}
                    {echo.is_read ? '  read' : '  pending'}
                  </Text                  <Text style={{ fontSize: 10, color: colors.textTertiary }}                    {new Date(echo.created_at).toLocaleDateString()}
                  </Text                </HStack                <Text color={colors.text} style={{ fontSize: 13, lineHeight: 20, marginBottom: 6 }}                  {echo.content}
                </Text                {echo.principal_response ? (
                  <Box
                    sx={{
                      padding: Theme.spacing.sm,
                      backgroundColor: colors.primary,
                      borderRadius: Theme.corners.comfortable,
                      borderLeftWidth: 3,
                      borderLeftColor: colors.action,
                    }}
                                      <Text style={{ fontSize: 10, fontWeight: '800', color: colors.action, marginBottom: 2 }}                      Principal's Reply
                    </Text                    <Text color={colors.text} style={{ fontSize: 12 }}                      {echo.principal_response}
                    </Text                  </Box                ) : (
                  <Text color={colors.textTertiary} style={{ fontSize: 11, fontStyle: 'italic' }}                    Awaiting principal response...
                  </Text                )}
              </Box            ))
          )}
        </ScrollView      </Box    </Modal  );
}
