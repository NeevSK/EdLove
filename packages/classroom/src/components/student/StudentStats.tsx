import React from 'react';
import { Box, Text } from '@repo/ui';

export const StudentStatCard = ({ stat, isDemo }: { stat: any, isDemo: boolean }) => {
    if (!stat) return null;
    const Icon = stat.icon;
    
    return (
        <Box
            className="sanctuary-card"
            sx={{
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                minWidth: 180,
            }}
        >
            <Icon size={20} color={stat.color} />
            <Box>
                <Text sx={{ fontSize: 32, fontWeight: '800' }}>
                    {stat.value}
                    {isDemo && stat.value !== '' && (
                        <Text sx={{ fontSize: 14, color: 'var(--sanctuary-saffron)', marginLeft: 4 }}>
                            &
                        </Text>
                    )}
                </Text>
                <Text
                    sx={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: 'var(--ink-ghost)',
                        textTransform: 'uppercase',
                    }}
                >
                    {stat.label}
                </Text>
            </Box>
        </Box>
    );
};

export const StudentStats = ({ stats, isDemo }: { stats: any[], isDemo: boolean }) => {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
                marginBottom: 40,
            }}
        >
            {stats.map((stat, i) => (
                <StudentStatCard key={i} stat={stat} isDemo={isDemo} />
            ))}
        </Box>
    );
};
