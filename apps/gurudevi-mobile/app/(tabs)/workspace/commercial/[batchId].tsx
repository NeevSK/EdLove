import { usePerspectiveSwitch } from '@repo/core/logic';
import type { CommercialPerspective } from '@repo/core/types/Perspective';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Briefcase, CircleCheck, ChevronRight, FileText, QrCode, Send, Sparkles, TrendingUp, Users } from '@repo/ui/icons';
import { Box, HStack, Pressable, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';

export { RouteErrorBoundary as ErrorBoundary };

export default function CommercialBatchScreen() {
  const { batchId } = useLocalSearchParams<{ batchId?: string }>();
  const { activePerspective, availablePerspectives, getPerspectiveStorage } = usePerspectiveSwitch();

  const commercialBatch = useMemo(() => {
    if (activePerspective.kind === 'commercial') {
      return activePerspective as CommercialPerspective;
    }
    const found = availablePerspectives.find(
      (p) => p.kind === 'commercial' && (p.id === batchId || (p as CommercialPerspective).batchId === batchId),
    );
    return (found as CommercialPerspective) || null;
  }, [activePerspective, availablePerspectives, batchId]);

  // Sandboxed storage partition for this specific commercial batch (e.g. attendance drafts, marks caches)
  const batchStorage = useMemo(() => {
    return getPerspectiveStorage(commercialBatch?.id || batchId);
  }, [batchId, commercialBatch?.id, getPerspectiveStorage]);

  if (!commercialBatch) {
    return (
      <Box style={{ flex: 1, backgroundColor: tokens.colors.background, padding: tokens.spacing.lg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: tokens.typography.sizes.md, fontWeight: '700', color: tokens.semantic.text.primary }}>
          Batch Workspace Not Found
        </Text>
        <Text style={{ fontSize: tokens.typography.sizes.xs, color: tokens.semantic.text.secondary, marginTop: 4 }}>
          Please select an active commercial tuition batch from the perspective switcher.
        </Text>
      </Box>
    );
  }

  const roleTitle = commercialBatch.role?.replace('_', ' ').toUpperCase() || 'LEAD TUTOR';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.colors.background }}>
      <VStack style={{ padding: tokens.spacing.md, gap: tokens.spacing.md }}>
        {/* 1. Batch Hero Banner */}
        <Box
          style={{
            padding: tokens.spacing.lg,
            borderRadius: tokens.radii.lg,
            backgroundColor: tokens.colors.surfaceElevated,
            borderWidth: 1,
            borderColor: 'rgba(79, 125, 163, 0.3)',
            shadowColor: tokens.colors.shadowColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <HStack style={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: tokens.spacing.sm }}>
            <VStack style={{ flex: 1, gap: 4 }}>
              <HStack style={{ alignItems: 'center', gap: 6 }}>
                <Box
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: tokens.radii.full,
                    backgroundColor: 'rgba(79, 125, 163, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(79, 125, 163, 0.3)',
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: tokens.colors.info }}>
                    {roleTitle}
                  </Text>
                </Box>
                <Text style={{ fontSize: 11, fontWeight: '700', color: tokens.semantic.text.secondary }}>
                  {commercialBatch.instituteName}
                </Text>
              </HStack>

              <Text
                style={{
                  fontSize: tokens.typography.sizes.lg,
                  fontWeight: '800',
                  color: tokens.semantic.text.primary,
                  marginTop: 2,
                }}
              >
                {commercialBatch.displayTitle || commercialBatch.displayName}
              </Text>

              <Text style={{ fontSize: tokens.typography.sizes.xs, color: tokens.semantic.text.secondary }}>
                {commercialBatch.batchName} · {commercialBatch.grade} ({commercialBatch.medium?.toUpperCase()})
              </Text>
            </VStack>

            <Box
              style={{
                width: 44,
                height: 44,
                borderRadius: tokens.radii.md,
                backgroundColor: 'rgba(79, 125, 163, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Briefcase size={22} color={tokens.colors.info} />
            </Box>
          </HStack>
        </Box>

        {/* 2. Quick Action Toolbar (Sri Lankan Tuition Workflow) */}
        <VStack style={{ gap: tokens.spacing.xs }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '800',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: tokens.semantic.text.secondary,
            }}
          >
            ⚡ Operational Actions
          </Text>

          <HStack style={{ gap: tokens.spacing.sm }}>
            {/* Quick QR Scanner */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Scan Student Admission Cards"
              onPress={() => hapticLight()}
              style={{
                flex: 1,
                padding: tokens.spacing.md,
                borderRadius: tokens.radii.md,
                backgroundColor: tokens.colors.surface,
                borderWidth: 1,
                borderColor: tokens.semantic.border.base,
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(212, 132, 58, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QrCode size={18} color={tokens.colors.primary} />
              </Box>
              <Text style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '700', color: tokens.semantic.text.primary }}>
                Card Scan Entry
              </Text>
              <Text style={{ fontSize: 10, color: tokens.semantic.text.muted }}>
                Barcode / QR Check
              </Text>
            </Pressable>

            {/* Paper Class Marks */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Paper Mark Entry"
              onPress={() => hapticLight()}
              style={{
                flex: 1,
                padding: tokens.spacing.md,
                borderRadius: tokens.radii.md,
                backgroundColor: tokens.colors.surface,
                borderWidth: 1,
                borderColor: tokens.semantic.border.base,
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(91, 140, 79, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={18} color={tokens.colors.success} />
              </Box>
              <Text style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '700', color: tokens.semantic.text.primary }}>
                Paper Marks
              </Text>
              <Text style={{ fontSize: 10, color: tokens.semantic.text.muted }}>
                Rank & Score Sheets
              </Text>
            </Pressable>

            {/* Parent SMS Blast */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="SMS Broadcast"
              onPress={() => hapticLight()}
              style={{
                flex: 1,
                padding: tokens.spacing.md,
                borderRadius: tokens.radii.md,
                backgroundColor: tokens.colors.surface,
                borderWidth: 1,
                borderColor: tokens.semantic.border.base,
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(79, 125, 163, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={18} color={tokens.colors.info} />
              </Box>
              <Text style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '700', color: tokens.semantic.text.primary }}>
                SMS Broadcast
              </Text>
              <Text style={{ fontSize: 10, color: tokens.semantic.text.muted }}>
                Parent Notices
              </Text>
            </Pressable>
          </HStack>
        </VStack>

        {/* 3. Live Batch Metrics */}
        <VStack style={{ gap: tokens.spacing.xs }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '800',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: tokens.semantic.text.secondary,
            }}
          >
            📊 Batch Summary
          </Text>

          <HStack style={{ gap: tokens.spacing.sm }}>
            <Box
              style={{
                flex: 1,
                padding: tokens.spacing.md,
                borderRadius: tokens.radii.md,
                backgroundColor: tokens.colors.surface,
                borderWidth: 1,
                borderColor: tokens.semantic.border.base,
              }}
            >
              <HStack style={{ alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Users size={14} color={tokens.semantic.text.secondary} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: tokens.semantic.text.secondary }}>
                  Enrolled Students
                </Text>
              </HStack>
              <Text style={{ fontSize: tokens.typography.sizes.xl, fontWeight: '800', color: tokens.semantic.text.primary }}>
                248
              </Text>
            </Box>

            <Box
              style={{
                flex: 1,
                padding: tokens.spacing.md,
                borderRadius: tokens.radii.md,
                backgroundColor: tokens.colors.surface,
                borderWidth: 1,
                borderColor: tokens.semantic.border.base,
              }}
            >
              <HStack style={{ alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <CircleCheck size={14} color={tokens.colors.success} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: tokens.semantic.text.secondary }}>
                  Today's Attendance
                </Text>
              </HStack>
              <Text style={{ fontSize: tokens.typography.sizes.xl, fontWeight: '800', color: tokens.colors.success }}>
                92%
              </Text>
            </Box>

            <Box
              style={{
                flex: 1,
                padding: tokens.spacing.md,
                borderRadius: tokens.radii.md,
                backgroundColor: tokens.colors.surface,
                borderWidth: 1,
                borderColor: tokens.semantic.border.base,
              }}
            >
              <HStack style={{ alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <TrendingUp size={14} color={tokens.colors.primary} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: tokens.semantic.text.secondary }}>
                  Monthly Fees Paid
                </Text>
              </HStack>
              <Text style={{ fontSize: tokens.typography.sizes.xl, fontWeight: '800', color: tokens.colors.primary }}>
                88%
              </Text>
            </Box>
          </HStack>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
