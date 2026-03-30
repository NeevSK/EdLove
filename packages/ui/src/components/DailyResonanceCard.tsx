import React from 'react';
import { View } from 'react-native';
import { VStack, HStack, Text, Heading } from '../gluestack';
import { useThemedColors } from '../hooks/useThemedColors';
import { Theme } from '../theme/Theme';
import { LucideIcon } from 'lucide-react-native';
import { GlassCard } from './GlassCard';

interface DailyResonanceCardProps {
    title: string;
    content: string;
    author?: string;
    icon: LucideIcon;
    type?: 'motivation' | 'wisdom' | 'general';
}

/**
 * DailyResonanceCard - A specialized GlassCard for daily insights.
 * Aligned with the "Glass Protocol" and "Active Resonance".
 */
export const DailyResonanceCard = ({
    title,
    content,
    author,
    icon: Icon,
    type = 'general'
}: DailyResonanceCardProps) => {
    const colors = useThemedColors();

    return (
        <GlassCard
            <VStack space="md"
                <HStack space="sm" alignItems="center"
                    <View
                        style={{
                            backgroundColor: type === 'motivation'
                                ? `${Theme.colors.sanctuarySaffron}26` // 15% opacity
                                : `${colors.action}26`,
                            padding: 8,
                            borderRadius: Theme.corners.comfortable
                        }}
                    
                        <Icon
                            size={20}
                            color={type === 'motivation' ? Theme.colors.sanctuarySaffron : colors.action}
                        /
                    </View
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: Theme.typography.fontSize.sm,
                            fontFamily: 'Inter_600SemiBold',
                            letterSpacing: 0.5
                        }}
                    
                        {title.toUpperCase()}
                    </Text
                </HStack

                <VStack space="xs"
                    <Text
                        style={{
                            color: colors.text,
                            fontSize: Theme.typography.fontSize.lg,
                            lineHeight: 26,
                            fontFamily: 'Inter_500Medium',
                        }}
                    
                        "{content}"
                    </Text
                    {author && (
                        <Text
                            style={{
                                color: colors.textTertiary,
                                fontSize: Theme.typography.fontSize.sm,
                                fontStyle: 'italic',
                                fontFamily: 'Inter_400Regular',
                                textAlign: 'right',
                                marginTop: Theme.spacing.small
                            }}
                        
                             {author}
                        </Text
                    )}
                </VStack
            </VStack
        </GlassCard
    );
};

