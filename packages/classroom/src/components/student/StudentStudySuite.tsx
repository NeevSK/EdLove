import React from 'react';
import { BookOpen, MessageSquare, Star, Layout, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, Text, Heading, Pressable, Theme } from '@repo/ui';

export const StudentStudySuite = () => {
    const navigation = useNavigation<any>();

    const items = [
        { label: 'Library', icon: BookOpen, color: 'var(--amber-glow)', onClick: () => navigation.navigate('Main', { screen: 'Library' }) },
        { label: 'Community', icon: MessageSquare, color: 'var(--gurudevi-blue)', onClick: () => navigation.navigate('Main', { screen: 'Community' }) },
        { label: 'Rewards', icon: Star, color: 'var(--sanctuary-saffron)', onClick: () => { } },
        { label: 'Timetable', icon: Layout, color: 'var(--moss)', onClick: () => navigation.navigate('Timetable', {}) },
        { label: 'Self Reflection', icon: TrendingUp, color: 'var(--water)', onClick: () => navigation.navigate('Main', { screen: 'Self' }) },
    ];

    return (
        <Box className="sanctuary-card" sx={{ padding: Theme.spacing.xl }}>
            <Heading sx={{ fontSize: 14, fontWeight: '800', marginBottom: Theme.spacing.md }}>
                Study Suite
            </Heading>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <Pressable
                            key={i}
                            onPress={item.onClick}
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12,
                                padding: 12,
                                borderRadius: Theme.corners.comfortable,
                                ':hover': {
                                    backgroundColor: 'var(--background-alt)',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: Theme.corners.tight,
                                    backgroundColor: 'var(--background-alt)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Icon size={16} color={item.color} />
                            </Box>
                            <Text sx={{ fontSize: 13, fontWeight: '600', flex: 1 }}>{item.label}</Text>
                            <ChevronRight size={14} style={{ opacity: 0.2 }} />
                        </Pressable>
                    );
                })}
            </Box>
        </Box>
    );
};
