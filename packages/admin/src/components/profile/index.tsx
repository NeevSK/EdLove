import React from 'react';
import { Box, Text, VStack, HStack, Avatar, AvatarImage, AvatarFallbackText, Icon, Pressable, hapticLight } from '@repo/ui';
import { Mail, Phone, Globe, MapPin, Edit2 } from 'lucide-react-native';

export const AvatarDisplay = ({ uri, name, editable, onSave }: { uri?: string; name: string; editable?: boolean; onSave?: (uri: string) => void }) => (
    <Box className="items-center justify-center p-4">
        <Avatar size="xl" className="bg-phase-interactive/10 border-2 border-phase-interactive/20">
            {uri && <AvatarImage source={{ uri }} alt={name} />}
            <AvatarFallbackText className="text-phase-interactive font-black text-2xl">
                {name?.charAt(0) || 'S'}
            </AvatarFallbackText>
        </Avatar>
        {editable && (
             <Pressable onPress={() => hapticLight()} className="absolute bottom-6 right-6 bg-phase-interactive p-2 rounded-full border-2 border-white shadow-sm">
                <Icon as={Edit2} size="xs" className="text-white" />
             </Pressable>
        )}
    </Box>
);

export const ContactLinktree = ({ links, userName, userId, isOwnProfile, editable }: { links: any[]; userName: string; userId: string; isOwnProfile: boolean; editable: boolean }) => (
    <VStack className="gap-4 w-full">
        {links.length === 0 ? (
            <Text className="text-[12px] font-bold text-phaseText-muted uppercase tracking-widest text-center py-8">No links shared</Text>
        ) : (
            links.map((link, idx) => (
                <HStack key={idx} className="items-center gap-3 p-4 bg-phase-canvas rounded-2xl border border-phase-border">
                    <Icon as={Globe} size="sm" className="text-phaseText-muted" />
                    <Text className="text-[14px] font-bold text-phaseText-primary">{link.url}</Text>
                </HStack>
            ))
        )}
    </VStack>
);

export const EditableItem = ({ icon, label, value, field, placeholder, onSave, disabled }: { icon: any; label: string; value: string; field: string; placeholder: string; onSave: (field: string, val: string) => void; disabled: boolean }) => (
    <Pressable 
        onPress={() => !disabled && hapticLight()}
        disabled={disabled}
        className={`flex-row items-center justify-between p-5 bg-phase-surface rounded-[24px] border border-phase-border transition-all ${disabled ? '' : 'active:scale-[0.98]'}`}
    >
        <HStack className="items-center gap-4 flex-1">
            <Box className="p-3 bg-phase-interactive/10 rounded-xl">
                <Icon as={icon} size="sm" className="text-phase-interactive" />
            </Box>
            <VStack className="gap-0.5">
                <Text className="text-[11px] font-black text-phaseText-muted uppercase tracking-widest">{label}</Text>
                <Text className="text-[16px] font-black text-phaseText-primary tracking-tight">{value || placeholder}</Text>
            </VStack>
        </HStack>
        {!disabled && <Icon as={Edit2} size="xs" className="text-phase-interactive" />}
    </Pressable>
);

export const useSchoolProfile = (schoolId: string) => {
    // Stub implementation
    return {
        school: {
            id: schoolId,
            name: 'Imperial Academy',
            type: 'secondary',
            handle: 'imperial',
            vision: 'Pioneering Human Excellence through Resilience and Wisdom.',
            mission: 'To foster an ecosystem where data-driven leadership meets deep human connection.',
            motto: 'Knowledge is Light',
            founded_year: '1998',
            email: 'admin@imperial.edu',
            phone: '+91 98765 43210',
            website: 'www.imperial.edu',
            address: 'Knowledge Park, Central District, 400001',
            logo_url: null,
            cover_url: null,
        },
        stats: {
            total_students: 1200,
            total_teachers: 85,
            total_sections: 24,
            total_classrooms: 48
        },
        isLoading: false,
        isEditable: true,
        updateField: async (field: string, value: string) => {
            console.log('Update field:', field, value);
            return { error: null };
        }
    };
};
