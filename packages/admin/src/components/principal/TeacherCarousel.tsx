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
import {
    Box,
    HStack,
    VStack,
    Text,
    ScrollView,
    SkeletonCard,
    useTheme,
    getInitialsFromName,
    Pressable,
    hapticLight,
    Theme
} from '@repo/ui';
import { staffManagementAPI, type TeacherCarouselItem } from '@repo/core';

interface TeacherCarouselProps {
    schoolId: string;
    onTapTeacher?: (userId: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
    present: 'Present',
    late: 'Late',
    absent: 'Absent',
    on_leave: 'On Leave',
    half_day: 'Half Day'
};

function formatRole(role: string): string {
    return role
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function TeacherCard({
    item,
    onTap
}: {
    item: TeacherCarouselItem;
    onTap?: () => void;
}) {
    const theme = useTheme();

    const getStatusColor = (status?: string): string => {
        switch (status) {
            case 'present': return theme.accent.sageGreen;
            case 'late': return theme.accent.action;
            case 'absent': return theme.accent.danger;
            case 'on_leave': return theme.accent.templeGold;
            case 'half_day': return theme.accent.templeGold;
            default: return theme.text.muted;
        }
    };

    const statusColor = getStatusColor(item.todayStatus);
    const statusLabel = item.todayStatus ? (STATUS_LABELS[item.todayStatus] ?? item.todayStatus) : 'No data';

    return (
        <Pressable 
            onPress={() => {
                hapticLight();
                onTap?.();
            }}
            className="w-40 bg-phase-surface rounded-2xl border border-phase-border p-md items-center justify-center gap-3"
        >
            {/* Avatar */}
            <Box
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{ backgroundColor: `${theme.accent.action}22` }}
            >
                <Text className="text-xl font-bold text-phase-accent">
                    {getInitialsFromName(item.fullName)}
                </Text>
            </Box>

            {/* Name & Role */}
            <VStack className="items-center gap-1">
                <Text
                    numberOfLines={1}
                    className="text-[13px] font-bold text-phaseText-primary text-center max-w-[136px]"
                >
                    {item.fullName}
                </Text>
                <Box className="bg-phase-interactive rounded-full px-2 py-0.5 border border-phase-border">
                    <Text className="text-[9px] font-bold text-phase-accent uppercase">
                        {formatRole(item.role)}
                    </Text>
                </Box>
            </VStack>

            {/* Status & Load */}
            <VStack className="items-center gap-1">
                <HStack className="items-center gap-1.5">
                    <Box
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: statusColor }}
                    />
                    <Text className="text-[11px] text-phaseText-secondary">
                        {statusLabel}
                    </Text>
                </HStack>
                <Text className="text-[10px] text-phaseText-muted">
                    {item.classroomCount === 1 ? '1 assigned class' : `${item.classroomCount} assigned classes`}
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
        return () => { mounted = false; };
    }, [schoolId]);

    if (loading) {
        return (
            <HStack className="gap-3">
                <SkeletonCard height={200} className="w-40" />
                <SkeletonCard height={200} className="w-40" />
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
            contentContainerStyle={{ 
                paddingHorizontal: 20,
                gap: 12 
            }}
        >
            {teachers.map((t) => (
                <TeacherCard
                    key={t.userId}
                    item={t}
                    onTap={() => onTapTeacher?.(t.userId)}
                />
            ))}
        </ScrollView>
    );
}
