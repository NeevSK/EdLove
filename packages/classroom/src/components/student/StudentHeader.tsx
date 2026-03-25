import React from 'react';
import { useStore } from '@repo/core';
import { Box, Heading, Text, Theme } from '@repo/ui';
import { Star } from 'lucide-react-native';

export function StudentHeader({ isDemo }: { isDemo: boolean }) {
    const { user } = useStore();
    return (
        <Box sx={{ marginBottom: 40 }}>
            <Box sx={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Box sx={{ padding: 8, backgroundColor: 'rgba(52, 199, 219, 0.1)', borderRadius: 8 }}>
                    <Star size={20} color="#34C7DB" />
                </Box>
                <Text sx={{ fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: '#A0A0A0' }}>
                    Your Learning Journey
                </Text>
            </Box>
            <Heading sx={{ fontSize: 42, fontWeight: '800', lineHeight: 50, color: 'var(--ink)' }}>
                Radiate <Text sx={{ color: '#34C7DB', fontSize: 42, fontWeight: '800' }}>Curiosity</Text>{isDemo ? ', Amara' : (user?.full_name ? `, ${user.full_name.split(' ')[0]}` : '')}.
            </Heading>
        </Box>
    );
}
