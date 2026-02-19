import React from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Progress,
    ProgressFilledTrack,
} from '../gluestack';
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';
import { Trophy } from 'lucide-react-native';

export interface SanctuaryStatsItem {
    label: string;
    value: string | number;
    icon: any;
    color: string;
}

export interface SanctuaryStatsCardProps {
    title: string;
    items: SanctuaryStatsItem[];
    progressLabel?: string;
    progressValue?: number;
    showTrophy?: boolean;
}

/**
 * A standardized statistics and gamification card for the Sanctuary design system.
 * Displays key metrics and a progress bar.
 */
export default function SanctuaryStatsCard({
    title,
    items,
    progressLabel,
    progressValue = 0,
    showTrophy = true
}: SanctuaryStatsCardProps) {
    const colors = useThemedColors();

    return (
        <Box
            sx={{
                backgroundColor: colors.secondary,
                borderRadius: Theme.corners.generous,
                padding: Theme.spacing.lg,
                marginBottom: Theme.spacing.lg,
                borderColor: colors.border,
                borderWidth: 1,
                marginHorizontal: Theme.spacing.md
            }}
        >
            <HStack {...({ space: "sm", alignItems: "center", mb: Theme.spacing.md } as any)}>
                {showTrophy && <Trophy size={18} color={Theme.colors.sanctuarySaffron} />}
                <Text {...({ color: colors.text, bold: true, size: "md" } as any)}>
                    {title}
                </Text>
            </HStack>

            <HStack {...({ justifyContent: "space-between", mb: Theme.spacing.lg } as any)}>
                {items.map((item, index) => (
                    <VStack key={index} {...({ alignItems: "center", space: "xs", sx: { flex: 1 } } as any)}>
                        <Box
                            sx={{
                                backgroundColor: `${item.color}20`,
                                padding: 10,
                                borderRadius: 12,
                                marginBottom: 4
                            }}
                        >
                            <item.icon size={20} color={item.color} />
                        </Box>
                        <Text {...({ color: colors.text, bold: true, size: "lg" } as any)}>
                            {item.value}
                        </Text>
                        <Text {...({ color: colors.textTertiary, size: "xs" } as any)}>
                            {item.label}
                        </Text>
                    </VStack>
                ))}
            </HStack>

            {/* Progress Section */}
            {(progressLabel || progressValue > 0) && (
                <VStack {...({ space: "xs" } as any)}>
                    <HStack {...({ justifyContent: "space-between" } as any)}>
                        <Text {...({ color: colors.textTertiary, size: "xs" } as any)}>
                            {progressLabel}
                        </Text>
                        <Text {...({ color: colors.action, size: "xs", bold: true } as any)}>
                            {progressValue}%
                        </Text>
                    </HStack>
                    <Progress value={progressValue} {...({ w: "100%", h: 6, bg: colors.tertiary } as any)}>
                        <ProgressFilledTrack {...({ bg: colors.action } as any)} />
                    </Progress>
                </VStack>
            )}
        </Box>
    );
}
