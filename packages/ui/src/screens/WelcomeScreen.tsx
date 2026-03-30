import React, { useState } from 'react';
import {
    Box,
    VStack,
    Text,
    Heading,
    Button,
    ButtonText,
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
    Pressable,
} from '../gluestack';
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';
import { useTranslation } from 'react-i18next';
import { Image, Dimensions } from 'react-native';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import ScreenWrapper from '../components/ScreenWrapper';
import { authAPI, handleAPIError, LanguageUtils } from '@repo/core';

// const { width } = Dimensions.get('window'); // width is unused
const LOGO = require('../../assets/icon.png');

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'si', label: 'Sinhala' },
    { code: 'ta', label: 'Tamil' },
];

interface WelcomeScreenProps {
    onLogin?: () => void;
    onGuest?: () => void;
}

export default function WelcomeScreen({ onLogin, onGuest }: WelcomeScreenProps) {
    const { t, i18n } = useTranslation();
    const colors = useThemedColors();
    const [acceptedTerms, setAcceptedTerms] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const toast = useToast();

    const changeLanguage = async (langCode: string) => {
        hapticLight();
        await LanguageUtils.setLanguage(langCode as 'en' | 'si' | 'ta');
    };

    const showTermsToast = () => {
        toast.show({
            placement: "top",
            render: ({ id }: { id: string }) => (
                <Toast nativeID={id} action="error" variant="solid"                    <VStack space="xs"                        <ToastTitle>{t('auth.acceptTermsRequired') || "Please accept the Terms and Privacy Pact to continue in the sanctuary"}</ToastTitle                    </VStack                </Toast            ),
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
        try {
            await authAPI.signInAnonymously();
            if (onGuest) onGuest();
        } catch (error) {
            handleAPIError(error);
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
        // Identity Phase: Navigate to Auth screen
        if (onLogin) onLogin();
    };

    return (
        <ScreenWrapper scroll            <Box
                sx={{
                    flex: 1,
                    backgroundColor: colors.primary,
                    paddingHorizontal: Theme.spacing.lg,
                    paddingTop: Theme.spacing.xl,
                    paddingBottom: Theme.spacing['2xl'],
                }}
                            <Box
                    sx={{
                        position: 'absolute',
                        top: -56,
                        left: -36,
                        width: 220,
                        height: 220,
                        borderRadius: 110,
                        backgroundColor: `${colors.action}14`,
                    }}
                /                <Box
                    sx={{
                        position: 'absolute',
                        right: -44,
                        top: 128,
                        width: 180,
                        height: 180,
                        borderRadius: 90,
                        backgroundColor: `${Theme.colors.gurudeviBlue}16`,
                    }}
                /                <Box
                    sx={{
                        position: 'absolute',
                        left: 28,
                        bottom: 92,
                        width: 140,
                        height: 140,
                        borderRadius: 70,
                        backgroundColor: `${Theme.colors.gurudeviViolet}10`,
                    }}
                /
                <Box sx={{ alignItems: 'flex-end', mb: Theme.spacing.lg }}                    <HStack space="xs" sx={{ backgroundColor: colors.secondary, borderRadius: 20, padding: 4, borderWidth: 1, borderColor: colors.border }}                    {LANGUAGES.map(lang => (
                        <Pressable
                            key={lang.code}
                            onPress={() => changeLanguage(lang.code)}
                            accessibilityRole="button"
                            accessibilityLabel={t('accessibility.switchLanguage', { lang: lang.label })}
                            accessibilityState={{ selected: i18n.language?.startsWith(lang.code) }}
                            sx={{
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 16,
                                backgroundColor: i18n.language?.startsWith(lang.code) ? colors.action : 'transparent'
                            }}
                                                    <Text
                                size="xs"
                                color={i18n.language?.startsWith(lang.code) ? Theme.colors.sacredWhite : colors.textSecondary}
                                bold={i18n.language?.startsWith(lang.code)}
                                                            {lang.code.toUpperCase()}
                            </Text                        </Pressable                    ))}
                    </HStack                </Box
                <VStack space="2xl" sx={{ width: '100%', maxWidth: 460, alignSelf: 'center', flex: 1 }}                    <VStack space="lg" sx={{ pt: Theme.spacing.md }}                        <Box
                            sx={{
                                alignSelf: 'flex-start',
                                px: Theme.spacing.md,
                                py: Theme.spacing.xs,
                                borderRadius: Theme.corners.full,
                                backgroundColor: `${colors.action}14`,
                                borderWidth: 1,
                                borderColor: `${colors.action}30`,
                            }}
                                                    <Text size="xs" color={colors.action} bold sx={{ letterSpacing: 0.6 }}                                SANCTUARY FOR TEACHERS
                            </Text                        </Box
                        <VStack space="md"                            <Box
                                sx={{
                                    width: 156,
                                    height: 156,
                                    borderRadius: 40,
                                    alignSelf: 'center',
                                    backgroundColor: colors.secondary,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    shadowColor: Theme.colors.shadowViolet,
                                    shadowOffset: { width: 0, height: 10 },
                                    shadowOpacity: 0.18,
                                    shadowRadius: 24,
                                    elevation: 10,
                                }}
                                                            <Box
                                    sx={{
                                        position: 'absolute',
                                        inset: 10,
                                        borderRadius: 32,
                                        backgroundColor: `${colors.action}08`,
                                    }}
                                /                                <Image
                                    source={LOGO}
                                    style={{ width: 96, height: 96, borderRadius: 18 }}
                                    accessible={true}
                                    accessibilityLabel={t('accessibility.appLogo')}
                                /                            </Box
                            <VStack space="sm" alignItems="center"                                <Heading
                                    color={colors.text}
                                    size="4xl"
                                    textAlign="center"
                                    sx={{ letterSpacing: -1.8, fontWeight: '$bold' }}
                                                                    Gurudevi
                                </Heading                                <Text
                                    color={colors.textSecondary}
                                    size="lg"
                                    textAlign="center"
                                    sx={{ maxWidth: 320, lineHeight: '$lg' }}
                                                                    {t('welcome.subtitle')}
                                </Text                            </VStack                        </VStack
                        <HStack space="sm" justifyContent="center" sx={{ flexWrap: 'wrap' }}                            {[
                                { label: 'Self', tone: colors.action },
                                { label: 'Classroom', tone: Theme.colors.gurudeviBlue },
                                { label: 'Community', tone: Theme.colors.gurudeviViolet },
                                { label: 'Library', tone: Theme.colors.success },
                            ].map((pillar) => (
                                <Box
                                    key={pillar.label}
                                    sx={{
                                        px: Theme.spacing.md,
                                        py: Theme.spacing.xs,
                                        borderRadius: Theme.corners.full,
                                        backgroundColor: `${pillar.tone}12`,
                                        borderWidth: 1,
                                        borderColor: `${pillar.tone}30`,
                                    }}
                                                                    <Text size="xs" color={pillar.tone} bold                                        {pillar.label}
                                    </Text                                </Box                            ))}
                        </HStack                    </VStack
                    <Box
                        sx={{
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.generous,
                            borderWidth: 1,
                            borderColor: colors.border,
                            padding: Theme.spacing.lg,
                            shadowColor: Theme.colors.shadowViolet,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.1,
                            shadowRadius: 20,
                            elevation: 4,
                        }}
                                            <VStack space="xl"                            <VStack space="sm"                                <Text size="xs" color={colors.textTertiary} bold sx={{ letterSpacing: 0.5 }}                                    BEGIN QUIETLY
                                </Text                                <Text color={colors.textSecondary} size="md"                                    Enter as a guest to explore the sanctuary, or return to the account that already holds your path.
                                </Text                            </VStack
                            <VStack space="lg"                                <HStack space="md" alignItems="center" justifyContent="center"                                <Checkbox
                                    size="md"
                                    value="terms"
                                    isChecked={acceptedTerms}
                                    onToggle={(checked: boolean) => {
                                        hapticLight();
                                        setAcceptedTerms(checked);
                                    }}
                                    aria-label="Accept Terms"
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
                                                                            <CheckboxIcon as={CheckIcon} color={colors.action} sx={{ boxSize: '$4' }} /                                    </CheckboxIndicator                                </Checkbox                                <HStack space="xs" flexShrink={1}                                    <Text size="sm" color={colors.textTertiary}>{t('welcome.acceptTerms')}</Text                                    <Link href="https://neevsk.org/privacy"                                        <LinkText size="sm" color={colors.action} sx={{ textDecorationLine: 'none', fontWeight: '$medium' }}                                            {t('welcome.privacyPactLink')}
                                        </LinkText                                    </Link                                </HStack                                </HStack
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
                                                                    <ButtonText color={Theme.colors.sacredWhite} fontWeight="$bold" size="lg"                                        {isConnecting ? t('welcome.openingSanctuary') : t('welcome.exploreAsGuest')}
                                    </ButtonText                                </Button
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onPress={handleLogin}
                                    sx={{
                                        borderColor: colors.textTertiary,
                                        borderRadius: Theme.corners.comfortable,
                                        height: 54,
                                        borderWidth: 1,
                                        width: '100%',
                                        backgroundColor: 'transparent',
                                    }}
                                                                    <ButtonText color={colors.textSecondary} fontWeight="$medium"                                        {t('welcome.login')}
                                    </ButtonText                                </Button                            </VStack
                            <Text color={colors.textTertiary} size="xs" textAlign="center"                                {t('welcome.footer')}
                            </Text                        </VStack                    </Box                </VStack            </Box        </ScreenWrapper    );
}
