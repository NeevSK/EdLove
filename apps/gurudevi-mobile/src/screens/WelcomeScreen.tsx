import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    ButtonText,
    Center,
} from '@/ui';
import { Theme } from '../constants/Theme';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Image, Dimensions } from 'react-native';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import AuthScreen from './AuthScreen';

const { width } = Dimensions.get('window');

const LOGO = require('../../assets/icon.png'); // Correct path relative to src/screens

export default function WelcomeScreen() {
    const { t } = useTranslation();
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

    if (showAuth) {
        // We can pass a prop to AuthScreen if we wanted to force a mode, 
        // but it has its own toggle.
        return <AuthScreen />;
    }

    const handleGetStarted = () => {
        hapticSuccess();
        setShowAuth(true);
    };

    const handleLogin = () => {
        hapticLight();
        setShowAuth(true);
    };

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <Center sx={{ flex: 1, padding: Theme.spacing.xl }}>
                <VStack space="2xl" alignItems="center" sx={{ width: '100%', maxWidth: 400 }}>
                    {/* Hero Section */}
                    <VStack space="md" alignItems="center">
                        <Box sx={{ width: 120, height: 120, borderRadius: 60, backgroundColor: Theme.colors.deepIndigo, justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                source={LOGO}
                                style={{ width: 80, height: 80, borderRadius: 10 }}
                                alt="Gurudevi Logo"
                            />
                        </Box>
                        <Heading
                            color={Theme.colors.sanctuarySaffron}
                            size="4xl"
                            textAlign="center"
                            sx={{ letterSpacing: -1, mt: Theme.spacing.md }}
                        >
                            Gurudevi
                        </Heading>
                        <Text
                            color={Theme.colors.sacredWhite}
                            size="lg"
                            textAlign="center"
                            sx={{ opacity: 0.9, fontStyle: 'italic' }}
                        >
                            The Digital Sanctuary for Educators
                        </Text>
                    </VStack>

                    {/* Intro Text */}
                    <Box sx={{ py: Theme.spacing.lg }}>
                        <Text color={Theme.colors.mistGray} textAlign="center" size="md">
                            Transmute your classroom into a shared sanctuary.
                            Manage ecology, track wellbeing, and nurture wisdom with 108 million teachers.
                        </Text>
                    </Box>

                    {/* Actions */}
                    <VStack space="md" sx={{ width: '100%' }}>
                        <Button
                            size="xl"
                            variant="solid"
                            onPress={handleGetStarted}
                            sx={{
                                backgroundColor: Theme.colors.sanctuarySaffron,
                                borderRadius: Theme.corners.comfortable,
                                height: 60,
                            }}
                        >
                            <ButtonText color={Theme.colors.voidIndigo} fontWeight="$bold" size="lg">
                                Get Started
                            </ButtonText>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            onPress={handleLogin}
                            sx={{
                                borderColor: Theme.colors.mistGray,
                                borderRadius: Theme.corners.comfortable,
                                height: 50,
                            }}
                        >
                            <ButtonText color={Theme.colors.mistGray}>
                                Already have an account? Log In
                            </ButtonText>
                        </Button>
                    </VStack>

                    {/* Footer */}
                    <Text color={Theme.colors.dimGray} size="xs" textAlign="center" mt="$4">
                        By joining, you agree to our Sacred Privacy Pact.
                    </Text>
                </VStack>
            </Center>
        </Box>
    );
}
