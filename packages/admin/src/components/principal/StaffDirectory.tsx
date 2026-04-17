import React from 'react';
import { Icon, VStack, HStack, Text, Box,  useThemedColors, SanctuaryCard, ScrollView } from '@repo/ui';
import { User, Mail, Phone, ChevronRight } from 'lucide-react-native';

interface StaffMember {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
}

interface StaffDirectoryProps {
    staff: StaffMember[];
    onSelect?: (staff: StaffMember) => void;
}

export default function StaffDirectory({ staff, onSelect }: StaffDirectoryProps) {
    const colors = useTheme().scene;

    if (!staff?.length) return (
        <Box sx={{ p: '$4', alignItems: 'center' }}>
            <Text color={colors.textSecondary}>No staff members found.</Text>
        </Box>
    );

    return (
        <ScrollView>
            <VStack space="sm" p="$4">
                {staff.map((member) => (
                    <SanctuaryCard 
                        key={member.id} 
                        variant="glass" 
                        onPress={() => onSelect?.(member)}
                    >
                        <HStack space="md" alignItems="center" p="$3">
                            <Box sx={{ p: '$2', borderRadius: '$full', backgroundColor: colors.tertiary }}>
                                <Icon as={User} size={20} color={colors.action} />
                            </Box>
                            <VStack flex={1}>
                                <Text bold color={colors.text}>{member.name}</Text>
                                <Text size="xs" color={colors.textSecondary}>{member.role}</Text>
                            </VStack>
                            <Icon as={ChevronRight} size={16} color={colors.textTertiary} />
                        </HStack>
                    </SanctuaryCard>
                ))}
            </VStack>
        </ScrollView>
    );
}
