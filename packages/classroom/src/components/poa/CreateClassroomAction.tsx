import React from 'react';
import { Plus } from 'lucide-react-native';
import { Box, Text, Icon, hapticLight } from '@repo/ui';

export function CreateClassroomAction({ onCreateClassroom }: { onCreateClassroom: () => void }) {
    return (
        <Box 
            as="button"
            onClick={() => { hapticLight(); onCreateClassroom(); }}
            className="flex-row items-center gap-2.5 px-6 py-3 rounded-full bg-sanctuarySaffron shadow-sm active:opacity-85"
        >
            <Icon as={Plus} size="sm" className="text-sacredWhite" />
            <Text className="text-sacredWhite font-black uppercase text-[10px] tracking-[0.2em]">Create Classroom</Text>
        </Box>
    );
}
