import React, { useState } from 'react';
import { Box, VStack, Text, Heading, Button, ButtonText, Checkbox, ScrollView, Center, HStack } from '@/ui';
import { Theme } from '../constants/Theme';
import { authAPI } from '../lib/api/auth';
import { useThemedColors } from '../hooks/useThemedColors';
import ScreenWrapper from '../components/shared/ScreenWrapper';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import { useTranslation } from 'react-i18next';
import { Shield, Heart, Info } from 'lucide-react-native';

interface TermsScreenProps {
    onAccept: () => void;
}

export default function TermsScreen({ onAccept }: TermsScreenProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        if (!accepted) return;

        hapticLight();
        setLoading(true);
        try {
            // Create anonymous user
            await authAPI.signInAnonymously();
            hapticSuccess();
            onAccept();
        } catch (error: any) {
            console.error('Failed to create anonymous user:', error);
            hapticError();
            // In a real app, we'd show a toast here
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView
                sx={{ flex: 1 }}
                contentContainerStyle={{
                    padding: 24,
                    paddingTop: 60,
                    paddingBottom: 40
                }}
                showsVerticalScrollIndicator={false}
            >
                <VStack space="2xl">
                    <Center>
                        <Box
                            sx={{
                                p: '$4',
                                borderRadius: Theme.corners.full,
                                backgroundColor: colors.secondary,
                                mb: '$2'
                            }}
                        >
                            <Heart size={40} color={colors.action} />
                        </Box>
                        <Heading size="3xl" color={colors.action} textAlign="center">
                            {t('terms.title') || 'Welcome to Gurudevi'}
                        </Heading>
                        <Text size="md" color={colors.textSecondary} textAlign="center" mt="$2">
                            {t('terms.subtitle') || 'Education born from Love, built with Love'}
                        </Text>
                    </Center>

                    <VStack space="lg" mt="$4">
                        <InfoItem
                            icon={<Shield size={20} color={colors.action} />}
                            title={t('terms.privacyTitle') || 'Privacy First'}
                            description={t('terms.privacyDesc') || "We don't track you. Your data is your own."}
                            colors={colors}
                        />
                        <InfoItem
                            icon={<Info size={20} color={colors.action} />}
                            title={t('terms.guestTitle') || 'Explore as Guest'}
                            description={t('terms.guestDesc') || 'Start exploring immediately. Create an account later to save your progress.'}
                            colors={colors}
                        />
                    </VStack>

                    <Box
                        sx={{
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.comfortable,
                            p: '$4',
                            mt: '$4',
                            borderWidth: 1,
                            borderColor: colors.border
                        }}
                    >
                        <Text size="sm" color={colors.textSecondary} lineHeight="$md">
                            {t('terms.disclaimer') || 'By continuing, you agree to our Terms of Service and Privacy Policy. You can explore the app as a guest. Create an account anytime to save your progress and unlock all features.'}
                        </Text>
                    </Box>

                    <HStack space="md" alignItems="center" px="$2">
                        <Checkbox
                            value={accepted}
                            onValueChange={(val) => {
                                hapticLight();
                                setAccepted(val);
                            }}
                            aria-label="Accept Terms"
                        />
                        <Pressable onPress={() => {
                            hapticLight();
                            setAccepted(!accepted);
                        }}>
                            <Text size="sm" color={colors.text}>
                                {t('terms.checkboxLabel') || 'I accept the Terms and Privacy Policy'}
                            </Text>
                        </Pressable>
                    </HStack>

                    <Button
                        size="lg"
                        onPress={handleAccept}
                        isDisabled={!accepted || loading}
                        sx={{
                            backgroundColor: accepted ? colors.action : colors.textTertiary,
                            borderRadius: Theme.corners.comfortable,
                            height: 56,
                            mt: '$2',
                        }}
                    >
                        <ButtonText color={Theme.colors.white} fontWeight="$bold" size="lg">
                            {loading ? t('terms.starting') || 'Starting...' : t('terms.accept') || 'Accept and Continue'}
                        </ButtonText>
                    </Button>
                </VStack>
            </ScrollView>
        </ScreenWrapper>
    );
}

function InfoItem({ icon, title, description, colors }: { icon: any, title: string, description: string, colors: any }) {
    return (
        <HStack space="md" alignItems="flex-start">
            <Box mt="$1">{icon}</Box>
            <VStack flex={1}>
                <Text color={colors.text} fontWeight="$bold" size="md">{title}</Text>
                <Text color={colors.textTertiary} size="sm">{description}</Text>
            </VStack>
        </HStack>
    );
}

function Pressable({ children, onPress }: { children: React.ReactNode, onPress: () => void }) {
    return (
        <VStack>
            <Button variant="link" onPress={onPress} p="$0">
                {children}
            </Button>
        </VStack>
    );
}
