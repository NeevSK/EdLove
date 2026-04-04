import React from 'react';
import { Trophy } from 'lucide-react-native';
import {
    useThemedColors,
    Box,
    HStack,
    VStack,
    Text,
    Theme,
    Heading
} from '@repo/ui';

interface StudentGrowthPointsProps {
    points: number;
    isDemo: boolean;
}

export const StudentGrowthPoints = ({ points, isDemo }: StudentGrowthPointsProps) => {
    const colors = useThemedColors();

    if (!isDemo) return null; // Only for demo for now based on original code

    return (
        <Box 
            sx={{ 
                padding: 24, 
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderColor: 'rgba(245, 158, 11, 0.2)',
                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                // linear-gradient equivalent in style or simplified
            }}
        >
            <HStack sx={{ alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Trophy size={20} color={Theme.colors.templeGold} />
                <Heading sx={{ fontSize: 14, fontWeight: '800', color: colors.text }}>
                    Growth Journey
                </Heading>
            </HStack>

            <HStack sx={{ alignItems: 'baseline', marginBottom: 4 }}>
                <Text sx={{ 
                    fontSize: 40, 
                    fontWeight: '800', 
                    color: Theme.colors.templeGold 
                }}>
                    {points}
                </Text>
                <Text sx={{ 
                    fontSize: 16, 
                    color: colors.textSecondary,
                    marginLeft: 4
                }}>
                    pts
                </Text>
            </HStack>

            <Text sx={{ 
                fontSize: 12, 
                color: colors.textSecondary, 
                marginBottom: 16 
            }}>
                Level 4 • Inquisitive Learner
            </Text>

            <Box sx={{ 
                height: 6, 
                backgroundColor: colors.border, 
                borderRadius: 3, 
                overflow: 'hidden', 
                marginBottom: 8 
            }}>
                <Box sx={{ 
                    width: '68%', 
                    height: '100%', 
                    backgroundColor: Theme.colors.templeGold, 
                    borderRadius: 3 
                }} />
            </Box>

            <Text sx={{ 
                fontSize: 11, 
                color: colors.textSecondary 
            }}>
                160 pts to next level
            </Text>
        </Box>
    );
};
