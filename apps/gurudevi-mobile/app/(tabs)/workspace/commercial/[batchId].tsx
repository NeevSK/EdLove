import { View, Text, Pressable, ScrollView } from 'react-native';
import { usePerspectiveSwitch } from '@repo/core/logic';
import type { CommercialPerspective } from '@repo/core/types/Perspective';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import {
  Briefcase,
  ChevronRight,
  CircleCheck,
  FileText,
  QrCode,
  Send,
  Sparkles,
  TrendingUp,
  Users,
} from '@repo/ui/icons';
import { tokens } from '@repo/ui/tokens';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';

export { RouteErrorBoundary as ErrorBoundary };

export default function CommercialBatchScreen() {
  const { batchId } = useLocalSearchParams<{ batchId?: string }>();
  const { activePerspective, availablePerspectives, getPerspectiveStorage } =
    usePerspectiveSwitch();

  const commercialBatch = useMemo(() => {
    if (activePerspective.kind === 'commercial') {
      return activePerspective as CommercialPerspective;
    }
    const found = availablePerspectives.find(
      (p) =>
        p.kind === 'commercial' &&
        (p.id === batchId || (p as CommercialPerspective).batchId === batchId),
    );
    return (found as CommercialPerspective) || null;
  }, [activePerspective, availablePerspectives, batchId]);

  // Sandboxed storage partition for this specific commercial batch (e.g. attendance drafts, marks caches)
  const batchStorage = useMemo(() => {
    return getPerspectiveStorage(commercialBatch?.id || batchId);
  }, [batchId, commercialBatch?.id, getPerspectiveStorage]);

  if (!commercialBatch) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: tokens.colors.background,
          padding: tokens.spacing.lg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: tokens.typography.sizes.md,
            fontWeight: '700',
            color: tokens.semantic.text.primary,
          }}
        >
          Batch Workspace Not Found
        </Text>
        <Text
          style={{
            fontSize: tokens.typography.sizes.xs,
            color: tokens.semantic.text.secondary,
            marginTop: 4,
          }}
        >
          Please select an active commercial tuition batch from the perspective switcher.
        </Text>
      </View>
    );
  }

  const roleTitle = commercialBatch.role?.replace('_', ' ').toUpperCase() || 'LEAD TUTOR';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.colors.background }}>
      <View style={{ padding: tokens.spacing.md, gap: tokens.spacing.md }}>
        {/* 1. Batch Hero Banner */}
        <View
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
          <View className="flex-row items-center"
            style={{
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: tokens.spacing.sm,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <View className="flex-row items-center" style={{ alignItems: 'center', gap: 6 }}>
                <View
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
                </View>
                <Text
                  style={{ fontSize: 11, fontWeight: '700', color: tokens.semantic.text.secondary }}
                >
                  {commercialBatch.instituteName}
                </Text>
              </View>

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

              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  color: tokens.semantic.text.secondary,
                }}
              >
                {commercialBatch.batchName} · {commercialBatch.grade} (
                {commercialBatch.medium?.toUpperCase()})
              </Text>
            </View>

            <View
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
            </View>
          </View>
        </View>

        {/* 2. Quick Action Toolbar (Sri Lankan Tuition Workflow) */}
        <View style={{ gap: tokens.spacing.xs }}>
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

          <View className="flex-row items-center" style={{ gap: tokens.spacing.sm }}>
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
              <View
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
              </View>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  fontWeight: '700',
                  color: tokens.semantic.text.primary,
                }}
              >
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
              <View
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
              </View>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  fontWeight: '700',
                  color: tokens.semantic.text.primary,
                }}
              >
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
              <View
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
              </View>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  fontWeight: '700',
                  color: tokens.semantic.text.primary,
                }}
              >
                SMS Broadcast
              </Text>
              <Text style={{ fontSize: 10, color: tokens.semantic.text.muted }}>
                Parent Notices
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 3. Live Batch Metrics */}
        <View style={{ gap: tokens.spacing.xs }}>
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

          <View className="flex-row items-center" style={{ gap: tokens.spacing.sm }}>
            <View
              style={{
                flex: 1,
                padding: tokens.spacing.md,
                borderRadius: tokens.radii.md,
                backgroundColor: tokens.colors.surface,
                borderWidth: 1,
                borderColor: tokens.semantic.border.base,
              }}
            >
              <View className="flex-row items-center" style={{ alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Users size={14} color={tokens.semantic.text.secondary} />
                <Text
                  style={{ fontSize: 10, fontWeight: '700', color: tokens.semantic.text.secondary }}
                >
                  Enrolled Students
                </Text>
              </View>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xl,
                  fontWeight: '800',
                  color: tokens.semantic.text.primary,
                }}
              >
                248
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                padding: tokens.spacing.md,
                borderRadius: tokens.radii.md,
                backgroundColor: tokens.colors.surface,
                borderWidth: 1,
                borderColor: tokens.semantic.border.base,
              }}
            >
              <View className="flex-row items-center" style={{ alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <CircleCheck size={14} color={tokens.colors.success} />
                <Text
                  style={{ fontSize: 10, fontWeight: '700', color: tokens.semantic.text.secondary }}
                >
                  Today's Attendance
                </Text>
              </View>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xl,
                  fontWeight: '800',
                  color: tokens.colors.success,
                }}
              >
                92%
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                padding: tokens.spacing.md,
                borderRadius: tokens.radii.md,
                backgroundColor: tokens.colors.surface,
                borderWidth: 1,
                borderColor: tokens.semantic.border.base,
              }}
            >
              <View className="flex-row items-center" style={{ alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <TrendingUp size={14} color={tokens.colors.primary} />
                <Text
                  style={{ fontSize: 10, fontWeight: '700', color: tokens.semantic.text.secondary }}
                >
                  Monthly Fees Paid
                </Text>
              </View>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xl,
                  fontWeight: '800',
                  color: tokens.colors.primary,
                }}
              >
                88%
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
