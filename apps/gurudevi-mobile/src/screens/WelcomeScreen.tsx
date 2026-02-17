import React, { useState } from 'react';
import {
    Box,
    VStack,
    Text,
    Heading,
    Button,
    ButtonText,
    Center,
} from '@/ui';
import { Theme } from '../constants/Theme';
import { useTranslation } from 'react-i18next';
import { Image, Dimensions } from 'react-native';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import AuthScreen from './AuthScreen';
import TermsScreen from './TermsScreen';
import ScreenWrapper from '../components/shared/ScreenWrapper';
import useThemedColors from '../hooks/useThemedColors';

const { width } = Dimensions.get('window');

const LOGO = require('../../assets/icon.png'); // Correct path relative to src/screens

export default function WelcomeScreen() {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [showAuth, setShowAuth] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    if (showAuth) {
        return <AuthScreen />;
    }

    if (showTerms) {
        return <TermsScreen onAccept={() => {
            // This is handled by App.tsx detecting the new session
            // from signInAnonymously inside TermsScreen
        }} />;
    }

    const handleGetStarted = () => {
        hapticSuccess();
        setShowTerms(true);
    };

    const handleLogin = () => {
        hapticLight();
        setShowAuth(true);
    };

    return (
        <ScreenWrapper scroll>
            <Center sx={{ flex: 1, paddingVertical: Theme.spacing.xl }}>
                <VStack space="2xl" alignItems="center" sx={{ width: '100%', maxWidth: 400 }}>
                    {/* Hero Section */}
                    <VStack space="md" alignItems="center">
                        <Box sx={{
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            backgroundColor: colors.secondary,
                            justifyContent: 'center',
                            alignItems: 'center',
                            shadowColor: colors.shadow,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 5
                        }}>
                            <Image
                                source={LOGO}
                                style={{ width: 80, height: 80, borderRadius: 10 }}
                                alt="Gurudevi Logo"
                            />
                        </Box>
                        <Heading
                            color={colors.action}
                            size="4xl"
                            textAlign="center"
                            sx={{ letterSpacing: -1, mt: Theme.spacing.md }}
                        >
                            Gurudevi
                        </Heading>
                        <Text
                            color={colors.text}
                            size="lg"
                            textAlign="center"
                            sx={{ opacity: 0.9, fontStyle: 'italic' }}
                        >
                            {t('welcome.subtitle', 'The Digital Sanctuary for Educators')}
                        </Text>
                    </VStack>

                    {/* Intro Text */}
                    <Box sx={{ py: Theme.spacing.lg }}>
                        <Text color={colors.textSecondary} textAlign="center" size="md">
                            {t('welcome.intro', 'Transmute your classroom into a shared sanctuary. Manage ecology, track wellbeing, and nurture wisdom with 108 million teachers.')}
                        </Text>
                    </Box>

                    {/* Actions */}
                    <VStack space="md" sx={{ width: '100%' }}>
                        <Button
                            size="xl"
                            variant="solid"
                            onPress={handleGetStarted}
                            sx={{
                                backgroundColor: colors.action,
                                borderRadius: Theme.corners.comfortable,
                                height: 60,
                            }}
                        >
                            <ButtonText color={Theme.colors.white} fontWeight="$bold" size="lg">
                                {t('welcome.getStarted', 'Get Started')}
                            </ButtonText>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            onPress={handleLogin}
                            sx={{
                                borderColor: colors.textTertiary,
                                borderRadius: Theme.corners.comfortable,
                                height: 50,
                            }}
                        >
                            <ButtonText color={colors.textSecondary}>
                                {t('welcome.login', 'Already have an account? Log In')}
                            </ButtonText>
                        </Button>
                    </VStack>

                    {/* Footer */}
                    <Text color={colors.textTertiary} size="xs" textAlign="center" mt="$4">
                        {t('welcome.privacyPact', 'By joining, you agree to our Sacred Privacy Pact.')}
                    </Text>
                </VStack>
            </Center>
        </ScreenWrapper>
    );
}
