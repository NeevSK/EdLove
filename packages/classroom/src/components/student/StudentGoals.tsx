import React from 'react';
import { Target } from 'lucide-react-native';
import { Box, Text, Button, SkeletonCard, ButtonText, Icon, VStack, HStack } from '@repo/ui';
import { useNavigation } from '@react-navigation/native';

export const StudentGoals = ({ goals, loading }: { goals: any[], loading: boolean }) => {
    const navigation = useNavigation<any>();

    return (
        <Box className="bg-sanctuary-surface rounded-[32px] border border-sanctuary-border p-6">
            <HStack className="items-center gap-2 mb-6">
                <Icon as={Target} size="xs" className="text-sanctuary-text-tertiary" />
                <Text className="text-xs font-black text-sanctuary-text-tertiary uppercase tracking-widest">
                    Active Goals
                </Text>
            </HStack>

            {loading ? (
                <SkeletonCard className="h-32" />
            ) : goals.length === 0 ? (
                <Text className="text-sm font-medium text-sanctuary-text-tertiary leading-relaxed">
                    No goals set yet. Start your growth journey.
                </Text>
            ) : (
                <VStack className="gap-6">
                    {goals.slice(0, 3).map((goal: any) => (
                        <VStack key={goal.id} className="gap-2">
                            <Text className="text-sm font-black text-sanctuary-text tracking-tight">
                                {goal.text}
                            </Text>
                            <Box className="h-2 bg-sanctuary-border/20 rounded-full overflow-hidden">
                                <Box 
                                    className="h-full bg-sanctuary-info rounded-full" 
                                    style={{ width: `${goal.progress ?? 0}%` }} 
                                />
                            </Box>
                            <Text className="text-[10px] font-black text-sanctuary-text-tertiary text-right tracking-widest uppercase">
                                {goal.progress ?? 0}% Complete
                            </Text>
                        </VStack>
                    ))}
                </VStack>
            )}

            <Button
                variant="outline"
                className="w-full mt-6 h-12 rounded-[18px] border-sanctuary-border/60"
                onPress={() => navigation.navigate('Main', { screen: 'Self' })}
            >
                <ButtonText className="text-xs font-bold text-sanctuary-text">
                    View All Goals →
                </ButtonText>
            </Button>
        </Box>
    );
};
