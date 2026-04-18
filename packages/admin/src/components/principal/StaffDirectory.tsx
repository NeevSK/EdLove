import React from 'react';
import { Icon, VStack, HStack, Text, Box, useTheme, SanctuaryCard, ScrollView } from '@repo/ui';
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
    const { scene } = useTheme();

    if (!staff?.length) return (
        <Box className="p-4 items-center">
            <Text style={{ color: scene.text.secondary }}>No staff members found.</Text>
        </Box>
    );

    return (
        <ScrollView>
            <VStack space="sm" className="p-4">
                {staff.map((member) => (
                    <SanctuaryCard 
                        key={member.id} 
                        onPress={() => onSelect?.(member)}
                    >
                        <HStack space="md" className="items-center p-3">
                            <Box className="p-2 rounded-full" style={{ backgroundColor: scene.primary.lowOpacity }}>
                                <Icon as={User} size={20} color={scene.primary.main} />
                            </Box>
                            <VStack className="flex-1">
                                <Text className="font-bold" style={{ color: scene.text.primary }}>{member.name}</Text>
                                <Text size="xs" style={{ color: scene.text.secondary }}>{member.role}</Text>
                            </VStack>
                            <Icon as={ChevronRight} size={16} color={scene.text.muted} />
                        </HStack>
                    </SanctuaryCard>
                ))}
            </VStack>
        </ScrollView>
    );
}
