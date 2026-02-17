import React, { useState } from 'react';
import {
    Box,
    VStack,
    Text,
    Heading,
    Button,
    ButtonText,
    Center,
    HStack,
    Checkbox,
    CheckboxIndicator,
    CheckboxIcon,
    CheckIcon,
    Link,
    LinkText,
    useToast,
    Toast,
    ToastTitle,
} from '../ui';
import { Theme } from '../constants/Theme';
import { useTranslation } from 'react-i18next';
import { Image, Dimensions } from 'react-native';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import AuthScreen from './AuthScreen';
import ScreenWrapper from '../components/shared/ScreenWrapper';
import useThemedColors from '../hooks/useThemedColors';
import { authAPI } from '../lib/api/auth';

const { width } = Dimensions.get('window');
const LOGO = require('../../assets/icon.png');

interface WelcomeScreenProps {
    onNext?: () => void;
    initialShowAuth?: boolean;
}

export default function WelcomeScreen({ onNext, initialShowAuth = false }: WelcomeScreenProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [showAuth, setShowAuth] = useState(initialShowAuth);
    const [acceptedTerms, setAcceptedTerms] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const toast = useToast();

    const showTermsToast = () => {
        toast.show({
            placement: "top",
            render: ({ id }) => (
                <Toast nativeID={id} variant="accent" action="info">
                    <VStack space="xs">
                        <ToastTitle>{t('auth.acceptTermsRequired') || "Please accept the Terms and Privacy Pact to continue in the sanctuary"}</ToastTitle>
                    </VStack>
                </Toast>
            ),
        });
    };

    const handleStartExploring = async () => {
        if (!acceptedTerms) {
            hapticError();
            showTermsToast();
            return;
        }

        hapticSuccess();
        setIsConnecting(true);
        console.log('🚀 Welcome: Starting anonymous sign in...');
        try {
            await authAPI.signInAnonymously();
            console.log('✅ Welcome: Guest sign in success, calling onNext');
            if (onNext) onNext();
        } catch (error) {
            console.error('❌ Welcome: Failed to start guest session:', error);
            hapticError();
            setIsConnecting(false);
        }
    };

    const handleLogin = () => {
        if (!acceptedTerms) {
            hapticError();
            showTermsToast();
            return;
        }
        hapticLight();
        setShowAuth(true);
    };

    if (showAuth) {
        return (
            <AuthScreen
                isAnonymous={true}
                onContinueAsGuest={handleStartExploring}
                onSuccess={() => {
                    console.log('✅ Welcome: Auth Success');
                    onNext?.();
                }}
            />
        );
    }

    return (
        <ScreenWrapper scroll>
            <Center sx={{ flex: 1, paddingVertical: Theme.spacing.xl, paddingHorizontal: 24 }}>
                <VStack space="2xl" alignItems="center" sx={{ width: '100%', maxWidth: 400 }}>
                    {/* Hero Section */}
                    <VStack space="lg" alignItems="center">
                        <Box sx={{
                            width: 140,
                            height: 140,
                            borderRadius: 70,
                            backgroundColor: colors.secondary,
                            justifyContent: 'center',
                            alignItems: 'center',
                            shadowColor: colors.shadow,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 8,
                            mb: '$2'
                        }}>
                            <Image
                                source={LOGO}
                                style={{ width: 90, height: 90, borderRadius: 12 }}
                                alt="Gurudevi Logo"
                            />
                        </Box>
                        <VStack space="xs" alignItems="center">
                            <Heading
                                color={colors.action}
                                size="4xl"
                                textAlign="center"
                                sx={{ letterSpacing: -1.5, fontWeight: '$bold' }}
                            >
                                Gurudevi
                            </Heading>
                            <Text
                                color={colors.textSecondary}
                                size="lg"
                                textAlign="center"
                                sx={{ maxWidth: 280, lineHeight: '$lg' }}
                            >
                                {t('welcome.subtitle')}
                            </Text>
                        </VStack>
                    </VStack>

                    {/* Actions Area */}
                    <VStack space="xl" sx={{ width: '100%', mt: '$4' }}>
                        <VStack space="lg">
                            <HStack space="md" alignItems="center" justifyContent="center" sx={{ px: '$4' }}>
                                <Checkbox
                                    size="md"
                                    value="terms"
                                    isChecked={acceptedTerms}
                                    onChange={(checked) => {
                                        hapticLight();
                                        setAcceptedTerms(checked);
                                    }}
                                    aria-label="Accept Terms"
                                >
                                    <CheckboxIndicator
                                        sx={{
                                            borderColor: colors.action,
                                            backgroundColor: 'transparent',
                                            borderRadius: '$sm',
                                            borderWidth: 2,
                                            ':checked': {
                                                backgroundColor: 'transparent',
                                                borderColor: colors.action,
                                            },
                                            ':active': {
                                                backgroundColor: 'transparent',
                                            },
                                            ':hover': {
                                                backgroundColor: 'transparent',
                                            }
                                        }}
                                    >
                                        <CheckboxIcon as={CheckIcon} color={colors.action} sx={{ boxSize: '$4' }} />
                                    </CheckboxIndicator>
                                </Checkbox>
                                <HStack space="xs" flexShrink={1}>
                                    <Text size="sm" color={colors.textTertiary}>{t('welcome.acceptTerms')}</Text>
                                    <Link href="https://neevsk.org/privacy">
                                        <LinkText size="sm" color={colors.action} sx={{ textDecorationLine: 'none', fontWeight: '$medium' }}>
                                            {t('welcome.privacyPactLink')}
                                        </LinkText>
                                    </Link>
                                </HStack>
                            </HStack>

                            <Button
                                size="xl"
                                variant="solid"
                                onPress={handleStartExploring}
                                isDisabled={isConnecting || !acceptedTerms}
                                sx={{
                                    backgroundColor: acceptedTerms ? colors.action : colors.textTertiary,
                                    borderRadius: Theme.corners.comfortable,
                                    height: 64,
                                    elevation: 2,
                                    width: '100%',
                                    ':active': {
                                        opacity: 0.8
                                    }
                                }}
                            >
                                <ButtonText color={Theme.colors.white} fontWeight="$bold" size="lg">
                                    {isConnecting ? t('welcome.openingSanctuary') : t('welcome.exploreAsGuest')}
                                </ButtonText>
                            </Button>
                        </VStack>

                        <Button
                            size="lg"
                            variant="outline"
                            onPress={handleLogin}
                            sx={{
                                borderColor: colors.textTertiary,
                                borderRadius: Theme.corners.comfortable,
                                height: 52,
                                borderWidth: 1,
                                width: '100%',
                            }}
                        >
                            <ButtonText color={colors.textSecondary} fontWeight="$medium">
                                {t('welcome.login')}
                            </ButtonText>
                        </Button>
                    </VStack>

                    {/* Footer */}
                    <Text color={colors.textTertiary} size="xs" textAlign="center" mt="$2">
                        {t('welcome.footer')}
                    </Text>
                </VStack>
            </Center>
        </ScreenWrapper>
    );
}
