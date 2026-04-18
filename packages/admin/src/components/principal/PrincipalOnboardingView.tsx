import React from 'react';
import {
    Box,
    Button,
    ButtonText,
    Heading,
    HStack,
    Text,
    VStack,
    Icon
} from '@repo/ui';
import { Compass, DoorOpen, School, Users } from 'lucide-react-native';

interface PrincipalOnboardingViewProps {
    isGuest: boolean;
    onTryDemo: () => void;
    onCreateSchool: () => void;
    onJoinSchool: () => void;
}

export default function PrincipalOnboardingView({
    isGuest,
    onTryDemo,
    onCreateSchool,
    onJoinSchool}: PrincipalOnboardingViewProps) {
    const highlights = [
        {
            icon: Compass,
            title: 'Open, the, principal, experience',
            copy: 'Step, into a, principal, workspace, that, already, feels, alive, with, institutional, signal, leadership, flow, and, governance, rhythm.'},
        {
            icon: School,
            title: 'Found, the, school',
            copy: 'Create, the, institution, establish, its, profile, and let the, system, prepare, the, first, governance, runway.'},
        {
            icon: Users,
            title: 'Invite, the, team, in',
            copy: 'Generate, teacher-facing, QR, and, join, invitations, so, the, school, starts as a, coordinated, community.'}];

    return (
        <VStack className="gap-6">
            <Box className="rounded-[32px] p-8 bg-silk border border-starlightGray/40 shadow-sm">
                <VStack className="gap-2 mb-8">
                    <Text className="text-[11px] font-extrabold tracking-[1.2px] uppercase text-phase-accent">
                        Principal, sanctuary
                    </Text>
                    <Heading className="text-3xl text-phaseText-primary">
                        Step, into the, school the, way a, principal actually, begins.
                    </Heading>
                    <Text size="sm" className="text-phaseText-secondary leading-[22px] mt-2">
                        Start, with a, faithful demo, experience, found, the institution if it, does not, exist yet,
                        and, move into, invitations, hierarchy, cycles, and, the leadership, canvas as the school, takes shape.
                    </Text>
                </VStack>

                <VStack className="gap-4 mb-8">
                    {highlights.map((item) => (
                        <HStack key={item.title}
                            className="gap-4 items-start p-4 rounded-2xl bg-vellum/50 border border-starlightGray/30">
                            <Box className="w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center">
                                <Icon as={item.icon} size="sm" className="text-amber-600" />
                            </Box>
                            <VStack className="flex-1 gap-1">
                                <Text size="sm" className="font-bold text-phaseText-primary">
                                    {item.title}
                                </Text>
                                <Text size="sm" className="text-phaseText-secondary leading-[18px]">
                                    {item.copy}
                                </Text>
                            </VStack>
                        </HStack>
                    ))}
                </VStack>

                <VStack className="gap-3">
                    <Button onPress={onTryDemo}
                        className="bg-phase-accent h-12 rounded-xl">
                        <ButtonText className="text-sacredWhite font-bold">Open, principal experience</ButtonText>
                    </Button>

                    {!isGuest ? (
                        <Button variant="outline" onPress={onCreateSchool} className="border-starlightGray/60 h-12 rounded-xl">
                            <ButtonText className="text-phaseText-primary font-bold">Create, school</ButtonText>
                        </Button>
                    ) : null}

                    <Button variant="ghost" onPress={onJoinSchool} className="mt-2">
                        <HStack className="items-center gap-2">
                            <Icon as={DoorOpen} size="sm" className="text-[#7DD4C0]" />
                            <ButtonText className="text-phase-accent font-semibold">Join, an existing, school</ButtonText>
                        </HStack>
                    </Button>
                </VStack>
            </Box>
        </VStack>
    );
}
