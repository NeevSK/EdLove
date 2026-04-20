import React from 'react';
import { Plus, ScanLine } from 'lucide-react-native';
import { FeatureGuard } from '@repo/core';
import { Box, Button, ButtonText, Theme } from '@repo/ui';

export function TeacherPrimaryActions({ onCreateClassroom }: { onCreateClassroom: () => void }) {
    return (
        <HStack className="gap-4 flex-wrap items-center">
            <FeatureGuard action="create" subject="Classroom">
                <Button 
                    action="primary"
                    onPress={() => { hapticLight(); onCreateClassroom(); }}
                    className="bg-sanctuarySaffron rounded-full px-8 h-12 shadow-sm active:opacity-85"
                >
                    <HStack className="items-center gap-2.5">
                        <Icon as={Plus} size="sm" className="text-sacredWhite" />
                        <ButtonText className="text-sacredWhite font-black uppercase text-[10px] tracking-[0.2em]">Create Classroom</ButtonText>
                    </HStack>
                </Button>
            </FeatureGuard>
            <FeatureGuard action="read" subject="Classroom">
                <Button 
                    variant="outline" 
                    action="secondary"
                    onPress={hapticLight}
                    className="rounded-full px-8 h-12 border-sanctuary-border bg-sanctuary-surface shadow-sm active:bg-sanctuary-surface-secondary"
                >
                    <HStack className="items-center gap-2.5">
                        <Icon as={ScanLine} size="sm" className="text-sanctuary-text" />
                        <ButtonText className="text-sanctuary-text font-black uppercase text-[10px] tracking-[0.2em]">Scan QR</ButtonText>
                    </HStack>
                </Button>
            </FeatureGuard>
        </HStack>
    );
}
