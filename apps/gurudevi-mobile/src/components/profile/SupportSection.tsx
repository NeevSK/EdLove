import React from 'react';
import { Linking, TouchableOpacity } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
} from '@/ui';
import { Theme } from '../../constants/Theme';
import { LifeBuoy, MessageCircle, AlertTriangle, ChevronRight } from 'lucide-react-native';

export default function SupportSection() {
    const handleSupport = () => {
        // TODO: Replace with actual support URL or email
        Linking.openURL('mailto:support@gurudevi.org');
    };

    const SupportItem = ({ icon: Icon, title, subtitle, onPress }: any) => (
        <TouchableOpacity onPress={onPress}>
            <HStack
                alignItems="center"
                justifyContent="space-between"
                p={Theme.spacing.md}
                bg={Theme.colors.deepIndigo}
                borderRadius={Theme.corners.comfortable}
                mb={Theme.spacing.sm}
            >
                <HStack space="md" alignItems="center">
                    <Box p={8} bg={`${Theme.colors.sanctuarySaffron}20`} borderRadius={8}>
                        <Icon size={20} color={Theme.colors.sanctuarySaffron} />
                    </Box>
                    <VStack>
                        <Text color={Theme.colors.sacredWhite} bold>{title}</Text>
                        <Text color={Theme.colors.mistGray} size="xs">{subtitle}</Text>
                    </VStack>
                </HStack>
                <ChevronRight size={20} color={Theme.colors.mistGray} />
            </HStack>
        </TouchableOpacity>
    );

    return (
        <VStack space="md" mt={Theme.spacing.lg}>
            <Heading color={Theme.colors.mistGray} size="sm" mb="$2">
                Help & Support
            </Heading>

            <SupportItem
                icon={MessageCircle}
                title="Contact Support"
                subtitle="Get help with your account"
                onPress={handleSupport}
            />
            <SupportItem
                icon={LifeBuoy}
                title="FAQs"
                subtitle="Common questions & answers"
                onPress={() => { }}
            />
            <SupportItem
                icon={AlertTriangle}
                title="Report Issue"
                subtitle="Found a bug? Let us know"
                onPress={handleSupport}
            />
        </VStack>
    );
}
