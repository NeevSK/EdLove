import React from 'react';
import { Plus, ScanLine } from 'lucide-react-native';
import { FeatureGuard } from '@repo/core';
import { Box, Button, ButtonText, HStack, Icon, hapticLight } from '@repo/ui';

export function TeacherPrimaryActions({ onCreateClassroom }: { onCreateClassroom: () => void }) {
    return (
        <HStack className="gap-4 flex-wrap items-center">
            <FeatureGuard action="create" subject="Classroom">
                <Button 
                    action="primary"
                    onPress={() => { hapticLight(); onCreateClassroom(); }}
                    className="bg-templeGold rounded-full px-8 h-14 shadow-lg shadow-templeGold/20 active:opacity-85"
                >
                    <HStack className="items-center gap-2.5">
                        <Icon as={Plus} size="sm" className="text-black" />
                        <ButtonText className="text-black font-black uppercase text-[10px] tracking-[0.2em]">Create Classroom</ButtonText>
                    </HStack>
                </Button>
            </FeatureGuard>
            <FeatureGuard action="read" subject="Classroom">
                <Button 
                    variant="outline" 
                    className="rounded-full px-8 h-14 border-phase-canvas bg-phase-surface/50 shadow-sm active:bg-phase-canvas/20"
                    onPress={hapticLight}
                >
                    <HStack className="items-center gap-2.5">
                        <Icon as={ScanLine} size="sm" className="text-phaseText-primary" />
                        <ButtonText className="text-phaseText-primary font-black uppercase text-[10px] tracking-[0.2em]">Scan QR</ButtonText>
                    </HStack>
                </Button>
            </FeatureGuard>
        </HStack>
    );
}
