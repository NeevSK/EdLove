import React from 'react';
import { useStore } from '@repo/core';
import { Box, Heading, Text, VStack, HStack, Icon } from '@repo/ui';
import { Star } from 'lucide-react-native';

export function StudentHeader({ isDemo }: { isDemo: boolean }) {
    const { user } = useStore();
    return (
        <VStack className="mb-10 mt-2">
            <HStack className="items-center gap-3 mb-4">
                <Box className="w-10 h-10 bg-sanctuary-info/10 rounded-xl items-center justify-center border border-sanctuary-info/20">
                    <Icon as={Star} size="sm" className="text-sanctuary-info" />
                </Box>
                <Text className="text-[10px] font-black text-sanctuary-text-tertiary uppercase tracking-[3px]">
                    Your Learning Journey
                </Text>
            </HStack>
            <Heading className="text-4xl font-black text-sanctuary-text leading-[1.2] tracking-tighter">
                Radiate <Text className="text-sanctuary-info text-4xl font-black italic">Curiosity</Text>{isDemo ? ', Amara' : (user?.full_name ? `, ${user.full_name.split(' ')[0]}` : '')}.
            </Heading>
        </VStack>
    );
}
