/**
 * TeacherCarousel
 *
 * Horizontal scroll list of teacher cards showing:
 *  - Avatar (initial letter fallback)
 *  - Name, role tag
 *  - Today's attendance status dot
 *  - Class count
 */

import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, HStack, VStack, Text, ScrollView, SkeletonCard, useThemedColors } from '@repo/ui';
import { Theme } from '@repo/ui';
import { staffManagementAPI, TeacherCarouselItem } from '@repo/core';

interface TeacherCarouselProps {
  schoolId: string;
  onTapTeacher?: (userId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  present: Theme.colors.sage ?? '#4caf50',
  late: Theme.colors.sage ?? '#8bc34a',
  absent: Theme.colors.roseQuartz ?? '#f44336',
  on_leave: Theme.colors.amberGlow ?? '#ffc107',
  half_day: Theme.colors.amberGlow ?? '#ffc107',
};

const STATUS_LABELS: Record<string, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  on_leave: 'On Leave',
  half_day: 'Half Day',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatRole(role: string): string {
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** 20% opacity suffix for avatar background */
const AVATAR_BG_OPACITY = '33';
  item,
  onTap,
  colors,
}: {
  item: TeacherCarouselItem;
  onTap?: () => void;
  colors: ReturnType<typeof useThemedColors>;
}) {
  const statusColor = item.todayStatus ? (STATUS_COLORS[item.todayStatus] ?? colors.textMuted) : colors.textMuted;
  const statusLabel = item.todayStatus ? (STATUS_LABELS[item.todayStatus] ?? item.todayStatus) : 'No data';

  return (
    <TouchableOpacity onPress={onTap} activeOpacity={0.8}>
      <Box
        sx={{
          width: 160,
          minHeight: 200,
          backgroundColor: colors.surface,
          borderRadius: Theme.corners.comfortable,
          borderWidth: 1,
          borderColor: colors.border,
          padding: Theme.spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
          gap: Theme.spacing.sm,
        }}
      >
        {/* Avatar */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: Theme.colors.amberGlow + AVATAR_BG_OPACITY,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
          }}
        >
          <Text sx={{ fontSize: 20, fontWeight: '700', color: Theme.colors.amberGlow ?? colors.text }}>
            {getInitials(item.fullName)}
          </Text>
        </Box>

        {/* Name */}
        <Text
          numberOfLines={1}
          sx={{ fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'center', maxWidth: 136 }}
        >
          {item.fullName}
        </Text>

        {/* Role tag */}
        <Box
          sx={{
            backgroundColor: colors.background,
            borderRadius: 999,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text sx={{ fontSize: 10, color: colors.textMuted }}>
            {formatRole(item.role)}
          </Text>
        </Box>

        {/* Status */}
        <HStack sx={{ alignItems: 'center', gap: 4 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: statusColor,
            }}
          />
          <Text sx={{ fontSize: 11, color: colors.textMuted }}>{statusLabel}</Text>
        </HStack>

        {/* Class count */}
        <Text sx={{ fontSize: 11, color: colors.textMuted }}>
          {item.classCount === 1 ? '1 class today' : `${item.classCount} classes today`}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

export default function TeacherCarousel({ schoolId, onTapTeacher }: TeacherCarouselProps) {
  const colors = useThemedColors();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeacherCarouselItem[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const data = await staffManagementAPI.getTeacherCarousel(schoolId);
      if (!mounted) return;
      setTeachers(data);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [schoolId]);

  if (loading) {
    return (
      <HStack sx={{ gap: Theme.spacing.sm }}>
        <SkeletonCard height={200} style={{ width: 160 }} />
        <SkeletonCard height={200} style={{ width: 160 }} />
        <SkeletonCard height={200} style={{ width: 160 }} />
      </HStack>
    );
  }

  if (teachers.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      sx={{ marginHorizontal: -Theme.spacing.lg }}
    >
      <HStack
        sx={{
          gap: Theme.spacing.sm,
          paddingHorizontal: Theme.spacing.lg,
          paddingVertical: Theme.spacing.xs,
        }}
      >
        {teachers.map((t) => (
          <TeacherCard
            key={t.userId}
            item={t}
            onTap={() => onTapTeacher?.(t.userId)}
            colors={colors}
          />
        ))}
      </HStack>
    </ScrollView>
  );
}
