/**
 * TeacherCarousel
 *
 * Horizontal scroll list of teacher cards showing:
 *  - Avatar (initial letter fallback)
 *  - Name, role tag
 *  - Today's attendance status dot
 *  - Class count
 */

import type { TeacherCarouselItem } from '@repo/core';
import { staffManagementAPI } from '@repo/core/api';

import { Box } from '@repo/ui/primitives';
import { HStack, Spinner, Text, VStack } from '@repo/ui/primitives';
import { Pressable, ScrollView } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import { getInitialsFromName } from '@repo/ui/utils/stringUtils';

import { useEffect, useState } from 'react';

interface TeacherCarouselProps {
  schoolId: string;
  onTapTeacher?: (userId: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  on_leave: 'On Leave',
  half_day: 'Half Day',
};

function formatRole(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function TeacherCard({ item, onTap }: { item: TeacherCarouselItem; onTap?: () => void }) {
  const getStatusStyles = (status?: string | null) => {
    switch (status) {
      case 'present':
        return { dot: 'bg-phase-success', bg: 'bg-phase-success/5' };
      case 'late':
        return { dot: 'bg-phase-interactive', bg: 'bg-phase-interactive/5' };
      case 'absent':
        return { dot: 'bg-phase-danger', bg: 'bg-phase-danger/5' };
      case 'on_leave':
      case 'half_day':
        return { dot: 'bg-phase-warning', bg: 'bg-phase-warning/5' };
      default:
        return { dot: 'bg-phaseText-muted', bg: 'bg-phase-canvas' };
    }
  };

  const statusStyles = getStatusStyles(item.todayStatus ?? undefined);
  const statusLabel = item.todayStatus
    ? (STATUS_LABELS[item.todayStatus] ?? item.todayStatus)
    : 'No data';

  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onTap?.();
      }}
      className="w-[170px] bg-phase-surface rounded-[32px] border border-phase-border p-6 items-center justify-center gap-5 active:scale-95 transition-all shadow-sm"
    >
      {/* Avatar Container */}
      <Box className="w-20 h-20 rounded-[28px] items-center justify-center bg-phase-interactive/10 border border-phase-interactive/10 relative">
        <Text className="text-2xl font-black text-phase-interactive">
          {getInitialsFromName(item.fullName)}
        </Text>
        {/* Status indicator overlap */}
        <Box
          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-[3px] border-phase-surface items-center justify-center ${statusStyles.dot}`}
        >
          <Box className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
        </Box>
      </Box>

      {/* Name & Role */}
      <VStack className="items-center gap-1.5">
        <Text
          numberOfLines={1}
          className="text-[15px] font-black text-phaseText-primary text-center w-full tracking-tight"
        >
          {item.fullName}
        </Text>
        <Box className="bg-phase-canvas border border-phase-border rounded-full px-3 py-1">
          <Text className="text-[9px] font-black text-phase-interactive uppercase tracking-widest leading-none">
            {formatRole(item.role)}
          </Text>
        </Box>
      </VStack>

      {/* Load Breakdown */}
      <VStack className="items-center gap-1 mt-1 bg-phase-canvas py-3 px-4 rounded-[20px] w-full border border-phase-border/50">
        <Text className="text-[11px] font-black text-phaseText-primary uppercase tracking-wider">
          {statusLabel}
        </Text>
        <Text className="text-[9px] font-bold text-phaseText-muted uppercase tracking-widest text-center">
          {item.classroomCount === 1 ? '1 UNIT' : `${item.classroomCount} UNITS`}
        </Text>
      </VStack>
    </Pressable>
  );
}

export default function TeacherCarousel({ schoolId, onTapTeacher }: TeacherCarouselProps) {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeacherCarouselItem[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await staffManagementAPI.getTeacherCarousel(schoolId);
        if (!mounted) return;
        setTeachers(data);
      } catch (err) {
        console.error('TeacherCarousel: load error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [schoolId]);

  if (loading) {
    return (
      <HStack className="gap-4 px-5">
        <Box className="w-[170px] h-[260px] bg-phase-canvas rounded-[32px] border border-phase-border items-center justify-center">
          <Spinner className="text-phase-interactive" />
        </Box>
        <Box className="w-[170px] h-[260px] bg-phase-canvas rounded-[32px] border border-phase-border items-center justify-center opacity-50">
          <Spinner className="text-phase-interactive opacity-50" />
        </Box>
      </HStack>
    );
  }

  if (teachers.length === 0) {
    return (
      <Box className="mx-5 p-12 bg-phase-canvas rounded-[32px] border border-dashed border-phase-border items-center justify-center opacity-60">
        <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[3px]">
          Vacancy In Registry
        </Text>
      </Box>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        gap: 16,
      }}
    >
      {teachers.map((t) => (
        <TeacherCard key={t.userId} item={t} onTap={() => onTapTeacher?.(t.userId)} />
      ))}
    </ScrollView>
  );
}
