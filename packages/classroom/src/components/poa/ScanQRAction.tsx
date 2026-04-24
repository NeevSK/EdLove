import React from 'react';
import { ScanLine } from 'lucide-react-native';
import { Box, Text, Icon, hapticLight } from '@repo/ui';

export function ScanQRAction() {
    return (
        <Box 
            as="button"
            onClick={hapticLight}
            className="flex-row items-center gap-2.5 px-6 py-3 rounded-full bg-sanctuary-surface border border-sanctuary-border shadow-sm active:bg-sanctuary-surface-secondary"
        >
            <Icon as={ScanLine} size="sm" className="text-sanctuary-text" />
            <Text className="text-sanctuary-text font-black uppercase text-[10px] tracking-[0.2em]">Scan QR</Text>
        </Box>
    );
}
