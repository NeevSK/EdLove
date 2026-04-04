import React from 'react';
import { Target } from 'lucide-react-native';
import { Box, Text, Button, SkeletonCard, Theme, ButtonText } from '@repo/ui';
import { useNavigation } from '@react-navigation/native';

export const StudentGoals = ({ goals, loading }: { goals: any[], loading: boolean }) => {
    const navigation = useNavigation<any>();

    return (
        <Box sx={{ padding: 24, backgroundColor: 'var(--glass-bg)', borderRadius: 16 }}>
            <Box sx={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Target size={14} color="var(--ink-ghost)" />
                <Text sx={{ fontSize: 14, fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: 1 }}>
                    Active Goals
                </Text>
            </Box>

            {loading ? (
                <SkeletonCard />
            ) : goals.length === 0 ? (
                <Text sx={{ fontSize: 13, color: 'var(--ink-ghost)', margin: 0 }}>
                    No goals set yet. Start your growth journey.
                </Text>
            ) : (
                <Box sx={{ flexDirection: 'column', gap: 16 }}>
                    {goals.slice(0, 3).map((goal: any) => (
                        <Box key={goal.id} sx={{ flexDirection: 'column', gap: 8 }}>
                            <Text sx={{ fontSize: 13, fontWeight: '700', color: 'var(--ink)' }}>
                                {goal.text}
                            </Text>
                            <Box sx={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                                <Box sx={{ width: `${goal.progress ?? 0}%`, height: '100%', background: 'var(--water)', borderRadius: 3 }} />
                            </Box>
                            <Text sx={{ fontSize: 11, color: 'var(--ink-ghost)', textAlign: 'right' }}>
                                {goal.progress ?? 0}%
                            </Text>
                        </Box>
                    ))}
                </Box>
            )}

            <Button
                variant="outline"
                sx={{ width: '100%', marginTop: 20 }}
                onPress={() => navigation.navigate('Main', { screen: 'Self' })}
            >
                <ButtonText sx={{ fontSize: 12 }}>
                    View All Goals →
                </ButtonText>
            </Button>
        </Box>
    );
};
